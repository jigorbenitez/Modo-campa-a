# Sprint 24 — Calidad Territorial y Gemelo Digital 1.0

## Resultado

ATIY incorpora una capa determinística de calidad territorial entre los datos verificados y sus consumidores. La auditoría evaluada el 1 de agosto de 2026 contiene **729 entidades canónicas**, consolidadas a partir de los registros disponibles sin borrar fuentes ni identificadores.

| Indicador | Resultado |
| --- | ---: |
| Calidad general | 86% |
| Duplicados ya resueltos | 78 |
| Posibles duplicados pendientes | 38 |
| Entidades reclasificadas por reglas | 389 |
| Sin categoría | 0 |
| Sin coordenadas | 0 |
| Fuera de la geometría municipal | 0 |
| Sin dirección | 535 |
| Clasificaciones pendientes | 2 |
| Nombres con formato inconsistente | 173 |

La diferencia frente al número histórico de 747 registros responde a la resolución canónica de identidades: varios registros fuente representan la misma entidad. ATIY conserva sus IDs externos, fuentes, alias e historial dentro de una ficha única.

## Taxonomía y clasificación

La taxonomía única organiza categorías específicas dentro de familias de Educación, Salud, Deporte, Seguridad, Espacio Público, Municipio, Transporte, Culto, Organizaciones, Comercio y Territorio. El clasificador aplica reglas ordenadas y reproducibles sobre nombre, categoría fuente, etiquetas y propiedades de origen. La regla de `Polideportivo` tiene precedencia sobre `Club`, por lo que los diez polideportivos identificados mantienen una categoría propia.

Las sugerencias de confianza intermedia no modifican el dato automáticamente. Se presentan en Auditoría Territorial para aprobación, rechazo o revisión posterior. Cada decisión se registra por municipio y usuario mediante RLS.

## Identidad y búsqueda

La resolución de identidad combina nombre normalizado, categoría, ubicación, dirección, identificadores externos y fuente. Los nombres alternativos permanecen indexados. La búsqueda expande singular, plural, abreviaturas y sinónimos definidos por la taxonomía, pero evita mezclar categorías distintas: `Club` devuelve clubes y `Polideportivo` devuelve polideportivos.

Verificaciones específicas sobre el repositorio canónico:

- Leopoldo Lugones: una ficha.
- Colegio San Pablo: una ficha.
- Instituto Don Orione: una ficha.
- Polideportivo Nº 1: categoría Polideportivo.
- Búsqueda Polideportivo: diez resultados categorizados como Polideportivo.

## Cobertura

| Categoría | Cargadas | Completitud interna | Sin dirección | Posibles duplicados | Sin clasificar |
| --- | ---: | ---: | ---: | ---: | ---: |
| Escuelas | 152 | 100% | 44 | 21 | 0 |
| Jardines | 69 | 100% | 8 | 10 | 1 |
| Hospitales | 10 | 100% | 5 | 0 | 1 |
| CAPS | 30 | 100% | 13 | 0 | 0 |
| Polideportivos | 10 | 100% | 10 | 0 | 0 |
| Clubes | 18 | 100% | 18 | 0 | 0 |
| Plazas | 25 | 100% | 25 | 0 | 0 |

El porcentaje expresa completitud de los registros cargados respecto de ID, coordenadas, fuente y categoría. No se publica una estimación de faltantes externos porque no existe un universo oficial único y verificable para todas las categorías. Presentar esos porcentajes como cobertura absoluta del mundo real sería engañoso.

## Validación geográfica

La pertenencia municipal se comprueba con point-in-polygon sobre el `MultiPolygon` derivado de los circuitos electorales oficiales, no mediante un rectángulo aproximado. La fuente cartográfica declarada es la Cámara Nacional Electoral publicada en el catálogo de datos de la Provincia de Buenos Aires, licencia CC BY 4.0. El resultado actual no detecta puntos fuera de esa geometría.

## Superficie administrativa

`/admin/data-quality` muestra métricas, cobertura, errores y sugerencias. Permite filtrar incidencias, seleccionar una categoría canónica, aprobar o rechazar cambios y resolver posibles coincidencias mediante Fusionar, Ignorar o Revisar luego. Las fichas territoriales exponen alias, categoría, fuentes, IDs externos, ubicación, cobertura, relaciones, recorridas, problemas, compromisos, documentos e historial.

## Riesgos y próximos controles

La principal deuda verificable es la dirección ausente en 535 registros. Debe resolverse mediante enriquecimiento desde fuentes públicas, sin inferir direcciones. Los 38 pares de identidad intermedia requieren revisión humana, porque fusionarlos automáticamente podría unir instituciones diferentes. Las 173 inconsistencias nominales se conservan como nombres fuente y pueden normalizarse editorialmente sin perder alias.
