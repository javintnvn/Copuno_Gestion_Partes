# 🏗️ Copuno - Gestión de Partes

Aplicación web moderna para la gestión de partes de trabajo con backend en Notion. Diseñada con una interfaz minimalista y elegante, optimizada para usuarios de todos los niveles.

## ✨ Características

### 🔗 Conectividad Robusta
- ✅ **Conexión directa con Notion API**
- ✅ **Datos reales en tiempo real** (sin datos sintéticos)
- ✅ **Smart Polling adaptativo** - Sincronización inteligente según actividad
- ✅ **Manejo de errores avanzado** con reintentos automáticos
- ✅ **Health check** para monitoreo de conectividad
- ✅ **Logging detallado** para debugging

### 🎨 Interfaz Moderna
- ✅ **Pantalla principal elegante** con navegación intuitiva
- ✅ **Diseño minimalista** con mejores prácticas de UI/UX
- ✅ **Sistema de variables CSS** para consistencia visual
- ✅ **Responsive design** para todos los dispositivos
- ✅ **Animaciones suaves** y feedback visual
- ✅ **Accesibilidad mejorada** con focus states

### 📊 Funcionalidades Principales
- ✅ **Pantalla de bienvenida** con navegación clara
- ✅ **Consultar partes existentes** con filtros avanzados
- ✅ **Crear nuevos partes** con formulario intuitivo
- ✅ **Editar partes existentes** con validación de estados
- ✅ **Modal de detalles** con información completa
- ✅ **Filtros por obra y fecha** funcionales
- ✅ **Formato de fechas español** (DD-MM-YYYY HH:MM)
- ✅ **Gestión avanzada de empleados** por obra
- ✅ **Control de estados** y permisos de edición
- ✅ **Sincronización inteligente** con indicadores visuales en tiempo real

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
# Crear archivo .env (recomendado)
NOTION_TOKEN=YOUR_NOTION_TOKEN
# PORT=3001
# ALLOWED_ORIGINS=https://tudominio.com,https://app.tudominio.com
# USE_MOCK_DATA=true  # Activa datos simulados para pruebas locales sin Notion
# PARTES_DATOS_WEBHOOK_URL=https://tuwebhook.com/evento  # URL para "Enviar Datos"
# PARTES_WEBHOOK_TIMEOUT_MS=10000                         # (opcional) timeout en ms
```
Si no configuras `PARTES_DATOS_WEBHOOK_URL`, el backend simula el envío y deja un log con el payload para permitir pruebas locales.
La carga de `.env` es automática (dotenv). Más detalles en `docs/CONFIGURACION_ENTORNO.md`.

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
    ├── notion-schema-detailed.md   # Documentación de BD
    ├── ESTADO_ACTUAL_V1.3.0.md    # Estado actual del proyecto
    ├── ROADMAP_FUTURAS_VERSIONES.md # Planificación futura
    └── COMANDOS_UTILES.md          # Comandos de desarrollo
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

### 🏠 Pantalla Principal
- **Pantalla de bienvenida:** Interfaz elegante y acogedora
- **Navegación intuitiva:** Botones grandes y accesibles
- **Diseño centrado:** Layout optimizado para usuarios
- **Mensaje descriptivo:** Información clara sobre el proyecto

### Consultar Partes
- **Filtros avanzados:** Por obra y fecha
- **Vista de detalles:** Modal con información completa
- **Formato español:** Fechas en DD-MM-YYYY HH:MM
- **Estados visuales:** Badges de estado con colores
- **Botones de edición:** Acceso directo a modificar partes

### Crear Partes
- **Formulario intuitivo:** Selección de obra y jefe
- **Gestión de empleados:** Asignación por obra específica
- **Control de horas:** Asignación individual por empleado
- **Validación en tiempo real:** Campos requeridos
- **Integración con Notion:** Creación directa en la BD

### ✏️ Editar Partes (NUEVO)
- **Edición inteligente:** Verificación de estados editables
- **Estados protegidos:** Partes firmados/enviados no editables
- **Validación de permisos:** Control de qué partes se pueden editar
- **Mensajes informativos:** Feedback claro sobre estados no editables
- **Interfaz de edición:** Formulario completo para modificar partes

### 👥 Gestión Avanzada de Empleados
- **Empleados por obra:** Carga específica según obra seleccionada
- **Empleados por parte:** Lista detallada de empleados asignados
- **Control de horas:** Asignación individual por empleado
- **Estados de carga:** Loading states para todas las operaciones

### 🔍 Detalles Completos de Partes
- **Información integral:** Datos del parte + empleados + persona autorizada
- **Empleados asignados:** Lista detallada con horas individuales
- **Estados de carga:** Feedback visual durante consultas
- **Datos estructurados:** Información organizada y accesible

### Conectividad
- **Health check:** `/api/health`
- **Endpoints disponibles:**
  - `GET /api/obras` - Lista de obras
  - `GET /api/empleados` - Lista de empleados
  - `GET /api/jefes-obra` - Lista de jefes
  - `GET /api/partes-trabajo` - Lista de partes
  - `POST /api/partes-trabajo` - Crear parte
  - `PUT /api/partes-trabajo/:id` - Editar parte
  - `GET /api/obras/:obraId/empleados` - Empleados de obra específica
  - `GET /api/partes-trabajo/:parteId/detalles` - Detalles completos de parte
  - `GET /api/partes-trabajo/:parteId/empleados` - Empleados de parte específico

## 🎨 Diseño y UX

### Principios de Diseño
- **Minimalismo:** Interfaz limpia y sin distracciones
- **Consistencia:** Sistema de variables CSS
- **Accesibilidad:** Contraste adecuado y focus states
- **Responsive:** Adaptable a todos los dispositivos

### Pantalla Principal
- **Bienvenida elegante:** Mensaje descriptivo del proyecto
- **Navegación clara:** Botones de acción prominentes
- **Diseño centrado:** Layout optimizado para primera impresión
- **Feedback visual:** Estados hover y focus mejorados

### Gestión de Estados
- **Estados no editables:** firmado, datos enviados, enviado
- **Validación automática:** Verificación antes de permitir edición
- **Mensajes contextuales:** Información específica por estado
- **Prevención de errores:** Evita modificaciones no permitidas

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

### v1.4.0 - Smart Polling y Optimización de Sincronización ⭐ **ACTUAL**
- ✅ **Smart Polling adaptativo** - Sistema de sincronización inteligente con 3 niveles
- ✅ **Optimización de API** - Consumo reducido 60% en picos de actividad
- ✅ **Indicadores visuales** - Badge animado mostrando modo de sincronización actual
- ✅ **Detección de cambios** - Hash-based change detection para evitar updates innecesarios
- ✅ **Latencia ultra-baja** - 3 segundos de actualización cuando hay actividad
- ✅ **Escalabilidad mejorada** - Soporte para 10+ usuarios concurrentes
- ✅ **Documentación técnica** - [SMART_POLLING.md](docs/SMART_POLLING.md) completa

### v1.3.0 - Funcionalidad de Edición y Gestión Avanzada
- ✅ **Funcionalidad de edición de partes** - Endpoint PUT completo
- ✅ **Validación de estados editables** - Control granular de permisos
- ✅ **Gestión avanzada de empleados** - Asignación y horas individuales
- ✅ **Detalles completos de partes** - Información integral
- ✅ **Control granular de permisos** - Estados protegidos
- ✅ **Interfaz profesional y moderna** - UX optimizada
- ✅ **Documentación completa** - Estado actual y roadmap futuro

### v1.2.0 - Pantalla Principal y Navegación Mejorada
- ✅ Pantalla de bienvenida elegante
- ✅ Navegación intuitiva y clara
- ✅ Diseño centrado y profesional
- ✅ Mejor experiencia de usuario
- ✅ Accesibilidad mejorada

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

## 📚 **Documentación Adicional**

### **⚡ Sincronización y Rendimiento**
- **[SMART_POLLING.md](docs/SMART_POLLING.md)** - Sistema de sincronización inteligente
- **Arquitectura adaptativa** con 3 niveles de polling
- **Análisis de consumo de API** y límites de Notion
- **Guía de configuración** y troubleshooting

### **📋 Estado Actual del Proyecto**
- **[ESTADO_ACTUAL_V1.3.0.md](docs/ESTADO_ACTUAL_V1.3.0.md)** - Documentación completa del estado actual
- **Punto de referencia sólido** para futuras versiones
- **Arquitectura detallada** y funcionalidades implementadas

### **🗺️ Roadmap de Futuras Versiones**
- **[ROADMAP_FUTURAS_VERSIONES.md](docs/ROADMAP_FUTURAS_VERSIONES.md)** - Planificación detallada
- **Versión 1.5.0:** Eliminación y exportación de datos
- **Versión 1.6.0:** Dashboard y analytics
- **Versión 1.7.0:** Autenticación y seguridad
- **Versión 2.0.0:** PWA y mobile

### **🛠️ Comandos de Desarrollo**
- **[COMANDOS_UTILES.md](docs/COMANDOS_UTILES.md)** - Guía completa de comandos
- **Debugging y monitoreo** avanzado
- **Testing y despliegue** automatizado
- **Troubleshooting** común

### **⚙️ Operaciones Backend**
- **[CONFIGURACION_ENTORNO.md](docs/CONFIGURACION_ENTORNO.md)** - Variables y buenas prácticas
- **[OPERACIONES_BACKEND.md](docs/OPERACIONES_BACKEND.md)** - Estado, decisiones y siguientes pasos
- **[DESARROLLADORES.md](docs/DESARROLLADORES.md)** - Guía para desarrolladores (setup, flujos, convenciones)
- **[API_REFERENCIA.md](docs/API_REFERENCIA.md)** - Endpoints de API y reglas de validación

> Nota: Por requerimiento del cliente, la UI y la API no exponen datos económicos. El backend purga y sanea cualquier información económica de las respuestas.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Javi** - [GitHub](https://github.com/javintnvn)

---

⭐ **¡Dale una estrella al proyecto si te ha sido útil!** 
