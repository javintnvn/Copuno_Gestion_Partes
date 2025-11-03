# Checklist de Seguridad para Producción

Este documento lista todas las medidas de seguridad implementadas y los pasos de validación antes del despliegue.

## ✅ Variables de Entorno Protegidas

- [x] Archivo `.env` está en `.gitignore`
- [x] Token de Notion NO está hardcodeado en el código
- [x] Webhook URL NO está hardcodeado en el código
- [x] Todas las credenciales se cargan desde variables de entorno
- [x] Archivo `.env.example` NO contiene valores reales
- [x] Variables de entorno documentadas en `docs/CONFIGURACION_ENTORNO.md`

## ✅ Archivos Sensibles Excluidos

Verificar que estos archivos/directorios están en `.gitignore`:

- [x] `.env`
- [x] `.env.local`
- [x] `.env.*.local`
- [x] `node_modules/`
- [x] `*.log`
- [x] `.DS_Store`

Verificar que estos archivos NO están en el repositorio:
```bash
git status
# No debe aparecer .env ni archivos con credenciales
```

## ✅ Configuración de Vercel

### Variables de Entorno en Vercel Dashboard

Verificar que están configuradas:

- [x] `NOTION_TOKEN` - Token de Notion
- [x] `PARTES_DATOS_WEBHOOK_URL` - URL del webhook
- [x] `NODE_ENV` = `production`
- [x] `CACHE_TTL_MS` = `5000`
- [x] `ALLOWED_ORIGINS` - Dominios permitidos (para dominio personalizado)

### Archivos de Configuración

- [x] `vercel.json` presente en la raíz
- [x] `.vercelignore` excluye archivos sensibles
- [x] `package.json` tiene script `vercel-build`
- [x] Build funciona correctamente: `npm run build`

## ✅ Headers de Seguridad (Helmet.js)

El servidor incluye los siguientes headers de seguridad automáticamente:

- [x] `X-Content-Type-Options: nosniff`
- [x] `X-Frame-Options: SAMEORIGIN`
- [x] `X-XSS-Protection: 1; mode=block`
- [x] `Strict-Transport-Security` (HSTS)
- [x] `Content-Security-Policy` (configurado por Helmet)

Verificar:
```bash
curl -I https://tu-app.vercel.app | grep -E "(X-Frame-Options|X-Content-Type-Options)"
```

## ✅ CORS Configurado

- [x] CORS permite cualquier origen en desarrollo (cuando `ALLOWED_ORIGINS` no está definido)
- [x] CORS restringido en producción (usando `ALLOWED_ORIGINS`)
- [x] Variable `ALLOWED_ORIGINS` configurada para dominio personalizado

Verificar CORS:
```bash
# Debe fallar si ALLOWED_ORIGINS está configurado
curl -H "Origin: https://malicious-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://tu-app.vercel.app/api/partes
```

## ✅ Rate Limiting

- [x] Rate limiting activo en `/api/*`
- [x] Límite por defecto: 100 peticiones/15 minutos
- [x] Configurable vía `RATE_LIMIT_WINDOW_MS` y `RATE_LIMIT_MAX`
- [x] Health endpoint excluido del rate limiting

Verificar:
```bash
# Hacer 101+ peticiones rápidas
for i in {1..101}; do curl https://tu-app.vercel.app/api/health; done
# La petición 101 debe retornar 429
```

## ✅ HTTPS/SSL

- [x] Vercel proporciona HTTPS automático
- [x] Certificados SSL de Let's Encrypt
- [x] Redirección HTTP → HTTPS automática

Verificar:
```bash
curl -I https://tu-app.vercel.app | grep "HTTP/2"
# Debe retornar HTTP/2 200
```

## ✅ Protección del Frontend

- [x] Sourcemaps desactivados en producción (`vite.config.js`)
- [x] `console.log` eliminado en producción (terser)
- [x] Código minificado
- [x] Code splitting implementado
- [x] Assets con caché optimizada (1 año)

Verificar:
```bash
# Verificar que no hay sourcemaps
curl https://tu-app.vercel.app/assets/*.js | grep -i "sourceMappingURL"
# No debe retornar nada
```

## ✅ Protección del Backend

- [x] Token de Notion validado al inicio
- [x] Modo mock si no hay token (previene crashes)
- [x] Timeouts configurados para webhooks
- [x] Request ID para trazabilidad
- [x] Morgan para logging (excluye assets estáticos)
- [x] Compression activado

## ✅ Validación de Datos

- [x] Validación de entrada en endpoints críticos
- [x] Manejo de errores robusto
- [x] No se exponen stack traces en producción
- [x] Errores logueados con Request ID

## ✅ Dependencias

Verificar vulnerabilidades:
```bash
npm audit
# Resolver vulnerabilidades críticas antes de desplegar
```

Actualizar dependencias:
```bash
npm outdated
npm update
```

## ✅ Tests Pre-Despliegue

### 1. Build Local
```bash
npm run build
# Debe completar sin errores
```

### 2. Test del Servidor
```bash
npm run server
# Verificar en http://localhost:3001
```

### 3. Test de API
```bash
curl http://localhost:3001/api/health
# Debe retornar: {"status":"ok"}
```

### 4. Test de Notion
```bash
curl http://localhost:3001/api/obras
# Debe retornar lista de obras
```

## ✅ Post-Despliegue en Vercel

### Funcionalidad Básica

- [ ] URL pública accesible
- [ ] Frontend carga correctamente
- [ ] Assets (CSS, JS, imágenes) se cargan
- [ ] API responde: `/api/health`
- [ ] Conexión con Notion funciona
- [ ] Webhook funciona (exportar parte)

### Seguridad

- [ ] HTTPS activo
- [ ] Headers de seguridad presentes
- [ ] CORS configurado correctamente
- [ ] Rate limiting funciona
- [ ] No hay errores en logs de Vercel

### Performance

- [ ] Lighthouse Score > 90
- [ ] Tiempo de carga < 3s
- [ ] API responde < 500ms
- [ ] Caché funciona correctamente

## ✅ Configuración de Dominio Personalizado

Cuando se configure `gestionpartes.copuno.com`:

- [ ] DNS configurado (CNAME: `cname.vercel-dns.com`)
- [ ] Dominio verificado en Vercel
- [ ] `ALLOWED_ORIGINS` actualizado con el nuevo dominio
- [ ] Certificado SSL activo para el dominio
- [ ] Re-desplegado después de añadir dominio

## 🔴 Red Flags - NO Desplegar Si

- ❌ Hay archivos `.env` en el repositorio
- ❌ Credenciales hardcodeadas en el código
- ❌ Build falla localmente
- ❌ npm audit muestra vulnerabilidades críticas
- ❌ Tests locales fallan
- ❌ Variables de entorno no configuradas en Vercel

## 📋 Checklist de Rotación de Credenciales

Si es necesario rotar el token de Notion:

1. [ ] Generar nuevo token en Notion
2. [ ] Actualizar `NOTION_TOKEN` en Vercel Dashboard
3. [ ] Re-desplegar: `vercel --prod`
4. [ ] Verificar que funciona con nuevo token
5. [ ] Revocar token antiguo en Notion
6. [ ] Documentar la rotación con fecha

## 📚 Recursos

- [Vercel Security](https://vercel.com/docs/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js](https://helmetjs.github.io/)
- [Notion API Security](https://developers.notion.com/docs/authorization)

---

**Última revisión**: 2025-01-03
**Responsable**: Equipo de desarrollo
**Próxima revisión**: Mensual o ante cambios significativos
