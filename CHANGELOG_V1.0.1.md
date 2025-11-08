# 📋 Changelog - Versión 1.0.1

**Fecha de Release**: 8 de noviembre de 2025  
**Tipo**: Patch Release (Ajustes visuales y UX)  
**Estado**: ✅ Deploy listo

---

## 🎯 Resumen de Cambios

Versión enfocada en pulir la experiencia visual y los mensajes del flujo de gestión de partes. Se estandariza la forma en la que se muestran las horas, se simplifican mensajes en la lista, se moderniza la paleta de estados y se mejora la claridad de los avisos de éxito/error al enviar partes.

---

## ✨ Ajustes Principales

1. **Formateo y Responsive de Horas**  
   - Nuevo helper `formatearHorasTexto` para evitar la doble `h` y limpiar textos provenientes de Notion.  
   - Etiquetas de horas dentro de `.info-item` ahora hacen wrap cuando el espacio es reducido.

2. **Mensajería Clara en Envíos**  
   - Mensaje de éxito actualizado a “Datos del parte enviados a generar el documento correctamente”.  
   - Errores de rate limit al obtener obras muestran “Error en obtener obras” evitando detalles innecesarios.

3. **Tarjetas sin ruido innecesario**  
   - Cuando los filtros no devuelven resultados solo se muestra el mensaje principal (sin listar obras/fechas).

4. **Badges de Estado Modernizados**  
   - Cada estado tiene color dedicado (Firmado en verde, Borrador en gris, Datos Enviados en naranja, etc.) para identificar rápidamente el estado del parte.

5. **Mantenimiento**  
   - Bump de versión a `1.0.1` en package.json, package-lock, App y documentación.

---

## 🔧 Cambios Técnicos Destacados

| Archivo | Descripción |
| --- | --- |
| `src/App.jsx` | Nuevo helper de horas, mensajes actualizados al enviar datos, limpieza del mensaje sin resultados y versión de la app. |
| `src/App.css` | Reglas responsive para `.info-item` y nueva paleta de colores por estado (incluye naranja para “Datos Enviados”). |
| `src/services/notionService.js` | Manejo específico del estatus 429 al consultar obras. |
| `README.md`, `docs/GUIA_DESPLIEGUE.md` | Actualización de versión/fecha y sección del release 1.0.1. |
| `package.json`, `package-lock.json` | Versión del proyecto fijada en `1.0.1`. |

---

## ✅ Próximos Pasos

- Validar despliegue en Vercel tras el push a `master`.  
- Verificar que las hojas de estilo mantengan contraste AA para todos los badges.  
- Documentar próximos cambios en `CHANGELOG_V1.0.2.md` cuando se planifiquen nuevas features.

