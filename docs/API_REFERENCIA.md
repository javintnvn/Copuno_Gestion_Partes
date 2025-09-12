# Referencia de API

Nota: Todas las respuestas de `/api/*` (excepto `/api/health`) se someten a un saneado que elimina/redacta datos económicos.

## Health
- Método: GET
- Ruta: `/api/health`
- Respuesta: `{ status, timestamp, notionToken }`

## Obras
- Método: GET
- Ruta: `/api/obras`
- Descripción: Lista de obras (sin campos económicos).
- Respuesta (array): `{ id, nombre, provincia, estado }`

## Empleados
- Método: GET
- Ruta: `/api/empleados`
- Descripción: Lista de empleados (datos básicos y estado).
- Respuesta (array): `{ id, nombre, categoria, provincia, localidad, telefono, dni, estado, delegado }`

- Método: GET
- Ruta: `/api/obras/:obraId/empleados`
- Descripción: Empleados relacionados con una obra específica.

- Método: GET
- Ruta: `/api/empleados/estado-opciones`
- Descripción: Opciones de la propiedad “Estado” (dinámico desde Notion); soporta `status`, `select` o `checkbox`.

- Método: PUT
- Ruta: `/api/empleados/:empleadoId/estado`
- Body: `{ estado: string|boolean }` (según tipo real de la propiedad en Notion).
- Descripción: Actualiza el estado de un empleado.

## Partes de Trabajo
- Método: GET
- Ruta: `/api/partes-trabajo`
- Descripción: Lista partes; incluye horas por rol, estado, obra, URL PDF y notas. No incluye importe.
- Respuesta (array): `{ id, nombre, fecha, estado, obra, horasOficial1, horasOficial2, horasCapataz, horasEncargado, urlPDF, enviadoCliente, notas }`

- Método: POST
- Ruta: `/api/partes-trabajo`
- Body: `{ obra, obraId, fecha, jefeObraId, notas?, empleados?: string[], empleadosHoras?: Record<string, number> }`
- Descripción: Crea un parte y (opcionalmente) los detalles de horas por empleado.

- Método: GET
- Ruta: `/api/partes-trabajo/:parteId/detalles`
- Descripción: Detalle de un parte y sus empleados/horas.

- Método: GET
- Ruta: `/api/partes-trabajo/:parteId/empleados`
- Descripción: Detalles de horas por empleado para un parte.

- Método: PUT
- Ruta: `/api/partes-trabajo/:parteId`
- Body: `{ obraId, fecha, personaAutorizadaId, notas?, empleados?: string[], empleadosHoras?: Record<string, number> }`
- Reglas:
  - No se permite editar si el parte está en: `firmado`, `datos enviados`, `enviado`.
  - Horas por empleado deben estar en el rango `[0, 24]`.

## Datos Completos
- Método: GET
- Ruta: `/api/datos-completos`
- Descripción: Obtiene obras, jefes, empleados y partes en una sola llamada.

## Errores (formato general)
- 400: Validaciones (campos requeridos, horas inválidas, etc.).
- 401/403/404/429: Errores de Notion (token, permisos, no encontrado, rate limit).
- 409: Edición no permitida por estado actual.
- 500: Error de servidor, mensaje con detalle.
