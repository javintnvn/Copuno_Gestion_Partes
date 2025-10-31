# 📡 Instrucciones para Configurar DNS - partesobra.copuno.com

**Destinatario:** Administrador del dominio copuno.com
**Objetivo:** Configurar subdominio para la aplicación de gestión de partes
**Fecha:** 29 de Octubre de 2025

---

## 🎯 Resumen

Necesitamos que configures un **subdominio** en el dominio **copuno.com** para acceder a nuestra aplicación web de gestión de partes de trabajo.

**Subdominio solicitado:** `partesobra.copuno.com`

---

## 📋 Información que Necesito de Ti

Por favor, responde estas preguntas:

1. **¿Dónde está registrado el dominio copuno.com?**
   - [ ] GoDaddy
   - [ ] Cloudflare
   - [ ] Namecheap
   - [ ] Google Domains
   - [ ] Otro: _________________

2. **¿Tienes acceso al panel de administración DNS?**
   - [ ] Sí, tengo acceso completo
   - [ ] Sí, pero necesito instrucciones
   - [ ] No, necesito solicitar acceso

3. **¿Prefieres que te envíe instrucciones específicas o compartir acceso temporalmente?**
   - [ ] Envíame instrucciones paso a paso
   - [ ] Compartir acceso temporal (te enviaré credenciales de Vercel)
   - [ ] Puedo hacer una videollamada para hacerlo juntos

---

## 🔧 Configuración DNS Requerida

### Opción 1: Registro CNAME (⭐ RECOMENDADO)

```
Tipo:    CNAME
Nombre:  partesobra
Valor:   cname.vercel-dns.com
TTL:     3600 (o Auto)
```

**Resultado:** `partesobra.copuno.com` → `cname.vercel-dns.com`

### Opción 2: Registro A (Solo si CNAME no es posible)

```
Tipo:    A
Nombre:  partesobra
Valor:   76.76.21.21
TTL:     3600 (o Auto)
```

**Nota:** La IP puede cambiar. CNAME es preferible.

---

## 📸 Ejemplos Visuales por Proveedor

### Si usas Cloudflare:

1. Ir a: **DNS** → **Records**
2. Click en **"Add record"**
3. Completar:
   ```
   Type:         CNAME
   Name:         partesobra
   Target:       cname.vercel-dns.com
   Proxy status: DNS only (nube GRIS, no naranja)
   TTL:          Auto
   ```
4. Click en **"Save"**

### Si usas GoDaddy:

1. Ir a: **My Products** → **DNS**
2. Click en **"Add"** → **"CNAME"**
3. Completar:
   ```
   Host:      partesobra
   Points to: cname.vercel-dns.com
   TTL:       1 Hour
   ```
4. Click en **"Save"**

### Si usas Namecheap:

1. Ir a: **Domain List** → **Manage** → **Advanced DNS**
2. Click en **"Add New Record"**
3. Completar:
   ```
   Type:  CNAME Record
   Host:  partesobra
   Value: cname.vercel-dns.com
   TTL:   Automatic
   ```
4. Click en el **checkmark verde** (guardar)

### Si usas Google Domains:

1. Ir a: **DNS** → **Manage custom records**
2. Click en **"Create new record"**
3. Completar:
   ```
   Host name: partesobra
   Type:      CNAME
   TTL:       1H
   Data:      cname.vercel-dns.com
   ```
4. Click en **"Add"**

---

## ⏱️ Tiempo de Propagación

- **Mínimo:** 5-10 minutos
- **Típico:** 30 minutos
- **Máximo:** 24-48 horas (raro)

Durante este tiempo, el DNS se propagará por todo internet.

---

## ✅ Verificación

### Opción 1: Desde tu computadora (Mac/Windows)

**Mac/Linux:**
```bash
nslookup partesobra.copuno.com
```

**Windows (CMD o PowerShell):**
```cmd
nslookup partesobra.copuno.com
```

**Resultado esperado:**
```
partesobra.copuno.com
canonical name = cname.vercel-dns.com
```

### Opción 2: Online (Más fácil)

1. Ve a: https://dnschecker.org
2. Ingresa: `partesobra.copuno.com`
3. Selecciona: `CNAME`
4. Click en **"Search"**
5. Verifica que la mayoría de ubicaciones muestren: `cname.vercel-dns.com`

---

## 🔐 Seguridad (SSL/HTTPS)

**No necesitas hacer nada.**

Una vez que el DNS esté configurado, Vercel:
- ✅ Detectará el dominio automáticamente
- ✅ Generará un certificado SSL gratuito (Let's Encrypt)
- ✅ Configurará HTTPS automáticamente
- ✅ Redirectará HTTP → HTTPS

**Tiempo:** 5-15 minutos después de configurar DNS

---

## 📞 Contacto

Si tienes alguna duda o problema:

1. **Email:** [TU_EMAIL]
2. **Teléfono:** [TU_TELÉFONO]
3. **Alternativa:** Podemos hacer una videollamada rápida

---

## 🎯 Checklist para Ti

- [ ] Identificar proveedor de DNS de copuno.com
- [ ] Acceder al panel de administración DNS
- [ ] Crear registro CNAME:
  - [ ] Tipo: CNAME
  - [ ] Nombre: partesobra
  - [ ] Valor: cname.vercel-dns.com
- [ ] Guardar cambios
- [ ] Esperar 30 minutos
- [ ] Verificar en https://dnschecker.org
- [ ] Notificarme cuando esté listo

---

## 📧 Plantilla de Respuesta

Por favor, copia y completa esto cuando hayas terminado:

```
✅ Configuración DNS completada

Proveedor DNS: [Nombre del proveedor]
Fecha/Hora de configuración: [Fecha y hora]
Tipo de registro creado: CNAME
Estado: Guardado correctamente

Notas adicionales:
[Cualquier comentario o problema encontrado]
```

---

## ❓ Preguntas Frecuentes

### ¿Esto afectará el sitio web principal de copuno.com?
**No.** Solo estamos agregando un subdominio. El sitio principal en `www.copuno.com` o `copuno.com` no se verá afectado.

### ¿Puedo usar otro nombre en lugar de "partesobra"?
**Sí.** Si prefieres otro nombre, podemos usar:
- `partes.copuno.com`
- `gestion.copuno.com`
- `app.copuno.com`
- Otro que prefieras

Solo avísame antes de configurar el DNS.

### ¿Qué pasa si me equivoco en la configuración?
**No hay problema.** Puedes:
1. Borrar el registro y volver a crearlo
2. Editar el registro existente
3. Contactarme y te ayudo

### ¿Es seguro dar acceso a Vercel al DNS?
**No es necesario.** Con el método CNAME, solo apuntas el subdominio a Vercel. No necesitas darles acceso a tu cuenta de DNS.

---

## 🚀 ¿Qué Sigue?

Una vez que confirmes que el DNS está configurado:

1. Yo verificaré que todo funcione correctamente
2. Vercel configurará SSL automáticamente
3. La aplicación estará disponible en: **https://partesobra.copuno.com**
4. Te enviaré confirmación cuando esté todo listo

**Tiempo total estimado:** 1-2 horas (incluyendo propagación DNS)

---

**Gracias por tu ayuda! 🙏**

---

**Documento creado:** 29 de Octubre de 2025
**Versión:** 1.0
