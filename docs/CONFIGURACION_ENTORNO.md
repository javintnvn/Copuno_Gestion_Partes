# Configuración de Entorno

Este proyecto usa variables de entorno para credenciales y ajustes de runtime. El servidor carga automáticamente un archivo `.env` en el directorio raíz (dotenv).

## Variables requeridas

- `NOTION_TOKEN`: Token de integración interna de Notion con acceso a las BDs usadas por la app. No lo publiques ni lo subas a Git.

## Variables opcionales

- `PORT`: Puerto de escucha del servidor (por defecto `3001`).
- `ALLOWED_ORIGINS`: Lista separada por comas de orígenes permitidos para CORS (p. ej. `https://tudominio.com,https://app.tudominio.com`). Si no se define, en desarrollo se permite cualquier origen.
- `USE_MOCK_DATA`: Activa el modo mock (valores `true/false`). Si es `true` o no hay `NOTION_TOKEN`, el backend usa datos locales y NO llama a Notion.
- `PARTES_DATOS_WEBHOOK_URL`: URL a la que se enviarán los datos de un parte cuando se pulse "Enviar Datos".
- `PARTES_WEBHOOK_TIMEOUT_MS`: Tiempo máximo de espera (ms) para el webhook (por defecto `10000`).
- `RATE_LIMIT_WINDOW_MS`: Ventana de rate limit en milisegundos (por defecto `900000`, 15 min).
- `RATE_LIMIT_MAX`: Máximo de peticiones por IP en cada ventana (por defecto `100`).

## Pasos para configurar

1) Crea una integración interna en Notion (Settings → Integrations → New integration) y copia el token.
2) Comparte cada base de datos con la integración (Share → Invite → tu integración → Can edit).
3) Crea un archivo `.env` en la raíz del proyecto con el contenido:

```
NOTION_TOKEN=YOUR_NOTION_TOKEN
PORT=3001
# ALLOWED_ORIGINS=https://tudominio.com,https://app.tudominio.com
```

## Rotación de tokens

Si un token se ha expuesto o quieres rotarlo:
- Genera un nuevo token en Notion.
- Actualiza `.env` con el nuevo valor.
- Revoca/borra el token antiguo en Notion.
- Reinicia el servidor.

## Buenas prácticas

- Nunca publiques el token en commits, issues o documentación pública.
- Mantén `.env` fuera del control de versiones (ya está incluido en `.gitignore`).
- Usa `ALLOWED_ORIGINS` en producción para restringir CORS.
