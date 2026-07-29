# Sprint 20 — Estabilización, cartografía, datos y UX

## Corrección cartográfica

La auditoría detectó que las geometrías de localidades provenientes de OpenStreetMap sobresalían entre 4,6 % y 8,4 % del municipio derivado de circuitos de la Cámara Nacional Electoral. Todas las fuentes usan coordenadas geográficas WGS84 (`EPSG:4326`), por lo que el problema no era una reproyección: las fuentes modelan límites con criterios distintos.

ATIY conserva los originales sin cambios en `src/data/san-fernando-boundaries.json`. El script `generate:territorial-hierarchy` genera una capa derivada mediante intersección topológica determinística:

- localidades ∩ municipio oficial;
- barrios ∩ localidad padre ∩ municipio;
- circuitos sin edición, como fuente electoral oficial;
- metadatos de derivación, procedencia y confianza.

El mapa consume la capa derivada. Las pruebas verifican que ninguna geometría resultante sobresalga del municipio. No se rellenan huecos ni se inventan límites. La sección insular y los barrios sin polígonos públicos verificables continúan documentados como pendientes.

## Importador territorial

El puerto de importación admite `csv`, `geojson`, `json`, `xlsx`, `shapefile` y `geopackage`. Toda fuente debe declarar municipio, nombre, URL, fecha de recuperación, licencia, CRS y confianza. Los importadores se registran por formato y generan una vista previa con problemas antes de persistir.

La estructura de ingreso es `data/<municipio>/`. Se crearon directorios independientes para San Fernando, Necochea y Tigre. Los archivos originales nunca se sobrescriben; una versión aceptada se optimiza por separado para la aplicación.

Los adaptadores binarios de Shapefile y GeoPackage permanecen desacoplados del dominio para poder ejecutarse en un worker o proceso de ingestión sin llevar esas dependencias al cliente PWA. Hasta incorporar esos adaptadores, no se aceptan geometrías binarias como registros válidos desde la interfaz.

## Cobertura de datos

DataHub calcula indicadores sobre los registros aceptados. El porcentaje mide completitud de identidad, ubicación y fuente, no pretende estimar el universo municipal cuando no existe un padrón oficial. Una categoría sin dataset aceptado muestra 0 % y explica la ausencia de base de referencia.

## Diario y recorridas

El Diario mantiene su historial sin iniciar recorridas automáticamente. Cada actividad puede abrirse, editarse, finalizarse, duplicarse, exportarse o eliminarse con confirmación. Finalizar registra transición de estado y aumenta la versión de auditoría.

Recorridas incorpora `MediaRecorder`: permite grabar, detener, escuchar, eliminar y guardar notas de voz. El audio queda asociado al aporte mediante un contrato preparado para almacenamiento externo y futura transcripción. La barra operativa muestra GPS, conectividad, sincronización, registros, fotos, videos, audios, batería y duración.

## PWA, Relaciones y experiencia

La sugerencia de instalación puede cerrarse, recuerda la preferencia y se ubica debajo del encabezado, lejos del dock de captura. Relaciones prioriza resumen, elementos relacionados y actividad; el grafo continúa disponible en una sección secundaria desplegable.

Todos los cambios conservan TypeScript estricto, DDD, Supabase, auditoría, PWA y funcionamiento offline existente.
