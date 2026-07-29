# ATIY — Centro Operativo Cartográfico

## Arquitectura

El mapa continúa consumiendo un `TerritorySnapshot` y una proyección generada por `TerritoryViewService`. La interfaz no consulta Supabase ni conoce detalles de PostGIS. Las preferencias de capas y los elementos creados durante la operación se conservan en claves versionadas `atiy:territory:*`, listas para ser reemplazadas por repositorios de infraestructura.

## Jerarquía territorial

La cartografía distingue cuatro niveles sin recurrir a colores partidarios:

- Municipio: límite continuo de mayor espesor.
- Localidades: límite continuo intermedio.
- Barrios: límite continuo fino.
- Circuitos: contorno continuo de acento ATIY.

Los circuitos no usan líneas discontinuas. Cuando existe una selección, el circuito activo se destaca y los restantes se atenúan. Las etiquetas permanentes aparecen con zoom de detalle para reducir superposiciones.

La capa Calles controla el mapa base de OpenStreetMap. Al desactivarla desaparece la cartografía vial, preservando únicamente la información territorial.

## Capas

El administrador agrupa divisiones, equipamiento y gestión. Cada capa puede activarse por separado y el navegador recuerda la selección. Las instituciones se clasifican en escuelas, hospitales, CAPS, clubes, bomberos, policía, bibliotecas, centros culturales y espacios verdes mediante reglas de subtipo, manteniendo una capa general para otras instituciones.

## Herramientas GIS

El panel permite:

- medir recorridos lineales de manera temporal;
- dibujar áreas y zonas temporales;
- seleccionar varios circuitos;
- exportar GeoJSON con atribución;
- generar una imagen PNG esquemática de la selección;
- imprimir o guardar la vista como PDF;
- crear instituciones, recorridas, compromisos, propuestas y fotografías georreferenciadas desde un punto del mapa.

La exportación PNG representa geometrías y selección ATIY sin incrustar teselas externas, evitando conflictos de CORS y licencias. El PDF utiliza el diálogo de impresión del navegador.

## Rendimiento y dispositivos móviles

Leaflet se mantiene cargado dinámicamente y fuera del renderizado del servidor. Las geometrías y vistas se memoizan, las etiquetas dependen del zoom y los controles son colapsables. El mapa conserva zoom táctil, arrastre, rueda, teclado y doble clic. `Escape` limpia cualquier selección.

## Limitaciones documentadas

- La búsqueda local cubre entidades, localidades, barrios y circuitos. La geocodificación de direcciones queda preparada pero no se conecta todavía para evitar incorporar un proveedor sin política de privacidad, límites de uso y estrategia offline.
- Las superficies temporales muestran vértices y geometría, pero el cálculo geodésico exacto queda pendiente de un adaptador GIS dedicado.
- El movimiento de marcadores existentes y la corrección coordinada contra Supabase requieren permisos, auditoría y repositorios persistentes. En esta entrega se permite crear puntos nuevos sin modificar datos oficiales.
- La selección múltiple implementada cubre circuitos. La selección múltiple de barrios se habilitará cuando exista una base oficial completa de polígonos barriales.
- No se simplifican los circuitos oficiales en el archivo fuente. Una futura tubería de teselas vectoriales deberá generar niveles de simplificación sin alterar la geometría canónica.
- Solo se muestran barrios con geometría pública verificada. No se inventan límites.

## Evolución

`TerritoryLayerId`, `TerritoryFeature` y el servicio de proyección dejan preparados heatmaps, cobertura, series temporales, indicadores por área y análisis espacial. La migración existente de circuitos aporta geometrías PostGIS, índices GiST y RLS por municipio.
