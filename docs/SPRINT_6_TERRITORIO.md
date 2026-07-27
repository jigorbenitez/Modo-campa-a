# Sprint 6 — Mapa Vivo

## Objetivo

Mapa Vivo es el Centro de Operaciones Territorial de Modo Campaña. Su función
no es mostrar puntos sobre un mapa, sino ofrecer una puerta de entrada
geoespacial a actividades, problemas, compromisos, propuestas, documentos,
instituciones y evidencia.

El módulo utiliza datos mock de Villa del Encuentro. No implementa todavía
persistencia, PostGIS, geolocalización, clustering, mapas offline ni IA.

## Arquitectura

El módulo se implementa como una vertical independiente:

```text
features/territorio-map/
  domain/
    territory.ts
  application/
    territory-view-service.ts

components/territory/
  territory-map.tsx
  territory-operations.tsx
  territory-sidebar.tsx
  layer-control.tsx
  timeline-slider.tsx
  ...
```

### Separación cartográfica

Leaflet y React Leaflet son adaptadores de presentación. El dominio territorial
no importa ninguna clase o tipo de Leaflet. Coordenadas, capas, períodos,
features e intensidad usan modelos propios.

Esta separación permite reemplazar o complementar el renderer en el futuro sin
reescribir reglas, filtros ni servicios de lectura.

### Modelo geoespacial

`TerritorySnapshot` representa una fotografía consistente de un municipio:

- centro y configuración territorial;
- barrios con centro y límite simulado;
- catálogo de capas;
- features georreferenciadas;
- períodos de historia.

`TerritoryFeature` normaliza los elementos visibles. Una feature conserva su
tipo, ubicación, barrio, fecha, estado y contexto relacionado. No reemplaza las
entidades DDD: es una proyección de lectura optimizada para el mapa.

## Flujo de datos

```text
Mock / futuros repositorios
          ↓
TerritorySnapshot
          ↓
TerritoryViewService
          ↓
TerritoryView
          ↓
Mapa + métricas + panel + timeline
```

El usuario modifica:

- período;
- capas activas;
- barrio seleccionado;
- marcador seleccionado.

`TerritoryViewService` vuelve a proyectar:

- features visibles;
- límites;
- métricas;
- contexto barrial;
- intensidad simulada.

Los componentes no filtran datos por su cuenta. Esto mantiene consistencia entre
el mapa, las tarjetas y el panel lateral.

## Capas

Cada capa posee identificador, etiqueta, descripción, color y estado inicial.
Las capas implementadas son:

- actividades;
- problemas;
- compromisos;
- propuestas;
- documentos;
- instituciones;
- barrios;
- fotografías;
- intensidad conceptual.

Desactivar una capa elimina sus features de la proyección completa. Si el
elemento seleccionado pertenece a esa capa, la ficha se cierra para evitar
mostrar contexto invisible.

## Modo historia

El timeline usa períodos con fechas de corte:

Marzo → Abril → Mayo → Junio → Julio → Hoy.

Al mover el control se recalculan features, indicadores, contexto barrial e
intensidad. No se ocultan solamente marcadores mediante CSS; se genera una
nueva vista coherente con el período.

Las implementaciones futuras podrán reemplazar los cortes mock por rangos
arbitrarios o eventos históricos sin modificar el mapa.

## Centro de información

Los marcadores no usan popups pequeños. Al seleccionarlos se abre una ficha
lateral con:

- descripción y estado;
- participantes;
- problemas;
- compromisos;
- propuestas;
- documentos;
- publicaciones;
- fotos y videos;
- historial.

Al seleccionar un barrio, el panel muestra:

- descripción;
- estado general;
- última actividad;
- cantidad de recorridas;
- problemas activos;
- compromisos;
- propuestas;
- documentos;
- publicaciones;
- indicadores;
- actividad territorial relacionada.

## Intensidad simulada

La capa de intensidad no usa todavía una librería de heatmap. El servicio
calcula un valor conceptual por barrio:

```text
actividades + problemas × 1,35 + compromisos × 1,15
```

El mapa representa ese valor mediante círculos de radio y opacidad variables.
Los pesos son demostrativos y deben convertirse en configuración versionada por
municipio antes de producción.

Esta capa valida la experiencia sin introducir un motor de calor prematuro.

## Rendimiento y escalabilidad

La implementación actual es adecuada para mocks pequeños. Para miles de
features se seguirá esta evolución:

1. consultas por bounding box y período;
2. simplificación de geometrías por nivel de zoom;
3. clustering en Web Worker o servidor;
4. teselas vectoriales para grandes volúmenes;
5. índices espaciales GiST en PostGIS;
6. paginación o streaming de fichas relacionadas;
7. caché por municipio, capa, período y viewport;
8. renderizado Canvas o WebGL cuando el volumen lo justifique.

El monolito modular debe conservarse hasta que métricas reales requieran
servicios separados.

## Integración futura con Supabase y PostGIS

La infraestructura recomendada:

```text
infrastructure/supabase/territory/
  territory-repository.ts
  geometry-mapper.ts
  territory-query.ts
```

Las tablas espaciales incluirán:

- `municipio_id` o futuro `workspace_id`;
- geometría con SRID explícito;
- timestamps y versión;
- fuente y precisión;
- índices espaciales;
- políticas RLS.

El cliente solicitará únicamente features dentro del viewport y período. Las
geometrías complejas no deben viajar completas en cada interacción.

## GIS futuro

La arquitectura queda preparada para:

- geolocalización con consentimiento;
- clustering;
- heatmaps reales;
- polígonos administrativos;
- rutas y trazas;
- capas WMS/WMTS;
- GeoJSON;
- teselas vectoriales;
- edición de geometrías;
- validación topológica;
- proyecciones y sistemas de referencia;
- importación desde fuentes oficiales.

Cada geometría deberá registrar precisión, fuente, licencia y fecha. Un punto
aproximado no debe presentarse como ubicación exacta.

## Estrategia offline

La PWA offline territorial requiere más que cachear tiles:

1. paquetes de mapa por municipio y nivel de zoom;
2. límites de almacenamiento visibles;
3. descarga explícita por zona;
4. cola local de actividades y evidencia;
5. identificadores temporales;
6. sincronización reintentable;
7. resolución de conflictos;
8. cifrado y cierre de sesión en dispositivos compartidos;
9. indicador claro de datos desactualizados;
10. política compatible con licencias de teselas.

OpenStreetMap no garantiza el uso masivo offline de su servidor público de
teselas. Producción deberá usar un proveedor compatible, teselas propias o
paquetes autorizados, manteniendo la atribución correspondiente.

## Integración futura con IA

La IA no tendrá acceso directo al mapa ni a la base espacial. Consumirá una
selección estructurada y limitada por tenant, viewport, período y permisos.

Casos posibles:

- resumir contexto de un barrio con referencias;
- comparar evolución entre períodos;
- detectar vacíos de cobertura;
- proponer preguntas para una recorrida;
- sintetizar historial de un compromiso.

Toda salida deberá citar features y versiones. La IA no inferirá características
sensibles de personas ni modificará geometrías o estados sin aprobación.

## Modo Presentación

El modo presentación oculta capas, timeline y panel lateral. Conserva:

- mapa;
- indicadores flotantes;
- controles mínimos para volver o restablecer la vista.

Está orientado a reuniones y permite usar el territorio como soporte visual sin
exponer controles operativos secundarios.

## Accesibilidad

- controles de capas con `aria-pressed`;
- timeline operable mediante teclado;
- botones con etiquetas explícitas;
- color acompañado por texto y símbolos;
- panel lateral como alternativa textual al mapa;
- selección de barrios disponible sin interactuar con geometrías;
- tamaños táctiles y diseño mobile first.

En una fase posterior se agregará una tabla equivalente de features para
usuarios que no puedan operar la superficie cartográfica.

## Compatibilidad

Se agregó `/territorio` y una entrada de navegación. No se eliminaron rutas,
entidades ni componentes existentes. Los barrios y actividades anteriores
siguen siendo la fuente conceptual; Mapa Vivo agrega una proyección GIS
especializada.
