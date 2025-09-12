require('dotenv').config()
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

// Configuración de Notion (sin fallback: exigir variable de entorno)
const NOTION_TOKEN = process.env.NOTION_TOKEN
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
// CORS: si se definen orígenes permitidos, restringir; en otro caso permitir (dev)
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
if (ALLOWED_ORIGINS.length > 0) {
  app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }))
} else {
  app.use(cors())
}
app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist')))

// Middleware de logging
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
	next()
})

// Verificar token al iniciar
if (!NOTION_TOKEN) {
  console.error('ERROR: Falta la variable de entorno NOTION_TOKEN. Configure su token de Notion antes de iniciar el servidor.')
  // Finalizar proceso para evitar ejecutar sin credenciales válidas
  process.exit(1)
}

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
			// Manejar rollups de diferentes tipos
			if (property.rollup?.type === 'array') {
				const array = property.rollup.array
				if (array && array.length > 0) {
					const firstItem = array[0]
					if (firstItem.type === 'title') {
						return firstItem.title?.[0]?.plain_text || ''
					} else if (firstItem.type === 'rich_text') {
						return firstItem.rich_text?.[0]?.plain_text || ''
					} else if (firstItem.type === 'date') {
						return firstItem.date?.start || ''
					} else if (firstItem.type === 'select') {
						return firstItem.select?.name || ''
					} else if (firstItem.type === 'number') {
						return firstItem.number || 0
					}
				}
			}
			return ''
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
		} else if (error.response?.status === 409) {
			throw new Error('Conflicto al crear el registro. Puede ser un duplicado o problema de permisos.')
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
			nombre: extractPropertyValue(page.properties['Obra - Codigo']),
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

// Obtener opciones válidas de la propiedad Estado de empleados (dinámico desde Notion)
app.get('/api/empleados/estado-opciones', async (req, res) => {
    try {
        const db = await makeNotionRequest('GET', `/databases/${DATABASES.EMPLEADOS}`)
        const prop = db.properties?.['Estado']
        if (!prop) {
            return res.json({ type: 'unknown', options: [] })
        }

        let options = []
        let type = prop.type
        if (prop.type === 'status') {
            options = (prop.status?.options || []).map(o => ({ name: o.name, color: o.color }))
        } else if (prop.type === 'select') {
            options = (prop.select?.options || []).map(o => ({ name: o.name, color: o.color }))
        } else if (prop.type === 'checkbox') {
            options = [
                { name: 'true', color: 'green' },
                { name: 'false', color: 'red' }
            ]
        }

        res.json({ type, options })
    } catch (error) {
        console.error('Error al obtener opciones de Estado:', error.message)
        res.status(500).json({ error: 'Error al obtener opciones de Estado', details: error.message })
    }
})

// Actualizar estado de un empleado
app.put('/api/empleados/:empleadoId/estado', async (req, res) => {
    try {
        const { empleadoId } = req.params
        const { estado } = req.body

        if (!estado || typeof estado !== 'string') {
            return res.status(400).json({ error: 'Parámetro "estado" requerido' })
        }

        // Obtener la página del empleado para detectar el tipo de la propiedad Estado
        const empleadoPage = await makeNotionRequest('GET', `/pages/${empleadoId}`)
        const propEstado = empleadoPage.properties?.['Estado']
        if (!propEstado) {
            return res.status(400).json({ error: 'La propiedad "Estado" no existe en el empleado' })
        }

        // Preparar payload según el tipo de la propiedad
        let estadoPayload
        if (propEstado.type === 'status') {
            estadoPayload = { status: { name: estado } }
        } else if (propEstado.type === 'select') {
            estadoPayload = { select: { name: estado } }
        } else if (propEstado.type === 'checkbox') {
            const value = /^(on|activo|true|sí|si)$/i.test(estado)
            estadoPayload = { checkbox: value }
        } else {
            return res.status(400).json({ error: `Tipo de propiedad Estado no soportado: ${propEstado.type}` })
        }

        const updated = await makeNotionRequest('PATCH', `/pages/${empleadoId}`, {
            properties: { 'Estado': estadoPayload }
        })

        res.json({ ok: true, empleadoId, estado })
    } catch (error) {
        console.error('Error al actualizar estado del empleado:', error.message)
        res.status(500).json({ error: 'Error al actualizar estado del empleado', details: error.message })
    }
})

// Obtener empleados de una obra específica
app.get('/api/obras/:obraId/empleados', async (req, res) => {
	try {
		const { obraId } = req.params

		// Obtener la obra específica para ver sus empleados relacionados
		const obraData = await makeNotionRequest('GET', `/pages/${obraId}`)
		
		// Extraer los IDs de empleados relacionados
		const empleadosRelacionados = extractPropertyValue(obraData.properties['Empleados'])
		
		if (!empleadosRelacionados || empleadosRelacionados.length === 0) {
			return res.json([])
		}

		// Obtener los detalles de cada empleado relacionado
		const empleadosDetalles = []
		
		for (const empleadoRef of empleadosRelacionados) {
			try {
				const empleadoData = await makeNotionRequest('GET', `/pages/${empleadoRef.id}`)
				
				empleadosDetalles.push({
					id: empleadoData.id,
					nombre: extractPropertyValue(empleadoData.properties['Nombre Completo']),
					categoria: extractPropertyValue(empleadoData.properties['Categoría']),
					provincia: extractPropertyValue(empleadoData.properties['Provincia']),
					localidad: extractPropertyValue(empleadoData.properties['Localidad']),
					telefono: extractPropertyValue(empleadoData.properties['Teléfono']),
					dni: extractPropertyValue(empleadoData.properties['DNI']),
					estado: extractPropertyValue(empleadoData.properties['Estado']),
					delegado: extractPropertyValue(empleadoData.properties['Delegado'])
				})
			} catch (error) {
				console.error(`Error al obtener empleado ${empleadoRef.id}:`, error.message)
			}
		}

		res.json(empleadosDetalles)
	} catch (error) {
		console.error('Error al obtener empleados de la obra:', error.message)
		res.status(500).json({ 
			error: 'Error al obtener empleados de la obra',
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
		const { obra, obraId, fecha, jefeObraId, notas, empleados, empleadosHoras } = req.body

		if (!obra || !obraId || !fecha || !jefeObraId) {
			return res.status(400).json({ 
				error: 'Faltan campos requeridos',
				required: ['obra', 'obraId', 'fecha', 'jefeObraId']
			})
		}

		// Crear el parte de trabajo
		const parteData = await makeNotionRequest('POST', '/pages', {
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

		// Crear detalles de horas para cada empleado seleccionado
		let detallesCreados = []
		let erroresDetalles = []

		if (empleados && empleados.length > 0) {
			for (const empleadoId of empleados) {
				try {
					const horas = empleadosHoras[empleadoId] || 8
					
					const detalleData = await makeNotionRequest('POST', '/pages', {
						parent: { database_id: DATABASES.DETALLES_HORA },
						properties: {
							'Detalle': {
								title: [
									{
										text: {
											content: `Detalle Horas`
										}
									}
								]
							},
							'Partes de trabajo': {
								relation: [
									{
										id: parteData.id
									}
								]
							},
							'Empleados': {
								relation: [
									{
										id: empleadoId
									}
								]
							},
							'Cantidad Horas': {
								number: horas
							}
						}
					})
					
					detallesCreados.push(detalleData)
					
					// Pausa entre requests para evitar rate limiting
					await new Promise(resolve => setTimeout(resolve, 100))
					
				} catch (error) {
					console.error(`Error al crear detalle para empleado ${empleadoId}:`, error.message)
					erroresDetalles.push({ empleadoId, error: error.message })
				}
			}

			// Log de resultados
			console.log(`✅ Detalles creados: ${detallesCreados.length}/${empleados.length}`)
			if (erroresDetalles.length > 0) {
				console.log(`❌ Errores en detalles:`, erroresDetalles)
			}
		}

		res.json({
			...parteData,
			empleadosCreados: empleados?.length || 0,
			detallesCreados: detallesCreados.length,
			erroresDetalles: erroresDetalles.length,
			mensaje: `Parte creado exitosamente. ${detallesCreados.length} empleados asignados.`
		})
	} catch (error) {
		console.error('Error al crear parte de trabajo:', error.message)
		res.status(500).json({ 
			error: 'Error al crear parte de trabajo',
			details: error.message 
		})
	}
})

// Obtener detalles de empleados de un parte específico
app.get('/api/partes-trabajo/:parteId/empleados', async (req, res) => {
	try {
		const { parteId } = req.params

		// Obtener detalles de horas para este parte
		const data = await makeNotionRequest('POST', `/databases/${DATABASES.DETALLES_HORA}/query`, {
			filter: {
				property: 'Partes de trabajo',
				relation: {
					contains: parteId
				}
			},
			page_size: 100
		})

		const detallesEmpleados = data.results.map(detalle => ({
			id: detalle.id,
			empleadoId: extractPropertyValue(detalle.properties['Empleados']),
			empleadoNombre: extractPropertyValue(detalle.properties['Aux Empleado']),
			categoria: extractPropertyValue(detalle.properties['AUX_Categoria']),
			horas: extractPropertyValue(detalle.properties['Cantidad Horas']),
			fecha: extractPropertyValue(detalle.properties['Fecha']),
			detalle: extractPropertyValue(detalle.properties['Detalle'])
		}))

		res.json(detallesEmpleados)
	} catch (error) {
		console.error('Error al obtener detalles de empleados del parte:', error.message)
		res.status(500).json({ 
			error: 'Error al obtener detalles de empleados del parte',
			details: error.message 
		})
	}
})

// Obtener detalles completos de un parte específico
app.get('/api/partes-trabajo/:parteId/detalles', async (req, res) => {
	try {
		const { parteId } = req.params

		// Obtener el parte específico
		const parteData = await makeNotionRequest('GET', `/pages/${parteId}`)
		
		// Extraer la Persona Autorizada
		const personaAutorizada = extractPropertyValue(parteData.properties['Persona Autorizada'])
		
		// Obtener detalles de empleados
		const detallesData = await makeNotionRequest('POST', `/databases/${DATABASES.DETALLES_HORA}/query`, {
			filter: {
				property: 'Partes de trabajo',
				relation: {
					contains: parteId
				}
			},
			page_size: 100
		})

		const detallesEmpleados = detallesData.results.map(detalle => ({
			id: detalle.id,
			empleadoId: extractPropertyValue(detalle.properties['Empleados']),
			empleadoNombre: extractPropertyValue(detalle.properties['Aux Empleado']),
			categoria: extractPropertyValue(detalle.properties['AUX_Categoria']),
			horas: extractPropertyValue(detalle.properties['Cantidad Horas']),
			fecha: extractPropertyValue(detalle.properties['Fecha']),
			detalle: extractPropertyValue(detalle.properties['Detalle'])
		}))

		res.json({
			parte: {
				id: parteData.id,
				nombre: extractPropertyValue(parteData.properties['Nombre']),
				fecha: extractPropertyValue(parteData.properties['Fecha']),
				obra: extractPropertyValue(parteData.properties['AUX Obra']),
				estado: extractPropertyValue(parteData.properties['Estado']),
				notas: extractPropertyValue(parteData.properties['Notas']),
				personaAutorizada: personaAutorizada
			},
			empleados: detallesEmpleados
		})
	} catch (error) {
		console.error('Error al obtener detalles completos del parte:', error.message)
		res.status(500).json({ 
			error: 'Error al obtener detalles completos del parte',
			details: error.message 
		})
	}
})

// Actualizar un parte de trabajo existente
app.put('/api/partes-trabajo/:parteId', async (req, res) => {
	try {
		const { parteId } = req.params
		const { obraId, fecha, personaAutorizadaId, notas, empleados, empleadosHoras } = req.body

		if (!obraId || !fecha || !personaAutorizadaId) {
			return res.status(400).json({ 
				error: 'Faltan campos requeridos',
				required: ['obraId', 'fecha', 'personaAutorizadaId']
			})
		}

		// Validar que el parte sea editable según su estado actual
		try {
			const parteActual = await makeNotionRequest('GET', `/pages/${parteId}`)
			const estadoParte = extractPropertyValue(parteActual.properties['Estado'])
			const noEditables = ['firmado', 'datos enviados', 'enviado']
			if (estadoParte && noEditables.includes(String(estadoParte).toLowerCase())) {
				return res.status(409).json({
					error: 'El parte no es editable por su estado actual',
					estado: estadoParte
				})
			}
		} catch (e) {
			console.warn('Aviso: no se pudo validar el estado del parte antes de editar:', e.message)
		}

		// Validar horas por empleado si vienen definidas
		if (empleados && empleadosHoras) {
			for (const empId of empleados) {
				const horasVal = empleadosHoras[empId]
				if (horasVal !== undefined) {
					const num = Number(horasVal)
					if (!Number.isFinite(num) || num < 0 || num > 24) {
						return res.status(400).json({
							error: `Horas inválidas para empleado ${empId}`,
							details: 'Las horas deben estar entre 0 y 24'
						})
					}
				}
			}
		}

		// Obtener la obra para el nombre
		const obraData = await makeNotionRequest('GET', `/pages/${obraId}`)
		const nombreObra = extractPropertyValue(obraData.properties['Obra'])

		// Actualizar el parte de trabajo
		const parteActualizado = await makeNotionRequest('PATCH', `/pages/${parteId}`, {
			properties: {
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
							id: personaAutorizadaId
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

		// Obtener detalles existentes para este parte
		const detallesExistentes = await makeNotionRequest('POST', `/databases/${DATABASES.DETALLES_HORA}/query`, {
			filter: {
				property: 'Partes de trabajo',
				relation: {
					contains: parteId
				}
			},
			page_size: 100
		})

		// Archivar detalles existentes (en lugar de eliminarlos)
		for (const detalle of detallesExistentes.results) {
			try {
				await makeNotionRequest('PATCH', `/pages/${detalle.id}`, {
					archived: true
				})
				// Pausa entre requests para evitar rate limiting
				await new Promise(resolve => setTimeout(resolve, 100))
			} catch (error) {
				console.error(`Error al archivar detalle ${detalle.id}:`, error.message)
			}
		}

		// Crear nuevos detalles de horas para cada empleado seleccionado
		let detallesCreados = []
		let erroresDetalles = []

		if (empleados && empleados.length > 0) {
			for (const empleadoId of empleados) {
				try {
					const horas = empleadosHoras[empleadoId] || 8
					
					const detalleData = await makeNotionRequest('POST', '/pages', {
						parent: { database_id: DATABASES.DETALLES_HORA },
						properties: {
							'Detalle': {
								title: [
									{
										text: {
											content: `Detalle Horas`
										}
									}
								]
							},
							'Partes de trabajo': {
								relation: [
									{
										id: parteId
									}
								]
							},
							'Empleados': {
								relation: [
									{
										id: empleadoId
									}
								]
							},
							'Cantidad Horas': {
								number: horas
							}
						}
					})
					
					detallesCreados.push(detalleData)
					
					// Pausa entre requests para evitar rate limiting
					await new Promise(resolve => setTimeout(resolve, 100))
					
				} catch (error) {
					console.error(`Error al crear detalle para empleado ${empleadoId}:`, error.message)
					erroresDetalles.push({ empleadoId, error: error.message })
				}
			}

			// Log de resultados
			console.log(`✅ Detalles actualizados: ${detallesCreados.length}/${empleados.length}`)
			if (erroresDetalles.length > 0) {
				console.log(`❌ Errores en detalles:`, erroresDetalles)
			}
		}

		res.json({
			...parteActualizado,
			empleadosActualizados: empleados?.length || 0,
			detallesCreados: detallesCreados.length,
			erroresDetalles: erroresDetalles.length,
			mensaje: `Parte actualizado exitosamente. ${detallesCreados.length} empleados asignados.`
		})
	} catch (error) {
		console.error('Error al actualizar parte de trabajo:', error.message)
		res.status(500).json({ 
			error: 'Error al actualizar parte de trabajo',
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

// Ruta para servir la aplicación React (solo para rutas que no sean API)
// Mantener rutas de API por encima y servir SPA para el resto
app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
	console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`)
	console.log(`📊 API disponible en http://localhost:${PORT}/api`)
	console.log(`🔍 Health check: http://localhost:${PORT}/api/health`)
	console.log(`🔑 Token de Notion: ${NOTION_TOKEN ? 'Configurado' : 'FALTANTE'}`)
}) 
