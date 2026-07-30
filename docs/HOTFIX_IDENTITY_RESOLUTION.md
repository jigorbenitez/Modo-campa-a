# Hotfix — Identity Resolution Engine

## Arquitectura

El motor vive en una capacidad de dominio independiente y recibe
`TerritorialEntity[]`. No conoce React, Supabase ni los conectores. La sincronización
lo invoca mediante un puerto opcional después de persistir cada ejecución.

## Evidencia y score

La configuración predeterminada pondera nombre (40%), ubicación (30%), dirección
(15%), categoría (10%) e identificador externo (5%). El nombre elimina diferencias
de mayúsculas, acentos, puntuación, espacios, abreviaturas, artículos y términos
institucionales. La distancia máxima comparable es 250 metros.

- Score igual o superior a 75%: fusión automática.
- Score entre 60% y 75%: revisión manual.
- Score inferior a 60%: registros independientes.

Los umbrales y pesos son configurables y los resultados son reproducibles.

## Fusión conservadora

Una fusión selecciona como nombre principal la fuente de mayor autoridad y conserva:

- todos los nombres alternativos;
- todos los identificadores externos;
- fuentes, URLs y licencias;
- notas, etiquetas y metadatos;
- historial de identidad con fecha, entidades y score.

La búsqueda consulta el nombre principal y sus alias. Una URL construida con cualquier
identificador fusionado resuelve la misma ficha canónica.

## Persistencia y auditoría

La migración crea `territorial_identity_clusters` y
`territorial_identity_decisions`, ambas aisladas por municipio mediante RLS.
`/admin/data-quality` muestra faltantes, coincidencias resueltas y casos intermedios.
Las acciones Fusionar, Ignorar y Revisar luego quedan auditadas.

## Casos verificados

- `Colegio San Pablo` y `Colegio Parroquial San Pablo`: una ficha.
- `Alfonsina Storni` y `Escuela Alfonsina Storni`: una ficha.
- `Don Orione` e `Instituto Don Orione`: una ficha institucional.

