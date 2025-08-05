# 🏗️ Copuno - Gestión de Partes

Aplicación web moderna para la gestión de partes de trabajo con backend en Notion. Diseñada con una interfaz minimalista y elegante, optimizada para usuarios de todos los niveles.

## ✨ Características

### 🔗 Conectividad Robusta
- ✅ **Conexión directa con Notion API**
- ✅ **Datos reales en tiempo real** (sin datos sintéticos)
- ✅ **Manejo de errores avanzado** con reintentos automáticos
- ✅ **Health check** para monitoreo de conectividad
- ✅ **Logging detallado** para debugging

### 🎨 Interfaz Moderna
- ✅ **Diseño minimalista** con mejores prácticas de UI/UX
- ✅ **Sistema de variables CSS** para consistencia visual
- ✅ **Responsive design** para todos los dispositivos
- ✅ **Animaciones suaves** y feedback visual
- ✅ **Accesibilidad mejorada** con focus states

### 📊 Funcionalidades Principales
- ✅ **Consultar partes existentes** con filtros avanzados
- ✅ **Crear nuevos partes** con formulario intuitivo
- ✅ **Modal de detalles** con información completa
- ✅ **Filtros por obra y fecha** funcionales
- ✅ **Formato de fechas español** (DD-MM-YYYY HH:MM)

### 🔧 Características Técnicas
- ✅ **Frontend:** React + Vite
- ✅ **Backend:** Node.js + Express
- ✅ **Base de datos:** Notion API
- ✅ **Estilos:** CSS Variables + Diseño moderno
- ✅ **Iconos:** Lucide React

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- Token de Notion API

### Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/javintnvn/Copuno_Gestion_Partes.git
cd Copuno_Gestion_Partes
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
# Crear archivo .env (opcional)
NOTION_TOKEN=tu_token_de_notion_aqui
```

4. **Construir la aplicación:**
```bash
npm run build
```

5. **Iniciar el servidor:**
```bash
npm run server
```

6. **Abrir en el navegador:**
```
http://localhost:3001
```

## 📁 Estructura del Proyecto

```
Copuno_Gestion_Partes/
├── src/
│   ├── App.jsx              # Componente principal
│   ├── App.css              # Estilos principales
│   └── services/
│       └── notionService.js # Servicios de Notion
├── server.js                # Servidor Express
├── scripts/
│   ├── explore-notion-direct.js    # Explorador de Notion
│   └── test-notion-direct.js       # Tests de conectividad
└── docs/
    └── notion-schema-detailed.md   # Documentación de BD
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Construir para producción
npm run preview          # Vista previa de producción

# Servidor
npm run server           # Iniciar servidor de producción
npm run start            # Alias para server

# Utilidades
npm run explore          # Explorar bases de datos de Notion
node scripts/test-notion-direct.js  # Test de conectividad
```

## 🎯 Funcionalidades Detalladas

### Consultar Partes
- **Filtros avanzados:** Por obra y fecha
- **Vista de detalles:** Modal con información completa
- **Formato español:** Fechas en DD-MM-YYYY HH:MM
- **Estados visuales:** Badges de estado con colores

### Crear Partes
- **Formulario intuitivo:** Selección de obra y jefe
- **Validación en tiempo real:** Campos requeridos
- **Integración con Notion:** Creación directa en la BD

### Conectividad
- **Health check:** `/api/health`
- **Endpoints disponibles:**
  - `GET /api/obras` - Lista de obras
  - `GET /api/empleados` - Lista de empleados
  - `GET /api/jefes-obra` - Lista de jefes
  - `GET /api/partes-trabajo` - Lista de partes
  - `POST /api/partes-trabajo` - Crear parte

## 🎨 Diseño y UX

### Principios de Diseño
- **Minimalismo:** Interfaz limpia y sin distracciones
- **Consistencia:** Sistema de variables CSS
- **Accesibilidad:** Contraste adecuado y focus states
- **Responsive:** Adaptable a todos los dispositivos

### Paleta de Colores
- **Primario:** Azul profesional (#2563eb)
- **Secundario:** Gris neutro (#64748b)
- **Éxito:** Verde (#059669)
- **Advertencia:** Naranja (#d97706)
- **Error:** Rojo (#dc2626)

## 🔍 Debugging y Monitoreo

### Logs de Desarrollo
```javascript
// En la consola del navegador
📊 Datos cargados: {obras: 5, empleados: 8, ...}
🏗️ Obras cargadas: 5
👥 Empleados cargados: 8
👨‍💼 Jefes de obra cargados: 3
```

### Health Check
```bash
curl http://localhost:3001/api/health
# Respuesta: {"status":"ok","timestamp":"...","notionToken":"configured"}
```

## 🚀 Despliegue

### Opciones de Despliegue
1. **Vercel:** Despliegue automático desde GitHub
2. **Netlify:** Drag & drop del build
3. **Heroku:** Conectar repositorio Git
4. **Railway:** Despliegue con Node.js

### Variables de Entorno
```bash
NOTION_TOKEN=tu_token_de_notion
PORT=3001
NODE_ENV=production
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Changelog

### v1.1.0 - Mejoras de Interfaz
- ✅ Interfaz minimalista y elegante
- ✅ Modal de detalles funcional
- ✅ Logo clickeable
- ✅ Formato de fechas español
- ✅ Filtros mejorados
- ✅ Sistema de variables CSS

### v1.0.0 - Versión Inicial
- ✅ Conectividad con Notion
- ✅ CRUD básico de partes
- ✅ Interfaz funcional

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Javi** - [GitHub](https://github.com/javintnvn)

---

⭐ **¡Dale una estrella al proyecto si te ha sido útil!** 