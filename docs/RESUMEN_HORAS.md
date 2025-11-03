# 📊 Resumen de Horas por Categoría

## Descripción

La funcionalidad de **Resumen de Horas** proporciona una vista consolidada de las horas trabajadas agrupadas por categoría laboral en cada parte de trabajo.

## Ubicación

El resumen se muestra en la **vista de detalles del parte**, ubicado entre la información general del parte y la lista de empleados asignados.

## Estructura Visual

```
┌─────────────────────────────────────────┐
│      📊 RESUMEN DE HORAS                │
├─────────────────────────────────────────┤
│ Horas de Oficial 1ª: 8                  │
│ Horas de Oficial 2ª: 0                  │
│ Horas de Oficial: 0                     │
│ Horas de Encargado: 0                   │
│ Horas de Capataz: 0                     │
│ Horas de Peón: 0                        │
├─────────────────────────────────────────┤
│ 💜 Horas totales: 8                     │
└─────────────────────────────────────────┘
```

## Categorías Soportadas

El sistema agrupa automáticamente las horas en las siguientes categorías:

1. **Oficial 1ª** - Primera categoría de oficial
2. **Oficial 2ª** - Segunda categoría de oficial
3. **Oficial** - Categoría general de oficial
4. **Encargado** - Personal de supervisión
5. **Capataz** - Jefe de cuadrilla
6. **Peón** - Categoría base

## Cálculo Automático

### Normalización de Categorías

El sistema normaliza automáticamente las variantes de nombres de categorías:

```javascript
// Ejemplos de normalización:
"08- OF. 2ª ALBAÑIL"      → Oficial 2ª
"Oficial de 1ª"           → Oficial 1ª
"PEON ESPECIALISTA"       → Peón
"Encargado de obra"       → Encargado
```

### Lógica de Agrupación

```javascript
if (categoria.includes('oficial 1') || categoria.includes('of. 1'))
  → Oficial 1ª

if (categoria.includes('oficial 2') || categoria.includes('of. 2'))
  → Oficial 2ª

if (categoria.includes('oficial'))
  → Oficial

if (categoria.includes('encargado'))
  → Encargado

if (categoria.includes('capataz'))
  → Capataz

if (categoria.includes('pe') && categoria.includes('n'))
  → Peón
```

## Características

### ✅ Funcionalidades

- **Cálculo automático** de sumatorios por categoría
- **Normalización inteligente** de nombres de categorías
- **Total destacado** visualmente con gradiente
- **Grid responsive** que se adapta a pantallas móviles
- **Solo horas** - Sin información económica

### 🎨 Diseño

- **Colores semánticos**: Azul para categorías, púrpura para total
- **Tipografía escalada**: Labels pequeños, valores destacados
- **Sombras suaves**: Profundidad visual
- **Animaciones**: Transiciones suaves

### 📱 Responsive

```css
/* Desktop: 3 columnas */
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));

/* Tablet: 2 columnas */
/* Mobile: 1 columna */
```

## Casos de Uso

### 1. Verificación antes de Enviar

El usuario puede verificar rápidamente si las horas están correctas antes de enviar el parte a Notion:

```
✅ Total esperado: 16 horas
✅ Total calculado: 16 horas
→ Datos correctos, proceder con envío
```

### 2. Detección de Errores

Si hay discrepancias, el usuario puede identificarlas fácilmente:

```
❌ Total esperado: 16 horas
❌ Total calculado: 12 horas
→ Faltan 4 horas, revisar empleados
```

### 3. Planificación de Recursos

Ayuda a identificar la composición de la cuadrilla:

```
2 Oficiales 1ª → 16 horas
1 Peón        → 8 horas
Total: 24 horas
```

## Implementación Técnica

### Función de Cálculo

```javascript
const calcularSumatoriosHoras = (detalles) => {
  const categorias = {
    'Oficial 1ª': 0,
    'Oficial 2ª': 0,
    'Oficial': 0,
    'Encargado': 0,
    'Capataz': 0,
    'Peón': 0
  }

  detalles.forEach(detalle => {
    const horas = detalle.horas || 0
    const categoria = detalle.categoria || ''

    // Lógica de normalización y agrupación
    // ...
  })

  const total = Object.values(categorias)
    .reduce((sum, horas) => sum + horas, 0)

  return { categorias, total }
}
```

### Componente React

```jsx
{!loadingDetalles && detallesEmpleados.length > 0 && (() => {
  const { categorias, total } = calcularSumatoriosHoras(detallesEmpleados)
  return (
    <div className="resumen-horas-section">
      <h3>Resumen de Horas</h3>
      <div className="resumen-horas-grid">
        {Object.entries(categorias).map(([categoria, horas]) => (
          <div key={categoria} className="resumen-horas-item">
            <span className="resumen-horas">
              Horas de {categoria}: {horas}
            </span>
          </div>
        ))}
      </div>
      <div className="resumen-total">
        <span className="total-horas">Horas totales: {total}</span>
      </div>
    </div>
  )
})()}
```

### Estilos CSS

Los estilos están organizados en:

- `.resumen-horas-section` - Contenedor principal
- `.resumen-horas-grid` - Grid de categorías
- `.resumen-horas-item` - Card individual de categoría
- `.resumen-total` - Banner de total destacado

Ver [src/App.css:1178-1247](../src/App.css#L1178-L1247) para detalles completos.

## Datos de Origen

### Notion Database

Los datos provienen de la tabla **DETALLES_HORA** (Detalle Horas):

```javascript
{
  empleadoNombre: "JUAN PEREZ",
  categoria: "08- OF. 2ª ALBAÑIL",
  horas: 8,
  detalle: "Trabajos de albañilería"
}
```

### API Endpoint

```
GET /api/partes/:parteId/detalles
```

Devuelve un array de detalles con:
- `empleadoNombre` - Nombre del empleado
- `categoria` - Categoría laboral
- `horas` - Horas trabajadas
- `estado` - Estado del empleado
- `detalle` - Notas adicionales

## Compatibilidad

### Navegadores Soportados

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dispositivos

- ✅ Desktop (1920x1080 y superiores)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)

## Mejoras Futuras

### v1.5.0 (Planeado)

- [ ] Exportar resumen a PDF
- [ ] Comparar con partes anteriores
- [ ] Gráfico de barras visual
- [ ] Filtros por categoría

### v1.6.0 (Planeado)

- [ ] Histórico de horas por categoría
- [ ] Tendencias semanales/mensuales
- [ ] Alertas de anomalías
- [ ] Dashboard de estadísticas

## Troubleshooting

### El resumen no aparece

**Posible causa:** No hay empleados asignados al parte

**Solución:** Asignar al menos un empleado con horas cargadas

---

### Las horas no coinciden

**Posible causa:** Categorías no reconocidas

**Solución:** Verificar que las categorías en Notion sigan el formato estándar

---

### Estilos rotos

**Posible causa:** Falta rebuild después de actualizar

**Solución:**
```bash
npm run build
```

## Referencias

- **Código fuente**: [src/App.jsx:581-616](../src/App.jsx#L581-L616)
- **Componente visual**: [src/App.jsx:1435-1455](../src/App.jsx#L1435-L1455)
- **Estilos**: [src/App.css:1178-1247](../src/App.css#L1178-L1247)
- **Changelog**: [CHANGELOG_V1.0.0.md](../CHANGELOG_V1.0.0.md)

---

**Documentado en:** v1.0.0
**Fecha:** 3 de Noviembre de 2025
**Autor:** Claude Code Assistant
