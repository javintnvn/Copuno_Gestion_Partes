# 🛠️ COMANDOS ÚTILES - DESARROLLO

**Proyecto:** Copuno - Gestión de Partes
**Versión:** 1.3.0
**Última actualización:** $(date)

---

## 🚀 **COMANDOS BÁSICOS**

### **📦 Gestión de Dependencias**
```bash
# Instalar dependencias
npm install

# Actualizar dependencias
npm update

# Ver dependencias obsoletas
npm outdated

# Limpiar cache de npm
npm cache clean --force
```

### **🔧 Desarrollo**
```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview

# Iniciar servidor de producción
npm run server
```

### **🧪 Testing**
```bash
# Ejecutar tests (cuando se implementen)
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ver cobertura de tests
npm run test:coverage
```

---

## 🔍 **DEBUGGING Y MONITOREO**

### **📊 Health Check**
```bash
# Verificar estado del servidor
curl http://localhost:3001/api/health

# Verificar con formato JSON
curl -H "Accept: application/json" http://localhost:3001/api/health

# Verificar solo el status
curl -s http://localhost:3001/api/health | jq '.status'
```

### **🔍 Logs del Servidor**
```bash
# Ver logs en tiempo real
tail -f logs/server.log

# Ver últimos 50 logs
tail -50 logs/server.log

# Buscar errores en logs
grep "ERROR" logs/server.log

# Buscar logs de una fecha específica
grep "2024-01-15" logs/server.log
```

### **🌐 Testing de Endpoints**
```bash
# Listar todas las obras
curl http://localhost:3001/api/obras

# Listar todos los empleados
curl http://localhost:3001/api/empleados

# Listar todos los partes
curl http://localhost:3001/api/partes-trabajo

# Crear un parte de prueba
curl -X POST http://localhost:3001/api/partes-trabajo \
  -H "Content-Type: application/json" \
  -d '{
    "obraId": "test-obra-id",
    "fecha": "2024-01-15",
    "personaAutorizadaId": "test-persona-id",
    "notas": "Parte de prueba",
    "empleados": ["emp1", "emp2"],
    "empleadosHoras": {"emp1": 8, "emp2": 6}
  }'

# Obtener detalles de un parte
curl http://localhost:3001/api/partes-trabajo/PARTE_ID/detalles

# Actualizar un parte
curl -X PUT http://localhost:3001/api/partes-trabajo/PARTE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "obraId": "nueva-obra-id",
    "fecha": "2024-01-16",
    "personaAutorizadaId": "nueva-persona-id",
    "notas": "Parte actualizado",
    "empleados": ["emp1", "emp3"],
    "empleadosHoras": {"emp1": 7, "emp3": 8}
  }'
```

---

## 🗄️ **GESTIÓN DE BASE DE DATOS**

### **🔗 Notion API**
```bash
# Explorar bases de datos de Notion
npm run explore

# Test de conectividad con Notion
node scripts/test-notion-direct.js

# Verificar token de Notion
node -e "console.log(process.env.NOTION_TOKEN ? 'Token configurado' : 'Token no configurado')"
```

### **📊 Consultas de Datos**
```bash
# Obtener estadísticas de datos
curl http://localhost:3001/api/obras | jq 'length'
curl http://localhost:3001/api/empleados | jq 'length'
curl http://localhost:3001/api/partes-trabajo | jq 'length'

# Buscar partes por obra
curl "http://localhost:3001/api/partes-trabajo?obra=OBRA_ID"

# Buscar partes por fecha
curl "http://localhost:3001/api/partes-trabajo?fecha=2024-01-15"
```

---

## 🐛 **DEBUGGING AVANZADO**

### **🔍 Debug del Frontend**
```javascript
// En la consola del navegador
// Ver datos cargados
console.log('Datos:', window.datos);

// Ver estado de la aplicación
console.log('Estado:', window.appState);

// Ver errores de red
window.addEventListener('error', console.error);

// Debug de localStorage
console.log('localStorage:', localStorage);
```

### **🔍 Debug del Backend**
```bash
# Iniciar servidor en modo debug
DEBUG=* npm run server

# Ver variables de entorno
node -e "console.log(process.env)"

# Ver configuración del servidor
node -e "console.log(require('./server.js'))"
```

### **📊 Performance**
```bash
# Ver uso de memoria del proceso
ps aux | grep node

# Ver puertos en uso
lsof -i :3001

# Ver logs de performance
node --prof server.js
```

---

## 🚀 **DESPLIEGUE**

### **🔧 Preparación**
```bash
# Construir para producción
npm run build

# Verificar archivos de build
ls -la dist/

# Verificar tamaño del build
du -sh dist/

# Verificar dependencias de producción
npm list --prod
```

### **🌐 Despliegue Local**
```bash
# Iniciar servidor de producción
npm run server

# Verificar que el servidor está corriendo
curl http://localhost:3001/api/health

# Verificar que el frontend responde
curl http://localhost:3001/
```

### **☁️ Despliegue en la Nube**

#### **Vercel**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Desplegar a producción
vercel --prod
```

#### **Netlify**
```bash
# Construir proyecto
npm run build

# Desplegar (drag & drop de la carpeta dist/)
```

#### **Heroku**
```bash
# Instalar Heroku CLI
# Crear app en Heroku
heroku create copuno-gestion-partes

# Configurar variables de entorno
heroku config:set NOTION_TOKEN=tu_token

# Desplegar
git push heroku master
```

---

## 🔧 **MANTENIMIENTO**

### **🧹 Limpieza**
```bash
# Limpiar node_modules
rm -rf node_modules
npm install

# Limpiar cache de npm
npm cache clean --force

# Limpiar logs antiguos
find logs/ -name "*.log" -mtime +30 -delete
```

### **📦 Actualizaciones**
```bash
# Verificar dependencias obsoletas
npm outdated

# Actualizar dependencias menores
npm update

# Actualizar dependencias mayores (cuidado)
npm install package@latest

# Verificar vulnerabilidades
npm audit
npm audit fix
```

### **🔍 Monitoreo**
```bash
# Ver procesos de Node.js
ps aux | grep node

# Ver uso de memoria
free -h

# Ver uso de disco
df -h

# Ver logs del sistema
journalctl -u copuno.service -f
```

---

## 🐙 **GIT Y CONTROL DE VERSIONES**

### **📝 Comandos Básicos**
```bash
# Ver estado del repositorio
git status

# Ver historial de commits
git log --oneline -10

# Ver cambios en un archivo
git diff src/App.jsx

# Ver cambios staged
git diff --cached
```

### **🌿 Gestión de Ramas**
```bash
# Ver ramas
git branch -a

# Crear nueva rama
git checkout -b feature/nueva-funcionalidad

# Cambiar a rama
git checkout main

# Merge de rama
git merge feature/nueva-funcionalidad

# Eliminar rama
git branch -d feature/nueva-funcionalidad
```

### **📤 Push y Pull**
```bash
# Subir cambios
git add .
git commit -m "feat: Nueva funcionalidad"
git push origin main

# Bajar cambios
git pull origin main

# Ver diferencias con remoto
git fetch
git diff main origin/main
```

### **🔧 Configuración**
```bash
# Configurar usuario
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Ver configuración
git config --list

# Configurar editor
git config --global core.editor "code --wait"
```

---

## 🧪 **TESTING Y CALIDAD**

### **🔍 Testing Manual**
```bash
# Test de conectividad
curl http://localhost:3001/api/health

# Test de creación de parte
curl -X POST http://localhost:3001/api/partes-trabajo \
  -H "Content-Type: application/json" \
  -d @test-data.json

# Test de actualización
curl -X PUT http://localhost:3001/api/partes-trabajo/TEST_ID \
  -H "Content-Type: application/json" \
  -d @update-data.json
```

### **📊 Métricas de Calidad**
```bash
# Verificar sintaxis de JavaScript
npx eslint src/

# Verificar formato de código
npx prettier --check src/

# Verificar tipos (si se implementa TypeScript)
npx tsc --noEmit

# Verificar vulnerabilidades
npm audit
```

---

## 🚨 **TROUBLESHOOTING**

### **🔧 Problemas Comunes**

#### **Servidor no inicia**
```bash
# Verificar puerto
lsof -i :3001

# Matar proceso si está ocupado
kill -9 $(lsof -t -i:3001)

# Verificar variables de entorno
echo $NOTION_TOKEN
```

#### **Errores de conectividad**
```bash
# Verificar conectividad con Notion
node scripts/test-notion-direct.js

# Verificar token
node -e "console.log(process.env.NOTION_TOKEN ? 'OK' : 'ERROR')"

# Verificar DNS
nslookup api.notion.com
```

#### **Errores de build**
```bash
# Limpiar cache
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Verificar versiones de Node
node --version
npm --version
```

---

## 📚 **RECURSOS ÚTILES**

### **🔗 Enlaces Importantes**
- **Repositorio:** https://github.com/javintnvn/Copuno_Gestion_Partes
- **Notion API:** https://developers.notion.com/
- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/
- **Express Docs:** https://expressjs.com/

### **📖 Documentación del Proyecto**
- **README.md:** Documentación principal
- **docs/ESTADO_ACTUAL_V1.3.0.md:** Estado actual detallado
- **docs/ROADMAP_FUTURAS_VERSIONES.md:** Planificación futura
- **docs/notion-schema-detailed.md:** Esquema de base de datos

### **🛠️ Herramientas Recomendadas**
- **Postman:** Testing de APIs
- **Insomnia:** Cliente REST alternativo
- **Chrome DevTools:** Debugging del frontend
- **VS Code:** Editor recomendado
- **GitKraken:** Cliente Git visual

---

## 📞 **SOPORTE**

**Para problemas técnicos:**
1. Revisar logs del servidor
2. Verificar conectividad con Notion
3. Probar endpoints individualmente
4. Revisar documentación del proyecto
5. Crear issue en GitHub

**Contacto:**
- **GitHub:** https://github.com/javintnvn
- **Email:** (proporcionar si está disponible)

---

⭐ **¡Estos comandos te ayudarán a desarrollar y mantener el proyecto eficientemente!**
