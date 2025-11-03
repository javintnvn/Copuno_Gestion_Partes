# Quick Start - Despliegue en Vercel

Guía rápida para desplegar la aplicación en Vercel en menos de 5 minutos.

## Paso 1: Preparar Variables de Entorno

Antes de desplegar, tener a mano:

- **NOTION_TOKEN**: Tu token de integración de Notion
- **PARTES_DATOS_WEBHOOK_URL**: URL del webhook de Make.com

## Paso 2: Desplegar desde GitHub

### A. Conectar Repositorio

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Conectar con GitHub
3. Seleccionar el repositorio `copuno-gestion-partes`
4. Click en **Import**

### B. Configurar Proyecto

Vercel detectará automáticamente:
- Framework: **Vite**
- Build Command: `npm run vercel-build`
- Output Directory: `dist`
- Install Command: `npm install`

**No cambiar nada**, solo click en **Continue**

### C. Configurar Variables de Entorno

Añadir estas variables (hacer click en "Add" para cada una):

```
NOTION_TOKEN = ntn_XXXXXXXXXX
PARTES_DATOS_WEBHOOK_URL = https://hook.eu2.make.com/XXXXXXXXXX
NODE_ENV = production
CACHE_TTL_MS = 5000
PARTES_WEBHOOK_TIMEOUT_MS = 10000
```

Marcar todas como **Production**, **Preview** y **Development**

### D. Deploy

Click en **Deploy** y esperar 2-3 minutos.

## Paso 3: Verificar Despliegue

Cuando termine, Vercel mostrará una URL: `https://copuno-gestion-partes-xxx.vercel.app`

### Tests Rápidos:

1. **Abrir la URL** - Debería cargar la aplicación
2. **Test de API**:
   ```bash
   curl https://tu-app.vercel.app/api/health
   ```
   Debería retornar: `{"status":"ok","mode":"production"}`

3. **Crear un parte de prueba** - Verificar que funciona end-to-end

## Paso 4: Configurar Dominio Personalizado (Opcional)

### A. En Vercel:
1. Ir a **Settings** → **Domains**
2. Añadir: `gestionpartes.copuno.com`
3. Vercel mostrará los registros DNS

### B. Configurar DNS:

Proporcionar al administrador del dominio:

```
Type: CNAME
Name: gestionpartes
Value: cname.vercel-dns.com
```

### C. Actualizar CORS:

En **Settings** → **Environment Variables**, añadir:
```
ALLOWED_ORIGINS = https://gestionpartes.copuno.com
```

Re-desplegar:
```bash
vercel --prod
```

## Despliegues Automáticos

Vercel desplegará automáticamente:
- **Push a main** → Producción
- **Push a otras ramas** → Preview deployment
- **Pull Requests** → Preview deployment con URL única

## Comandos CLI Útiles

```bash
# Instalar CLI
npm install -g vercel

# Login
vercel login

# Desplegar
vercel --prod

# Ver logs
vercel logs --follow

# Ver variables de entorno
vercel env ls
```

## Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| Build falla | Verificar que `npm run build` funciona localmente |
| API 500 | Verificar variables de entorno en Vercel Dashboard |
| CORS error | Añadir dominio a `ALLOWED_ORIGINS` |
| 404 en assets | Verificar que `vercel.json` está en la raíz |

## Documentación Completa

Para instrucciones detalladas, ver: [docs/DESPLIEGUE_VERCEL.md](docs/DESPLIEGUE_VERCEL.md)

---

**¿Necesitas ayuda?** Revisa los logs en Vercel Dashboard → Deployments → View Logs
