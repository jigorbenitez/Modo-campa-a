# ATIY — Consistencia territorial y preparación multi-municipio

## Fuente única del límite municipal

El límite de San Fernando ya no utiliza la geometría general de IGN/Georef que convivía con los circuitos. Se genera mediante una operación real de unión y disolución sobre los 16 circuitos electorales oficiales.

El proceso reproducible vive en `scripts/generate-municipality-boundary.mjs` y utiliza `polygon-clipping` solamente como dependencia de desarrollo. Produce:

- `src/data/san-fernando-municipality-from-circuits.json`, consumido por la aplicación;
- `public/data/san-fernando-municipality-from-circuits.geojson`, disponible para interoperabilidad.

Las colecciones de localidades y barrios ya no contienen otra entidad municipal.

### Resultado topológico

- Circuitos procesados: 16.
- Polígonos resultantes: 25, debido a la composición continental e insular del partido.
- Anillos interiores: 0.
- Anillos cerrados: todos.
- Superposición relativa detectada entre fuentes: `9,523 × 10⁻⁶`, inferior al umbral de prueba de `2 × 10⁻⁵`.

La diferencia residual corresponde a solapamientos submétricos de la fuente electoral. La disolución los absorbe y garantiza un borde exterior común. No se aplicó simplificación destructiva ni se alteraron los circuitos originales.

## Centro operativo

El mapa incorpora escala métrica dinámica, coordenadas del cursor, zoom visible, norte, ubicación del dispositivo, historial de vistas y mini mapa sincronizado. Los controles no deshabilitan arrastre, zoom táctil, teclado ni rueda.

Las fichas territoriales existentes conservan resumen, indicadores, relaciones, documentación, evidencia visual, historial y actividad. Municipio, localidad, barrio y circuito centran su geometría; las entidades puntuales centran su marcador.

## Dashboard ejecutivo

El inicio consume el diario local, recorridas y gestores operativos. Expone actividad diaria y semanal, agenda de compromisos, últimas actividades, alertas de cobertura, instituciones, propuestas en estudio y actividad por circuito. Cuando falta información muestra estados pendientes explícitos y no inventa métricas.

## Cronología y asistente

La cronología se mantiene como capacidad transversal de `TerritoryFeature`, actividades y relaciones. El nuevo puerto `TerritorialAssistantPort` define consultas estructuradas y una implementación determinística basada en reglas. No utiliza modelos de IA.

Las intenciones iniciales son:

- áreas sin recorridas;
- compromisos pendientes por circuito;
- borrador de recorrido;
- informe territorial.

El contrato puede recibir en el futuro un adaptador contextual o semántico sin acoplar IA al dominio.

## Importación y exportación

Territorio admite previsualización de CSV, XLSX, JSON y GeoJSON. Antes de importar valida nombre y rango de coordenadas. Los registros confirmados ingresan como `pending_review`.

La exportación cubre:

- CSV y XLSX desde el directorio territorial;
- GeoJSON, PNG cartográfico y PDF desde el mapa.

El adaptador XLSX es mínimo y controlado: usa ZIP/XML mediante `fflate`, sin macros, fórmulas ni ejecución de contenido embebido. Esto evitó incorporar bibliotecas con vulnerabilidades altas conocidas.

## Límites pendientes

- Las diferencias de cobertura entre circuitos electorales y límites de localidades provienen de fuentes y finalidades distintas. No se recortaron localidades automáticamente para no adulterar sus geometrías publicadas.
- Solo existe un barrio con polígono público verificado. Los restantes permanecen pendientes de una fuente oficial reutilizable.
- El mini mapa utiliza OpenStreetMap en línea. Una versión offline deberá servirse desde teselas empaquetadas.
- La importación XLSX procesa la primera hoja y valores simples. No interpreta fórmulas, macros, estilos ni libros cifrados.
- La ficha 360° completa depende de que cada entidad tenga relaciones y adjuntos persistidos. Los estados vacíos se mantienen explícitos.
- Los datos locales versionados deberán migrar a repositorios Supabase para colaboración concurrente y auditoría central.

## Seguridad de dependencias

Se descartaron `xlsx` y `exceljs` durante el desarrollo al detectar vulnerabilidades altas o cadenas transitivas obsoletas. `fflate` limita la superficie del adaptador Excel. Las alertas restantes de `npm audit` pertenecen al toolchain existente de Next.js/ESLint y requieren actualizaciones coordinadas; no se aplicó un `audit fix --force` que pudiera romper compatibilidad.
