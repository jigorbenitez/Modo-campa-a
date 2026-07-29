# Sprint 22 — Conectores oficiales

## Alcance

ATIY incorpora adaptadores funcionales para GeoRef Argentina, Datos Abiertos de la Provincia de Buenos Aires, Datos.gob.ar, catálogos CKAN compatibles, OpenStreetMap/Overpass, ArcGIS REST e IGN. Supabase y el dominio no dependen de estos proveedores: los conectores sólo descubren datasets; el motor descarga, parsea, filtra, compara y persiste mediante puertos.

## Flujo

1. Un conector descubre recursos, licencia, editor, formato y versión.
2. Las descargas remotas pasan por un proxy servidor con allowlist, límite de 50 MB y timeout.
3. El parser normaliza GeoJSON, CSV, Shapefile, GeoPackage, KML u OSM JSON.
4. El filtro territorial valida San Fernando, coordenadas y jerarquía.
5. El motor deduplica, calcula el delta, guarda la versión y registra el resultado.
6. Un fallo de descubrimiento o descarga se convierte en un resultado `unavailable` o `failed`; las demás fuentes continúan.

## Primera sincronización reproducible

`npm run sync:san-fernando` consulta las fuentes públicas y genera:

- `src/data/san-fernando-official-sync.json`, consumido por Mapa, Búsqueda y Relaciones;
- `data/san-fernando/latest-report.json`, evidencia estructurada;
- `docs/SPRINT_22_IMPORT_REPORT.md`, informe legible.

El proceso no completa categorías con supuestos. Si un catálogo no ofrece un recurso georreferenciado atribuible al municipio, registra cero importaciones y conserva la evidencia de conectividad.

## Fuentes y licencias

- GeoRef Argentina: API oficial, CC BY 4.0.
- Datos Abiertos PBA: catálogo CKAN oficial; establecimientos educativos, CC BY 4.0.
- Datos Argentina: API CKAN oficial; licencia por dataset.
- OpenStreetMap/Overpass: ODbL 1.0.
- IGN: servicios WFS y ArcGIS REST públicos; atribución IGN.

Las URLs, fechas, cantidades, descartes y errores de la ejecución están dentro del artefacto JSON y del informe de importación.

## Validación cartográfica

Los puntos se normalizan a EPSG:4326 y se aceptan únicamente si caen dentro del polígono municipal versionado. La deduplicación utiliza categoría y nombre normalizado, manteniendo la fuente de mayor precedencia por orden de importación. Una fuente puntual nunca crea límites de barrios, localidades o circuitos.

## Operación

La ruta `/admin/data-sync` permite seleccionar municipio, ejecutar el mismo motor, observar progreso, resultados, entidades e historial. `/admin/sync` permanece como alias compatible.
