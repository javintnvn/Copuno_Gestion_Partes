# Plan de Testing - Copuno Gestión de Partes

## Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Funcionalidades de la Aplicación](#funcionalidades-de-la-aplicación)
3. [Flujos Críticos de Negocio](#flujos-críticos-de-negocio)
4. [Integraciones Externas](#integraciones-externas)
5. [Tests Prioritarios](#tests-prioritarios)
6. [Plan de Ejecución](#plan-de-ejecución)
7. [Checklist Pre-Entrega](#checklist-pre-entrega)

---

## Resumen Ejecutivo

Este documento describe el plan completo de testing para la aplicación Copuno - Gestión de Partes antes de su entrega en producción. La aplicación es un sistema de gestión de partes de trabajo que utiliza Notion como backend y cuenta con sincronización inteligente en tiempo real.

### Tecnologías Principales
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Base de Datos**: Notion API
- **Sincronización**: Smart Polling + SSE (Server-Sent Events)
- **Integración**: Webhook Make para flujo de firma

### Estado Actual
- **Versión**: 1.4.0
- **Tests Automatizados**: ❌ No implementados
- **Testing Manual**: ⚠️ Parcial
- **Documentación**: ✅ Completa

---

## Funcionalidades de la Aplicación

### Frontend (React + Vite)

#### 1. Pantalla Principal
- Pantalla de bienvenida con navegación a Crear/Consultar partes
- Logo clickeable que vuelve al inicio
- Indicador de conectividad en tiempo real (Conectado/Error)
- Badge de sincronización inteligente (Rápido/Normal/Lento)
- Botón de refrescar datos manual

#### 2. Crear Partes de Trabajo
- **Selección de provincia**: Filtro para obras disponibles
- **Selección de obra**: Depende de provincia seleccionada
- **Fecha y hora del parte**: Input datetime-local
- **Selección de Persona Autorizada**: Jefe de obra
- **Gestión de empleados por obra**:
  - Listado de empleados asignados a la obra seleccionada
  - Selección múltiple de empleados con checkbox
  - Asignación de horas individuales por empleado (0-24h, paso 0.5h)
  - Cambio de estado del empleado desde la interfaz
  - Validación: empleados sin obra no aparecen
- **Campo de notas adicionales**
- **Generación automática de nombre**: "Parte + NombreObra + ID"
- **Creación de registros en "Detalles Hora"** por cada empleado
- **Opciones post-creación**: Crear otro parte o ver detalles

#### 3. Consultar Partes Existentes

**Filtros disponibles**:
- Por obra (dropdown con todas las obras)
- Por fecha (date picker, formato DD-MM-YYYY)

**Lista de partes con información resumida**:
- Nombre del parte
- Estado (badge con colores)
- Obra asociada
- Fecha (formato español DD-MM-YYYY HH:MM)
- Horas totales
- Indicador visual "No editable" para estados protegidos

**Modal de detalles del parte**:
- Información completa del parte
- Lista de empleados asignados con horas
- Notas del parte
- Botones contextuales según estado

#### 4. Editar Partes de Trabajo

**Validaciones**:
- Estados editables: solo "Borrador" y "Listo para firmar"
- Mensaje de error para estados no editables (Firmado, Datos Enviados, Enviado)
- Cambio automático de estado "Listo para firmar" → "Borrador" al editar

**Formulario de edición completo**:
- Cambio de provincia/obra
- Cambio de fecha/hora
- Cambio de persona autorizada
- Modificación de notas
- Gestión de empleados (agregar/quitar/cambiar horas)
- Cambio de estado de empleados

**Comportamiento**:
- Archivado de detalles antiguos (no eliminación)
- Creación de nuevos detalles con las horas actualizadas
- Advertencia visual cuando el estado cambia a Borrador

#### 5. Gestión de Estados de Empleados
- Obtención dinámica de opciones de estado desde Notion
- Soporte para 3 tipos de propiedad: status, select, checkbox
- Cambio de estado en tiempo real desde cualquier vista
- Indicador visual con color por cada estado
- Estados persistidos inmediatamente en Notion

#### 6. Flujo de Botones por Estado del Parte

| Estado | Ver Detalles | Descargar PDF | Firmar | Enviar Datos | Editar |
|--------|--------------|---------------|--------|--------------|--------|
| Borrador | ✅ | ❌ | ❌ | ✅ | ✅ |
| Listo para firmar | ✅ | ❌ | ✅ (si URL) | ❌ | ✅ |
| Firmado | ✅ | ✅ | ❌ | ❌ | ❌ |
| Datos Enviados | ✅ | ❌ | ❌ | ❌ | ❌ |
| Enviado | ✅ | ✅ | ❌ | ❌ | ❌ |

#### 7. Sistema de Sincronización Inteligente (Smart Polling)

**Modo Rápido (3 segundos)**:
- Activación: Hay cambios en últimos 30 segundos
- Indicador: Badge azul con animación pulsante
- Comportamiento:
  - Polling cada 3s para lista de partes
  - SSE cada 3s para detalles (si modal abierto)
  - Máxima responsividad para detectar cambios rápidamente

**Modo Normal (8 segundos)**:
- Activación: Sin cambios entre 30s y 2 minutos
- Indicador: Badge morado estático
- Comportamiento:
  - Polling cada 8s para lista de partes
  - SSE cada 8s para detalles
  - Balance entre responsividad y consumo de API

**Modo Lento (15 segundos)**:
- Activación: Sin cambios por más de 2 minutos
- Indicador: Badge gris estático
- Comportamiento:
  - Polling cada 15s para lista de partes
  - SSE cada 15s para detalles
  - Mínimo consumo de API cuando no hay actividad

**Detección de Cambios**:
- Hash basado en: ID + estado + última edición
- Si hash cambia → modo rápido automático
- Si hash no cambia → transición gradual a modos más lentos

**Pausas Automáticas**:
- Pestaña oculta (visibilitychange) → pausa todo
- Pestaña visible → refresco inmediato + reanudación
- Durante edición de parte → pausa polling de lista
- Al cerrar edición → reanudación de polling

**SSE (Server-Sent Events)**:
- Conexión persistente mientras modal de detalles abierto
- Emite cambios de estado y última edición en tiempo real
- Heartbeats cada X segundos para mantener conexión viva
- Reconexión automática con backoff exponencial (1s → 2s → 4s... → max 30s)
- Cierre automático al cerrar modal

### Backend (Node.js + Express)

#### 1. Arquitectura
- Servidor único que sirve SPA + API REST
- Base de datos: Notion API como backend
- Puerto: 3001 (configurable)
- Modo mock disponible para testing sin Notion

#### 2. Middlewares de Seguridad
- **helmet**: Headers de seguridad HTTP
- **compression**: Compresión gzip de respuestas
- **cors**: CORS configurable con whitelist de orígenes
- **express-rate-limit**: Limitación de peticiones por IP
  - Ventana: 15 minutos (configurable)
  - Máximo: 100 peticiones (configurable)
- **morgan**: Logging de acceso con request-id
- **Request ID único** por petición (x-request-id)
- **Sanitización automática** de datos económicos en respuestas

#### 3. Sistema de Cache
- Cache en memoria con TTL configurable (5s por defecto)
- Catálogos cacheados: obras, jefes de obra, empleados
- Invalidación automática por tiempo
- Reduce latencia y presión sobre Notion API

**Puntos críticos a testear**:
- ✅ Invalidación tras cambios externos en Notion (expiración TTL refresca datos sin reiniciar cliente)

#### 4. Sanitización de Datos Económicos
- Eliminación automática de campos con keywords: importe, precio, coste, tarifa, eur, euro
- Redacción de valores con símbolos monetarios (€, eur, euros)
- Aplicado a todas las respuestas /api/* excepto /api/health
- Protección automática sin configuración necesaria

#### 5. Endpoints de API

**Health y Configuración**
- `GET /api/health`: Estado del servidor y conectividad

**Catálogos**
- `GET /api/obras`: Lista de obras (con cache)
- `GET /api/jefes-obra`: Lista de personas autorizadas (con cache)
- `GET /api/empleados`: Lista completa de empleados (con cache)
- `GET /api/obras/:obraId/empleados`: Empleados de obra específica
- `GET /api/empleados/estado-opciones`: Opciones dinámicas de estado
- `PUT /api/empleados/:empleadoId/estado`: Actualizar estado de empleado

**Partes de Trabajo - CRUD**
- `GET /api/partes-trabajo`: Lista de partes (ordenados por fecha desc)
- `POST /api/partes-trabajo`: Crear nuevo parte
  - Validación de campos requeridos
  - Generación de nombre automático con ID de Notion
  - Creación de detalles de horas por empleado
  - Validación de horas [0-24]
- `PUT /api/partes-trabajo/:parteId`: Actualizar parte existente
  - Validación de estados editables
  - Cambio automático "Listo para firmar" → "Borrador"
  - Archivado de detalles antiguos
  - Creación de nuevos detalles
  - Validación de horas por empleado
- `GET /api/partes-trabajo/:parteId/detalles`: Detalles completos del parte
- `GET /api/partes-trabajo/:parteId/empleados`: Empleados del parte

**Sincronización de Estado**
- `GET /api/partes-trabajo/:parteId/estado`: Estado actual (puntual)
- `GET /api/partes-trabajo/:parteId/estado/stream`: SSE para cambios en tiempo real
  - Smart Polling con ajuste dinámico (3s/8s/15s)
  - Heartbeats para mantener conexión viva
  - Reconexión automática con backoff

**Webhook de Envío de Datos**
- `POST /api/partes-trabajo/:parteId/enviar-datos`: Enviar datos al webhook
  - Validación: solo partes en estado "Borrador"
  - Envío de payload completo a webhook Make (configurable)
  - Cambio automático de estado a "Datos Enviados"
  - Timeout configurable (10s por defecto)
  - Modo simulado si webhook no configurado

**Agregados**
- `GET /api/datos-completos`: Obtiene obras, jefes, empleados y partes en una llamada

---

## Flujos Críticos de Negocio

### FLUJO 1: Creación de Parte de Trabajo

**Pasos**:
1. Usuario navega a "Crear Nuevo Parte"
2. Selecciona provincia → filtra obras disponibles
3. Selecciona obra → carga empleados asignados a esa obra
4. Selecciona fecha/hora del parte
5. Selecciona persona autorizada (jefe de obra)
6. Selecciona empleados para el parte
7. Asigna horas individuales por empleado (0-24h, paso 0.5h)
8. Opcionalmente cambia estado de empleados
9. Añade notas adicionales
10. Hace clic en "Crear Parte"

**Validaciones**:
- Obra, fecha y persona autorizada son obligatorios
- Horas por empleado deben estar en rango [0-24]
- Solo empleados de la obra seleccionada pueden asignarse

**Resultado**:
- Parte creado en Notion con estado "Borrador"
- Nombre automático: "Parte + NombreObra + ID"
- Registro en BD "Partes de Trabajo"
- Registros en BD "Detalles Hora" por cada empleado
- Usuario puede crear otro parte o ver detalles

**Puntos críticos a testear**:
- ✅ Validación de campos requeridos
- ✅ Filtrado correcto de obras por provincia
- ✅ Carga correcta de empleados por obra
- ✅ Validación de rango de horas [0-24]
- ✅ Creación correcta en Notion con todas las relaciones
- ✅ Generación correcta del nombre automático
- ✅ Creación de detalles de horas para cada empleado
- ✅ Manejo de errores de API
- ✅ Feedback visual de éxito/error

### FLUJO 2: Envío de Datos del Parte (Webhook)

**Prerequisito**: Parte en estado "Borrador"

**Pasos**:
1. Usuario ve parte en lista o detalles
2. Ve botón "Enviar Datos" (solo visible en estado Borrador)
3. Hace clic en "Enviar Datos"
4. Sistema valida estado actual
5. Sistema construye payload con:
   - ID del parte
   - ID de la página de Notion
   - ID de la propiedad button
   - Datos completos del parte
   - Metadata de origen y timestamp
6. Sistema envía POST al webhook Make configurado
7. Si webhook responde OK:
   - Cambia estado del parte a "Datos Enviados"
   - Notion genera URL de firma (propiedad "Firmar")
8. Sistema refresca datos automáticamente
9. Usuario ve nuevo estado y botón "Firmar ahora"

**Validaciones**:
- Solo partes en estado "Borrador" pueden enviarse
- Timeout configurable (10s por defecto)
- Webhook URL debe estar configurado (o modo simulado)

**Resultado**:
- Parte cambia a estado "Datos Enviados" o "Listo para firmar"
- URL de firma disponible
- Parte ya no es editable
- Botón "Enviar Datos" desaparece
- Botón "Firmar ahora" aparece (si hay URL)

**Puntos críticos a testear**:
- ✅ Validación de estado "Borrador" antes de enviar
- ✅ Construcción correcta del payload con todos los campos
- ✅ Envío exitoso al webhook
- ✅ Manejo de timeout del webhook
- ✅ Manejo de errores HTTP del webhook (4xx/5xx)
- ✅ Cambio correcto de estado tras envío exitoso
- ✅ Actualización de UI con nuevo estado
- ✅ Visibilidad correcta de botones por estado
- ✅ Modo simulado cuando webhook no configurado
- ✅ Logging correcto de payload y respuestas

### FLUJO 3: Edición de Parte

**Prerequisito**: Parte en estado editable (Borrador o Listo para firmar)

**Pasos**:
1. Usuario consulta parte desde lista
2. Ve botón "Editar" (solo visible si editable)
3. Hace clic en "Editar Parte"
4. Sistema verifica estado actual:
   - Si es "Listo para firmar" → marca para cambio a "Borrador"
   - Si es otro estado no editable → muestra error
5. Sistema carga detalles completos:
   - Datos del parte (obra, fecha, persona autorizada, notas)
   - Lista de empleados actuales con horas
6. Sistema carga empleados disponibles de la obra
7. Usuario modifica:
   - Provincia/obra (recarga empleados)
   - Fecha/hora
   - Persona autorizada
   - Notas
   - Añade/quita empleados
   - Cambia horas de empleados
   - Cambia estado de empleados
8. Hace clic en "Guardar Cambios"
9. Sistema valida datos
10. Sistema actualiza en Notion:
    - Archiva detalles antiguos (no los elimina)
    - Crea nuevos detalles con datos actualizados
    - Si era "Listo para firmar" → cambia estado a "Borrador"
11. Sistema muestra mensaje de éxito:
    - Normal: "Parte actualizado"
    - Con cambio de estado: "⚠️ El estado ha cambiado... deberás enviar los datos nuevamente"
12. Sistema recarga datos y cierra modal

**Validaciones**:
- Estados editables: solo Borrador y Listo para firmar
- Estados NO editables: Firmado, Datos Enviados, Enviado
- Obra, fecha y persona autorizada obligatorios
- Horas por empleado en rango [0-24]

**Resultado**:
- Parte actualizado con nuevos datos
- Detalles antiguos archivados
- Nuevos detalles creados
- Si era "Listo para firmar" → ahora es "Borrador"
- Usuario ve mensaje de advertencia si cambió estado
- URL de firma se pierde si cambió a Borrador

**Puntos críticos a testear**:
- ✅ Validación de estados editables antes de mostrar botón
- ✅ Mensaje de error para estados no editables
- ✅ Carga correcta de datos actuales del parte
- ✅ Carga correcta de empleados de la obra
- ✅ Detección y cambio automático de "Listo para firmar" a "Borrador"
- ✅ Archivado correcto de detalles antiguos (no eliminación)
- ✅ Creación correcta de nuevos detalles
- ✅ Mensaje de advertencia cuando cambia estado
- ✅ Actualización correcta de todas las relaciones en Notion
- ✅ Manejo de errores de API
- ✅ Recarga automática de datos tras edición

### FLUJO 4: Firma del Parte

**Prerequisito**: Parte en estado "Listo para firmar" con URL de firma

**Pasos**:
1. Usuario ve parte con estado "Listo para firmar"
2. Ve botón "Firmar ahora" (solo si existe URL de firma)
3. Hace clic en "Firmar ahora"
4. Sistema abre URL de firma en nueva pestaña
5. Usuario completa firma en interfaz externa (Notion)
6. Notion:
   - Marca parte como "Firmado"
   - Genera PDF del parte
   - Almacena PDF en propiedad "URL PDF"
7. Sistema sincroniza estado automáticamente (SSE o polling)
8. Usuario ve nuevo estado "Firmado"
9. Botón "Descargar PDF" ahora visible
10. Botón "Firmar ahora" desaparece
11. Parte ya no es editable

**Validaciones**:
- Solo visible si estado es "Listo para firmar"
- Solo visible si existe propiedad "firmarUrl"

**Resultado**:
- Parte cambia a estado "Firmado"
- PDF generado y disponible
- Parte permanentemente no editable
- Botones actualizados según nuevo estado

**Puntos críticos a testear**:
- ✅ Visibilidad correcta de botón según estado
- ✅ URL de firma válida y accesible
- ✅ Apertura correcta en nueva pestaña
- ✅ Sincronización automática de cambio de estado
- ✅ Generación correcta de PDF en Notion
- ✅ Actualización de UI tras firma
- ✅ Visibilidad de botón "Descargar PDF" tras firma
- ✅ Desaparición de botón "Firmar"
- ✅ Bloqueo permanente de edición

### FLUJO 5: Consulta y Filtrado de Partes

**Pasos**:
1. Usuario navega a "Consultar Partes"
2. Sistema carga lista completa de partes (ordenados por fecha desc)
3. Sistema muestra filtros:
   - Dropdown de obras (todas las obras disponibles)
   - Date picker para fecha
4. Usuario aplica filtros
5. Sistema filtra partes en frontend:
   - Por nombre de obra (coincidencia exacta)
   - Por fecha (formato YYYY-MM-DD normalizado)
6. Sistema muestra resultados filtrados con:
   - Nombre del parte
   - Estado con badge de color
   - Obra
   - Fecha (formato español DD-MM-YYYY HH:MM)
   - Horas totales
   - Indicador "No editable" si aplica
7. Usuario puede:
   - Ver detalles (siempre disponible)
   - Descargar PDF (si estado permite)
   - Firmar (si estado "Listo para firmar" y hay URL)
   - Enviar Datos (si estado "Borrador")
   - Editar (si estado editable)

**Validaciones**:
- Filtros son opcionales
- Sin filtros muestra todos los partes
- Fechas se normalizan para comparación correcta

**Resultado**:
- Lista filtrada de partes
- Botones contextuales según estado
- Acceso rápido a todas las operaciones

**Puntos críticos a testear**:
- ✅ Carga correcta de lista completa
- ✅ Ordenamiento por fecha descendente
- ✅ Filtrado correcto por obra
- ✅ Filtrado correcto por fecha
- ✅ Normalización correcta de fechas
- ✅ Formato español de fechas en UI
- ✅ Visibilidad correcta de botones por estado
- ✅ Estados de badge con colores correctos
- ✅ Indicador "No editable" para estados protegidos
- ✅ Performance con muchos partes (100+)

### FLUJO 6: Sincronización Inteligente (Smart Polling)

**Comportamiento Automático**:

**Modo Rápido (3 segundos)**:
- **Activación**: Hay cambios en últimos 30 segundos
- **Indicador**: Badge azul con animación pulsante
- **Comportamiento**:
  - Polling cada 3s para lista de partes
  - SSE cada 3s para detalles (si modal abierto)
  - Máxima responsividad para detectar cambios rápidamente

**Modo Normal (8 segundos)**:
- **Activación**: Sin cambios entre 30s y 2 minutos
- **Indicador**: Badge morado estático
- **Comportamiento**:
  - Polling cada 8s para lista de partes
  - SSE cada 8s para detalles
  - Balance entre responsividad y consumo de API

**Modo Lento (15 segundos)**:
- **Activación**: Sin cambios por más de 2 minutos
- **Indicador**: Badge gris estático
- **Comportamiento**:
  - Polling cada 15s para lista de partes
  - SSE cada 15s para detalles
  - Mínimo consumo de API cuando no hay actividad

**Detección de Cambios**:
- Hash basado en: ID + estado + última edición
- Si hash cambia → modo rápido automático
- Si hash no cambia → transición gradual a modos más lentos

**Pausas Automáticas**:
- Pestaña oculta (visibilitychange) → pausa todo
- Pestaña visible → refresco inmediato + reanudación
- Durante edición de parte → pausa polling de lista
- Al cerrar edición → reanudación de polling

**SSE (Server-Sent Events)**:
- Conexión persistente mientras modal de detalles abierto
- Emite cambios de estado y última edición en tiempo real
- Heartbeats cada X segundos para mantener conexión viva
- Reconexión automática con backoff exponencial (1s → 2s → 4s... → max 30s)
- Cierre automático al cerrar modal

**Puntos críticos a testear**:
- ✅ Transición correcta entre modos (rápido → normal → lento)
- ✅ Detección correcta de cambios mediante hash
- ✅ Indicador visual actualizado según modo activo
- ✅ Pausa al ocultar pestaña
- ✅ Reanudación y refresco al mostrar pestaña
- ✅ Pausa durante edición de parte
- ✅ Reanudación tras cerrar edición
- ✅ Manejo de modo offline prolongado durante edición (sin sobrescribir cambios locales al reconectar)
- ✅ SSE: conexión correcta al abrir modal
- ✅ SSE: cierre correcto al cerrar modal
- ✅ SSE: reconexión automática tras error
- ✅ SSE: backoff exponencial funciona
- ✅ Consumo de API dentro de límites (< 3 req/s)
- ✅ Sin actualizaciones innecesarias (solo si hay cambios)
- ✅ Performance con 10+ usuarios concurrentes

---

## Integraciones Externas

### NOTION API

**Configuración**:
- URL base: `https://api.notion.com/v1`
- Autenticación: Bearer token (integración interna)
- Versión API: 2022-06-28
- Timeout: 10 segundos

**Bases de Datos**:

1. **OBRAS** (ID: `20882593a257810083d6dc8ec0a99d58`)
   - Propiedades principales: Obra - Codigo, Provincia, Estado, Empleados (relation)
   - **Campos económicos SANITIZADOS**: Precio Encargado, Precio Peón, Precio Capataz, Precio Oficial 1ª/2ª

2. **JEFE_OBRAS** (ID: `20882593a25781b4a3b9e0ff5589ea4e`)
   - Propiedades: Persona Autorizada, Email

3. **EMPLEADOS** (ID: `20882593a257814db882c4b70cb0cbab`)
   - Propiedades: Nombre Completo, Categoría, Provincia, Localidad, Teléfono, DNI, Estado, Delegado

4. **PARTES_TRABAJO** (ID: `20882593a25781258595e15abb37e87a`)
   - Propiedades principales: Nombre, Fecha, Estado, Obras (relation), Persona Autorizada (relation), Notas, URL PDF, Firmar (formula), Última edición
   - **Campos económicos SANITIZADOS**: Importe total, RP Importe Parte, Imp Horas*

5. **DETALLES_HORA** (ID: `20882593a25781838da1fe6741abcfd9`)
   - Propiedades: Detalle, Partes de trabajo (relation), Empleados (relation), Cantidad Horas

**Operaciones**:
- Query databases (POST /databases/{id}/query)
- Retrieve page (GET /pages/{id})
- Create page (POST /pages)
- Update page (PATCH /pages/{id})
- Retrieve database (GET /databases/{id}) - para opciones de propiedades

**Límites de Notion**:
- Rate limit: 3 requests/segundo
- Cache TTL: 5 segundos (configurable)
- Reintentos: con backoff exponencial

**Puntos críticos a testear**:
- ✅ Autenticación correcta con token
- ✅ Manejo de errores HTTP (401, 403, 404, 429, 500)
- ✅ Extracción correcta de valores por tipo de propiedad
- ✅ Creación correcta de relaciones entre BDs
- ✅ Actualización correcta de propiedades
- ✅ Archivado vs eliminación de páginas
- ✅ Respeto de rate limits
- ✅ Reintentos con backoff exponencial
- ✅ Manejo de paginación `has_more` en catálogos y listados extensos
- ✅ Detección temprana de deriva de esquema (propiedades críticas presentes y con tipo esperado)
- ✅ Timeout handling
- ✅ Sanitización de datos económicos en respuestas

### WEBHOOK MAKE (Envío de Datos)

**Configuración**:
- URL: configurable vía `PARTES_DATOS_WEBHOOK_URL`
- Timeout: configurable vía `PARTES_WEBHOOK_TIMEOUT_MS` (10s por defecto)
- Método: POST
- Content-Type: application/json

**Payload Enviado**:
```json
{
  "parteId": "string",
  "notionPageId": "string",
  "page_id": "string",
  "property_id": "string",
  "property_name": "string",
  "source": {
    "type": "copuno-app",
    "action": "enviar-datos",
    "triggeredAt": "ISO timestamp"
  },
  "data": {
    // Datos completos del parte (properties sanitizadas)
  }
}
```

**Comportamiento**:
- Solo se envía si parte está en estado "Borrador"
- Tras envío exitoso, cambia estado a "Datos Enviados"
- Si webhook no configurado: modo simulado con logging
- Si falla: error HTTP con detalles de respuesta

**Puntos críticos a testear**:
- ✅ Validación de estado "Borrador" antes de envío
- ✅ Construcción correcta del payload completo
- ✅ Identificación correcta de property button
- ✅ Envío HTTP exitoso al webhook
- ✅ Manejo de timeout
- ✅ Manejo de errores HTTP del webhook
- ✅ Reintentos idempotentes tras timeout/500 (sin duplicar envíos ni estados inconsistentes)
- ✅ Cambio de estado tras envío exitoso
- ✅ Modo simulado cuando webhook no configurado
- ✅ Logging detallado de payload y respuestas
- ✅ Datos económicos sanitizados en payload

---

## Tests Prioritarios

### PRIORIDAD CRÍTICA (P0) - Bloqueantes

#### 1. Crear Parte de Trabajo

**Tests a realizar**:
- ✅ Validar que obra, fecha y persona autorizada son obligatorios
- ✅ Verificar generación automática de nombre: "Parte + NombreObra + ID"
- ✅ Confirmar que solo aparecen empleados de la obra seleccionada
- ✅ Validar rango de horas por empleado [0-24] con paso 0.5h
- ✅ Verificar creación correcta en Notion con todas las relaciones
- ✅ Confirmar creación de detalles de horas por cada empleado
- ✅ Verificar estado inicial "Borrador"
- ✅ Confirmar mensaje de éxito tras creación
- ✅ Verificar manejo de errores de API

**Criterio de éxito**:
- Todas las validaciones funcionan correctamente
- Parte se crea en Notion con datos completos
- Nombre se genera automáticamente con formato correcto
- Detalles de horas se crean para cada empleado seleccionado

#### 2. Editar Parte de Trabajo

**Tests a realizar**:
- ✅ Validar que solo estados "Borrador" y "Listo para firmar" son editables
- ✅ Verificar mensaje de error para estados protegidos (Firmado, Datos Enviados, Enviado)
- ✅ Confirmar cambio automático "Listo para firmar" → "Borrador"
- ✅ Verificar que detalles antiguos se archivan (no se eliminan)
- ✅ Confirmar creación de nuevos detalles con datos actualizados
- ✅ Validar mensaje de advertencia cuando cambia estado a Borrador
- ✅ Verificar actualización correcta de todas las relaciones
- ✅ Confirmar que URL de firma se pierde al cambiar a Borrador

**Criterio de éxito**:
- Solo partes editables permiten edición
- Mensaje claro para partes no editables
- Cambio de estado funciona correctamente
- Detalles antiguos se conservan (archivados)
- Usuario es advertido cuando pierde firma

#### 3. Envío de Datos al Webhook

**Tests a realizar**:
- ✅ Validar que solo partes en estado "Borrador" pueden enviarse
- ✅ Verificar construcción correcta del payload completo
- ✅ Confirmar cambio de estado a "Datos Enviados" tras envío exitoso
- ✅ Verificar manejo de timeout del webhook (10s)
- ✅ Verificar manejo de errores HTTP del webhook (4xx, 5xx)
- ✅ Confirmar que botón "Enviar Datos" desaparece tras envío
- ✅ Verificar que botón "Firmar ahora" aparece si hay URL
- ✅ Confirmar modo simulado cuando webhook no configurado
- ✅ Verificar logging detallado de payload y respuestas

**Criterio de éxito**:
- Solo partes en "Borrador" pueden enviarse
- Payload incluye todos los campos necesarios
- Estado cambia correctamente tras envío
- Errores del webhook se manejan apropiadamente
- UI se actualiza correctamente

#### 4. Sanitización de Datos Económicos

**Tests a realizar**:
- ✅ Verificar eliminación de campos con keywords: importe, precio, coste, tarifa
- ✅ Confirmar redacción de valores con € o euros
- ✅ Verificar que se aplica a TODAS las respuestas /api/*
- ✅ Confirmar que obras no exponen datos económicos
- ✅ Confirmar que empleados no exponen datos económicos
- ✅ Verificar que partes no exponen importes
- ✅ Confirmar que /api/health NO sanitiza (excepción)

**Criterio de éxito**:
- Ningún dato económico es visible en frontend
- Sanitización es automática y global
- No hay fugas de información sensible

#### 5. Autenticación con Notion

**Tests a realizar**:
- ✅ Verificar conexión exitosa con token configurado
- ✅ Verificar manejo de errores 401 (Unauthorized)
- ✅ Verificar manejo de errores 403 (Forbidden)
- ✅ Confirmar acceso a las 5 bases de datos requeridas:
  - OBRAS
  - JEFE_OBRAS
  - EMPLEADOS
  - PARTES_TRABAJO
  - DETALLES_HORA
- ✅ Verificar timeout de 10 segundos funciona
- ✅ Verificar reintentos con backoff exponencial

**Criterio de éxito**:
- Aplicación se conecta correctamente a Notion
- Errores de autenticación se manejan apropiadamente
- Todas las bases de datos son accesibles

### PRIORIDAD ALTA (P1) - Importantes

#### 6. Smart Polling y Sincronización

**Tests a realizar**:
- ✅ Verificar inicio en modo adecuado según actividad
- ✅ Confirmar transición automática: Rápido (3s) → Normal (8s) → Lento (15s)
- ✅ Verificar detección de cambios mediante hash (ID + estado + última edición)
- ✅ Confirmar pausa al ocultar pestaña del navegador
- ✅ Verificar refresco inmediato al volver a pestaña
- ✅ Confirmar pausa durante edición de parte
- ✅ Verificar reanudación tras cerrar edición
- ✅ Confirmar indicador visual correcto por cada modo:
  - Rápido: Badge azul pulsante
  - Normal: Badge morado estático
  - Lento: Badge gris estático
- ✅ Verificar que consumo de API < 3 req/s

**Criterio de éxito**:
- Transiciones entre modos funcionan correctamente
- Detección de cambios es precisa
- Pausas y reanudaciones funcionan
- Indicadores visuales son correctos
- Consumo de API está dentro de límites

#### 7. SSE (Server-Sent Events)

**Tests a realizar**:
- ✅ Verificar conexión al abrir modal de detalles
- ✅ Confirmar cierre al cerrar modal
- ✅ Verificar actualización en tiempo real de estado
- ✅ Confirmar actualización de "última edición"
- ✅ Verificar reconexión automática con backoff exponencial:
  - 1s → 2s → 4s → 8s → 16s → max 30s
- ✅ Confirmar heartbeats mantienen conexión viva
- ✅ Verificar que no hay fugas de memoria (conexiones no cerradas)

**Criterio de éxito**:
- SSE se conecta y desconecta correctamente
- Cambios se reflejan en tiempo real
- Reconexión automática funciona
- No hay fugas de memoria

#### 8. Gestión de Estados de Empleados

**Tests a realizar**:
- ✅ Verificar obtención dinámica de opciones desde Notion
- ✅ Confirmar soporte para tipos: status, select, checkbox
- ✅ Verificar actualización en tiempo real al cambiar estado
- ✅ Confirmar indicador visual con color por cada estado
- ✅ Verificar persistencia inmediata en Notion
- ✅ Confirmar que cambios se reflejan en todas las vistas

**Criterio de éxito**:
- Opciones de estado se cargan dinámicamente
- Cambios se persisten correctamente
- UI se actualiza en tiempo real

#### 9. Filtrado y Consulta de Partes

**Tests a realizar**:
- ✅ Verificar carga correcta de lista completa
- ✅ Confirmar ordenamiento por fecha descendente
- ✅ Verificar filtrado correcto por obra
- ✅ Verificar filtrado correcto por fecha
- ✅ Confirmar normalización correcta de fechas (YYYY-MM-DD)
- ✅ Verificar formato español de fechas en UI (DD-MM-YYYY HH:MM)
- ✅ Confirmar limpieza de filtros restaura lista completa
- ✅ Verificar performance con 100+ partes

**Criterio de éxito**:
- Filtros funcionan correctamente
- Fechas se muestran en formato español
- Performance es aceptable con muchos partes

#### 10. Visibilidad de Botones por Estado

**Tests a realizar**:

Verificar visibilidad de botones según estado:

| Estado | Ver Detalles | Descargar PDF | Firmar | Enviar Datos | Editar |
|--------|--------------|---------------|--------|--------------|--------|
| Borrador | ✅ | ❌ | ❌ | ✅ | ✅ |
| Listo para firmar | ✅ | ❌ | ✅ (si URL) | ❌ | ✅ |
| Firmado | ✅ | ✅ | ❌ | ❌ | ❌ |
| Datos Enviados | ✅ | ❌ | ❌ | ❌ | ❌ |
| Enviado | ✅ | ✅ | ❌ | ❌ | ❌ |

**Criterio de éxito**:
- Botones correctos visibles por cada estado
- No hay botones incorrectos visibles
- Transiciones de estado actualizan botones

#### 11. Rate Limiting y Protección

**Tests a realizar**:
- ✅ Verificar límite de 100 peticiones por 15 minutos por IP
- ✅ Confirmar respuesta HTTP 429 al exceder límite
- ✅ Verificar que cache reduce presión sobre API
- ✅ Confirmar respeto de límite de Notion (3 req/s)
- ✅ Verificar que Smart Polling ajusta intervalos bajo carga
- ✅ Confirmar que múltiples usuarios no saturan API

**Criterio de éxito**:
- Rate limiting funciona correctamente
- API no se satura bajo carga
- Cache es efectivo

### PRIORIDAD MEDIA (P2) - Deseables

#### 12. Carga de Empleados por Obra

**Tests a realizar**:
- ✅ Verificar que solo empleados de la obra seleccionada aparecen
- ✅ Confirmar recarga al cambiar de obra
- ✅ Verificar performance con muchos empleados (100+)
- ✅ Confirmar que empleados sin obra no aparecen

**Criterio de éxito**:
- Filtrado de empleados es correcto
- Performance es aceptable

#### 13. Validación de Horas

**Tests a realizar**:
- ✅ Verificar rango [0-24] validado en frontend
- ✅ Verificar rango [0-24] validado en backend
- ✅ Confirmar paso de 0.5h respetado
- ✅ Verificar mensaje de error claro si fuera de rango

**Criterio de éxito**:
- Validación funciona en ambos lados
- Mensajes de error son claros

#### 14. Formato de Fechas

**Tests a realizar**:
- ✅ Verificar formato español DD-MM-YYYY HH:MM en UI
- ✅ Confirmar normalización a YYYY-MM-DD para comparaciones
- ✅ Verificar que date picker funciona correctamente
- ✅ Confirmar que datetime-local funciona correctamente

**Criterio de éxito**:
- Fechas se muestran en formato español
- Comparaciones funcionan correctamente

#### 15. Manejo de Errores de UI

**Tests a realizar**:
- ✅ Verificar mensajes de error claros y accionables
- ✅ Confirmar feedback visual de loading (spinners)
- ✅ Verificar recuperación de errores de red
- ✅ Confirmar que UI no se bloquea tras error

**Criterio de éxito**:
- Errores se muestran claramente
- UI se recupera apropiadamente

#### 16. Logging y Observabilidad

**Tests a realizar**:
- ✅ Verificar request-id en todos los logs
- ✅ Confirmar logs estructurados en producción
- ✅ Verificar logging de errores completo
- ✅ Confirmar logging de operaciones críticas

**Criterio de éxito**:
- Logs son útiles para debugging
- Request-id permite trazabilidad

---

## Plan de Ejecución

### FASE 1: Tests Manuales Inmediatos (1-2 días)

**Objetivo**: Validar funcionalidades críticas antes de entrega

**Actividades**:

#### Día 1: Tests Core
1. **Crear Parte de Trabajo** (30 min)
   - Crear 3 partes con diferentes obras
   - Verificar generación de nombre automático
   - Confirmar creación de detalles de horas
   - Validar mensajes de error con datos inválidos

2. **Editar Parte de Trabajo** (30 min)
   - Editar parte en estado "Borrador"
   - Editar parte en estado "Listo para firmar"
   - Intentar editar parte "Firmado" (debe fallar)
   - Verificar archivado de detalles antiguos

3. **Envío de Datos al Webhook** (45 min)
   - Enviar datos de parte en "Borrador"
   - Verificar cambio de estado
   - Verificar generación de URL de firma
   - Intentar enviar desde estado incorrecto (debe fallar)
   - Verificar logging de payload

4. **Sanitización de Datos Económicos** (30 min)
   - Abrir DevTools y revisar respuestas de:
     - GET /api/obras
     - GET /api/empleados
     - GET /api/partes-trabajo
   - Confirmar que NO hay campos con: importe, precio, coste, €, euros

5. **Autenticación con Notion** (15 min)
   - Verificar health check: GET /api/health
   - Confirmar acceso a todas las BDs
   - Revisar logs de conexión

#### Día 2: Tests de Integración y UI
1. **Flujo Completo: Crear → Enviar → Firmar** (1 hora)
   - Crear nuevo parte
   - Enviar datos
   - Abrir URL de firma (no completar firma aún)
   - Verificar estado "Listo para firmar"
   - Completar firma en Notion
   - Esperar sincronización
   - Verificar estado "Firmado"
   - Verificar URL de PDF disponible

2. **Flujo de Edición con Pérdida de Firma** (30 min)
   - Crear parte → enviar → "Listo para firmar"
   - Editar parte
   - Verificar advertencia de cambio de estado
   - Confirmar pérdida de URL de firma
   - Verificar que debe reenviar datos

3. **Smart Polling y Sincronización** (45 min)
   - Abrir aplicación en 2 pestañas
   - Crear parte en pestaña 1
   - Verificar actualización en pestaña 2
   - Observar transición de modos:
     - Debe iniciar en modo rápido (badge azul)
     - Tras 30s sin cambios → modo normal (badge morado)
     - Tras 2 min sin cambios → modo lento (badge gris)
   - Ocultar pestaña → verificar pausa
   - Mostrar pestaña → verificar refresco

4. **Visibilidad de Botones por Estado** (30 min)
   - Verificar botones para cada estado:
     - Borrador: Ver, Enviar Datos, Editar
     - Listo para firmar: Ver, Firmar, Editar
     - Firmado: Ver, Descargar PDF
     - Datos Enviados: Ver
     - Enviado: Ver, Descargar PDF

5. **Filtros y Búsqueda** (30 min)
   - Filtrar por obra
   - Filtrar por fecha
   - Combinar filtros
   - Limpiar filtros

**Entregables Fase 1**:
- ✅ Checklist de tests ejecutados
- ✅ Lista de bugs encontrados
- ✅ Screenshots de evidencia
- ✅ Reporte de tests manuales

### FASE 2: Tests de Integración (2-3 días)

**Objetivo**: Validar integraciones y flujos complejos

**Actividades**:

#### Día 1: Integración con Notion
1. **CRUD de Partes de Trabajo** (2 horas)
   - Crear 10 partes diferentes
   - Editar 5 partes
   - Verificar en Notion que datos son correctos
   - Confirmar relaciones entre BDs

2. **Gestión de Estados de Empleados** (1 hora)
   - Cambiar estado de 5 empleados
   - Verificar persistencia en Notion
   - Confirmar actualización en UI

3. **Manejo de Errores de Notion** (1 hora)
   - Simular token inválido
   - Simular timeout
   - Simular rate limit (429)
   - Verificar mensajes de error

#### Día 2: Integración con Webhook
1. **Envío de Datos** (2 horas)
   - Enviar 5 partes diferentes
   - Verificar payload en logs del webhook
   - Confirmar cambio de estado
   - Verificar generación de URL de firma

2. **Manejo de Errores del Webhook** (1 hora)
   - Simular timeout del webhook
   - Simular error 500 del webhook
   - Simular webhook no configurado
   - Verificar mensajes de error

#### Día 3: Sincronización y SSE
1. **Smart Polling** (2 horas)
   - Monitorear transiciones de modo durante 30 minutos
   - Crear cambios y verificar detección
   - Verificar consumo de API con DevTools
   - Confirmar < 3 req/s

2. **SSE** (1 hora)
   - Abrir modal de detalles
   - Cambiar estado desde otra sesión
   - Verificar actualización en tiempo real
   - Cerrar modal y verificar cierre de conexión

**Entregables Fase 2**:
- ✅ Reporte de tests de integración
- ✅ Logs de errores encontrados
- ✅ Métricas de consumo de API
- ✅ Evidencia de pruebas

### FASE 3: Tests de UI/UX (1 día)

**Objetivo**: Validar experiencia de usuario

**Actividades**:

#### Mañana: Validación Visual
1. **Visibilidad de Botones** (1 hora)
   - Verificar tabla de visibilidad completa
   - Capturar screenshots de cada estado

2. **Feedback Visual** (1 hora)
   - Verificar loading spinners
   - Verificar mensajes de éxito
   - Verificar mensajes de error
   - Verificar badges de estado

3. **Filtros y Búsqueda** (1 hora)
   - Probar todos los filtros
   - Verificar performance con muchos partes
   - Confirmar formato de fechas

#### Tarde: Responsividad
1. **Desktop** (30 min)
   - 1920x1080
   - 1366x768

2. **Tablet** (30 min)
   - iPad (768x1024)
   - Landscape y portrait

3. **Mobile** (1 hora)
   - iPhone (375x667)
   - Android (360x640)
   - Landscape y portrait

**Entregables Fase 3**:
- ✅ Screenshots de UI en diferentes resoluciones
- ✅ Reporte de issues de UX
- ✅ Lista de mejoras sugeridas

### FASE 4: Tests de Compatibilidad (1 día)

**Objetivo**: Validar compatibilidad cross-browser

**Actividades**:

#### Mañana: Navegadores Desktop
1. **Chrome** (1 hora)
   - Última versión
   - Versión anterior
   - Ejecutar suite completa de tests manuales

2. **Firefox** (1 hora)
   - Última versión
   - Versión anterior
   - Ejecutar suite completa de tests manuales

3. **Safari** (1 hora)
   - Última versión
   - Ejecutar suite completa de tests manuales

#### Tarde: Navegadores Mobile
1. **Chrome Android** (1 hora)
   - Ejecutar suite de tests core

2. **Safari iOS** (1 hora)
   - Ejecutar suite de tests core

**Entregables Fase 4**:
- ✅ Matriz de compatibilidad
- ✅ Lista de bugs por navegador
- ✅ Screenshots de problemas encontrados

### FASE 5: Tests de Performance (Opcional - 1 día)

**Objetivo**: Validar performance bajo carga

**Actividades**:

1. **Carga de Datos** (2 horas)
   - Crear 200+ partes
   - Medir tiempo de carga inicial
   - Medir tiempo de filtrado
   - Verificar performance de Smart Polling

2. **Concurrencia** (2 horas)
   - Simular 10 usuarios concurrentes
   - Verificar consumo de API
   - Confirmar ausencia de race conditions
   - Verificar rate limiting

**Entregables Fase 5**:
- ✅ Reporte de performance
- ✅ Métricas de consumo de API
- ✅ Recomendaciones de optimización

---

## Checklist Pre-Entrega

### CRÍTICO (Bloqueante para Producción)

#### Funcionalidad Core
- [ ] Crear parte funciona correctamente
- [ ] Editar parte funciona en estados permitidos (Borrador, Listo para firmar)
- [ ] Editar parte muestra error en estados protegidos (Firmado, Datos Enviados, Enviado)
- [ ] Envío de datos al webhook funciona
- [ ] Cambio de estado tras envío funciona
- [ ] URL de firma se genera correctamente

#### Seguridad
- [ ] Datos económicos están sanitizados en todas las respuestas
- [ ] Autenticación con Notion funciona
- [ ] Rate limiting está activo (100 req/15min por IP)
- [ ] CORS está configurado correctamente
- [ ] Headers de seguridad (Helmet) están activos

#### Visibilidad de UI
- [ ] Botones visibles según estado correcto (ver tabla)
- [ ] Estado "Borrador": Ver, Enviar Datos, Editar
- [ ] Estado "Listo para firmar": Ver, Firmar (si URL), Editar
- [ ] Estado "Firmado": Ver, Descargar PDF
- [ ] Estado "Datos Enviados": Ver
- [ ] Estado "Enviado": Ver, Descargar PDF

#### Integridad de Datos
- [ ] Partes se crean con todas las relaciones correctas
- [ ] Detalles de horas se crean por cada empleado
- [ ] Detalles antiguos se archivan (no se eliminan) al editar
- [ ] Nombre automático se genera con formato correcto

### IMPORTANTE (Alta Prioridad)

#### Sincronización
- [ ] Smart Polling funciona en los 3 modos (Rápido/Normal/Lento)
- [ ] Transición entre modos funciona correctamente
- [ ] Detección de cambios mediante hash funciona
- [ ] Pausa al ocultar pestaña funciona
- [ ] Reanudación al mostrar pestaña funciona
- [ ] Indicadores visuales (badges) son correctos

#### SSE
- [ ] Conexión se establece al abrir modal de detalles
- [ ] Conexión se cierra al cerrar modal
- [ ] Actualización en tiempo real funciona
- [ ] Reconexión automática funciona
- [ ] No hay fugas de memoria (conexiones no cerradas)

#### Filtros y Búsqueda
- [ ] Filtro por obra funciona correctamente
- [ ] Filtro por fecha funciona correctamente
- [ ] Limpieza de filtros restaura lista completa
- [ ] Formato de fecha español (DD-MM-YYYY HH:MM) se muestra correctamente

#### Performance
- [ ] Performance aceptable con 100+ partes
- [ ] Consumo de API < 3 req/s
- [ ] Cache reduce presión sobre Notion API
- [ ] Tiempo de carga inicial < 3 segundos

#### Manejo de Errores
- [ ] Mensajes de error claros y accionables
- [ ] Feedback visual de loading (spinners)
- [ ] Recuperación de errores de red funciona
- [ ] UI no se bloquea tras error

### DESEABLE (Media Prioridad)

#### Compatibilidad
- [ ] Funciona en Chrome (últimas 2 versiones)
- [ ] Funciona en Firefox (últimas 2 versiones)
- [ ] Funciona en Safari (última versión)
- [ ] Funciona en Chrome Android
- [ ] Funciona en Safari iOS

#### Responsividad
- [ ] Desktop (1920x1080 y superiores)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667 mínimo)

#### Validaciones
- [ ] Validación de campos requeridos funciona
- [ ] Validación de rango de horas [0-24] funciona
- [ ] Mensajes de validación son claros

#### Logging
- [ ] Request-id en todos los logs
- [ ] Logs estructurados en producción
- [ ] Logging de errores completo
- [ ] Logging de operaciones críticas

---

## Resumen de Estimaciones

### Tiempo Total Estimado
- **Fase 1** (Tests Manuales Inmediatos): 1-2 días
- **Fase 2** (Tests de Integración): 2-3 días
- **Fase 3** (Tests de UI/UX): 1 día
- **Fase 4** (Tests de Compatibilidad): 1 día
- **Fase 5** (Tests de Performance - Opcional): 1 día

**TOTAL**: 5-7 días (sin performance) o 6-8 días (con performance)

### Priorización Recomendada

**Para entrega inmediata** (crítico):
- Fase 1: Tests Manuales Inmediatos (1-2 días)
- Subset de Fase 2: Tests de integración críticos (1 día)
- **TOTAL MÍNIMO**: 2-3 días

**Para entrega completa** (recomendado):
- Todas las fases 1-4 (5-7 días)

**Para optimización** (opcional):
- Fase 5: Tests de Performance (1 día adicional)

---

## Notas Finales

### Recomendaciones

1. **Testing Automatizado Futuro**
   - Considerar implementar Jest/Vitest para tests unitarios
   - Implementar Playwright/Cypress para tests E2E
   - Configurar CI/CD con tests automatizados
   - Implementar coverage reporting

2. **Monitoreo en Producción**
   - Implementar error tracking (Sentry, LogRocket, etc.)
   - Monitorear métricas de performance
   - Configurar alertas para errores críticos
   - Implementar analytics de uso

3. **Documentación**
   - Mantener este documento actualizado
   - Documentar bugs conocidos
   - Documentar workarounds temporales
   - Crear runbook de operaciones

4. **Mejora Continua**
   - Recopilar feedback de usuarios
   - Priorizar mejoras según impacto
   - Iterar sobre tests basado en bugs encontrados
   - Mantener checklist actualizado

### Contacto y Soporte

Para dudas o problemas durante el testing, contactar a:
- **Desarrollador**: [Nombre del desarrollador]
- **Product Owner**: [Nombre del PO]
- **Repositorio**: [URL del repositorio]
- **Documentación**: Ver carpeta `/docs/`

---

**Última actualización**: 2025-10-31
**Versión del documento**: 1.0
**Versión de la aplicación**: 1.4.0
