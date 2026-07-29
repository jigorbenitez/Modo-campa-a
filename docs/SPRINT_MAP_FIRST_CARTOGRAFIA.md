# ATIY — Map First y jerarquía cartográfica

## Decisión de producto

Territorio pasa a ocupar toda el área disponible entre la navegación global y el borde de la ventana. El mapa es el estado base; la información contextual y las herramientas aparecen únicamente por intención del usuario.

La interfaz utiliza un buscador compacto, un selector de modo cartográfico y un solo menú flotante. Indicadores, capas, herramientas GIS, historia y leyenda son mutuamente excluyentes. La ficha contextual se desliza sobre el mapa solo después de seleccionar una entidad y se cierra al tocar el mapa, presionar Escape o limpiar la selección.

## Modos cartográficos

- Territorial: municipio, localidades y barrios.
- Electoral: municipio, circuitos oficiales y escuelas.
- Institucional: instituciones y servicios verificados.
- Operativo: recorridas, compromisos, problemas y propuestas.

Cambiar de modo reemplaza el conjunto completo de capas. El administrador solo expone las capas del modo activo; esto evita combinaciones que destruyen la jerarquía visual.

## Jerarquía visual

El municipio se representa con borde exterior grueso y relleno casi transparente. Las localidades usan relleno suave y línea secundaria. Los barrios usan línea fina. Los circuitos usan línea muy fina y relleno mínimo. Una selección puede reforzar temporalmente su geometría sin alterar el dato.

La jerarquía conceptual es:

`Municipio → Localidades → Barrios ↔ Circuitos → Instituciones → Eventos → Recorridas → Compromisos`

Los circuitos complementan los barrios y pueden atravesarlos. No se presentan como sustituto de la división barrial.

## Fuentes y confianza

| Conjunto | Fuente | Licencia | Confianza |
| --- | --- | --- | --- |
| Circuitos electorales | Cámara Nacional Electoral / Datos Argentina | CC BY 4.0 | Verificada |
| Límite municipal | Disolución topológica de circuitos CNE | CC BY 4.0 | Verificada, dato derivado |
| Localidades | OpenStreetMap, relaciones 1788821, 1788822 y 1898365 | ODbL 1.0 | Verificada contra la fuente publicada |
| Barrio Infico | OpenStreetMap, relación 3664246 | ODbL 1.0 | Verificada contra la fuente publicada |
| Instituciones | OpenStreetMap y, cuando existe, sitio municipal | ODbL / fuente institucional | Alta o verificada según cruce |

Cada registro cartográfico admite `sourceUrl` y `confidence`. ATIY no modifica geometrías oficiales manualmente.

## Diferencias y datos pendientes

La cartografía pública revisada no ofrece actualmente un conjunto completo, homogéneo y reutilizable de polígonos para todos los barrios de San Fernando. Por ese motivo solo se incorpora Barrio Infico como barrio con límite verificable. Los nombres barriales sin geometría trazable no se convierten en polígonos, centroides ni bandas aproximadas.

Las tres localidades continentales disponibles se muestran con sus geometrías publicadas. La sección insular/delta queda representada por el límite municipal derivado de circuitos hasta disponer de una geometría de localidad verificable y compatible. Esta diferencia debe revisarse en una futura actualización del DataHub.

## Rendimiento y accesibilidad

El mapa continúa cargándose mediante importación dinámica. Los paneles desmontados no procesan listas ni controles. Los modos reducen la cantidad de geometrías y marcadores simultáneos. Todos los comandos son botones accesibles, exponen estado expandido o presionado y Escape recupera la vista general.

## Evolución

DataHub será el único punto de entrada para nuevas geometrías. Una versión candidata deberá validar topología, identificadores, fuente, licencia, contención municipal, duplicados y diferencias contra la versión aceptada antes de publicarse.
