# 🔧 Plan de Refactorización - Copuno Gestión de Partes

**Versión:** 2.0.0
**Fecha:** 15 de Octubre de 2025
**Estado Actual:** v1.3.0

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Análisis de la Arquitectura Actual](#análisis-de-la-arquitectura-actual)
3. [Problemas Identificados](#problemas-identificados)
4. [Propuesta de Refactorización](#propuesta-de-refactorización)
5. [Plan de Implementación](#plan-de-implementación)
6. [Estructura Propuesta](#estructura-propuesta)
7. [Mejoras Técnicas Detalladas](#mejoras-técnicas-detalladas)
8. [Migración y Testing](#migración-y-testing)
9. [Timeline y Fases](#timeline-y-fases)

---

## 📊 Resumen Ejecutivo

### Estado Actual
- **Líneas de código:** ~1.850 líneas en App.jsx
- **Componentes:** 3 componentes monolíticos en un solo archivo
- **Servicios:** 1 archivo de servicios centralizado
- **Estilos:** 2 archivos CSS globales
- **Gestión de estado:** useState local sin contexto global
- **Performance:** Polling cada 30s sin optimización

### Objetivos de la Refactorización
1. **Modularización**: Separar componentes en archivos independientes
2. **Escalabilidad**: Preparar la arquitectura para futuras funcionalidades
3. **Mantenibilidad**: Código más legible y fácil de mantener
4. **Performance**: Optimizar renderizados y gestión de estado
5. **Testing**: Facilitar pruebas unitarias y de integración
6. **TypeScript**: Migración gradual para mayor type-safety

---

## 🏗️ Análisis de la Arquitectura Actual

### Estructura Actual
```
src/
├── App.jsx (1843 líneas) ⚠️
│   ├── App (componente principal)
│   ├── PantallaPrincipal (componente)
│   ├── ConsultaPartes (componente - 640 líneas)
│   └── CrearParte (componente - 443 líneas)
├── App.css (estilos globales)
├── main.jsx (entry point)
└── services/
    └── notionService.js (313 líneas)
```

### Backend (server.js)
```
server.js (1299 líneas) ⚠️
├── Configuración y middlewares (95 líneas)
├── Funciones helper (145 líneas)
├── Endpoints API (1050 líneas)
└── Lógica de negocio mezclada
```

---

## ⚠️ Problemas Identificados

### 1. **Arquitectura Frontend**

#### 1.1 Componentes Monolíticos
- **App.jsx**: 1843 líneas en un solo archivo
- **ConsultaPartes**: 640 líneas con múltiples responsabilidades
- **CrearParte**: 443 líneas con lógica compleja
- Violación del principio de responsabilidad única

#### 1.2 Gestión de Estado
```javascript
// Problema: Estado distribuido sin contexto global
const [datos, setDatos] = useState({ ... })           // Datos globales
const [loading, setLoading] = useState(true)           // Estado de carga
const [error, setError] = useState(null)               // Errores
const [connectivity, setConnectivity] = useState({})   // Conectividad
const [estadoOptions, setEstadoOptions] = useState({}) // Opciones
// + 20 estados locales más en subcomponentes
```

**Problemas:**
- Prop drilling extremo
- Re-renders innecesarios
- Difícil sincronización entre componentes
- No hay single source of truth

#### 1.3 Lógica de Negocio Mezclada
```javascript
// En ConsultaPartes.jsx - Lógica mezclada con UI
const iniciarEdicion = async (parte) => {
  // Lógica de transformación de datos
  const obraEncontrada = datos.obras.find(...)
  const detallesCompletos = await getDetallesCompletosParte(...)

  // Transformación compleja de relaciones Notion
  let personaAutorizadaId = ''
  if (Array.isArray(detallesCompletos.parte.personaAutorizada)) {
    personaAutorizadaId = detallesCompletos.parte.personaAutorizada[0].id
  } else if (typeof detallesCompletos.parte.personaAutorizada === 'object') {
    personaAutorizadaId = detallesCompletos.parte.personaAutorizada.id
  }
  // ... más lógica
}
```

**Problemas:**
- Lógica de transformación en componentes UI
- Difícil de testear
- Código duplicado entre componentes
- No reutilizable

#### 1.4 Código Duplicado
```javascript
// Duplicado en CrearParte y ConsultaPartes
const mapNotionColorToHex = (color) => { ... }
const getEstadoOptionByName = (name) => { ... }
const normalizeEstadoForApi = (valor) => { ... }
const clampRoundHoras = (val) => { ... }
```

### 2. **Arquitectura Backend**

#### 2.1 Server.js Monolítico
```javascript
// server.js - 1299 líneas
// Problemas:
- Configuración mezclada con rutas
- Funciones helper inline
- Lógica de negocio en endpoints
- No hay separación de capas
```

#### 2.2 Sin Validación de Esquemas
```javascript
// Validación manual repetida
app.post('/api/partes-trabajo', async (req, res) => {
  const { obra, obraId, fecha, jefeObraId, notas, empleados, empleadosHoras } = req.body

  if (!obra || !obraId || !fecha || !jefeObraId) {
    return res.status(400).json({
      error: 'Faltan campos requeridos',
      required: ['obra', 'obraId', 'fecha', 'jefeObraId']
    })
  }
  // ...
})
```

**Problemas:**
- Validación manual en cada endpoint
- No hay esquemas reutilizables
- Errores inconsistentes
- Difícil de mantener

#### 2.3 Funciones Helper No Reutilizables
```javascript
// Funciones inline en server.js
const extractPropertyValue = (property) => { ... }  // 62 líneas
const sanitizeEconomic = (value) => { ... }         // 25 líneas
const buildEstadoUpdatePayload = (estadoProperty, nuevoEstado) => { ... }
const makeNotionRequest = async (method, endpoint, data) => { ... }
```

### 3. **Performance**

#### 3.1 Polling Ineficiente
```javascript
// Polling cada 30s sin optimización
useEffect(() => {
  const interval = setInterval(async () => {
    if (editandoParte) return  // Condición simple
    const partes = await getPartesTrabajo()
    setDatos(prev => ({ ...prev, partesTrabajo: partes }))
  }, 30000)
  return () => clearInterval(interval)
}, [])
```

**Problemas:**
- Polling global sin discriminación
- No usa cache eficientemente
- Re-fetching de datos completos
- Alto consumo de API

#### 3.2 Re-renders Innecesarios
```javascript
// Datos completos se re-cargan en cada cambio
const cargarDatos = async () => {
  const datosCompletos = await getDatosCompletos()  // Todo de nuevo
  setDatos(datosCompletos)
}
```

### 4. **Estilos y UI**

#### 4.1 CSS Global No Modular
```css
/* App.css - Estilos globales sin scope */
.empleado-item { ... }
.parte-card { ... }
.form-group { ... }
/* Riesgo de colisiones de nombres */
```

#### 4.2 Sin Sistema de Diseño
- Colores hardcodeados en múltiples lugares
- Espaciados inconsistentes
- No hay tokens de diseño centralizados
- Componentes UI no reutilizables

### 5. **Testing**
- ❌ No hay tests unitarios
- ❌ No hay tests de integración
- ❌ No hay tests E2E
- ❌ Difícil de testear por acoplamiento

---

## 🎯 Propuesta de Refactorización

### Fase 1: Modularización Frontend (Semanas 1-2)

#### 1.1 Separación de Componentes
```
src/
├── components/
│   ├── layout/
│   │   ├── Header/
│   │   │   ├── Header.jsx
│   │   │   ├── Header.module.css
│   │   │   └── index.js
│   │   ├── Layout/
│   │   │   ├── Layout.jsx
│   │   │   ├── Layout.module.css
│   │   │   └── index.js
│   │   └── ConnectivityStatus/
│   │       ├── ConnectivityStatus.jsx
│   │       ├── ConnectivityStatus.module.css
│   │       └── index.js
│   │
│   ├── pages/
│   │   ├── MainPage/
│   │   │   ├── MainPage.jsx
│   │   │   ├── MainPage.module.css
│   │   │   └── index.js
│   │   ├── ConsultaPage/
│   │   │   ├── ConsultaPage.jsx
│   │   │   ├── components/
│   │   │   │   ├── PartesTable/
│   │   │   │   ├── ParteCard/
│   │   │   │   ├── ParteDetalles/
│   │   │   │   ├── ParteEditor/
│   │   │   │   └── Filtros/
│   │   │   ├── hooks/
│   │   │   │   ├── usePartesFiltrados.js
│   │   │   │   ├── useParteEditor.js
│   │   │   │   └── useParteDetalles.js
│   │   │   ├── ConsultaPage.module.css
│   │   │   └── index.js
│   │   └── CrearPage/
│   │       ├── CrearPage.jsx
│   │       ├── components/
│   │       │   ├── FormularioParte/
│   │       │   ├── EmpleadosSelector/
│   │       │   └── ParteCreado/
│   │       ├── hooks/
│   │       │   └── useFormularioParte.js
│   │       ├── CrearPage.module.css
│   │       └── index.js
│   │
│   ├── common/
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   ├── Button.module.css
│   │   │   └── index.js
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Textarea/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Badge/
│   │   ├── Loader/
│   │   └── Alert/
│   │
│   └── features/
│       ├── empleados/
│       │   ├── EmpleadoItem/
│       │   ├── EmpleadosList/
│       │   └── EmpleadoEstadoSelector/
│       └── partes/
│           ├── ParteAcciones/
│           ├── ParteEstadoBadge/
│           └── ParteFechaDisplay/
```

#### 1.2 Gestión de Estado Global
```javascript
// src/context/AppContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext()

const initialState = {
  datos: {
    obras: [],
    jefesObra: [],
    empleados: [],
    partesTrabajo: []
  },
  ui: {
    loading: false,
    error: null,
    connectivity: { status: 'checking', message: '' }
  },
  opciones: {
    estadoEmpleados: { type: 'status', options: [] }
  }
}

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DATOS':
      return { ...state, datos: { ...state.datos, ...action.payload } }
    case 'SET_LOADING':
      return { ...state, ui: { ...state.ui, loading: action.payload } }
    case 'SET_ERROR':
      return { ...state, ui: { ...state.ui, error: action.payload } }
    case 'SET_CONNECTIVITY':
      return { ...state, ui: { ...state.ui, connectivity: action.payload } }
    case 'UPDATE_PARTE':
      return {
        ...state,
        datos: {
          ...state.datos,
          partesTrabajo: state.datos.partesTrabajo.map(p =>
            p.id === action.payload.id ? { ...p, ...action.payload.data } : p
          )
        }
      }
    default:
      return state
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Lógica de inicialización y polling
  useEffect(() => {
    // Cargar datos iniciales
    loadInitialData()

    // Iniciar polling
    const interval = setInterval(refreshPartes, 30000)

    return () => clearInterval(interval)
  }, [])

  const value = {
    state,
    dispatch,
    // Actions
    loadInitialData,
    refreshPartes,
    updateParte,
    // ...
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
```

#### 1.3 Custom Hooks Reutilizables
```javascript
// src/hooks/useParteEditor.js
import { useState, useCallback } from 'react'
import { getDetallesCompletosParte, actualizarParteTrabajo } from '@/services'
import { extractRelacionId } from '@/utils/notion'

export const useParteEditor = () => {
  const [editandoParte, setEditandoParte] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const iniciarEdicion = useCallback(async (parte, obras) => {
    setLoading(true)
    setError(null)

    try {
      const obraId = obras.find(o => o.nombre === parte.obra)?.id
      const detalles = await getDetallesCompletosParte(parte.id)

      const parteEditado = {
        id: parte.id,
        nombre: parte.nombre,
        fecha: formatearFechaParaInput(parte.fecha),
        obraId,
        obra: parte.obra,
        personaAutorizadaId: extractRelacionId(detalles.parte.personaAutorizada),
        notas: detalles.parte.notas || '',
        empleados: detalles.empleados.map(e => extractRelacionId(e.empleadoId)),
        empleadosHoras: detalles.empleados.reduce((acc, e) => {
          const id = extractRelacionId(e.empleadoId)
          return { ...acc, [id]: e.horas || 8 }
        }, {})
      }

      setEditandoParte(parteEditado)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const guardarCambios = useCallback(async () => {
    if (!editandoParte) return

    setLoading(true)
    setError(null)

    try {
      const resultado = await actualizarParteTrabajo(editandoParte.id, {
        obraId: editandoParte.obraId,
        fecha: editandoParte.fecha,
        personaAutorizadaId: editandoParte.personaAutorizadaId,
        notas: editandoParte.notas,
        empleados: editandoParte.empleados,
        empleadosHoras: editandoParte.empleadosHoras
      })

      return resultado
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [editandoParte])

  const cancelarEdicion = useCallback(() => {
    setEditandoParte(null)
    setError(null)
  }, [])

  return {
    editandoParte,
    loading,
    error,
    iniciarEdicion,
    guardarCambios,
    cancelarEdicion,
    updateField: (field, value) =>
      setEditandoParte(prev => ({ ...prev, [field]: value }))
  }
}
```

```javascript
// src/hooks/useEmpleadosObra.js
import { useState, useEffect } from 'react'
import { getEmpleadosObra } from '@/services'

export const useEmpleadosObra = (obraId) => {
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!obraId) {
      setEmpleados([])
      return
    }

    const cargarEmpleados = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getEmpleadosObra(obraId)
        setEmpleados(data)
      } catch (err) {
        setError(err.message)
        setEmpleados([])
      } finally {
        setLoading(false)
      }
    }

    cargarEmpleados()
  }, [obraId])

  return { empleados, loading, error }
}
```

#### 1.4 Utilidades y Helpers
```javascript
// src/utils/notion.js
/**
 * Extrae el ID de una relación de Notion en cualquier formato
 */
export const extractRelacionId = (valor) => {
  if (!valor) return ''
  if (Array.isArray(valor) && valor.length > 0) return valor[0]?.id || ''
  if (typeof valor === 'object' && valor.id) return valor.id
  if (typeof valor === 'string') return valor
  return ''
}

/**
 * Extrae múltiples IDs de una relación de Notion
 */
export const extractRelacionIds = (valor) => {
  if (!valor) return []
  if (Array.isArray(valor)) return valor.map(v => v.id).filter(Boolean)
  if (typeof valor === 'object' && valor.id) return [valor.id]
  if (typeof valor === 'string') return [valor]
  return []
}

/**
 * Construye el payload para actualizar el estado según el tipo de propiedad
 */
export const buildEstadoPayload = (tipo, estado) => {
  const estadoNombre = String(estado || '').trim()
  if (!estadoNombre) throw new Error('Estado inválido')

  switch (tipo) {
    case 'select':
      return { select: { name: estadoNombre } }
    case 'multi_select':
      return { multi_select: [{ name: estadoNombre }] }
    case 'status':
      return { status: { name: estadoNombre } }
    default:
      return { status: { name: estadoNombre } }
  }
}
```

```javascript
// src/utils/fecha.js
/**
 * Formatea una fecha al formato español DD-MM-YYYY HH:MM
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha'

  try {
    const fechaObj = new Date(fecha)
    if (isNaN(fechaObj.getTime())) return fecha

    const dia = String(fechaObj.getDate()).padStart(2, '0')
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0')
    const año = fechaObj.getFullYear()
    const hora = String(fechaObj.getHours()).padStart(2, '0')
    const minutos = String(fechaObj.getMinutes()).padStart(2, '0')

    return `${dia}-${mes}-${año} ${hora}:${minutos}`
  } catch {
    return fecha
  }
}

/**
 * Normaliza una fecha para comparación (YYYY-MM-DD)
 */
export const normalizarFecha = (fecha) => {
  if (!fecha) return ''
  const fechaObj = new Date(fecha)
  if (isNaN(fechaObj.getTime())) return fecha
  return fechaObj.toISOString().split('T')[0]
}

/**
 * Obtiene la fecha y hora actual en formato YYYY-MM-DDTHH:MM
 */
export const getCurrentDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Formatea fecha para input datetime-local
 */
export const formatearFechaParaInput = (fecha) => {
  if (!fecha) return getCurrentDateTime()
  return new Date(fecha).toISOString().slice(0, 16)
}
```

```javascript
// src/utils/estado.js
/**
 * Mapea color de Notion a color hexadecimal
 */
export const mapNotionColorToHex = (color) => {
  const colorMap = {
    gray: '#6b7280',
    brown: '#92400e',
    orange: '#f97316',
    yellow: '#eab308',
    green: '#16a34a',
    blue: '#2563eb',
    purple: '#7c3aed',
    pink: '#db2777',
    red: '#dc2626'
  }

  return colorMap[color?.toLowerCase()] || '#64748b'
}

/**
 * Valida y redondea horas de trabajo (0-24, incrementos de 0.5)
 */
export const clampRoundHoras = (valor) => {
  let num = parseFloat(valor)
  if (!isFinite(num)) num = 0
  if (num < 0) num = 0
  if (num > 24) num = 24
  return Math.round(num * 2) / 2
}

/**
 * Normaliza valor de estado según tipo de propiedad
 */
export const normalizeEstadoForApi = (valor, tipo) => {
  if (tipo === 'checkbox') {
    if (typeof valor === 'boolean') return valor
    const v = String(valor).toLowerCase()
    return ['on', 'true', 'sí', 'si'].includes(v)
  }
  return valor
}
```

```javascript
// src/utils/validation.js
/**
 * Verifica si un parte puede ser editado según su estado
 */
export const puedeEditarParte = (estado) => {
  const estadosNoEditables = ['firmado', 'datos enviados', 'enviado']
  return !estadosNoEditables.includes(estado?.toLowerCase())
}

/**
 * Verifica si un parte está en estado borrador
 */
export const esEstadoBorrador = (estado) => {
  return String(estado || '').toLowerCase() === 'borrador'
}

/**
 * Verifica si un parte está listo para firmar
 */
export const esEstadoListoFirmar = (estado) => {
  return String(estado || '').toLowerCase() === 'listo para firmar'
}

/**
 * Obtiene mensaje descriptivo para estados no editables
 */
export const getMensajeEstadoNoEditable = (estado) => {
  const mensajes = {
    'firmado': 'Este parte está firmado y no puede ser modificado',
    'datos enviados': 'Este parte tiene los datos enviados y no puede ser modificado',
    'enviado': 'Este parte ha sido enviado y no puede ser modificado'
  }

  return mensajes[estado?.toLowerCase()] || 'Este parte no puede ser modificado'
}
```

### Fase 2: Refactorización Backend (Semanas 3-4)

#### 2.1 Arquitectura de Capas
```
server/
├── config/
│   ├── database.js        # IDs de bases de datos Notion
│   ├── middleware.js      # Configuración de middlewares
│   └── environment.js     # Variables de entorno
│
├── controllers/
│   ├── obras.controller.js
│   ├── empleados.controller.js
│   ├── partes.controller.js
│   └── health.controller.js
│
├── services/
│   ├── notion/
│   │   ├── notion.service.js       # Cliente base de Notion
│   │   ├── obras.service.js
│   │   ├── empleados.service.js
│   │   └── partes.service.js
│   ├── webhook/
│   │   └── webhook.service.js
│   └── cache/
│       └── cache.service.js
│
├── models/
│   ├── validators/
│   │   ├── parte.validator.js
│   │   ├── empleado.validator.js
│   │   └── obra.validator.js
│   └── schemas/
│       ├── parte.schema.js
│       └── empleado.schema.js
│
├── utils/
│   ├── notion/
│   │   ├── extractors.js          # extractPropertyValue, etc.
│   │   ├── builders.js             # buildEstadoUpdatePayload, etc.
│   │   └── sanitizers.js           # sanitizeEconomic
│   ├── errors/
│   │   ├── AppError.js
│   │   └── errorHandler.js
│   └── logger.js
│
├── routes/
│   ├── api/
│   │   ├── obras.routes.js
│   │   ├── empleados.routes.js
│   │   ├── partes.routes.js
│   │   └── health.routes.js
│   └── index.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── validation.middleware.js
│   ├── errorHandler.middleware.js
│   └── sanitizer.middleware.js
│
└── app.js                  # Express app setup
└── server.js               # Entry point
```

#### 2.2 Ejemplo de Controller
```javascript
// server/controllers/partes.controller.js
const PartesService = require('../services/notion/partes.service')
const WebhookService = require('../services/webhook/webhook.service')
const { parteValidator } = require('../models/validators')
const { AppError } = require('../utils/errors')

class PartesController {
  async getAll(req, res, next) {
    try {
      const partes = await PartesService.getAll()
      res.json(partes)
    } catch (error) {
      next(error)
    }
  }

  async getById(req, res, next) {
    try {
      const { parteId } = req.params
      const parte = await PartesService.getById(parteId)

      if (!parte) {
        throw new AppError('Parte no encontrado', 404)
      }

      res.json(parte)
    } catch (error) {
      next(error)
    }
  }

  async create(req, res, next) {
    try {
      // Validar datos
      const validationError = parteValidator.validate(req.body)
      if (validationError) {
        throw new AppError(validationError, 400)
      }

      // Crear parte
      const parte = await PartesService.create(req.body)

      res.status(201).json(parte)
    } catch (error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {
      const { parteId } = req.params

      // Validar estado editable
      const estadoActual = await PartesService.getEstado(parteId)
      if (!PartesService.esEditable(estadoActual)) {
        throw new AppError('El parte no es editable en su estado actual', 409)
      }

      // Validar datos
      const validationError = parteValidator.validate(req.body)
      if (validationError) {
        throw new AppError(validationError, 400)
      }

      // Actualizar
      const parteActualizado = await PartesService.update(parteId, req.body)

      res.json(parteActualizado)
    } catch (error) {
      next(error)
    }
  }

  async enviarDatos(req, res, next) {
    try {
      const { parteId } = req.params

      // Validar estado
      const parte = await PartesService.getById(parteId)
      if (parte.estado.toLowerCase() !== 'borrador') {
        throw new AppError('Solo los partes en estado Borrador pueden enviarse', 409)
      }

      // Enviar a webhook
      await WebhookService.enviarParteDatos(parte)

      // Actualizar estado
      await PartesService.updateEstado(parteId, 'Datos Enviados')

      res.json({
        status: 'ok',
        parteId,
        nuevoEstado: 'Datos Enviados'
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new PartesController()
```

#### 2.3 Ejemplo de Service
```javascript
// server/services/notion/partes.service.js
const NotionClient = require('./notion.service')
const { extractPropertyValue } = require('../../utils/notion/extractors')
const { buildEstadoPayload } = require('../../utils/notion/builders')
const CacheService = require('../cache/cache.service')

class PartesService {
  constructor() {
    this.databaseId = process.env.PARTES_DATABASE_ID
    this.estadosNoEditables = ['firmado', 'datos enviados', 'enviado']
  }

  async getAll() {
    // Intentar desde cache
    const cached = CacheService.get('partes')
    if (cached) return cached

    // Fetch desde Notion
    const response = await NotionClient.queryDatabase(this.databaseId, {
      page_size: 100,
      sorts: [{ property: 'Fecha', direction: 'descending' }]
    })

    const partes = response.results.map(this._mapPartePage)

    // Guardar en cache
    CacheService.set('partes', partes, 30000) // 30s TTL

    return partes
  }

  async getById(parteId) {
    const page = await NotionClient.getPage(parteId)
    return this._mapPartePage(page)
  }

  async create(data) {
    const { obraId, fecha, jefeObraId, notas, empleados, empleadosHoras } = data

    // Crear parte
    const partePage = await NotionClient.createPage({
      parent: { database_id: this.databaseId },
      properties: {
        'Nombre': { title: [{ text: { content: `Parte ${data.obra} - ${new Date(fecha).toLocaleDateString()}` } }] },
        'Fecha': { date: { start: fecha } },
        'Obras': { relation: [{ id: obraId }] },
        'Persona Autorizada': { relation: [{ id: jefeObraId }] },
        'Notas': { rich_text: [{ text: { content: notas || '' } }] }
      }
    })

    // Crear detalles de empleados
    const detallesCreados = await this._createDetallesEmpleados(
      partePage.id,
      empleados,
      empleadosHoras
    )

    // Invalidar cache
    CacheService.delete('partes')

    return {
      ...partePage,
      detallesCreados: detallesCreados.length,
      mensaje: `Parte creado exitosamente. ${detallesCreados.length} empleados asignados.`
    }
  }

  async update(parteId, data) {
    const { obraId, fecha, personaAutorizadaId, notas, empleados, empleadosHoras } = data

    // Actualizar parte
    const parteActualizado = await NotionClient.updatePage(parteId, {
      properties: {
        'Fecha': { date: { start: fecha } },
        'Obras': { relation: [{ id: obraId }] },
        'Persona Autorizada': { relation: [{ id: personaAutorizadaId }] },
        'Notas': { rich_text: [{ text: { content: notas || '' } }] }
      }
    })

    // Archivar detalles antiguos
    await this._archiveDetalles(parteId)

    // Crear nuevos detalles
    const detallesCreados = await this._createDetallesEmpleados(
      parteId,
      empleados,
      empleadosHoras
    )

    // Invalidar cache
    CacheService.delete('partes')

    return {
      ...parteActualizado,
      detallesCreados: detallesCreados.length,
      mensaje: `Parte actualizado exitosamente. ${detallesCreados.length} empleados asignados.`
    }
  }

  async updateEstado(parteId, nuevoEstado) {
    const page = await NotionClient.getPage(parteId)
    const estadoProperty = page.properties['Estado']

    const payload = buildEstadoPayload(estadoProperty.type, nuevoEstado)

    await NotionClient.updatePage(parteId, {
      properties: { 'Estado': payload }
    })

    // Invalidar cache
    CacheService.delete('partes')
  }

  esEditable(estado) {
    return !this.estadosNoEditables.includes(estado?.toLowerCase())
  }

  async getEstado(parteId) {
    const page = await NotionClient.getPage(parteId)
    return extractPropertyValue(page.properties['Estado'])
  }

  // Private methods
  _mapPartePage(page) {
    return {
      id: page.id,
      nombre: extractPropertyValue(page.properties['Nombre']),
      fecha: extractPropertyValue(page.properties['Fecha']),
      ultimaEdicion: extractPropertyValue(page.properties['Última edición']),
      estado: extractPropertyValue(page.properties['Estado']),
      obra: extractPropertyValue(page.properties['AUX Obra']),
      rpHorasTotales: extractPropertyValue(page.properties['RP Horas totales']),
      urlPDF: extractPropertyValue(page.properties['URL PDF']),
      firmarUrl: extractPropertyValue(page.properties['Firmar']),
      notas: extractPropertyValue(page.properties['Notas'])
    }
  }

  async _createDetallesEmpleados(parteId, empleados, empleadosHoras) {
    const detallesCreados = []

    for (const empleadoId of empleados || []) {
      try {
        const horas = empleadosHoras?.[empleadoId] || 8

        const detalle = await NotionClient.createPage({
          parent: { database_id: process.env.DETALLES_DATABASE_ID },
          properties: {
            'Detalle': { title: [{ text: { content: 'Detalle Horas' } }] },
            'Partes de trabajo': { relation: [{ id: parteId }] },
            'Empleados': { relation: [{ id: empleadoId }] },
            'Cantidad Horas': { number: horas }
          }
        })

        detallesCreados.push(detalle)

        // Pausa para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error creando detalle para empleado ${empleadoId}:`, error.message)
      }
    }

    return detallesCreados
  }

  async _archiveDetalles(parteId) {
    // Query detalles existentes
    const detalles = await NotionClient.queryDatabase(
      process.env.DETALLES_DATABASE_ID,
      {
        filter: {
          property: 'Partes de trabajo',
          relation: { contains: parteId }
        }
      }
    )

    // Archivar cada detalle
    for (const detalle of detalles.results) {
      try {
        await NotionClient.updatePage(detalle.id, { archived: true })
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error archivando detalle ${detalle.id}:`, error.message)
      }
    }
  }
}

module.exports = new PartesService()
```

#### 2.4 Validadores con Joi
```javascript
// server/models/validators/parte.validator.js
const Joi = require('joi')

const parteCreateSchema = Joi.object({
  obra: Joi.string().required().messages({
    'string.empty': 'El nombre de la obra es requerido',
    'any.required': 'El nombre de la obra es requerido'
  }),
  obraId: Joi.string().required().messages({
    'string.empty': 'El ID de la obra es requerido',
    'any.required': 'El ID de la obra es requerido'
  }),
  fecha: Joi.date().iso().required().messages({
    'date.base': 'La fecha debe ser una fecha válida',
    'date.format': 'La fecha debe estar en formato ISO',
    'any.required': 'La fecha es requerida'
  }),
  jefeObraId: Joi.string().required().messages({
    'string.empty': 'El ID del jefe de obra es requerido',
    'any.required': 'El ID del jefe de obra es requerido'
  }),
  notas: Joi.string().allow('').optional(),
  empleados: Joi.array().items(Joi.string()).default([]),
  empleadosHoras: Joi.object().pattern(
    Joi.string(),
    Joi.number().min(0).max(24)
  ).default({})
})

const parteUpdateSchema = Joi.object({
  obraId: Joi.string().required(),
  fecha: Joi.date().iso().required(),
  personaAutorizadaId: Joi.string().required(),
  notas: Joi.string().allow('').optional(),
  empleados: Joi.array().items(Joi.string()).default([]),
  empleadosHoras: Joi.object().pattern(
    Joi.string(),
    Joi.number().min(0).max(24)
  ).default({})
})

class ParteValidator {
  validate(data, isUpdate = false) {
    const schema = isUpdate ? parteUpdateSchema : parteCreateSchema
    const { error } = schema.validate(data, { abortEarly: false })

    if (error) {
      const errors = error.details.map(detail => detail.message)
      return errors.join(', ')
    }

    return null
  }
}

module.exports = new ParteValidator()
```

### Fase 3: Performance y Optimización (Semana 5)

#### 3.1 React Query para Cache y Fetching
```javascript
// src/api/queries/partes.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as partesService from '@/services/partes.service'

// Keys para cache
export const partesKeys = {
  all: ['partes'],
  lists: () => [...partesKeys.all, 'list'],
  list: (filters) => [...partesKeys.lists(), filters],
  details: () => [...partesKeys.all, 'detail'],
  detail: (id) => [...partesKeys.details(), id]
}

// Query: Obtener todos los partes
export const usePartes = (filters = {}) => {
  return useQuery({
    queryKey: partesKeys.list(filters),
    queryFn: () => partesService.getPartesTrabajo(),
    staleTime: 30000, // 30s
    cacheTime: 300000, // 5min
    refetchOnWindowFocus: true,
    refetchInterval: 30000 // Polling cada 30s
  })
}

// Query: Obtener detalles de un parte
export const useParteDetalles = (parteId, options = {}) => {
  return useQuery({
    queryKey: partesKeys.detail(parteId),
    queryFn: () => partesService.getDetallesCompletosParte(parteId),
    enabled: !!parteId,
    ...options
  })
}

// Mutation: Crear parte
export const useCrearParte = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: partesService.crearParteTrabajo,
    onSuccess: () => {
      // Invalidar cache de partes
      queryClient.invalidateQueries({ queryKey: partesKeys.lists() })
    }
  })
}

// Mutation: Actualizar parte
export const useActualizarParte = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ parteId, data }) =>
      partesService.actualizarParteTrabajo(parteId, data),
    onMutate: async ({ parteId, data }) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: partesKeys.detail(parteId) })

      // Snapshot del valor anterior
      const previousParte = queryClient.getQueryData(partesKeys.detail(parteId))

      // Optimistic update
      queryClient.setQueryData(partesKeys.detail(parteId), (old) => ({
        ...old,
        ...data
      }))

      return { previousParte }
    },
    onError: (err, { parteId }, context) => {
      // Rollback en caso de error
      queryClient.setQueryData(
        partesKeys.detail(parteId),
        context.previousParte
      )
    },
    onSettled: (data, error, { parteId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: partesKeys.detail(parteId) })
      queryClient.invalidateQueries({ queryKey: partesKeys.lists() })
    }
  })
}

// Mutation: Enviar datos del parte
export const useEnviarDatosParte = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: partesService.enviarDatosParte,
    onSuccess: (data, parteId) => {
      queryClient.invalidateQueries({ queryKey: partesKeys.detail(parteId) })
      queryClient.invalidateQueries({ queryKey: partesKeys.lists() })
    }
  })
}
```

Uso en componente:
```javascript
// src/components/pages/ConsultaPage/ConsultaPage.jsx
import { usePartes, useActualizarParte } from '@/api/queries/partes'

function ConsultaPage() {
  const { data: partes, isLoading, error } = usePartes()
  const { mutate: actualizarParte, isLoading: isUpdating } = useActualizarParte()

  const handleGuardarCambios = (parteId, cambios) => {
    actualizarParte(
      { parteId, data: cambios },
      {
        onSuccess: () => {
          toast.success('Parte actualizado correctamente')
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`)
        }
      }
    )
  }

  if (isLoading) return <Loader />
  if (error) return <ErrorAlert message={error.message} />

  return (
    <div>
      {partes.map(parte => (
        <ParteCard
          key={parte.id}
          parte={parte}
          onEdit={handleGuardarCambios}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  )
}
```

#### 3.2 Optimización de Re-renders
```javascript
// src/components/common/ParteCard/ParteCard.jsx
import { memo } from 'react'

const ParteCard = memo(({ parte, onEdit }) => {
  // Componente solo re-renderiza si 'parte' o 'onEdit' cambian
  return (
    <div className="parte-card">
      <h3>{parte.nombre}</h3>
      {/* ... */}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison: solo re-render si el ID o estado cambian
  return (
    prevProps.parte.id === nextProps.parte.id &&
    prevProps.parte.estado === nextProps.parte.estado &&
    prevProps.parte.ultimaEdicion === nextProps.parte.ultimaEdicion
  )
})

export default ParteCard
```

```javascript
// Uso de useCallback para estabilizar callbacks
import { useCallback } from 'react'

function ParentComponent() {
  const handleEdit = useCallback((parteId, data) => {
    actualizarParte({ parteId, data })
  }, [actualizarParte])

  return <ParteCard onEdit={handleEdit} />
}
```

#### 3.3 Code Splitting y Lazy Loading
```javascript
// src/App.jsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Lazy load de páginas
const MainPage = lazy(() => import('@/components/pages/MainPage'))
const ConsultaPage = lazy(() => import('@/components/pages/ConsultaPage'))
const CrearPage = lazy(() => import('@/components/pages/CrearPage'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/consulta" element={<ConsultaPage />} />
          <Route path="/crear" element={<CrearPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

### Fase 4: TypeScript Migration (Semanas 6-7)

#### 4.1 Tipos Base
```typescript
// src/types/notion.types.ts
export interface NotionProperty {
  id: string
  type: string
  [key: string]: any
}

export interface NotionPage {
  id: string
  created_time: string
  last_edited_time: string
  properties: Record<string, NotionProperty>
  archived: boolean
}

export interface NotionRelation {
  id: string
}
```

```typescript
// src/types/models.types.ts
export interface Obra {
  id: string
  nombre: string
  provincia: string
  estado: string
}

export interface Empleado {
  id: string
  nombre: string
  categoria: string
  provincia: string
  localidad: string
  telefono: string
  dni: string
  estado: string
  delegado: string
}

export interface JefeObra {
  id: string
  nombre: string
  email: string
}

export interface ParteTrabajo {
  id: string
  nombre: string
  fecha: string
  ultimaEdicion: string
  estado: EstadoParte
  obra: string
  rpHorasTotales?: number
  horasOficial1?: number
  horasOficial2?: number
  horasCapataz?: number
  horasEncargado?: number
  urlPDF?: string
  enviadoCliente?: boolean
  notas?: string
  firmarUrl?: string
}

export enum EstadoParte {
  BORRADOR = 'borrador',
  LISTO_FIRMAR = 'listo para firmar',
  FIRMADO = 'firmado',
  DATOS_ENVIADOS = 'datos enviados',
  ENVIADO = 'enviado'
}

export interface DetalleEmpleado {
  id: string
  empleadoId: string | NotionRelation | NotionRelation[]
  empleadoNombre: string
  categoria: string
  horas: number
  fecha: string
  detalle: string
}

export interface ParteCompleto {
  parte: ParteTrabajo
  empleados: DetalleEmpleado[]
}
```

```typescript
// src/types/forms.types.ts
export interface FormularioParteData {
  obraId: string
  obra: string
  fecha: string
  personaAutorizadaId: string
  notas: string
  empleados: string[]
  empleadosHoras: Record<string, number>
}

export interface FormularioParteErrors {
  obraId?: string
  fecha?: string
  personaAutorizadaId?: string
  empleados?: string
}
```

#### 4.2 Tipado de Hooks
```typescript
// src/hooks/useParteEditor.ts
import { useState, useCallback } from 'react'
import type { ParteTrabajo, Obra, FormularioParteData } from '@/types'

interface UseParteEditorReturn {
  editandoParte: FormularioParteData | null
  loading: boolean
  error: string | null
  iniciarEdicion: (parte: ParteTrabajo, obras: Obra[]) => Promise<void>
  guardarCambios: () => Promise<void>
  cancelarEdicion: () => void
  updateField: <K extends keyof FormularioParteData>(
    field: K,
    value: FormularioParteData[K]
  ) => void
}

export const useParteEditor = (): UseParteEditorReturn => {
  const [editandoParte, setEditandoParte] = useState<FormularioParteData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const iniciarEdicion = useCallback(async (
    parte: ParteTrabajo,
    obras: Obra[]
  ): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      // ... implementación
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const guardarCambios = useCallback(async (): Promise<void> => {
    // ... implementación
  }, [editandoParte])

  const cancelarEdicion = useCallback((): void => {
    setEditandoParte(null)
    setError(null)
  }, [])

  const updateField = useCallback(<K extends keyof FormularioParteData>(
    field: K,
    value: FormularioParteData[K]
  ): void => {
    setEditandoParte(prev => prev ? { ...prev, [field]: value } : null)
  }, [])

  return {
    editandoParte,
    loading,
    error,
    iniciarEdicion,
    guardarCambios,
    cancelarEdicion,
    updateField
  }
}
```

#### 4.3 Componentes Tipados
```typescript
// src/components/common/Button/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'small' | 'medium' | 'large'
  isLoading?: boolean
  icon?: ReactNode
  children: ReactNode
}

export const Button = ({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  icon,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`
        ${styles.button}
        ${styles[variant]}
        ${styles[size]}
        ${className || ''}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className={styles.spinner} />
      ) : (
        <>
          {icon && <span className={styles.icon}>{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  )
}
```

### Fase 5: Testing (Semanas 8-9)

#### 5.1 Setup de Testing
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.spec.ts',
        '**/*.test.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Cleanup después de cada test
afterEach(() => {
  cleanup()
})

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})
```

#### 5.2 Tests Unitarios
```typescript
// src/utils/fecha.test.ts
import { describe, it, expect } from 'vitest'
import { formatearFecha, normalizarFecha, getCurrentDateTime } from './fecha'

describe('utils/fecha', () => {
  describe('formatearFecha', () => {
    it('debe formatear fecha ISO correctamente', () => {
      const fecha = '2025-10-15T14:30:00.000Z'
      const resultado = formatearFecha(fecha)
      expect(resultado).toMatch(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/)
    })

    it('debe manejar fecha inválida', () => {
      const resultado = formatearFecha('invalid')
      expect(resultado).toBe('invalid')
    })

    it('debe manejar fecha null', () => {
      const resultado = formatearFecha(null)
      expect(resultado).toBe('Sin fecha')
    })
  })

  describe('normalizarFecha', () => {
    it('debe normalizar fecha a formato YYYY-MM-DD', () => {
      const fecha = '2025-10-15T14:30:00.000Z'
      const resultado = normalizarFecha(fecha)
      expect(resultado).toBe('2025-10-15')
    })
  })

  describe('getCurrentDateTime', () => {
    it('debe retornar formato YYYY-MM-DDTHH:MM', () => {
      const resultado = getCurrentDateTime()
      expect(resultado).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    })
  })
})
```

```typescript
// src/utils/validation.test.ts
import { describe, it, expect } from 'vitest'
import { puedeEditarParte, esEstadoBorrador, esEstadoListoFirmar } from './validation'

describe('utils/validation', () => {
  describe('puedeEditarParte', () => {
    it('debe permitir editar partes en borrador', () => {
      expect(puedeEditarParte('borrador')).toBe(true)
      expect(puedeEditarParte('Borrador')).toBe(true)
      expect(puedeEditarParte('BORRADOR')).toBe(true)
    })

    it('debe prohibir editar partes firmados', () => {
      expect(puedeEditarParte('firmado')).toBe(false)
      expect(puedeEditarParte('Firmado')).toBe(false)
    })

    it('debe prohibir editar partes con datos enviados', () => {
      expect(puedeEditarParte('datos enviados')).toBe(false)
      expect(puedeEditarParte('Datos Enviados')).toBe(false)
    })

    it('debe manejar estados undefined/null', () => {
      expect(puedeEditarParte(undefined)).toBe(true)
      expect(puedeEditarParte(null)).toBe(true)
    })
  })

  describe('esEstadoBorrador', () => {
    it('debe identificar estado borrador correctamente', () => {
      expect(esEstadoBorrador('borrador')).toBe(true)
      expect(esEstadoBorrador('Borrador')).toBe(true)
      expect(esEstadoBorrador('firmado')).toBe(false)
    })
  })
})
```

#### 5.3 Tests de Componentes
```typescript
// src/components/common/Button/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('debe renderizar correctamente', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('debe manejar clicks', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('debe mostrar loading state', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('debe aplicar variantes correctamente', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('primary')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('secondary')
  })

  it('debe estar deshabilitado cuando disabled=true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('debe renderizar icono cuando se proporciona', () => {
    const Icon = () => <span data-testid="icon">Icon</span>
    render(<Button icon={<Icon />}>With Icon</Button>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
```

```typescript
// src/components/features/partes/ParteCard/ParteCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ParteCard } from './ParteCard'

const mockParte = {
  id: '1',
  nombre: 'Parte Test',
  fecha: '2025-10-15T10:00:00.000Z',
  estado: 'borrador',
  obra: 'Obra Test',
  rpHorasTotales: 8
}

describe('ParteCard', () => {
  it('debe renderizar información del parte', () => {
    render(<ParteCard parte={mockParte} onEdit={vi.fn()} />)

    expect(screen.getByText('Parte Test')).toBeInTheDocument()
    expect(screen.getByText(/Obra Test/)).toBeInTheDocument()
  })

  it('debe mostrar badge de estado correcto', () => {
    render(<ParteCard parte={mockParte} onEdit={vi.fn()} />)
    expect(screen.getByText('borrador')).toBeInTheDocument()
  })

  it('debe llamar onEdit cuando se hace click en editar', () => {
    const handleEdit = vi.fn()
    render(<ParteCard parte={mockParte} onEdit={handleEdit} />)

    fireEvent.click(screen.getByText(/Editar/i))
    expect(handleEdit).toHaveBeenCalledWith(mockParte)
  })

  it('debe ocultar botón editar para partes no editables', () => {
    const parteNoEditable = { ...mockParte, estado: 'firmado' }
    render(<ParteCard parte={parteNoEditable} onEdit={vi.fn()} />)

    expect(screen.queryByText(/Editar/i)).not.toBeInTheDocument()
  })
})
```

#### 5.4 Tests de Hooks
```typescript
// src/hooks/useParteEditor.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useParteEditor } from './useParteEditor'
import * as partesService from '@/services/partes.service'

vi.mock('@/services/partes.service')

describe('useParteEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe inicializar con estado vacío', () => {
    const { result } = renderHook(() => useParteEditor())

    expect(result.current.editandoParte).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('debe cargar detalles del parte al iniciar edición', async () => {
    const mockParte = {
      id: '1',
      nombre: 'Test',
      fecha: '2025-10-15',
      estado: 'borrador',
      obra: 'Obra 1'
    }

    const mockObras = [{ id: 'obra1', nombre: 'Obra 1' }]

    const mockDetalles = {
      parte: {
        personaAutorizada: [{ id: 'jefe1' }],
        notas: 'Notas test'
      },
      empleados: [
        { empleadoId: [{ id: 'emp1' }], horas: 8 }
      ]
    }

    vi.mocked(partesService.getDetallesCompletosParte)
      .mockResolvedValue(mockDetalles)

    const { result } = renderHook(() => useParteEditor())

    await result.current.iniciarEdicion(mockParte, mockObras)

    await waitFor(() => {
      expect(result.current.editandoParte).not.toBeNull()
      expect(result.current.editandoParte?.obraId).toBe('obra1')
      expect(result.current.editandoParte?.personaAutorizadaId).toBe('jefe1')
      expect(result.current.loading).toBe(false)
    })
  })

  it('debe manejar errores al cargar detalles', async () => {
    const mockError = new Error('Error de red')
    vi.mocked(partesService.getDetallesCompletosParte)
      .mockRejectedValue(mockError)

    const { result } = renderHook(() => useParteEditor())

    await result.current.iniciarEdicion({} as any, [])

    await waitFor(() => {
      expect(result.current.error).toBe('Error de red')
      expect(result.current.loading).toBe(false)
    })
  })

  it('debe actualizar campo correctamente', () => {
    const { result } = renderHook(() => useParteEditor())

    // Establecer estado inicial
    result.current.updateField('notas', 'Nueva nota')

    // Como editandoParte es null, no debería hacer nada
    expect(result.current.editandoParte).toBeNull()
  })

  it('debe cancelar edición correctamente', async () => {
    const { result } = renderHook(() => useParteEditor())

    // Simular inicio de edición
    vi.mocked(partesService.getDetallesCompletosParte)
      .mockResolvedValue({
        parte: { personaAutorizada: [], notas: '' },
        empleados: []
      })

    await result.current.iniciarEdicion({} as any, [])

    await waitFor(() => {
      expect(result.current.editandoParte).not.toBeNull()
    })

    // Cancelar edición
    result.current.cancelarEdicion()

    expect(result.current.editandoParte).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
```

#### 5.5 Tests de Integración
```typescript
// src/components/pages/ConsultaPage/ConsultaPage.integration.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConsultaPage } from './ConsultaPage'
import * as partesService from '@/services/partes.service'

vi.mock('@/services/partes.service')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('ConsultaPage - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe cargar y mostrar partes correctamente', async () => {
    const mockPartes = [
      {
        id: '1',
        nombre: 'Parte 1',
        estado: 'borrador',
        obra: 'Obra 1',
        fecha: '2025-10-15'
      },
      {
        id: '2',
        nombre: 'Parte 2',
        estado: 'firmado',
        obra: 'Obra 2',
        fecha: '2025-10-16'
      }
    ]

    vi.mocked(partesService.getPartesTrabajo).mockResolvedValue(mockPartes)

    render(<ConsultaPage />, { wrapper: createWrapper() })

    // Verificar loading state
    expect(screen.getByText(/Cargando/i)).toBeInTheDocument()

    // Esperar a que carguen los partes
    await waitFor(() => {
      expect(screen.getByText('Parte 1')).toBeInTheDocument()
      expect(screen.getByText('Parte 2')).toBeInTheDocument()
    })
  })

  it('debe filtrar partes por obra', async () => {
    const mockPartes = [
      { id: '1', nombre: 'Parte 1', obra: 'Obra A', estado: 'borrador', fecha: '2025-10-15' },
      { id: '2', nombre: 'Parte 2', obra: 'Obra B', estado: 'borrador', fecha: '2025-10-15' }
    ]

    vi.mocked(partesService.getPartesTrabajo).mockResolvedValue(mockPartes)

    render(<ConsultaPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Parte 1')).toBeInTheDocument()
    })

    // Filtrar por Obra A
    const selectObra = screen.getByLabelText(/Filtrar por Obra/i)
    fireEvent.change(selectObra, { target: { value: 'Obra A' } })

    await waitFor(() => {
      expect(screen.getByText('Parte 1')).toBeInTheDocument()
      expect(screen.queryByText('Parte 2')).not.toBeInTheDocument()
    })
  })

  it('debe abrir modal de edición al hacer click en editar', async () => {
    const mockPartes = [
      { id: '1', nombre: 'Parte 1', obra: 'Obra 1', estado: 'borrador', fecha: '2025-10-15' }
    ]

    const mockDetalles = {
      parte: {
        personaAutorizada: [{ id: 'jefe1' }],
        notas: 'Test'
      },
      empleados: []
    }

    vi.mocked(partesService.getPartesTrabajo).mockResolvedValue(mockPartes)
    vi.mocked(partesService.getDetallesCompletosParte).mockResolvedValue(mockDetalles)

    render(<ConsultaPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Parte 1')).toBeInTheDocument()
    })

    // Click en editar
    fireEvent.click(screen.getByText(/Editar/i))

    // Verificar que se abre el modal
    await waitFor(() => {
      expect(screen.getByText(/Editar Parte/i)).toBeInTheDocument()
    })
  })

  it('debe manejar error al cargar partes', async () => {
    vi.mocked(partesService.getPartesTrabajo)
      .mockRejectedValue(new Error('Error de red'))

    render(<ConsultaPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText(/Error de red/i)).toBeInTheDocument()
    })
  })
})
```

#### 5.6 Tests E2E con Playwright
```typescript
// e2e/partes.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Gestión de Partes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001')
  })

  test('debe navegar a crear parte desde página principal', async ({ page }) => {
    await page.click('text=Crear Nuevo Parte')
    await expect(page).toHaveURL(/.*crear/)
    await expect(page.locator('h2')).toContainText('Crear Nuevo Parte')
  })

  test('debe crear un parte completo', async ({ page }) => {
    // Navegar a crear
    await page.click('text=Crear Nuevo Parte')

    // Llenar formulario
    await page.selectOption('select#obra', { label: 'Obra Test' })
    await page.fill('input[type="datetime-local"]', '2025-10-15T10:00')
    await page.selectOption('select#jefe', { label: 'Jefe Test' })

    // Seleccionar empleados
    await page.check('input[type="checkbox"][value="empleado-1"]')
    await page.fill('input#horas-empleado-1', '8')

    // Notas
    await page.fill('textarea', 'Notas de prueba')

    // Enviar
    await page.click('button:has-text("Crear Parte")')

    // Verificar éxito
    await expect(page.locator('text=Parte creado exitosamente')).toBeVisible()
  })

  test('debe editar un parte existente', async ({ page }) => {
    // Navegar a consulta
    await page.click('text=Consultar Partes')

    // Click en primer parte
    await page.click('text=Ver Detalles >> nth=0')

    // Click en editar
    await page.click('button:has-text("Editar Parte")')

    // Modificar notas
    await page.fill('textarea', 'Notas actualizadas')

    // Guardar
    await page.click('button:has-text("Guardar Cambios")')

    // Verificar éxito
    await expect(page.locator('text=Parte actualizado')).toBeVisible()
  })

  test('no debe permitir editar parte firmado', async ({ page }) => {
    await page.click('text=Consultar Partes')

    // Buscar parte firmado
    await page.click('text=Parte Firmado')

    // Verificar que no hay botón de editar
    await expect(page.locator('button:has-text("Editar")')).not.toBeVisible()

    // Verificar mensaje informativo
    await expect(page.locator('text=Este parte está firmado')).toBeVisible()
  })

  test('debe filtrar partes correctamente', async ({ page }) => {
    await page.click('text=Consultar Partes')

    // Verificar que hay múltiples partes
    const partesIniciales = await page.locator('.parte-card').count()
    expect(partesIniciales).toBeGreaterThan(1)

    // Filtrar por obra
    await page.selectOption('select#filtro-obra', { label: 'Obra específica' })

    // Verificar que se redujo la lista
    const partesFiltrados = await page.locator('.parte-card').count()
    expect(partesFiltrados).toBeLessThan(partesIniciales)
  })
})
```

---

## 📁 Estructura Propuesta Final

```
copuno-gestion-partes/
├── public/
│   └── assets/
│
├── src/
│   ├── api/
│   │   ├── queries/
│   │   │   ├── partes.ts
│   │   │   ├── empleados.ts
│   │   │   └── obras.ts
│   │   └── client.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   ├── Layout/
│   │   │   ├── Sidebar/
│   │   │   └── Footer/
│   │   │
│   │   ├── pages/
│   │   │   ├── MainPage/
│   │   │   ├── ConsultaPage/
│   │   │   ├── CrearPage/
│   │   │   └── ErrorPage/
│   │   │
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── Textarea/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── Badge/
│   │   │   ├── Loader/
│   │   │   ├── Alert/
│   │   │   └── Tooltip/
│   │   │
│   │   └── features/
│   │       ├── empleados/
│   │       │   ├── EmpleadoItem/
│   │       │   ├── EmpleadosList/
│   │       │   ├── EmpleadoEstadoSelector/
│   │       │   └── EmpleadosFilters/
│   │       │
│   │       └── partes/
│   │           ├── ParteCard/
│   │           ├── PartesList/
│   │           ├── ParteDetalles/
│   │           ├── ParteEditor/
│   │           ├── ParteAcciones/
│   │           ├── ParteEstadoBadge/
│   │           ├── ParteFechaDisplay/
│   │           └── PartesFilters/
│   │
│   ├── context/
│   │   ├── AppContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── hooks/
│   │   ├── useApp.ts
│   │   ├── usePartes.ts
│   │   ├── useParteEditor.ts
│   │   ├── useEmpleadosObra.ts
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── services/
│   │   ├── partes.service.ts
│   │   ├── empleados.service.ts
│   │   ├── obras.service.ts
│   │   └── api.service.ts
│   │
│   ├── types/
│   │   ├── models.types.ts
│   │   ├── forms.types.ts
│   │   ├── api.types.ts
│   │   └── notion.types.ts
│   │
│   ├── utils/
│   │   ├── notion.ts
│   │   ├── fecha.ts
│   │   ├── estado.ts
│   │   ├── validation.ts
│   │   └── formatting.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── tokens/
│   │       ├── colors.css
│   │       ├── spacing.css
│   │       └── typography.css
│   │
│   ├── test/
│   │   ├── setup.ts
│   │   ├── mocks/
│   │   └── utils/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── server/
│   ├── config/
│   │   ├── database.js
│   │   ├── middleware.js
│   │   └── environment.js
│   │
│   ├── controllers/
│   │   ├── obras.controller.js
│   │   ├── empleados.controller.js
│   │   ├── partes.controller.js
│   │   └── health.controller.js
│   │
│   ├── services/
│   │   ├── notion/
│   │   │   ├── notion.service.js
│   │   │   ├── obras.service.js
│   │   │   ├── empleados.service.js
│   │   │   └── partes.service.js
│   │   ├── webhook/
│   │   │   └── webhook.service.js
│   │   └── cache/
│   │       └── cache.service.js
│   │
│   ├── models/
│   │   ├── validators/
│   │   │   ├── parte.validator.js
│   │   │   └── empleado.validator.js
│   │   └── schemas/
│   │       └── parte.schema.js
│   │
│   ├── utils/
│   │   ├── notion/
│   │   │   ├── extractors.js
│   │   │   ├── builders.js
│   │   │   └── sanitizers.js
│   │   ├── errors/
│   │   │   ├── AppError.js
│   │   │   └── errorHandler.js
│   │   └── logger.js
│   │
│   ├── routes/
│   │   ├── api/
│   │   │   ├── obras.routes.js
│   │   │   ├── empleados.routes.js
│   │   │   ├── partes.routes.js
│   │   │   └── health.routes.js
│   │   └── index.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   └── sanitizer.middleware.js
│   │
│   ├── app.js
│   └── server.js
│
├── e2e/
│   ├── partes.spec.ts
│   ├── empleados.spec.ts
│   └── fixtures/
│
├── docs/
│   ├── REFACTORIZACION_PROPUESTA.md
│   ├── ESTADO_ACTUAL_V1.3.0.md
│   ├── ROADMAP_FUTURAS_VERSIONES.md
│   ├── API_REFERENCIA.md
│   ├── CONFIGURACION_ENTORNO.md
│   ├── DESARROLLADORES.md
│   └── MIGRATION_GUIDE.md
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

---

## 📈 Timeline y Fases

### Semana 1-2: Modularización Frontend
- ✅ Separar componentes en archivos independientes
- ✅ Crear estructura de carpetas
- ✅ Implementar CSS Modules
- ✅ Extraer custom hooks
- ✅ Crear utilidades reutilizables

### Semana 3-4: Refactorización Backend
- ✅ Separar en capas (controllers, services, routes)
- ✅ Implementar validadores con Joi
- ✅ Crear servicios de Notion reutilizables
- ✅ Mejorar manejo de errores
- ✅ Implementar logging estructurado

### Semana 5: Performance y Optimización
- ✅ Implementar React Query
- ✅ Optimizar re-renders con memo/useCallback
- ✅ Code splitting y lazy loading
- ✅ Mejorar cache y polling
- ✅ Análisis de bundle size

### Semana 6-7: Migración a TypeScript
- ✅ Setup de TypeScript
- ✅ Migrar tipos base
- ✅ Migrar componentes comunes
- ✅ Migrar hooks
- ✅ Migrar páginas

### Semana 8-9: Testing
- ✅ Setup de testing (Vitest + RTL)
- ✅ Tests unitarios de utils
- ✅ Tests de componentes
- ✅ Tests de hooks
- ✅ Tests de integración
- ✅ Tests E2E con Playwright

### Semana 10: Documentación y Deploy
- ✅ Actualizar documentación
- ✅ Crear guía de migración
- ✅ Setup de CI/CD
- ✅ Deploy a producción
- ✅ Monitoreo y métricas

---

## 🎯 Métricas de Éxito

### Antes de Refactorización
- **App.jsx**: 1843 líneas
- **server.js**: 1299 líneas
- **Componentes**: 3 archivos
- **Tests**: 0
- **Coverage**: 0%
- **Bundle size**: ~450 KB
- **First Load**: ~2.5s
- **Complejidad ciclomática**: Alta

### Después de Refactorización (Objetivo)
- **Archivo más grande**: < 300 líneas
- **Componentes**: ~50 archivos modulares
- **Tests**: > 200 tests
- **Coverage**: > 80%
- **Bundle size**: < 300 KB (33% reducción)
- **First Load**: < 1.5s (40% mejora)
- **Complejidad ciclomática**: Baja-Media

---

## 🚀 Beneficios Esperados

### Mantenibilidad
- ✅ Código modular y organizado
- ✅ Fácil localización de bugs
- ✅ Onboarding de nuevos desarrolladores más rápido
- ✅ Reducción de código duplicado

### Escalabilidad
- ✅ Arquitectura preparada para nuevas features
- ✅ Componentes reutilizables
- ✅ Separación clara de responsabilidades
- ✅ Fácil extensión de funcionalidades

### Performance
- ✅ Menos re-renders innecesarios
- ✅ Cache inteligente
- ✅ Code splitting efectivo
- ✅ Bundle más pequeño

### Developer Experience
- ✅ Type safety con TypeScript
- ✅ Tests confiables
- ✅ Hot reload más rápido
- ✅ Mejor debugging

### User Experience
- ✅ Tiempos de carga más rápidos
- ✅ Interfaz más responsiva
- ✅ Menos bugs en producción
- ✅ Mejor estabilidad

---

## 📝 Notas Finales

Esta refactorización es **incremental y reversible**. Cada fase puede implementarse de forma independiente sin romper funcionalidad existente. Se recomienda:

1. **Crear branch de refactorización**: `git checkout -b refactor/v2.0`
2. **Implementar fase por fase**: No todo a la vez
3. **Testing continuo**: Asegurar que nada se rompe
4. **Code reviews**: Validar cambios con el equipo
5. **Documentar cambios**: Mantener docs actualizados

**Prioridad**: Modularización Frontend > Backend > TypeScript > Testing

**Riesgo**: Bajo (cambios incrementales y probados)

**ROI**: Alto (mejoras significativas en todos los aspectos)

---

**Documento generado**: 15 de Octubre de 2025
**Autor**: Claude Code (Anthropic)
**Versión**: 1.0.0
