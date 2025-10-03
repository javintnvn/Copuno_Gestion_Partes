# Operaciones Backend: Estado y Siguientes Pasos

Este documento resume el estado actual del servidor, las decisiones técnicas, cambios ya aplicados y la guía para continuar desde este punto sin pérdida de contexto.

## Estado Actual
- Servidor: Node.js + Express sirviendo SPA y API REST en el mismo proceso.
- Seguridad y resiliencia:
  - `dotenv` cargando `.env` (NOTION_TOKEN obligatorio).
  - CORS configurable por `ALLOWED_ORIGINS`.
  - Rate limiting con `express-rate-limit` (por IP, configurable).
  - Logging de acceso con `morgan` (latencia; request-id).
  - Headers de seguridad con `helmet`.
  - Compresión HTTP con `compression`.
  - Request ID (`x-request-id`) por petición.
- Cache en memoria (TTL) para catálogos: obras, jefes, empleados.
- Saneado de datos económicos: las respuestas de `/api/*` se filtran para eliminar claves y valores con información económica (excepto `/api/health`).

### Sincronización de estado (Partes)
- Stream SSE: `GET /api/partes-trabajo/:parteId/estado/stream` emite cambios de `estado` y `Última edición` (sondeo a Notion cada 5s, reconexión con backoff hasta 30s).
- Consulta puntual: `GET /api/partes-trabajo/:parteId/estado` devuelve el estado actual y la última edición.
- Frontend: abre SSE al mostrar el modal de detalles; cierra al ocultar/cerrar. La lista se refresca cada 30s.
- Ahorro de recursos: el polling/SSE se pausan cuando la pestaña está en segundo plano y al abrir edición.
- Reglas de negocio:
  - PUT de partes bloquea estados no editables: firmado, datos enviados, enviado.
  - Validación de horas por empleado [0–24].
  - Estado “Listo para firmar” habilita CTA de firma y mantiene edición posible.

## Variables de Entorno
Ver `docs/CONFIGURACION_ENTORNO.md` y `env.example`.
- Relevantes nuevas:
  - `CACHE_TTL_MS` (opcional, TTL cache catálogos; por defecto 60000).
  - `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` (rate limit).
  - `PARTES_DATOS_WEBHOOK_URL` (webhook Make) + `PARTES_WEBHOOK_TIMEOUT_MS` (timeout opcional). Si falta la URL se simula y se loguea el payload.
  - El saneado económico está activado por defecto y no requiere configuración.
  - Frecuencias actuales (hardcode): SSE 5s; lista 30s. Se pueden parametrizar en el futuro si es necesario.

## Procedimientos
- Arranque local:
  - `.env` con `NOTION_TOKEN` válido.
  - `npm install`
  - `npm run build`
  - `npm run server` → `http://localhost:3001`
- Diagnóstico rápido:
  - `GET /api/health` → ok.
  - `GET /api/obras`/`empleados`/`jefes-obra` → datos (cacheados 60s).
  - `node scripts/test-notion-direct.js` (usa `.env`).
  - `POST /api/partes-trabajo/:id/enviar-datos` (curl) para verificar el webhook; revisar `server.live.log` para ver `page_id`/`property_id` enviados y respuesta de Make.

## Decisiones y Racional
- SPA + API desde Express: simplifica despliegue y evita CORS internos.
- Token Notion solo vía `.env` (sin hardcodes): seguridad y rotación fácil.
- Rate limiting conservador para proteger Notion y la API.
- Logging con request-id para trazabilidad; se omiten assets/health para reducir ruido.
- Cache de catálogos reduce latencia y presión a Notion.

## Backlog Técnico (Prioridad Alta → Media)
1) Validación robusta de payloads (Alta)
   - Introducir `zod`/`joi` para `POST/PUT` (tipos, formatos, arrays coherentes, fechas ISO).
2) Logs estructurados en producción (Alta)
   - `pino-http` activable por `NODE_ENV=production`, con redact de secretos y `request_id`.
3) Circuit breaker/backoff hacia Notion (Media)
   - Retries con backoff y corte temporal si hay fallos persistentes (429/5xx).
4) Cache ampliada y/o distribuida (Media)
   - TTL ajustable por endpoint; invalidaciones simples.
5) Tests de integración (Media)
   - `supertest` para `/api/*`; mock de Notion para CI.
6) Observabilidad (Media)
   - Métricas básicas (latencia por ruta, tasa de error) y alertas.

## Checklist de Revisión antes de Producción
- CORS cerrado con `ALLOWED_ORIGINS`.
- Rate limit sintonizado con tráfico real; considerar store Redis si hay varias instancias.
- Token rotado y BDs compartidas a la integración.
- Logs: retención/rotación en hosting o `pino` + agregador.
- Pruebas manuales de CRUD y límites de horas.

## Convenciones de Commit
- `feat(server): ...` para nuevas capacidades del servidor.
- `chore(security): ...` para cambios de configuración/secretos.
- `docs: ...` para documentación.

## Referencias de Código
- `server.js`: middlewares (helmet, compression, CORS, morgan, rate-limit, request-id), cache y endpoints.
- `src/services/notionService.js`: cliente frontend.
- `docs/CONFIGURACION_ENTORNO.md`: variables y rotación.

---
Última actualización: integración con webhook Make y botón de firma en partes “Listo para firmar”.
