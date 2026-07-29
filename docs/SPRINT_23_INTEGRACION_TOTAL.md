# Sprint 23 — Integración total

## Origen canónico

El flujo territorial queda unificado en una sola dirección:

`Sincronización → Supabase → TerritorialEntityRepository → dominio → proveedor UI`

`territorial_registry` es la proyección de lectura de Supabase. Los componentes no
consultan tablas, archivos ni snapshots directamente. En desarrollo y como respaldo
offline de la PWA se utiliza una proyección verificada del último artefacto de
sincronización; contiene los mismos registros públicos y nunca se mezcla con la
respuesta de Supabase.

## Resolución de identidad

El artefacto de Sprint 22 contiene 813 filas. Se detectaron seis identificadores
provinciales repetidos entre las clasificaciones jardín y escuela. Después de resolver
identificadores quedan 807 filas. La resolución territorial entre fuentes agrupa
registros del mismo tipo, nombre normalizado y ubicación dentro de 120 metros,
priorizando la fuente oficial provincial sobre OpenStreetMap. El resultado reproducible
es de **747 entidades canónicas**.

No se colapsan instituciones homónimas ubicadas en sedes diferentes.

## Consumidores

Mapa, búsqueda global, directorio territorial, fichas, Relaciones, Inteligencia,
Dashboard y Diario reciben el mismo arreglo canónico. Inteligencia genera prioridades
para el conjunto completo y “Abrir registro” enlaza a la ficha territorial original.

## Persistencia y sincronización

La interfaz de Administración ejecuta `TerritorialDataSyncEngine` mediante un
repositorio HTTP respaldado por Supabase. El endpoint persiste fuentes, versiones,
entidades y ejecuciones; una fuente fallida no invalida las demás. La migración del
sprint agrega índices, desactiva duplicados de huella exacta y publica la vista
`territorial_registry` con RLS heredado mediante `security_invoker`.

## Auditoría de cantidades

| Superficie | Entidades canónicas |
| --- | ---: |
| Mapa | 747 |
| Búsqueda | 747 |
| Territorio | 747 |
| Relaciones | 747 |
| Inteligencia | 747 |
| Diario | 747 |

Categorías principales: 163 escuelas, 71 jardines, 32 CAPS, 9 hospitales,
23 clubes, 37 plazas/parques y 412 entidades de otras categorías verificadas.

## Verificación funcional

Se verificó `INSTITUTO DON ORIONE` (Datos Abiertos PBA) en búsqueda territorial,
marcador y ficha lateral del mapa, ficha completa, Relaciones e Inteligencia. El enlace
de Inteligencia abre `/territorio/entidades/pba-education-60034300`; no inicia una
recorrida.

