# Sprint 22 — Informe de primera sincronización real

Fecha UTC: 2026-08-02T23:47:43.639Z

Municipio: San Fernando, Buenos Aires

## Entidades importadas

| Categoría | Cantidad |
|---|---:|
| Municipio | 1 |
| Localidades | 3 |
| Barrios | 0 |
| Escuelas | 169 |
| Jardines | 78 |
| Hospitales | 15 |
| CAPS | 47 |
| Comisarías | 20 |
| Bomberos | 2 |
| Clubes | 23 |
| Plazas | 1 |
| Parques | 35 |
| Estaciones | 7 |
| Puntos de interés | 350 |

## Fuentes y descartes

| Fuente | Estado | Importadas | Descartadas | Motivo / error |
|---|---|---:|---:|---|
| GeoRef Argentina | ok | 3 | 6116 | other_municipality: 6114; non_point_hierarchy_stored_separately: 1; duplicate: 1 |
| Establecimientos de salud públicos 2025 | ok | 34 | 3018 | other_municipality: 3017; outside_municipality: 1 |
| Establecimientos educativos | ok | 186 | 21413 | other_municipality: 21397; duplicate: 13; outside_municipality: 3 |
| OpenStreetMap / Overpass | ok | 541 | 6953 | outside_municipality: 2488; missing_name: 4377; duplicate: 88 |
| IGN ArcGIS REST — Gobiernos locales | ok | 1 | 1 | outside_municipality: 1 |
| Datos.gob.ar CKAN | ok | 0 | 0 | — |
| CKAN compatible PBA | ok | 0 | 0 | — |
| IGN Capas SIG / WFS | ok | 0 | 0 | — |

## Validación cartográfica

- CRS normalizado: EPSG:4326.
- Cada punto fue validado contra el polígono municipal versionado; no se aceptaron puntos fuera del municipio.
- Duplicados eliminados por categoría, nombre normalizado y coordenada a cinco decimales.
- La jerarquía existente se conserva; una fuente puntual no crea barrios ni límites.
- No se inventaron geometrías ni entidades. Las categorías sin fuente pública utilizable quedan en cero.

## Trazabilidad

Los datos completos, URLs, licencias, fechas y motivos de descarte están en `src/data/san-fernando-official-sync.json` y `data/san-fernando/latest-report.json`.
