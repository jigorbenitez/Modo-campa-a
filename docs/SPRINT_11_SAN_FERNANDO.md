# Sprint 11 — Base territorial San Fernando

## Alcance

ATIY utiliza ahora `municipio-san-fernando` como tenant territorial de referencia. La base del mapa contiene únicamente registros verificables de San Fernando y no incorpora actividad, reclamos, propuestas ni compromisos simulados.

Cada punto territorial incluye identificador, nombre, tipo, coordenadas, barrio, localidad, descripción, estado, fecha de actualización y fuente. El catálogo de categorías contempla educación, salud, seguridad, cultura, transporte, espacios públicos, organizaciones, dependencias y puntos de interés.

## Estabilidad del mapa

La selección se valida mediante una función pura antes de proyectarse en la interfaz. Si una capa se desactiva, cambia el período o desaparece un registro, el marcador deja de estar seleccionado sin conservar referencias inválidas.

El mapa ofrece tres salidas seguras:

- `Volver al municipio` restaura el centro municipal y limpia todo el contexto.
- `Limpiar selección` cierra la ficha del marcador sin perder el barrio.
- `Escape` restaura la vista municipal desde cualquier estado.

Un clic sobre el fondo del mapa también cierra el marcador. Cada transición vuelve a habilitar arrastre, rueda, zoom táctil, doble clic, teclado y cierre de popups. El enfoque depende de coordenadas escalares e identificadores estables para evitar ciclos de `flyTo`.

## Flujo de datos

`TerritorySnapshot` continúa desacoplado de React. `TerritoryViewService` filtra por período, capas, barrio, texto y categoría; luego deriva indicadores y el contexto barrial. La UI recibe solamente la proyección resultante.

El panel barrial queda preparado para escuelas, jardines, clubes, plazas, salud, instituciones, actividades, problemas, compromisos, recorridas, fotografías y documentos. Los valores operativos permanecen en cero hasta que existan datos persistidos.

## Escalabilidad

Las capas futuras de actividades, reclamos, propuestas, compromisos, fotografías y documentos mantienen contratos independientes. El esquema conserva `municipioId`, fuente y fecha de actualización para una migración posterior a Supabase/PostGIS, clustering, sincronización offline e importación masiva.

## Fuentes iniciales

- Municipalidad de San Fernando: datos de la ciudad, localidades, equipamiento y publicaciones institucionales.
- OpenStreetMap: referencia cartográfica y coordenadas operativas.
