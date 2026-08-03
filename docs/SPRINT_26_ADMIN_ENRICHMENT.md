# Sprint 26 — Administración estable y enriquecimiento territorial

## Administración

La ruta `/admin` conserva su identidad en todos los casos. Una sesión inexistente continúa en el flujo de autenticación; una sesión válida sin `users:read` recibe un estado de acceso denegado dentro de Administración, con explicación del permiso faltante y acceso a Mi Cuenta. Ya no existe una redirección silenciosa al Dashboard ni a otra sección.

## Ayuda y comentarios

`FeedbackPanel` genera un contrato local con tipo, descripción, ruta automática, fecha ISO, usuario disponible, versión de ATIY y modo de entrega. Permite copiar JSON, descargarlo o producir un borrador legible. No importa ni invoca Supabase: una futura persistencia implementará el puerto de entrega detrás de la misma interfaz visual.

## Sincronización real

La ejecución del 2 de agosto de 2026 consultó GeoRef Argentina, Datos Abiertos PBA, OpenStreetMap/Overpass, IGN ArcGIS REST, Datos.gob.ar CKAN, CKAN PBA e IGN WFS. El nuevo padrón de establecimientos de salud públicos 2025 de PBA usa CC BY 4.0 y aportó 34 registros verificables con coordenadas dentro del municipio.

Respecto del artefacto versionado anterior:

- 49 IDs son incorporaciones nuevas: 34 de Salud PBA 2025 y 15 de OpenStreetMap.
- 97 IDs dejaron de publicarse en las respuestas actuales de educación/OSM y no se conservaron como si siguieran vigentes.
- El artefacto actualizado contiene 765 registros crudos verificables.
- 99 fichas presentan metadatos nuevos o actualizados frente a la versión anterior.
- Cobertura disponible: 246 direcciones, 196 teléfonos, 73 correos, 111 sitios web y 143 horarios.

La reducción neta no se oculta: el objetivo es vigencia y trazabilidad, no sostener un total histórico con registros que la fuente ya no devuelve.

## Clasificación y fichas

La taxonomía ahora distingue bibliotecas, centros culturales, centros de jubilados, sociedades de fomento, oficinas provinciales, oficinas nacionales y reservas. Las fichas conservan alias, contacto, organismo, horario, fuente, URL, licencia, fecha de actualización y propiedades originales. Los valores manualmente validados no son reemplazados por el motor de enriquecimiento.

## Cobertura aún baja

- Plazas y sociedades de fomento: pocas fuentes municipales ofrecen descarga estructurada y coordenadas.
- Centros de jubilados y ONG: existen referencias administrativas y boletines, pero la mayoría no publica geometría reutilizable.
- Oficinas provinciales/nacionales: la información está dispersa por organismo y no hay un padrón geográfico municipal único.
- Clubes y parroquias: OSM y páginas institucionales aportan registros, aunque teléfonos, horarios y licencias fotográficas siguen incompletos.

ATIY registra esos faltantes en vez de inferir datos o geocodificar en masa direcciones ambiguas.
