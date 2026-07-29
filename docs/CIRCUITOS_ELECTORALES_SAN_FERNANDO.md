# Circuitos electorales de San Fernando

## Alcance

ATIY incorpora los circuitos electorales como una dimensión territorial independiente. Complementan al municipio, las localidades y los barrios; no los sustituyen ni alteran sus límites.

La imagen aportada se utilizó únicamente para reconocer la organización general y contrastar la numeración. No se digitalizaron geometrías desde la imagen ni se reutilizaron sus colores partidarios.

## Fuente oficial

El archivo `public/data/san-fernando-electoral-circuits.geojson` contiene 16 circuitos de San Fernando filtrados del dataset **Circuitos electorales** del Catálogo de Datos Abiertos de la Provincia de Buenos Aires.

- Responsable: Poder Judicial de la Nación, Justicia Nacional Electoral, Cámara Nacional Electoral.
- Proyección: WGS 84 / EPSG:4326.
- Licencia: Creative Commons Attribution 4.0.
- Actualización informada por el catálogo: 12 de marzo de 2026.
- Recurso original: archivo ZIP con SHP, GeoJSON y KML.

Los códigos incorporados son:

`0872`, `0873`, `0874`, `0875`, `0876`, `0877`, `0878`, `0878A`, `0879`, `0879A`, `0880`, `0880A`, `0880B`, `0881`, `0882` y `0882A`.

Los circuitos 881, 882 y 882A corresponden a sectores insulares del Delta y no se descartaron aunque no se distingan claramente en la referencia visual.

## Integración cartográfica

La capa **Circuitos**:

- se activa y desactiva de forma independiente;
- utiliza el acento cian de ATIY;
- muestra la numeración al explorar el polígono;
- permite seleccionar un circuito y ajustar el mapa a su extensión real;
- abre una ficha lateral con fuente, licencia y contexto relacionado;
- convive con las capas de localidades y barrios.

La geometría original se conserva como `MultiPolygon`. El modelo de visualización admite múltiples anillos, necesario para los circuitos insulares.

## Asociaciones del dominio

`TenantScoped` incorpora `circuitIds` como relación territorial opcional. De esta manera, actividades, personas, instituciones, propuestas, compromisos, problemas, oportunidades y documentos pueden vincularse con uno o más circuitos sin acoplar su dominio a Leaflet o GeoJSON.

El asistente de actividades permite seleccionar barrios y circuitos por separado. `ActivityRecord` conserva la relación y el adaptador territorial la proyecta en el mapa.

La migración `202607290001_electoral_circuits.sql` prepara:

- `electoral_circuits`, con código externo, geometría, fuente y licencia;
- `entity_circuits`, como relación polimórfica entre circuitos y entidades;
- índices por municipio y entidad;
- aislamiento multi-municipio mediante RLS;
- permisos de lectura y escritura territorial.

La geometría se almacena inicialmente como GeoJSON. Cuando PostGIS esté habilitado podrá migrarse a `geometry(MultiPolygon, 4326)` y agregarse un índice GiST sin modificar el dominio ni la interfaz.

## Reproducción y control de calidad

`scripts/generate-san-fernando-circuits.mjs` recibe el GeoJSON oficial extraído del ZIP, filtra exclusivamente San Fernando, normaliza metadatos y genera las copias pública y tipada.

Las pruebas verifican:

- la cantidad exacta de 16 circuitos;
- la lista completa de códigos;
- identificadores únicos;
- geometrías `MultiPolygon`;
- municipio, atribución y licencia;
- codificación UTF‑8.
