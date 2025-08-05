import axios from 'axios'

// Configuración de la API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
	? window.location.origin 
	: 'http://localhost:3001'

// Configuración de axios con interceptores
const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 15000,
	headers: {
		'Content-Type': 'application/json'
	}
})

// Interceptor para requests
apiClient.interceptors.request.use(
	(config) => {
		console.log(`🌐 Request: ${config.method?.toUpperCase()} ${config.url}`)
		return config
	},
	(error) => {
		console.error('❌ Error en request:', error)
		return Promise.reject(error)
	}
)

// Interceptor para responses
apiClient.interceptors.response.use(
	(response) => {
		console.log(`✅ Response: ${response.status} ${response.config.url}`)
		return response
	},
	(error) => {
		console.error('❌ Error en response:', {
			status: error.response?.status,
			message: error.response?.data?.error || error.message,
			url: error.config?.url
		})
		return Promise.reject(error)
	}
)

// Función para validar conectividad
export const checkConnectivity = async () => {
	try {
		const response = await apiClient.get('/api/health')
		return {
			status: 'ok',
			data: response.data
		}
	} catch (error) {
		return {
			status: 'error',
			message: error.response?.data?.error || error.message
		}
	}
}

// Función para extraer valores de propiedades de Notion
const extractPropertyValue = (property) => {
	if (!property || !property.type) {
		return ''
	}

	switch (property.type) {
		case 'title':
			return property.title?.[0]?.plain_text || ''
		case 'rich_text':
			return property.rich_text?.[0]?.plain_text || ''
		case 'number':
			return property.number || 0
		case 'select':
			return property.select?.name || ''
		case 'multi_select':
			return property.multi_select?.map(opt => opt.name).join(', ') || ''
		case 'date':
			return property.date?.start || ''
		case 'checkbox':
			return property.checkbox || false
		case 'url':
			return property.url || ''
		case 'email':
			return property.email || ''
		case 'phone_number':
			return property.phone_number || ''
		case 'relation':
			return property.relation || []
		case 'rollup':
			return property.rollup || ''
		case 'formula':
			return property.formula?.string || property.formula?.number || property.formula?.boolean || ''
		case 'status':
			return property.status?.name || ''
		case 'unique_id':
			return property.unique_id?.prefix + property.unique_id?.number || ''
		case 'files':
			return property.files || []
		default:
			return `[${property.type}]`
	}
}

// Función para manejar errores de API
const handleApiError = (error, operation) => {
	const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message
	console.error(`Error en ${operation}:`, errorMessage)
	
	if (error.response?.status === 0) {
		throw new Error('No se puede conectar con el servidor. Verifica que el servidor esté ejecutándose.')
	} else if (error.response?.status === 404) {
		throw new Error('El servicio no está disponible. Contacta al administrador.')
	} else if (error.response?.status === 500) {
		throw new Error(`Error del servidor: ${errorMessage}`)
	} else {
		throw new Error(`Error en ${operation}: ${errorMessage}`)
	}
}

// Obtener todas las obras
export const getObras = async () => {
	try {
		const response = await apiClient.get('/api/obras')
		return response.data
	} catch (error) {
		handleApiError(error, 'obtener obras')
	}
}

// Obtener todos los jefes de obra
export const getJefesObra = async () => {
	try {
		const response = await apiClient.get('/api/jefes-obra')
		return response.data
	} catch (error) {
		handleApiError(error, 'obtener jefes de obra')
	}
}

// Obtener todos los empleados
export const getEmpleados = async () => {
	try {
		const response = await apiClient.get('/api/empleados')
		return response.data
	} catch (error) {
		handleApiError(error, 'obtener empleados')
	}
}

// Obtener empleados de una obra específica
export const getEmpleadosObra = async (obraId) => {
	try {
		const response = await apiClient.get(`/api/obras/${obraId}/empleados`)
		return response.data
	} catch (error) {
		handleApiError(error, 'obtener empleados de la obra')
	}
}

// Obtener todos los partes de trabajo
export const getPartesTrabajo = async () => {
	try {
		const response = await apiClient.get('/api/partes-trabajo')
		return response.data
	} catch (error) {
		handleApiError(error, 'obtener partes de trabajo')
	}
}

// Obtener detalles de empleados de un parte específico
export const getDetallesEmpleados = async (parteId) => {
	try {
		const response = await apiClient.get(`/api/partes-trabajo/${parteId}/empleados`)
		return response.data
	} catch (error) {
		handleApiError(error, 'obtener detalles de empleados del parte')
	}
}

// Obtener detalles completos de un parte específico
export const getDetallesCompletosParte = async (parteId) => {
	try {
		const response = await apiClient.get(`/api/partes-trabajo/${parteId}/detalles`)
		return response.data
	} catch (error) {
		handleApiError(error, 'obtener detalles completos del parte')
	}
}

// Crear un nuevo parte de trabajo
export const crearParteTrabajo = async (datos) => {
	try {
		// Validar datos requeridos
		const requiredFields = ['obra', 'obraId', 'fecha', 'jefeObraId']
		const missingFields = requiredFields.filter(field => !datos[field])
		
		if (missingFields.length > 0) {
			throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`)
		}

		// Preparar datos para enviar
		const datosEnvio = {
			...datos,
			empleados: datos.empleados || [],
			empleadosHoras: datos.empleadosHoras || {}
		}

		const response = await apiClient.post('/api/partes-trabajo', datosEnvio)
		return response.data
	} catch (error) {
		handleApiError(error, 'crear parte de trabajo')
	}
}

// Obtener datos completos para la aplicación
export const getDatosCompletos = async () => {
	try {
		// Primero verificar conectividad
		const connectivity = await checkConnectivity()
		if (connectivity.status === 'error') {
			throw new Error(`Problema de conectividad: ${connectivity.message}`)
		}

		const [obras, jefesObra, empleados, partesTrabajo] = await Promise.all([
			getObras(),
			getJefesObra(),
			getEmpleados(),
			getPartesTrabajo()
		])

		return {
			obras,
			jefesObra,
			empleados,
			partesTrabajo
		}
	} catch (error) {
		console.error('Error al obtener datos completos:', error)
		throw error
	}
}

// Función para reintentar operaciones
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await operation()
		} catch (error) {
			if (attempt === maxRetries) {
				throw error
			}
			console.log(`Reintento ${attempt}/${maxRetries} en ${delay}ms...`)
			await new Promise(resolve => setTimeout(resolve, delay))
			delay *= 2 // Backoff exponencial
		}
	}
} 