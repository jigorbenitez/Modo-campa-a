# Sprint 21 — Territorial Data Sync Engine

## Objetivo

ATIY incorpora un motor desacoplado para descubrir, descargar, validar, filtrar y versionar datos públicos por municipio. El motor no modifica las entidades DDD existentes: opera mediante puertos de aplicación y persiste sus resultados en infraestructura separada.

## Arquitectura

```text
Administración
  → TerritorialDataSyncEngine
    → TerritorialDatasetConnector[]
    → DatasetDownloader
    → DatasetParser[]
    → TerritorialFilter
    → SyncRepository
```

Los conectores solo describen recursos públicos. Los parsers solo convierten formatos. El filtro impone el municipio activo. El repositorio conserva versiones, deltas, ejecuciones y auditoría. Esta separación permite sustituir una fuente, un parser o Supabase sin modificar el dominio.

## Fuentes soportadas

- GeoRef Argentina: unidades territoriales oficiales publicadas por Datos Argentina.
- OpenStreetMap/Overpass: equipamiento e instituciones, con atribución ODbL.
- El puerto `TerritorialDatasetConnector` permite agregar Datos Argentina, Provincia de Buenos Aires, IGN o portales municipales sin condicionales dentro del motor.

Las fuentes se descubren en paralelo. El downloader reintenta hasta tres veces cada recurso de manera independiente. Un fallo parcial no descarta los resultados válidos de otros conectores.

## Formatos

| Formato | Implementación |
|---|---|
| GeoJSON | Parser nativo con exigencia de `FeatureCollection` |
| CSV | Parser tabular con coordenadas explícitas |
| Shapefile | `shpjs`; requiere ZIP o conjunto binario compatible |
| GeoPackage | `@ngageoint/geopackage`; itera todas las tablas vectoriales |
| KML | `@tmcw/togeojson`; valida XML antes de convertir |
| OSM JSON | Adaptador específico para respuestas Overpass |

Un recurso inválido o un entorno que no pueda ejecutar su parser produce un error explícito por dataset. El motor no declara una importación exitosa si el formato no fue procesado.

## Proceso de sincronización

1. Seleccionar provincia y municipio activos.
2. Consultar conectores independientes.
3. Descargar cada versión con reintentos acotados.
4. Parsear al modelo `NormalizedFeature`.
5. Rechazar registros sin identidad, nombre o geometría.
6. Filtrar al municipio y eliminar duplicados por huella estable.
7. Comparar la versión anterior por `externalId` y `fingerprint`.
8. Aplicar únicamente altas, modificaciones y bajas.
9. Guardar la versión completa y el resumen de auditoría.
10. Recalcular cobertura exclusivamente con universos publicados.

La operación está integrada en `/admin/data-sync`. `/admin/sync` se conserva como alias y redirige al centro de sincronización. El usuario puede seleccionar cualquiera de los municipios visibles para su cuenta, observar el progreso, revisar el delta, consultar las entidades importadas y recorrer el historial.

Las descargas remotas pasan por `/api/territorial-sync/download`, que aplica HTTPS, lista cerrada de proveedores y un máximo de 50 MB. Esto evita CORS y reduce el riesgo de SSRF. Cuando una fuente remota no está disponible, el conector de caché territorial puede utilizar únicamente snapshots públicos ya verificados y distribuidos por ATIY; los errores remotos siguen visibles en la auditoría.

No se calcula un porcentaje cuando una fuente no publica el universo esperado. En ese caso ATIY muestra “sin universo público verificable” y deja la categoría pendiente de carga manual.

## Persistencia y seguridad

La migración `202607290002_data_sync_engine.sql` crea:

- `territorial_data_sources`
- `territorial_dataset_versions`
- `territorial_public_features`
- `territorial_sync_runs`
- `territorial_sync_schedules`

Todas las tablas incluyen `municipality_id`, índices multi-municipio y RLS basada en `has_membership` y `territory:write`. La geometría se conserva como GeoJSON hasta habilitar PostGIS. La interfaz local usa un repositorio de caché para continuar funcionando offline; las tablas constituyen la persistencia colaborativa autorizada.

## Programación

La configuración admite ejecución manual, diaria, semanal y mensual y registra la próxima fecha por municipio. En una instalación productiva, un cron de Vercel o una función programada de Supabase debe invocar el caso de uso cuando `territorial_sync_schedules.next_run_at` venza. Las credenciales de servicio nunca deben enviarse al navegador.

## Atlas Territorial

Los registros aceptados conservan nombre, categoría, geometría, propiedades originales, fuente, versión, licencia, confianza y fecha. Esto permite que las fichas territoriales existentes consulten un registro público y combinen, por relación, recorridas, problemas, compromisos, fotografías y documentos sin duplicar esas entidades.

## Limitaciones verificables

- Las fuentes públicas no ofrecen todas las categorías para todos los municipios.
- Los polígonos requieren un límite municipal verificable antes de efectuar un recorte topológico; un `bounds` solo es suficiente para puntos.
- Overpass es un servicio comunitario y puede limitar consultas; sus errores quedan registrados.
- La ejecución programada requiere configurar el cron del entorno de despliegue.
- No se incorporaron datasets ni geometrías ficticias.

## Pruebas

Las pruebas automáticas verifican:

- delta reproducible de altas, cambios, bajas y registros sin cambios;
- rechazo de GeoJSON inválido;
- tratamiento correcto de coordenadas CSV ausentes;
- reintentos;
- filtrado y deduplicación antes de persistir;
- auditoría de la ejecución.
