const express = require('express')
const cors = require('cors')
const axios = require('axios')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

// Configuración de Notion
const NOTION_TOKEN = process.env.NOTION_TOKEN || 'YOUR_NOTION_TOKEN_HERE'
const NOTION_API = 'https://api.notion.com/v1'

// Configuración de bases de datos corregida
const DATABASES = {
	OBRAS: '20882593a257810083d6dc8ec0a99d58',
	JEFE_OBRAS: '20882593a25781b4a3b9e0ff5589ea4e',
	EMPLEADOS: '20882593a257814db882c4b70cb0cbab',
	PARTES_TRABAJO: '20882593a25781258595e15abb37e87a',
	DETALLES_HORA: '20882593a25781838da1fe6741abcfd9'
}

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist')))

// Middleware de logging
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
	next()
})

// Headers para Notion
const getNotionHeaders = () => ({
	'Authorization': `Bearer ${NOTION_TOKEN}`,
	'Notion-Version': '2022-06-28',
	'Content-Type': 'application/json'
})

// Función para validar respuesta de Notion
const validateNotionResponse = (response) => {
	if (!response || !response.data) {
		throw new Error('Respuesta inválida de Notion API')
	}
	return response.data
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

// Función para hacer requests a Notion con manejo de errores
const makeNotionRequest = async (method, endpoint, data = null) => {
	try {
		const config = {
			method,
			url: `${NOTION_API}${endpoint}`,
			headers: getNotionHeaders(),
			timeout: 10000
		}

		if (data) {
			config.data = data
		}

		const response = await axios(config)
		return validateNotionResponse(response)
	} catch (error) {
		console.error(`Error en request a Notion (${method} ${endpoint}):`, {
			status: error.response?.status,
			message: error.response?.data?.message || error.message,
			code: error.response?.data?.code
		})
		
		if (error.response?.status === 401) {
			throw new Error('Token de Notion inválido o expirado')
		} else if (error.response?.status === 403) {
			throw new Error('Sin permisos para acceder a la base de datos')
		} else if (error.response?.status === 404) {
			throw new Error('Base de datos no encontrada')
		} else if (error.response?.status === 429) {
			throw new Error('Límite de rate limit excedido')
		} else {
			throw new Error(`Error de conectividad con Notion: ${error.message}`)
		}
	}
}

// Rutas de la API

// Health check
app.get('/api/health', (req, res) => {
	res.json({ 
		status: 'ok', 
		timestamp: new Date().toISOString(),
		notionToken: NOTION_TOKEN ? 'configured' : 'missing'
	})
})

// Obtener todas las obras
app.get('/api/obras', async (req, res) => {
	try {
		const data = await makeNotionRequest('POST', `/databases/${DATABASES.OBRAS}/query`, {
			page_size: 100
		})

		const obras = data.results.map(page => ({
			id: page.id,
			nombre: extractPropertyValue(page.properties['Obra']),
			provincia: extractPropertyValue(page.properties['Provincia']),
			estado: extractPropertyValue(page.properties['Estado']),
			precioEncargado: extractPropertyValue(page.properties['Precio Encargado']),
			precioCapataz: extractPropertyValue(page.properties['Precio Capataz']),
			precioOficial1: extractPropertyValue(page.properties['Precio Oficial 1ª']),
			precioOficial2: extractPropertyValue(page.properties['Precio Oficial 2ª'])
		}))

		res.json(obras)
	} catch (error) {
		console.error('Error al obtener obras:', error.message)
		res.status(500).json({ 
			error: 'Error al obtener obras',
			details: error.message 
		})
	}
})

// Obtener todos los jefes de obra
app.get('/api/jefes-obra', async (req, res) => {
	try {
		const data = await makeNotionRequest('POST', `/databases/${DATABASES.JEFE_OBRAS}/query`, {
			page_size: 100
		})

		const jefesObra = data.results.map(page => ({
			id: page.id,
			nombre: extractPropertyValue(page.properties['Persona Autorizada']),
			email: extractPropertyValue(page.properties[' Email'])
		}))

		res.json(jefesObra)
	} catch (error) {
		console.error('Error al obtener jefes de obra:', error.message)
		res.status(500).json({ 
			error: 'Error al obtener jefes de obra',
			details: error.message 
		})
	}
})

// Obtener todos los empleados
app.get('/api/empleados', async (req, res) => {
	try {
		const data = await makeNotionRequest('POST', `/databases/${DATABASES.EMPLEADOS}/query`, {
			page_size: 100
		})

		const empleados = data.results.map(page => ({
			id: page.id,
			nombre: extractPropertyValue(page.properties['Nombre Completo']),
			categoria: extractPropertyValue(page.properties['Categoría']),
			provincia: extractPropertyValue(page.properties['Provincia']),
			localidad: extractPropertyValue(page.properties['Localidad']),
			telefono: extractPropertyValue(page.properties['Teléfono']),
			dni: extractPropertyValue(page.properties['DNI']),
			estado: extractPropertyValue(page.properties['Estado']),
			delegado: extractPropertyValue(page.properties['Delegado'])
		}))

		res.json(empleados)
	} catch (error) {
		console.error('Error al obtener empleados:', error.message)
		res.status(500).json({ 
			error: 'Error al obtener empleados',
			details: error.message 
		})
	}
})

// Obtener todos los partes de trabajo
app.get('/api/partes-trabajo', async (req, res) => {
	try {
		const data = await makeNotionRequest('POST', `/databases/${DATABASES.PARTES_TRABAJO}/query`, {
			page_size: 100,
			sorts: [
				{
					property: 'Fecha',
					direction: 'descending'
				}
			]
		})

		const partesTrabajo = data.results.map(page => ({
			id: page.id,
			nombre: extractPropertyValue(page.properties['Nombre']),
			fecha: extractPropertyValue(page.properties['Fecha']),
			estado: extractPropertyValue(page.properties['Estado']),
			obra: extractPropertyValue(page.properties['AUX Obra']),
			horasOficial1: extractPropertyValue(page.properties['Horas Oficial 1ª']),
			horasOficial2: extractPropertyValue(page.properties['Horas Oficial 2ª ']),
			horasCapataz: extractPropertyValue(page.properties['Horas Capataz']),
			horasEncargado: extractPropertyValue(page.properties['Horas Encargado ']),
			importeTotal: extractPropertyValue(page.properties['Importe total']),
			urlPDF: extractPropertyValue(page.properties['URL PDF']),
			enviadoCliente: extractPropertyValue(page.properties['Enviado a cliente']),
			notas: extractPropertyValue(page.properties['Notas'])
		}))

		res.json(partesTrabajo)
	} catch (error) {
		console.error('Error al obtener partes de trabajo:', error.message)
		res.status(500).json({ 
			error: 'Error al obtener partes de trabajo',
			details: error.message 
		})
	}
})

// Crear un nuevo parte de trabajo
app.post('/api/partes-trabajo', async (req, res) => {
	try {
		const { obra, obraId, fecha, jefeObraId, notas } = req.body

		if (!obra || !obraId || !fecha || !jefeObraId) {
			return res.status(400).json({ 
				error: 'Faltan campos requeridos',
				required: ['obra', 'obraId', 'fecha', 'jefeObraId']
			})
		}

		const data = await makeNotionRequest('POST', '/pages', {
			parent: { database_id: DATABASES.PARTES_TRABAJO },
			properties: {
				'Nombre': {
					title: [
						{
							text: {
								content: `Parte ${obra} - ${new Date().toLocaleDateString()}`
							}
						}
					]
				},
				'Fecha': {
					date: {
						start: fecha
					}
				},
				'Obras': {
					relation: [
						{
							id: obraId
						}
					]
				},
				'Persona Autorizada': {
					relation: [
						{
							id: jefeObraId
						}
					]
				},
				'Notas': {
					rich_text: [
						{
							text: {
								content: notas || ''
							}
						}
					]
				}
			}
		})

		res.json(data)
	} catch (error) {
		console.error('Error al crear parte de trabajo:', error.message)
		res.status(500).json({ 
			error: 'Error al crear parte de trabajo',
			details: error.message 
		})
	}
})

// Obtener datos completos
app.get('/api/datos-completos', async (req, res) => {
	try {
		const [obrasRes, jefesObraRes, empleadosRes, partesTrabajoRes] = await Promise.all([
			axios.get(`${req.protocol}://${req.get('host')}/api/obras`),
			axios.get(`${req.protocol}://${req.get('host')}/api/jefes-obra`),
			axios.get(`${req.protocol}://${req.get('host')}/api/empleados`),
			axios.get(`${req.protocol}://${req.get('host')}/api/partes-trabajo`)
		])

		res.json({
			obras: obrasRes.data,
			jefesObra: jefesObraRes.data,
			empleados: empleadosRes.data,
			partesTrabajo: partesTrabajoRes.data
		})
	} catch (error) {
		console.error('Error al obtener datos completos:', error.message)
		res.status(500).json({ 
			error: 'Error al obtener datos completos',
			details: error.message 
		})
	}
})

// Ruta para servir la aplicación React
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
	console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`)
	console.log(`📊 API disponible en http://localhost:${PORT}/api`)
	console.log(`🔍 Health check: http://localhost:${PORT}/api/health`)
	console.log(`🔑 Token de Notion: ${NOTION_TOKEN ? 'Configurado' : 'FALTANTE'}`)
}) 