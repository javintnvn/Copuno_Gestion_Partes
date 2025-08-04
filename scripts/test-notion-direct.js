const axios = require('axios');

// Configuración
const NOTION_TOKEN = 'YOUR_NOTION_TOKEN_HERE';
const NOTION_API = 'https://api.notion.com/v1';

// Bases de datos corregidas
const DATABASES = {
	OBRAS: '20882593a257810083d6dc8ec0a99d58',
	JEFE_OBRAS: '20882593a25781b4a3b9e0ff5589ea4e',
	EMPLEADOS: '20882593a257814db882c4b70cb0cbab',
	PARTES_TRABAJO: '20882593a25781258595e15abb37e87a',
	DETALLES_HORA: '20882593a25781838da1fe6741abcfd9'
};

// Función para hacer requests a Notion con manejo de errores
const makeNotionRequest = async (method, endpoint, data = null) => {
	try {
		const config = {
			method,
			url: `${NOTION_API}${endpoint}`,
			headers: {
				'Authorization': `Bearer ${NOTION_TOKEN}`,
				'Notion-Version': '2022-06-28',
				'Content-Type': 'application/json'
			},
			timeout: 10000
		};

		if (data) {
			config.data = data;
		}

		const response = await axios(config);
		return response.data;
	} catch (error) {
		throw {
			status: error.response?.status,
			message: error.response?.data?.message || error.message,
			code: error.response?.data?.code
		};
	}
};

async function testNotionAccess() {
	try {
		console.log('🔍 Probando acceso directo a Notion API...\n');
		
		// Probar con una base de datos
		const testDbId = DATABASES.OBRAS;
		
		console.log(`Probando acceso a base de datos: ${testDbId}`);
		
		const data = await makeNotionRequest('GET', `/databases/${testDbId}`);
		
		console.log('✅ Acceso exitoso a Notion API');
		console.log('Información de la base de datos:');
		console.log('- Título:', data.title[0]?.plain_text || 'Sin título');
		console.log('- Propiedades:', Object.keys(data.properties));
		
		return true;
		
	} catch (error) {
		console.error('❌ Error al acceder a Notion API:');
		console.error('Status:', error.status);
		console.error('Message:', error.message);
		console.error('Code:', error.code);
		
		if (error.status === 401) {
			console.error('🔑 Error de autenticación - Verificar token');
		} else if (error.status === 403) {
			console.error('🚫 Error de permisos - Verificar acceso a la base de datos');
		} else if (error.status === 404) {
			console.error('🔍 Base de datos no encontrada - Verificar ID');
		} else if (error.status === 429) {
			console.error('⏰ Rate limit excedido - Esperar antes de reintentar');
		}
		
		return false;
	}
}

async function testAllDatabases() {
	console.log('\n🔍 Probando acceso a todas las bases de datos...\n');
	
	const results = {};
	
	for (const [name, id] of Object.entries(DATABASES)) {
		try {
			console.log(`Probando ${name} (${id})...`);
			const data = await makeNotionRequest('GET', `/databases/${id}`);
			results[name] = {
				status: 'ok',
				title: data.title[0]?.plain_text || 'Sin título',
				properties: Object.keys(data.properties).length
			};
			console.log(`✅ ${name}: OK - ${data.title[0]?.plain_text || 'Sin título'}`);
		} catch (error) {
			results[name] = {
				status: 'error',
				error: error.message,
				code: error.code
			};
			console.log(`❌ ${name}: ERROR - ${error.message}`);
		}
		
		// Pausa entre requests
		await new Promise(resolve => setTimeout(resolve, 500));
	}
	
	return results;
}

async function testLocalServer() {
	try {
		console.log('\n🔍 Probando servidor local...\n');
		
		const LOCAL_API = 'http://localhost:3001';
		
		// Probar health check
		console.log('Probando health check...');
		const healthResponse = await axios.get(`${LOCAL_API}/api/health`, {
			timeout: 5000
		});
		
		console.log('✅ Health check exitoso');
		console.log('Respuesta:', healthResponse.data);
		
		// Probar endpoint de obras
		console.log('\nProbando endpoint de obras...');
		const obrasResponse = await axios.get(`${LOCAL_API}/api/obras`, {
			timeout: 10000
		});
		
		console.log('✅ Endpoint de obras exitoso');
		console.log('Obras encontradas:', obrasResponse.data.length);
		
		return true;
		
	} catch (error) {
		console.error('❌ Error al acceder al servidor local:');
		console.error('Status:', error.response?.status);
		console.error('Message:', error.response?.data?.error || error.message);
		
		if (error.code === 'ECONNREFUSED') {
			console.error('🔌 Servidor no está ejecutándose en puerto 3001');
		} else if (error.response?.status === 404) {
			console.error('🔍 Endpoint no encontrado');
		}
		
		return false;
	}
}

async function testProxyAccess() {
	try {
		console.log('\n🔍 Probando acceso al proxy externo...\n');
		
		const PROXY_API = 'https://copuno.onrender.com/notion/';
		
		// Probar endpoint básico
		const response = await axios.get(`${PROXY_API}`, {
			timeout: 10000
		});
		
		console.log('✅ Proxy accesible');
		console.log('Respuesta:', response.data);
		
		return true;
		
	} catch (error) {
		console.error('❌ Error al acceder al proxy:');
		console.error('Status:', error.response?.status);
		console.error('Message:', error.response?.data || error.message);
		
		return false;
	}
}

async function generateReport(notionAccess, localServer, proxyAccess, databaseResults) {
	console.log('\n📊 REPORTE DE CONECTIVIDAD');
	console.log('=' .repeat(50));
	
	console.log('\n🔑 Acceso directo a Notion:');
	console.log(`   Estado: ${notionAccess ? '✅ CONECTADO' : '❌ FALLIDO'}`);
	
	console.log('\n🏠 Servidor local:');
	console.log(`   Estado: ${localServer ? '✅ FUNCIONANDO' : '❌ NO DISPONIBLE'}`);
	
	console.log('\n🌐 Proxy externo:');
	console.log(`   Estado: ${proxyAccess ? '✅ ACCESIBLE' : '❌ NO DISPONIBLE'}`);
	
	console.log('\n📋 Bases de datos de Notion:');
	Object.entries(databaseResults).forEach(([name, result]) => {
		const status = result.status === 'ok' ? '✅' : '❌';
		const info = result.status === 'ok' 
			? `${result.title} (${result.properties} propiedades)`
			: result.error;
		console.log(`   ${name}: ${status} ${info}`);
	});
	
	console.log('\n💡 RECOMENDACIONES:');
	
	if (!notionAccess) {
		console.log('• Verificar que el token de Notion sea válido');
		console.log('• Verificar que el token tenga permisos para acceder a las bases de datos');
		console.log('• Verificar que los IDs de las bases de datos sean correctos');
	}
	
	if (!localServer) {
		console.log('• Iniciar el servidor local con: npm run server');
		console.log('• Verificar que el puerto 3001 esté disponible');
	}
	
	if (!proxyAccess) {
		console.log('• El proxy externo no está disponible');
		console.log('• Usar el servidor local para desarrollo');
	}
	
	const workingDatabases = Object.values(databaseResults).filter(r => r.status === 'ok').length;
	const totalDatabases = Object.keys(databaseResults).length;
	
	if (workingDatabases < totalDatabases) {
		console.log(`• ${totalDatabases - workingDatabases} bases de datos no están accesibles`);
		console.log('• Verificar permisos y IDs de las bases de datos');
	}
	
	console.log('\n✅ CONECTIVIDAD OPTIMA:');
	if (notionAccess && localServer && workingDatabases === totalDatabases) {
		console.log('• Todas las conexiones funcionan correctamente');
		console.log('• La aplicación está lista para usar');
	} else {
		console.log('• Hay problemas de conectividad que deben resolverse');
	}
}

async function main() {
	console.log('🚀 Iniciando pruebas de conectividad...\n');
	
	const notionAccess = await testNotionAccess();
	const databaseResults = await testAllDatabases();
	const localServer = await testLocalServer();
	const proxyAccess = await testProxyAccess();
	
	await generateReport(notionAccess, localServer, proxyAccess, databaseResults);
}

if (require.main === module) {
	main().catch(console.error);
} 