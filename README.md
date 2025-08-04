# Copuno - Gestión de Partes

Aplicación web para gestión de partes de trabajo con backend en Notion.

## Configuración de Notion

### Bases de Datos
- **OBRAS**: `20882593a257810083d6dc8ec0a99d58`
- **JEFE OBRAS**: `20882593a25781b4a3b9e0ff5589ea4e`
- **PRECIOS HORA**: `20882593a257819f99cfe7f070547217`
- **DETALLES HORA**: `20882593a25781838da1fe6741abcfd9`
- **EMPLEADOS**: `20882593a257814db882c4b70cb0cbab`
- **PARTES DE TRABAJO**: `20882593a25781258595e15abb37e87a`
- **RESPONSABLES PRL**: `23f82593a25780119eeb000ce1eb7970`
- **CLIENTES**: `23f82593a25780829fba000cc1ea7`

### Configuración API
- **TOKEN API**: `YOUR_NOTION_TOKEN_HERE`
- **PROXY API**: `https://copuno.onrender.com/notion/`

## Estructura del Proyecto

```
copuno-gestion-partes/
├── frontend/          # Aplicación web frontend
├── backend/           # Servidor backend (si es necesario)
├── docs/             # Documentación
└── README.md         # Este archivo
```

## Instalación y Configuración

### Requisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Instalación
```bash
npm install
```

### Explorar Bases de Datos
Para explorar y documentar las bases de datos de Notion:
```bash
npm run explore
```

## Documentación

### Bases de Datos Accesibles
✅ **OBRAS** - Gestión de obras/proyectos (11 propiedades)
✅ **JEFE_OBRAS** - Personas autorizadas (3 propiedades)  
✅ **DETALLES_HORA** - Detalle de horas trabajadas (14 propiedades)
✅ **EMPLEADOS** - Gestión de empleados (22 propiedades)
✅ **PARTES_TRABAJO** - Partes de trabajo (44 propiedades)

### Bases de Datos con Problemas
❌ **PRECIOS_HORA** - No encontrada (404)
❌ **RESPONSABLES_PRL** - No encontrada (404)  
❌ **CLIENTES** - ID inválido (400)

### Configuración API
- **Token Notion**: ✅ Funcionando
- **Proxy Render.com**: ❌ No disponible
- **Acceso Directo**: ✅ Funcionando

## ✅ Aplicación Completada

### Funcionalidades Implementadas

#### 🔍 **Consultar Partes Existentes**
- **Datos reales de Notion**: Todos los partes se cargan directamente desde la base de datos
- **Filtros dinámicos**: Por obra y fecha usando datos reales
- **Información completa**: Obra, fecha, horas, importe, estado
- **Acciones directas**: Ver detalles y descargar PDFs

#### ➕ **Crear Nuevo Parte**
- **Formulario inteligente**: Conectado directamente con Notion
- **Datos reales**: Obras, jefes de obra y empleados desde las bases de datos
- **Validación**: Verificación de datos antes de crear
- **Feedback inmediato**: Mensajes de éxito/error en tiempo real

### Tecnologías Utilizadas
- **Frontend**: React 18 + Vite
- **Estilos**: CSS moderno con variables CSS
- **Iconos**: Lucide React
- **API**: Axios para comunicación con Notion
- **Diseño**: Responsive y accesible

### Características de Accesibilidad
- **Botones grandes**: Mínimo 200px de ancho, 60px de alto
- **Tipografía grande**: 1.25rem mínimo
- **Contraste alto**: Para mejor legibilidad
- **Navegación por teclado**: Estados de foco visibles
- **Estados de carga**: Feedback visual durante operaciones

### Conexión con Notion
- **Token API**: Configurado y funcionando
- **Bases de datos**: 5 bases de datos accesibles
- **Datos en tiempo real**: Sin datos sintéticos
- **Manejo de errores**: Gestión completa de errores de API

## 🚀 Cómo Usar

### Desarrollo
1. **Instalar dependencias**: `npm install`
2. **Ejecutar servidor completo**: `npm run dev:full`
3. **Abrir navegador**: http://localhost:3001

### Producción
1. **Construir aplicación**: `npm run build`
2. **Ejecutar servidor**: `npm run server`
3. **Abrir navegador**: http://localhost:3001

### Explorar Datos
```bash
npm run explore
```

## ✅ **¡Problema de CORS Resuelto!**

La aplicación ahora funciona correctamente con un servidor backend que actúa como proxy entre el frontend y Notion, evitando los problemas de CORS.

### 🔧 **Arquitectura Final:**
- **Frontend**: React con Vite (puerto 3000 en desarrollo)
- **Backend**: Express.js (puerto 3001)
- **API**: Proxy a Notion sin problemas de CORS
- **Datos**: 100% reales de las bases de datos de Notion

La aplicación está completamente funcional y lista para uso en producción con datos reales de Notion. 