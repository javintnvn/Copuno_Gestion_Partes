const axios = require('axios')

async function testCrearParteConEmpleados() {
	try {
		console.log('🧪 Probando creación de parte con empleados...')
		
		// Primero obtener datos de prueba
		const obrasResponse = await axios.get('http://localhost:3001/api/obras')
		const jefesResponse = await axios.get('http://localhost:3001/api/jefes-obra')
		const empleadosResponse = await axios.get('http://localhost:3001/api/obras/24582593-a257-800e-87c8-ded52b33cd68/empleados')
		
		if (obrasResponse.data.length === 0) {
			console.log('❌ No hay obras disponibles para la prueba')
			return
		}
		
		if (jefesResponse.data.length === 0) {
			console.log('❌ No hay jefes de obra disponibles para la prueba')
			return
		}
		
		if (empleadosResponse.data.length === 0) {
			console.log('❌ No hay empleados disponibles para la prueba')
			return
		}
		
		const obra = obrasResponse.data[0]
		const jefe = jefesResponse.data[0]
		const empleado = empleadosResponse.data[0]
		
		console.log(`📋 Usando obra: ${obra.nombre}`)
		console.log(`👤 Usando jefe: ${jefe.nombre}`)
		console.log(`👷 Usando empleado: ${empleado.nombre}`)
		
		// Datos de prueba con empleado
		const datosParte = {
			obra: obra.nombre,
			obraId: obra.id,
			fecha: new Date().toISOString(),
			jefeObraId: jefe.id,
			notas: 'Prueba de creación de parte con empleados',
			empleados: [empleado.id],
			empleadosHoras: {
				[empleado.id]: 8.5
			}
		}
		
		console.log('📤 Enviando datos:', datosParte)
		
		// Crear el parte
		const response = await axios.post('http://localhost:3001/api/partes-trabajo', datosParte)
		
		console.log('✅ Parte creado exitosamente:')
		console.log('   ID:', response.data.id)
		console.log('   Nombre:', response.data.properties?.Nombre?.title?.[0]?.plain_text)
		console.log('   Empleados asignados:', response.data.empleadosCreados || 0)
		console.log('   Detalles creados:', response.data.detallesCreados || 0)
		console.log('   Errores en detalles:', response.data.erroresDetalles || 0)
		
		if (response.data.erroresDetalles > 0) {
			console.log('❌ Errores en detalles:', response.data.erroresDetalles)
		}
		
	} catch (error) {
		console.error('❌ Error en la prueba:', error.response?.data || error.message)
	}
}

testCrearParteConEmpleados() 