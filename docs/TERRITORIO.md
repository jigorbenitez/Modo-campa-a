# Motor Territorial ATIY

## Propósito

El Motor Territorial establece la base para organizar lugares, servicios, instituciones, movilidad y puntos de interés de múltiples municipios. Este sprint incorpora arquitectura y experiencia vacía: no importa datasets, no crea registros ficticios y no modifica el Mapa Vivo existente.

La entrada principal es `/territorio/entidades`. El Mapa Vivo continúa en `/territorio`.

## Arquitectura

El módulo se encuentra en `src/features/territorial-engine` y respeta cuatro capas:

```text
presentation
    ↓
application
    ↓
domain
    ↑
infrastructure
```

### Domain

Contiene:

- `TerritorialEntity`, agregado multi-municipio.
- Tipos y estados territoriales.
- Dirección, horarios, coordenadas y metadata extensible.
- Contratos separados de lectura y escritura.
- Consulta territorial paginada.
- Referencias de relaciones futuras.

El dominio no importa React, Leaflet, Supabase, PostGIS ni formatos de archivo.

### Application

Contiene:

- `TerritorialSearchService`.
- Puerto y registro de importadores.
- Proyección cartográfica.
- Contrato de clustering.
- Cálculo inicial de zoom sugerido.
- Definiciones de filtros reutilizables.

Los servicios reciben interfaces de repositorio; nunca construyen consultas de infraestructura.

### Infrastructure

`EmptyTerritorialEntityRepository` es el adaptador inicial. Responde consultas válidas con resultados vacíos y rechaza explícitamente escrituras hasta que Sprint 13 habilite persistencia.

`DefaultTerritorialImportRegistry` permite registrar importadores CSV, JSON y GeoJSON de forma independiente. En este sprint no contiene parsers ni procesa archivos.

El reemplazo futuro esperado será:

```text
TerritorialEntityRepository
  ├─ SupabaseTerritorialEntityRepository
  ├─ PostGISTerritorialEntityRepository
  └─ OfflineTerritorialEntityRepository
```

### Presentation

Incluye:

- Directorio responsive.
- Búsqueda de texto libre.
- Filtros por tipo, categoría, localidad y barrio.
- Estado vacío intencional.
- Resumen de capas cartográficas preparadas.
- Ficha de entidad.
- Placeholders de documentos, relaciones, actividad futura y fotografías.

La presentación recibe entidades y definiciones ya resueltas. No conoce consultas SQL ni SDKs.

## Modelo territorial

`TerritorialEntity` soporta:

- identidad y `municipalityId`;
- nombre, tipo, categoría y subcategoría;
- descripción;
- dirección estructurada;
- latitud y longitud opcionales;
- localidad y barrio por identificador y nombre de lectura;
- teléfono, email y sitio web;
- horarios estructurados por zona horaria;
- observaciones;
- etiquetas;
- estado;
- fechas de creación y actualización;
- metadata abierta.

Los tipos iniciales cubren localidades, barrios, educación, clubes, salud, espacios públicos, dependencias municipales, instituciones, organizaciones, estaciones, transporte, comercios, centros comerciales, lugares religiosos y puntos de interés.

No se utiliza herencia por tipo. Las diferencias específicas pueden incorporarse en metadata validada o en proyecciones especializadas sin fragmentar el agregado.

## Relaciones futuras

La entidad territorial no contiene arreglos de personas, actividades o documentos. Las conexiones se representan mediante `TerritorialRelationReference`, fuera del agregado.

Esto permite vincular posteriormente:

- personas;
- reuniones;
- recorridos;
- actividades;
- problemas;
- proyectos;
- fotografías;
- documentos;
- compromisos;
- campañas;
- eventos.

El Motor de Relaciones puede resolver esas referencias sin migrar o reescribir la entidad territorial.

## Flujo de búsqueda

```text
Texto y filtros
  ↓
TerritorialSearchInput
  ↓
TerritorialSearchService
  ↓
TerritorialEntityReader.search
  ↓
Página de resultados
```

La consulta admite nombre, categoría, barrio, localidad, texto libre, tipos, estados, bounds geográficos y paginación. El adaptador vacío devuelve la misma estructura con cero resultados, por lo que la interfaz funciona antes de incorporar datos.

En producción, la búsqueda textual podrá usar índices `GIN`/`pg_trgm` y los filtros espaciales índices `GiST`.

## Capas y mapa

`TerritorialMapProjectionService` convierte entidades con coordenadas en puntos agnósticos de Leaflet. Las capas preparadas son:

- Educación.
- Salud.
- Comunidad.
- Espacio público.
- Transporte.
- Comercio.
- Municipio.
- Lugares.

Cada capa define un token de color y una clave de icono. La proyección excluye entidades sin coordenadas sin descartar sus fichas o relaciones.

El contrato `TerritorialClusterStrategy` permite incorporar clustering sin acoplar el dominio a una librería. `suggestedZoom` brinda una primera estrategia basada en extensión geográfica.

El directorio enlaza al Mapa Vivo y las fichas podrán abrir su ubicación allí. No se insertan capas vacías dentro del mapa actual para evitar renders y preservar su comportamiento.

## Importadores

`TerritorialImporter` define el contrato común para CSV, JSON y GeoJSON:

- fuente y formato;
- municipio destino;
- opciones de codificación, delimitador y CRS;
- preview normalizado;
- incidencias por fila y campo;
- cantidad de filas válidas.

Sprint 13 podrá implementar cada parser por separado y registrar el adaptador en `DefaultTerritorialImportRegistry`.

Antes de persistir, el flujo recomendado es:

1. Leer archivo.
2. Detectar o confirmar esquema.
3. Normalizar texto y coordenadas.
4. Validar campos.
5. Mostrar preview.
6. Detectar duplicados.
7. Confirmar importación.
8. Persistir por lotes con auditoría.

## Rendimiento y escala

- Rutas independientes para code splitting.
- `loading.tsx` para carga diferida.
- `useDeferredValue` para búsqueda fluida.
- `useMemo` para proyecciones locales.
- Paginación desde el contrato.
- Límite máximo de página.
- Filtro espacial por bounds.
- Proyección cartográfica sin objetos Leaflet.
- Contrato de clustering intercambiable.
- Escritura masiva prevista mediante `saveMany`.

Para miles de registros, el servidor debe devolver únicamente el viewport o cluster requerido y nunca transferir el dataset completo al navegador.

## Multi-municipio y seguridad

Toda lectura o escritura recibe `municipalityId`. La implementación futura debe reforzar este filtro mediante RLS y memberships, siguiendo Sprint 8. El identificador enviado por el cliente no reemplaza las políticas de base de datos.

## Experiencia vacía

La aplicación no confunde falta de datos con error:

- el buscador permanece disponible;
- los filtros muestran el catálogo de tipos y opciones dinámicas vacías;
- el contador indica cero entidades;
- la ficha de un identificador inexistente explica el estado;
- la acción de importar permanece deshabilitada;
- el usuario puede volver al mapa actual.

## Extensión prevista para Sprint 13

1. Migración de tabla territorial con índices espaciales.
2. Adaptador Supabase/PostGIS.
3. Importadores concretos.
4. Deduplicación y normalización.
5. Capas Leaflet cargadas por viewport.
6. Clustering en cliente o servidor según volumen.
7. Vinculación con el Motor de Relaciones.
8. Caché offline por municipio.

Esta evolución no requiere modificar `TerritorialEntity`, los componentes de búsqueda ni las rutas creadas en este sprint.
