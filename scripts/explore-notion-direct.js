const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const NOTION_TOKEN = 'YOUR_NOTION_TOKEN_HERE';
const NOTION_API = 'https://api.notion.com/v1';

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

async function getDatabaseInfo(databaseId, databaseName) {
	try {
		console.log(`\n=== Explorando ${databaseName} ===`);
		
		// Obtener información de la base de datos
		const dbResponse = await axios.get(`${NOTION_API}/databases/${databaseId}`, {
			headers: {
				'Authorization': `Bearer ${NOTION_TOKEN}`,
				'Notion-Version': '2022-06-28'
			}
		});
		
		const db = dbResponse.data;
		const title = db.title[0]?.plain_text || 'Sin título';
		
		console.log(`Título: ${title}`);
		console.log('Propiedades:');
		
		const properties = {};
		Object.keys(db.properties).forEach(propName => {
			const prop = db.properties[propName];
			properties[propName] = {
				type: prop.type,
				description: getPropertyDescription(prop)
			};
			console.log(`  - ${propName}: ${prop.type} ${getPropertyDescription(prop)}`);
		});
		
		// Obtener algunos registros de ejemplo
		const queryResponse = await axios.post(`${NOTION_API}/databases/${databaseId}/query`, {
			page_size: 3
		}, {
			headers: {
				'Authorization': `Bearer ${NOTION_TOKEN}`,
				'Notion-Version': '2022-06-28',
				'Content-Type': 'application/json'
			}
		});
		
		console.log(`\nRegistros encontrados: ${queryResponse.data.results.length}`);
		
		// Mostrar ejemplo del primer registro
		if (queryResponse.data.results.length > 0) {
			console.log('Ejemplo de registro:');
			const sampleRecord = queryResponse.data.results[0];
			Object.keys(sampleRecord.properties).forEach(propName => {
				const prop = sampleRecord.properties[propName];
				const value = extractPropertyValue(prop);
				console.log(`  ${propName}: ${value}`);
			});
		}
		
		return {
			id: databaseId,
			title,
			properties,
			sampleRecords: queryResponse.data.results.slice(0, 2)
		};
		
	} catch (error) {
		console.error(`Error al explorar ${databaseName}:`, error.response?.data || error.message);
		return null;
	}
}

function getPropertyDescription(property) {
	switch (property.type) {
		case 'title':
			return '(título)';
		case 'rich_text':
			return '(texto)';
		case 'number':
			return `(número${property.number?.format ? ` - ${property.number.format}` : ''})`;
		case 'select':
			return `(selección${property.select?.options ? ` - ${property.select.options.length} opciones` : ''})`;
		case 'multi_select':
			return `(selección múltiple${property.multi_select?.options ? ` - ${property.multi_select.options.length} opciones` : ''})`;
		case 'date':
			return '(fecha)';
		case 'checkbox':
			return '(checkbox)';
		case 'url':
			return '(URL)';
		case 'email':
			return '(email)';
		case 'phone_number':
			return '(teléfono)';
		case 'relation':
			return `(relación con ${property.relation?.database_id ? 'otra BD' : 'BD'})`;
		case 'rollup':
			return '(rollup)';
		case 'formula':
			return '(fórmula)';
		case 'created_time':
			return '(tiempo creado)';
		case 'created_by':
			return '(creado por)';
		case 'last_edited_time':
			return '(última edición)';
		case 'last_edited_by':
			return '(editado por)';
		default:
			return `(${property.type})`;
	}
}

function extractPropertyValue(property) {
	switch (property.type) {
		case 'title':
			return property.title[0]?.plain_text || '';
		case 'rich_text':
			return property.rich_text[0]?.plain_text || '';
		case 'number':
			return property.number || '';
		case 'select':
			return property.select?.name || '';
		case 'multi_select':
			return property.multi_select.map(opt => opt.name).join(', ') || '';
		case 'date':
			return property.date?.start || '';
		case 'checkbox':
			return property.checkbox ? 'Sí' : 'No';
		case 'url':
			return property.url || '';
		case 'email':
			return property.email || '';
		case 'phone_number':
			return property.phone_number || '';
		case 'relation':
			return `[${property.relation.length} relaciones]`;
		case 'rollup':
			return '[rollup]';
		case 'formula':
			return property.formula?.string || property.formula?.number || property.formula?.boolean || '';
		case 'created_time':
			return property.created_time || '';
		case 'created_by':
			return property.created_by?.name || '';
		case 'last_edited_time':
			return property.last_edited_time || '';
		case 'last_edited_by':
			return property.last_edited_by?.name || '';
		default:
			return `[${property.type}]`;
	}
}

async function exploreAllDatabases() {
	console.log('🚀 Explorando todas las bases de datos de Notion...\n');
	
	const results = {};
	
	for (const [name, id] of Object.entries(DATABASES)) {
		const result = await getDatabaseInfo(id, name);
		if (result) {
			results[name] = result;
		}
		// Pausa entre requests para no sobrecargar la API
		await new Promise(resolve => setTimeout(resolve, 1000));
	}
	
	console.log('\n✅ Exploración completada');
	return results;
}

function saveResults(results) {
	const docsDir = path.join(__dirname, '..', 'docs');
	if (!fs.existsSync(docsDir)) {
		fs.mkdirSync(docsDir, { recursive: true });
	}
	
	const outputFile = path.join(docsDir, 'notion-schema-detailed.md');
	
	let content = `# Esquema Detallado de Bases de Datos - Notion

## Configuración API
- **Token**: \`${NOTION_TOKEN}\`
- **API**: \`${NOTION_API}\`

## Bases de Datos

`;

	Object.entries(results).forEach(([name, db]) => {
		content += `### ${name} (${db.title})
- **ID**: \`${db.id}\`
- **Descripción**: ${db.title}

#### Propiedades:
`;

		Object.entries(db.properties).forEach(([propName, prop]) => {
			content += `- **${propName}**: ${prop.type} ${prop.description}\n`;
		});
		
		content += '\n#### Ejemplo de Registro:\n';
		if (db.sampleRecords.length > 0) {
			const sample = db.sampleRecords[0];
			Object.entries(sample.properties).forEach(([propName, prop]) => {
				const value = extractPropertyValue(prop);
				content += `- **${propName}**: ${value}\n`;
			});
		}
		
		content += '\n---\n\n';
	});
	
	fs.writeFileSync(outputFile, content);
	console.log(`📄 Resultados guardados en: ${outputFile}`);
}

// Ejecutar exploración
if (require.main === module) {
	exploreAllDatabases()
		.then(results => {
			console.log('\n📊 Resumen de resultados:');
			Object.keys(results).forEach(dbName => {
				const db = results[dbName];
				console.log(`  - ${dbName} (${db.title}): ${Object.keys(db.properties).length} propiedades`);
			});
			
			saveResults(results);
		})
		.catch(error => {
			console.error('Error en la exploración:', error);
		});
}

module.exports = { exploreAllDatabases, DATABASES }; 