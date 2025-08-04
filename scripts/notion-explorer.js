const axios = require('axios');

// Configuración
const NOTION_TOKEN = 'YOUR_NOTION_TOKEN_HERE';
const PROXY_API = 'https://copuno.onrender.com/notion/';

// Bases de datos
const DATABASES = {
	OBRAS: '20882593a257810083d6dc8ec0a99d58',
	JEFE_OBRAS: '20882593a25781b4a3b9e0ff5589ea4e',
	PRECIOS_HORA: '20882593a257819f99cfe7f070547217',
	DETALLES_HORA: '20882593a25781838da1fe6741abcfd9',
	EMPLEADOS: '20882593a257814db882c4b70cb0cbab',
	PARTES_TRABAJO: '20882593a25781258595e15abb37e87a',
	RESPONSABLES_PRL: '23f82593a25780119eeb000ce1eb7970',
	CLIENTES: '23f82593a25780829fba000cc1ea7'
};

async function getDatabaseSchema(databaseId, databaseName) {
	try {
		console.log(`\n=== Explorando ${databaseName} ===`);
		
		// Obtener información de la base de datos
		const dbResponse = await axios.get(`${PROXY_API}databases/${databaseId}`, {
			headers: {
				'Authorization': `Bearer ${NOTION_TOKEN}`,
				'Notion-Version': '2022-06-28'
			}
		});
		
		console.log('Propiedades de la base de datos:');
		const properties = dbResponse.data.properties;
		Object.keys(properties).forEach(propName => {
			const prop = properties[propName];
			console.log(`  - ${propName}: ${prop.type}`);
		});
		
		// Obtener algunos registros de ejemplo
		const queryResponse = await axios.post(`${PROXY_API}databases/${databaseId}/query`, {
			page_size: 5
		}, {
			headers: {
				'Authorization': `Bearer ${NOTION_TOKEN}`,
				'Notion-Version': '2022-06-28',
				'Content-Type': 'application/json'
			}
		});
		
		console.log(`\nRegistros encontrados: ${queryResponse.data.results.length}`);
		
		return {
			properties,
			sampleRecords: queryResponse.data.results
		};
		
	} catch (error) {
		console.error(`Error al explorar ${databaseName}:`, error.response?.data || error.message);
		return null;
	}
}

async function exploreAllDatabases() {
	console.log('🚀 Explorando todas las bases de datos de Notion...\n');
	
	const results = {};
	
	for (const [name, id] of Object.entries(DATABASES)) {
		const result = await getDatabaseSchema(id, name);
		if (result) {
			results[name] = result;
		}
		// Pausa entre requests para no sobrecargar la API
		await new Promise(resolve => setTimeout(resolve, 1000));
	}
	
	console.log('\n✅ Exploración completada');
	return results;
}

// Ejecutar exploración
if (require.main === module) {
	exploreAllDatabases()
		.then(results => {
			console.log('\n📊 Resumen de resultados:');
			Object.keys(results).forEach(dbName => {
				console.log(`  - ${dbName}: ${Object.keys(results[dbName].properties).length} propiedades`);
			});
		})
		.catch(error => {
			console.error('Error en la exploración:', error);
		});
}

module.exports = { exploreAllDatabases, DATABASES }; 