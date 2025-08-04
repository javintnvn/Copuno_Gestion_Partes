# Esquema Detallado de Bases de Datos - Notion

## Configuración API
- **Token**: `YOUR_NOTION_TOKEN_HERE`
- **API**: `https://api.notion.com/v1`

## Bases de Datos

### OBRAS (Obras)
- **ID**: `20882593a257810083d6dc8ec0a99d58`
- **Descripción**: Obras

#### Propiedades:
- **Responsables PRL **: relation (relación con otra BD)
- **Precio Encargado**: number (número - euro)
- **Provincia**: select (selección - 2 opciones)
- **Estado**: status (status)
- **Precio Capataz**: number (número - euro)
- **Empleados**: relation (relación con otra BD)
- **Precio Oficial 2ª**: number (número - euro)
- **Partes de trabajo**: relation (relación con otra BD)
- **Precio Oficial 1ª**: number (número - euro)
- **Clientes**: relation (relación con otra BD)
- **Obra**: title (título)

#### Ejemplo de Registro:
- **Responsables PRL **: [1 relaciones]
- **Precio Encargado**: 36
- **Provincia**: CADIZ
- **Estado**: [status]
- **Precio Capataz**: 54
- **Empleados**: [8 relaciones]
- **Precio Oficial 2ª**: 12
- **Partes de trabajo**: [1 relaciones]
- **Precio Oficial 1ª**: 14
- **Clientes**: [1 relaciones]
- **Obra**: Sabinillas

---

### JEFE_OBRAS (Persona Autorizada)
- **ID**: `20882593a25781b4a3b9e0ff5589ea4e`
- **Descripción**: Persona Autorizada

#### Propiedades:
- **Partes de trabajo**: relation (relación con otra BD)
- ** Email**: email (email)
- **Persona Autorizada**: title (título)

#### Ejemplo de Registro:
- **Partes de trabajo**: [1 relaciones]
- ** Email**: p@ntnvn.com
- **Persona Autorizada**: Paco Pérez

---

### DETALLES_HORA (Detalle Horas)
- **ID**: `20882593a25781838da1fe6741abcfd9`
- **Descripción**: Detalle Horas

#### Propiedades:
- **AUX_Categoria**: formula (fórmula)
- **Empleados**: relation (relación con otra BD)
- **Fecha**: rollup (rollup)
- **Aux Empleado**: rollup (rollup)
- **Categoría-roll-aux**: rollup (rollup)
- **Partes de trabajo**: relation (relación con otra BD)
- **Estado Parte**: rollup (rollup)
- **Cantidad Horas**: number (número - number)
- **Fecha PArte de Trabajo**: rollup (rollup)
- **ID Parte Trabajo**: rollup (rollup)
- **AUX_Categoría**: formula (fórmula)
- **Rollup Estado**: rollup (rollup)
- **ID**: unique_id (unique_id)
- **Detalle**: title (título)

#### Ejemplo de Registro:
- **AUX_Categoria**: 04- ENCARGADO
- **Empleados**: [1 relaciones]
- **Fecha**: [rollup]
- **Aux Empleado**: [rollup]
- **Categoría-roll-aux**: [rollup]
- **Partes de trabajo**: [1 relaciones]
- **Estado Parte**: [rollup]
- **Cantidad Horas**: 8
- **Fecha PArte de Trabajo**: [rollup]
- **ID Parte Trabajo**: [rollup]
- **AUX_Categoría**: [04- ENCARGADO]
- **Rollup Estado**: [rollup]
- **ID**: [unique_id]
- **Detalle**:  

---

### EMPLEADOS (Empleados)
- **ID**: `20882593a257814db882c4b70cb0cbab`
- **Descripción**: Empleados

#### Propiedades:
- **Categoría**: select (selección - 48 opciones)
- **Obras**: relation (relación con otra BD)
- **Delegado**: select (selección - 8 opciones)
- **1R COGNOM**: rich_text (texto)
- **Obra**: rollup (rollup)
- **Detalle Horas**: relation (relación con otra BD)
- **Provincia**: select (selección - 62 opciones)
- **Caduca**: date (fecha)
- **Estado**: select (selección - 12 opciones)
- **R. Medica**: date (fecha)
- **ID Trabajador**: unique_id (unique_id)
- **Teléfono**: phone_number (teléfono)
- **2N COGNOM**: rich_text (texto)
- **Parte**: rollup (rollup)
- **Localidad**: select (selección - 317 opciones)
- **Fecha Nacimiento**: date (fecha)
- **Otros**: rich_text (texto)
- **Fecha Alta**: date (fecha)
- **AUX **: formula (fórmula)
- **DNI**: rich_text (texto)
- **NAF**: number (número - number)
- **Nombre Completo**: title (título)

#### Ejemplo de Registro:
- **Categoría**: 09- PEON ESPECIALISTA 
- **Obras**: [0 relaciones]
- **Delegado**: JOSE Mº
- **1R COGNOM**: HERNANDEZ
- **Obra**: [rollup]
- **Detalle Horas**: [0 relaciones]
- **Provincia**: CACERES
- **Caduca**: 
- **Estado**: ON - Disponible
- **R. Medica**: 
- **ID Trabajador**: [unique_id]
- **Teléfono**: 646795742
- **2N COGNOM**: RODRIGUEZ
- **Parte**: [rollup]
- **Localidad**: MORALEJA
- **Fecha Nacimiento**: 
- **Otros**: 
- **Fecha Alta**: 
- **AUX **: LUIS MIGUEL HERNANDEZ RODRIGUEZ HERNANDEZ RODRIGUEZ
- **DNI**: 76013537D
- **NAF**: 100044040610
- **Nombre Completo**: LUIS MIGUEL HERNANDEZ RODRIGUEZ

---

### PARTES_TRABAJO (Partes de trabajo)
- **ID**: `20882593a25781258595e15abb37e87a`
- **Descripción**: Partes de trabajo

#### Propiedades:
- **AUX Pr OF1**: rollup (rollup)
- **Última edición por**: last_edited_by (editado por)
- **AUX Pr OF2**: rollup (rollup)
- **Detalle Horas**: relation (relación con otra BD)
- **AUX Obra en Texto**: formula (fórmula)
- **Report Horas Encargado**: formula (fórmula)
- **Enviar Datos**: button (button)
- **AUX Obra**: formula (fórmula)
- **Fecha**: date (fecha)
- **Report Horas Oficial 1ª**: formula (fórmula)
- **Enviado a cliente**: checkbox (checkbox)
- **Horas Oficial 1ª**: formula (fórmula)
- **TOCAR URL PARA FIRMAR**: rich_text (texto)
- **AUX Jefe de Obra**: formula (fórmula)
- **Email Jefe Obra**: rollup (rollup)
- **Horas Capataz**: formula (fórmula)
- **URL PDF**: url (URL)
- **Firmar**: formula (fórmula)
- **Report Horas Capataz **: formula (fórmula)
- **Horas Encargado **: formula (fórmula)
- **Report Horas Oficial 2ª**: formula (fórmula)
- **Imp Horas Of 1ª**: formula (fórmula)
- **AUX Pr Capataz**: rollup (rollup)
- **Importe total**: formula (fórmula)
- **Report Importe Parte**: formula (fórmula)
- **Última edición**: last_edited_time (última edición)
- **AUX Pr Encargado**: rollup (rollup)
- **Notas**: rich_text (texto)
- **Imp Horas Capataz**: formula (fórmula)
- **Persona Autorizada**: relation (relación con otra BD)
- **Horas Oficial 2ª **: formula (fórmula)
- **AUX ID PDF Onedrive**: rich_text (texto)
- **Documento Firmado**: files (files)
- **Obras**: relation (relación con otra BD)
- **ID**: unique_id (unique_id)
- **Horas totales**: rollup (rollup)
- **Imp Horas Encargado**: formula (fórmula)
- **Estado**: status (status)
- **Total Horas Oficial**: formula (fórmula)
- **Enviar email al cliente**: button (button)
- **AUX Obra para filtro softr**: rollup (rollup)
- **Imp Horas Of 2ª**: formula (fórmula)
- **AUX Precios Hora**: relation (relación con otra BD)
- **Nombre**: title (título)

#### Ejemplo de Registro:
- **AUX Pr OF1**: [rollup]
- **Última edición por**: Make
- **AUX Pr OF2**: [rollup]
- **Detalle Horas**: [6 relaciones]
- **AUX Obra en Texto**: Sabinillas
- **Report Horas Encargado**: 8 Horas de encargado con un importe de 288€
- **Enviar Datos**: [button]
- **AUX Obra**: Sabinillas
- **Fecha**: 2025-08-04T10:00:00.000+02:00
- **Report Horas Oficial 1ª**: 79 Horas de encargado con un importe de 1106€
- **Enviado a cliente**: No
- **Horas Oficial 1ª**: 79
- **TOCAR URL PARA FIRMAR**: TOCAR ESTA URL PARA FIRMAR ⬇️
- **AUX Jefe de Obra**: Paco Pérez
- **Email Jefe Obra**: [rollup]
- **Horas Capataz**: 4
- **URL PDF**: https://copuno-my.sharepoint.com/:b:/p/notionvan/EWZ2__CIP55KmB-JJ4jFgswByoNyoFaGZSe05Gi6KkC4nA
- **Firmar**: https://www.copuno.com/es/notion/?parteId=76&obra=Sabinillas
- **Report Horas Capataz **: 4 Horas de capataz con un importe de 216€
- **Horas Encargado **: 8
- **Report Horas Oficial 2ª**: 7 Horas de encargado con un importe de 84€
- **Imp Horas Of 1ª**: 1106
- **AUX Pr Capataz**: [rollup]
- **Importe total**: 1694
- **Report Importe Parte**: Importe del parte:  1694€
- **Última edición**: 2025-08-04T16:48:00.000Z
- **AUX Pr Encargado**: [rollup]
- **Notas**: 
- **Imp Horas Capataz**: 216
- **Persona Autorizada**: [1 relaciones]
- **Horas Oficial 2ª **: 7
- **AUX ID PDF Onedrive**: 01YTENQULGO377BCB7TZFJQH4JE6EMLAWM
- **Documento Firmado**: [files]
- **Obras**: [1 relaciones]
- **ID**: [unique_id]
- **Horas totales**: [rollup]
- **Imp Horas Encargado**: 288
- **Estado**: [status]
- **Total Horas Oficial**: 86
- **Enviar email al cliente**: [button]
- **AUX Obra para filtro softr**: [rollup]
- **Imp Horas Of 2ª**: 84
- **AUX Precios Hora**: [0 relaciones]
- **Nombre**: Parte Sabinillas76

---

