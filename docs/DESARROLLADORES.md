# Guía para Desarrolladores

## Visión General
- Frontend: React + Vite (`src/`), SPA servida por Express en producción.
- Backend: Node.js + Express (`server.js`), integra con Notion API.
- Scripts utilitarios: `scripts/` para explorar y probar Notion (cargan `.env`).

## Requisitos
- Node.js 18+ recomendado (funciona en versiones superiores).
- npm 9+.
- Token de integración interna de Notion (ver `docs/CONFIGURACION_ENTORNO.md`).

## Puesta en Marcha
- Instalar dependencias: `npm install`.
- Crear `.env` con al menos `NOTION_TOKEN`.
- Modo desarrollo (frontend con proxy): `npm run dev` (Vite en 5173, proxy a 3001).
- Producción local (SPA + API):
  - `npm run build`
  - `npm run server`
  - Abrir `http://localhost:3001`.

## Estructura
- `src/App.jsx`: interfaz principal y lógica de UI (crear/consultar/editar partes).
- `src/services/notionService.js`: cliente Axios hacia `/api/*`.
- `server.js`: API Express, middlewares y rutas.
- `docs/`: documentación de proyecto (estado, entorno, operaciones, API, etc.).

## Backend: Middlewares y Políticas
- Variables de entorno: `dotenv` (requiere `NOTION_TOKEN`).
- Seguridad: `helmet` (headers), `compression` (gzip), CORS configurable con `ALLOWED_ORIGINS`.
- Observabilidad: `morgan` (access logs) con `x-request-id` por petición.
- Rate limiting: `express-rate-limit` (por IP), configurable con `RATE_LIMIT_*`.
- Cache: memoria (TTL) para catálogos (`/api/obras`, `/api/jefes-obra`, `/api/empleados`), `CACHE_TTL_MS`.
- Saneado económico: eliminación/redacción de claves/valores económicos en todas las respuestas `/api/*` (excepto health).
- Sincronización de estado: endpoints `/api/partes-trabajo/:id/estado` y stream `/api/partes-trabajo/:id/estado/stream` (SSE cada 5s, backoff hasta 30s). El frontend pausa SSE y polling si la pestaña está oculta o durante edición.

## Integración Notion
- Se usa Axios contra `https://api.notion.com/v1` con el token de integración.
- IDs de BD están en `server.js` (const `DATABASES`). Ajustar solo si cambia el esquema en Notion.
- Compartir las BDs con la integración desde Notion (Share → Invite → Can edit).

## Flujo de Trabajo típico
- Añadir endpoint: crear ruta en `server.js`, usar `makeNotionRequest` y respetar políticas (cache, límites, saneado).
- Consumir endpoint: añadir función en `src/services/notionService.js` y usar en UI.
- Validación: mantener rangos/estados (p. ej., edición prohibida por estados no editables).
- Sincronización: usar SSE para detalles y polling para la lista; pausar/resumir según visibilidad/edición.

## Convenciones
- Commits: estilo Conventional Commits (feat, fix, chore, docs, refactor...).
- Ramas: `feature/...`, `fix/...`, PRs con descripción concisa.
- Estilo: mantener patrones existentes (sin introducir frameworks innecesarios).

## Testing y Debug
- Manual: `GET /api/health`, `GET /api/obras`, `GET /api/partes-trabajo`.
- Scripts Notion: `node scripts/test-notion-direct.js` (usa `.env`).
- Observa logs: `morgan` en consola; `x-request-id` para correlación.

## Checklist antes de subir
- Sin secretos en código o docs.
- UI: no mostrar datos económicos.
- API: sin campos económicos; sanitización activa.
- `README.md`, `docs/*` actualizados si hay cambios de comportamiento.
- Revisión de sincronización: SSE funciona en detalles; lista refresca y se pausa en background.
