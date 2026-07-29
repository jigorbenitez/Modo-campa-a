# Sprint 12 — ATIY Premium

## Objetivo

Este sprint consolida ATIY como producto territorial utilizable: sustituye geometrías ilustrativas por límites publicados y trazables, estabiliza la interacción cartográfica, incorpora una gestión permanente de actividades en **Mi Diario** y agrega controles automáticos de codificación y datos.

No se modificó el dominio DDD, la autenticación, Supabase ni el sistema de permisos. La integración continúa respetando el flujo UI → servicios de aplicación → repositorios o adaptadores.

## Calidad cartográfica

La base se genera de forma reproducible con `scripts/generate-san-fernando-geojson.mjs` y se publica en `public/data/san-fernando-boundaries.geojson`. La copia tipada de compilación vive en `src/data/san-fernando-boundaries.json`.

Fuentes:

- Partido de San Fernando: Instituto Geográfico Nacional, a través de la API Georef de la República Argentina.
- Localidades San Fernando, Victoria y Virreyes: relaciones publicadas en OpenStreetMap, licencia ODbL 1.0.
- Barrio Infico: relación publicada en OpenStreetMap, licencia ODbL 1.0.
- Puntos de interés: elementos trazables de OpenStreetMap; cada registro conserva su URL de origen.

El módulo no crea polígonos inferidos. Cuando una fuente pública consultada no publica un límite barrial verificable, ATIY no lo presenta como exacto. La arquitectura permite incorporar nuevos `Polygon` o `MultiPolygon` de catastros municipales, IDEBA o RENABAP sin cambiar los componentes del mapa.

Cada área conserva:

- identificador estable;
- nivel territorial;
- geometría completa;
- fuente y enlace;
- fecha de actualización;
- centro calculado para navegación.

Leaflet ajusta la vista con `fitBounds` sobre la geometría seleccionada. El municipio se representa como contexto y la localidad o barrio seleccionado recibe el énfasis visual. Cerrar, limpiar, presionar `Esc` o volver al municipio elimina marcadores y ventanas activas, restaura la extensión general y vuelve a habilitar desplazamiento, zoom, teclado y gestos táctiles.

## Mi Diario

`/diario` es una sección permanente de la navegación. Permite:

- ordenar cronológicamente;
- buscar por texto, observaciones, participantes y territorio;
- filtrar por área, institución u organizador, tipo y estado;
- abrir el contexto completo;
- editar mediante el asistente existente;
- duplicar con un identificador y auditoría nuevos;
- eliminar con confirmación;
- revisar fotografías y documentos;
- abrir la ubicación en Territorio.

La persistencia local se encapsula en `activity-journal-store.ts`; ningún componente conoce la implementación de almacenamiento. `useActivityJournal` sincroniza pestañas y vistas mediante eventos de almacenamiento. Es un adaptador transitorio preparado para ser reemplazado por el repositorio Supabase sin cambiar la experiencia.

`activityRecordToTerritoryFeature` proyecta las actividades en el modelo cartográfico. Al crear, editar o eliminar, Territorio recibe el nuevo snapshot y `sanitizeTerritorySelection` descarta cualquier selección que haya dejado de existir.

## Integridad y codificación

`scripts/check-utf8.mjs` recorre TypeScript, TSX, JSON, GeoJSON, Markdown, SQL, CSS y scripts con decodificación UTF‑8 estricta. También detecta patrones habituales de doble codificación. La auditoría forma parte de `npm test`, por lo que una regresión bloquea la validación.

La revisión incluyó títulos, botones, mensajes de confirmación, placeholders, datos de ejemplo, documentación y textos accesibles.

## Rendimiento y escalabilidad

- El mapa continúa cargándose mediante importación dinámica y sin SSR.
- Las proyecciones de Diario a Territorio se memorizan.
- Las geometrías se cargan como datos estáticos versionados, sin solicitudes cartográficas durante la interacción.
- Las selecciones se validan contra capas, período, áreas y entidades disponibles.
- `Polygon` y `MultiPolygon` comparten un modelo de anillos, compatible con futuras simplificaciones por nivel de zoom.
- El generador permite actualizar fuentes sin editar manualmente miles de coordenadas.

Para volúmenes grandes, la siguiente evolución natural es almacenar geometrías en PostGIS, entregar teselas vectoriales por extensión y nivel de zoom, indexar con GiST y mantener una caché offline por municipio.

## Pruebas y control de calidad

Las pruebas automáticas verifican:

- conservación de selecciones válidas;
- descarte de capas desactivadas;
- recuperación ante marcadores o barrios eliminados;
- descarte por período;
- existencia de municipio, localidades y barrio;
- identificadores cartográficos únicos;
- geometrías y fuentes trazables;
- integridad UTF‑8.

La validación de entrega se completa con ESLint, TypeScript, pruebas, build de producción y `git diff --check`.
