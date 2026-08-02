# Sprint 25 — Territorial Enrichment Engine

## Arquitectura

El enriquecimiento se ejecuta después de la sincronización y de la resolución de identidades. `TerritorialEnrichmentEngine` depende de puertos de proveedores y persistencia; no conoce React ni Supabase. Cada candidato conserva campo, valor anterior, valor propuesto, fuente, URL, licencia, fecha, confianza y motivo.

Los campos vacíos con evidencia pública se aplican como proyección enriquecida. Una diferencia frente a un valor existente se registra como conflicto y nunca lo sobrescribe. La aceptación o el rechazo manual genera una entrada de historial con usuario; las aplicaciones automáticas identifican al actor como proceso.

## Fuentes

- Metadatos de las fuentes ya sincronizadas: dirección, contacto, operador, horarios, atributos institucionales e identificadores.
- OpenStreetMap Nominatim para geocodificación inversa acotada. Se ejecuta secuencialmente, hasta cinco entidades por corrida, con identificación de ATIY y atribución ODbL. El límite evita uso masivo del servicio público.
- Fotografías únicamente cuando el registro declara URL y una licencia compatible (CC0, CC BY o dominio público).
- Redes sociales únicamente cuando la fuente institucional publica explícitamente el perfil.

## Datos y auditoría

Las tablas `territorial_enrichment_runs`, `territorial_enrichment_candidates` y `territorial_enrichment_history` aplican RLS por municipio. La proyección territorial incorpora exclusivamente candidatos con estado `applied`, sin modificar el registro fuente original.

La validación detecta formatos inválidos de teléfono, email y URL, además de pares de coordenadas incompletos. La comprobación de URL es sintáctica; una URL rota requiere una consulta de red explícita para evitar falsos positivos por bloqueos temporales.

## Completitud

La completitud mide diez campos prioritarios: dirección, teléfono, email, web, fotografía, horarios, organismo responsable, barrio, localidad y circuito. Es completitud interna del registro, no cobertura absoluta del mundo real. El panel administrativo muestra el agregado municipal y el detalle por categoría sin inventar universos externos.

## Preparación para consultas territoriales futuras

Los campos normalizados, IDs externos, relaciones territoriales y procedencia permanecen estructurados. Esto permitirá construir posteriormente un servicio de consultas contextuales sobre datos consolidados. No se implementó IA, embeddings ni generación automática de respuestas.

## Operación

La ruta `/admin/enrichment` permite ejecutar el motor, observar progreso, fuentes, cambios y conflictos, y aceptar o rechazar propuestas. Las fichas muestran calidad, completitud y campos faltantes.
