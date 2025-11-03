# 📋 Changelog – Versión 1.0.0 (MVP)

**Fecha de Release:** 3 de noviembre de 2025  
**Tipo:** Major Release (MVP listo para producción)  
**Estado:** ✅ Desplegable en Vercel

---

## 🎯 Resumen Ejecutivo
La versión 1.0.0 marca el lanzamiento oficial del MVP de Copuno – Gestión de Partes.  
El proyecto queda listo para despliegue en Vercel con integración completa a Notion, sincronización inteligente y una interfaz diseñada para operación diaria en campo.

---

## ✨ Nuevas Funcionalidades Clave

### 1. Gestión Integral de Partes
- Creación, edición y consulta de partes vinculados a Notion.
- Formulario asistido con validaciones de horas, estado y asignación de empleados.
- Resumen automático de horas agrupado por categoría de empleado.

### 2. Sincronización Inteligente
- **Smart Polling adaptativo** (modos Rápido, Normal y Lento) con indicadores visuales.
- SSE para actualización del estado del parte en tiempo casi real.
- Cache ajustable (`CACHE_TTL_MS`) para controlar peticiones a la API de Notion.

### 3. Gestión de Empleados y Estados
- Carga dinámica de empleados por obra y control de horas asignadas.
- Actualización de estado individual de empleados con feed visual y colorimetría.
- Indicadores de permisos según estado del parte (Borrador, Firmado, Datos Enviados, etc).

### 4. UI/UX Corporativa
- Nueva paleta de colores Copuno y gradientes diferenciados por acción.
- Footer con versión y fecha de lanzamiento.
- Componentes responsive y accesibles, listos para operar en desktop y tablet.

---

## 🔧 Cambios Técnicos
- `React + Vite` como base del frontend, `Express` como capa SSR/API.
- `server.js` preparado para despliegue serverless en Vercel con rutas `/api/*`.
- Scripts unificados para build (`npm run build`) y ejecución (`npm run server`).
- Configuración de entornos documentada (`docs/CONFIGURACION_ENTORNO.md`).

---

## 📦 Despliegue
- **Objetivo principal:** Vercel (via `vercel.json`).
- Build estático en `dist/` + funciones serverless para API y SSE.
- Documentación de despliegue actualizada en `docs/GUIA_DESPLIEGUE.md`.

---

## 📚 Documentación Actualizada
- `README.md` – Resumen del MVP y pasos rápidos.
- `docs/ESTADO_ACTUAL_V1.0.0.md` – Panorama funcional y técnico.
- `docs/PLAN_TESTING.md` – Plan de pruebas manuales para 1.0.0.
- `docs/ROADMAP_FUTURAS_VERSIONES.md` – Próximos hitos a partir de la 1.0.

---

## ✅ Checklist de Release
- [x] Integración con Notion en vivo
- [x] Smart Polling y SSE operativos
- [x] Validaciones de creación/edición de partes
- [x] Documentación lista (configuración, despliegue, testing)
- [x] Build Vercel-ready (`npm run build`)

---

**¡Copuno 1.0.0 está listo para producción!**
