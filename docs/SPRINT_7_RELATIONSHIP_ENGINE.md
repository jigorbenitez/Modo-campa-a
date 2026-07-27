# Sprint 7 — Motor de Relaciones y Memoria Institucional

## Objetivo

El Motor de Relaciones transforma las entidades independientes de ATIY
en una red navegable de conocimiento. Cada entidad puede responder:

> ¿Con qué otras cosas está relacionada y por qué?

El motor utiliza reglas del dominio y relaciones explícitas. No utiliza
inteligencia artificial, embeddings ni una base de datos de grafos.

## Modelo de relaciones

La arquitectura distingue dos modelos:

1. **Modelo transaccional DDD:** entidades como `Actividad`, `Barrio`,
   `Documento`, `Problema` o `Compromiso`. Es la fuente de verdad operativa.
2. **Proyección de conocimiento:** nodos y conexiones normalizadas, optimizadas
   para explorar contexto.

No se agregaron arrays genéricos de relaciones a cada entidad. Esa solución
parece directa, pero acoplaría el dominio, duplicaría referencias y haría difícil
explicar cómo apareció una conexión.

### KnowledgeNode

Representa cualquier entidad dentro de la memoria institucional:

- identidad y municipio;
- tipo;
- título y resumen;
- estado y fecha;
- barrios, instituciones y personas declaradas;
- etiquetas;
- metadatos;
- historial.

### KnowledgeEdge

Representa una relación:

- origen y destino;
- tipo y etiqueta legible;
- peso;
- origen explícito o inferido por regla;
- evidencia;
- fecha.

Cada conexión conserva explicación. La interfaz nunca necesita adivinar por qué
dos elementos están relacionados.

## RelationshipEngine

El servicio central:

- ejecuta reglas de descubrimiento;
- integra conexiones explícitas;
- descarta referencias inexistentes;
- impide conexiones entre municipios;
- elimina duplicados;
- conserva la relación más fuerte o explícita;
- obtiene el contexto completo;
- agrupa entidades relacionadas;
- construye cronologías;
- calcula conexiones por tipo;
- resuelve URLs de navegación cruzada.

El servicio no importa React, Next.js ni mocks. Puede ejecutarse en cliente,
servidor, procesos en segundo plano o pruebas.

## Reglas implementadas

### Relación geográfica

Vincula una entidad con los barrios declarados en `barrioIds`.

Ejemplos:

- una actividad ocurrió en Centro;
- una institución se encuentra en Estación;
- una propuesta está vinculada con Los Aromos.

### Participación

Conecta personas y actividades cuando una actividad declara `personIds`.

### Relación institucional

Conecta personas con instituciones y actividades con las organizaciones
involucradas.

### Tema compartido

Conecta problemas, propuestas, oportunidades y documentos cuando comparten
etiquetas. Estas conexiones tienen menor peso que una relación explícita y
declaran las etiquetas usadas como evidencia.

### Secuencia territorial

Conecta una actividad con la actividad anterior del mismo barrio. Permite
reconstruir continuidad sin reemplazar la cronología.

### Relaciones explícitas

El snapshot declara relaciones confirmadas:

- problema detectado en actividad;
- compromiso generado;
- documento de soporte;
- propuesta fundamentada;
- publicación producida;
- institución documentada.

Las relaciones explícitas tienen prioridad durante la deduplicación.

## Fichas vivas

`EntityContext` compone una ficha completa con:

- información general;
- conexiones;
- grupos por entidad;
- actividad reciente;
- cronología institucional;
- enlaces rápidos;
- total de conexiones.

La misma estructura funciona para barrios, instituciones, personas, actividades,
documentos, problemas, compromisos y propuestas.

La ruta `/relaciones` implementa:

- búsqueda por título, resumen y etiqueta;
- filtros por tipo;
- catálogo ordenado por conectividad;
- ficha viva;
- mapa de relaciones inmediato;
- paneles agrupados;
- timeline;
- sidebar contextual;
- navegación natural entre nodos.

La URL se actualiza con `?entity=<id>`, por lo que el contexto puede enlazarse
directamente.

## Nuevas entidades

### Institución

Modela escuelas, universidades, clubes, centros de salud, comercios,
organizaciones sociales y dependencias públicas. Conserva barrio, personas de
contacto, actividades, problemas, compromisos, propuestas y documentos.

### Persona

Modela una persona relacionada con finalidad operativa y datos mínimos:

- nombre visible;
- rol;
- instituciones;
- barrios;
- actividades;
- compromisos.

Los datos mock son ficticios. En producción, Persona requerirá políticas de
finalidad, acceso, conservación y auditoría.

## Mock data

La memoria de Villa del Encuentro incluye:

- tres barrios;
- siete actividades;
- escuela;
- universidad;
- club;
- centro de salud;
- cámara comercial;
- organización social;
- seis personas ficticias;
- problemas;
- oportunidades;
- compromisos;
- propuestas;
- publicaciones;
- cuatro documentos coherentes.

Las conexiones fueron construidas para que cada ficha muestre contextos
diferentes y para validar relaciones explícitas e inferidas.

## Escalabilidad

La implementación en memoria es apropiada para mocks. La evolución recomendada:

### Primera etapa: base relacional

- entidades en tablas normales;
- tabla `entity_relationships`;
- índices por tenant, origen, destino y tipo;
- restricciones de unicidad;
- consultas por profundidad limitada;
- auditoría de creación y eliminación.

### Segunda etapa: proyección de conocimiento

- generación incremental ante eventos de dominio;
- tabla o vista materializada de nodos;
- cola de recalculo;
- caché por entidad y versión;
- reglas versionadas;
- métricas de calidad y cardinalidad.

### Tercera etapa: grafo especializado

Una base de grafos sólo se justifica cuando consultas multi-salto reales no
puedan resolverse de forma eficiente con PostgreSQL. Postgres puede soportar la
primera escala mediante relaciones, CTE recursivos e índices.

El contrato `KnowledgeNode`/`KnowledgeEdge` permite incorporar Neo4j, Apache
AGE u otra proyección sin modificar componentes.

## Rendimiento

Para miles o millones de relaciones:

- no recalcular todo el snapshot en cada petición;
- ejecutar reglas sólo para entidades modificadas;
- limitar profundidad;
- paginar grupos;
- almacenar grados y resúmenes;
- detectar nodos de cardinalidad excesiva;
- enviar al cliente únicamente el subgrafo visible;
- renderizar visualizaciones grandes mediante Canvas o WebGL;
- medir reglas y consultas por tenant.

## Memoria institucional de varios años

La memoria debe ser temporal, no sólo relacional. Cada nodo y conexión requiere:

- vigencia;
- fecha de observación;
- fuente;
- versión;
- actor;
- evidencia;
- estado histórico.

Los cambios no deben sobrescribir el pasado silenciosamente. Las fichas deben
poder reconstruirse “como se conocían” en una fecha determinada.

## Integración futura con búsqueda semántica

La búsqueda semántica será otra fuente de candidatos, no una relación
confirmada. Sus resultados deberán:

- respetar tenant y permisos;
- citar fragmentos;
- declarar similitud;
- exigir confirmación si se convierten en relación persistente;
- invalidarse al cambiar documentos;
- diferenciar semejanza textual de relación institucional.

## Integración futura con IA

Los agentes consumirán `EntityContext` o un subgrafo acotado, nunca el grafo
completo. El contexto incluirá referencias, evidencia, versiones y permisos.

Casos futuros:

- resumir memoria de una institución;
- preparar una reunión;
- explicar evolución de un problema;
- sugerir conexiones candidatas;
- detectar vacíos de documentación.

La IA no creará relaciones confirmadas de forma autónoma. Podrá producir
`RelationshipCandidate` con evidencia y confianza para aprobación humana.

## Beneficios

- evita reconstruir contexto manualmente;
- reduce duplicación;
- conecta territorio con decisiones;
- conserva origen de problemas y compromisos;
- mejora preparación de reuniones;
- permite navegar sin volver al menú;
- prepara búsqueda y asistentes contextuales;
- transforma datos acumulados en memoria reutilizable.

## Accesibilidad y mobile first

El “grafo” inicial es una representación accesible mediante tarjetas y botones,
no una visualización compleja que dependa de precisión motriz. Toda conexión
puede explorarse como lista agrupada.

- búsqueda etiquetada;
- filtros con `aria-pressed`;
- navegación mediante botones;
- jerarquía semántica;
- diseño de una columna en móvil;
- información no dependiente del color.

Una visualización gráfica futura deberá conservar esta alternativa textual.

## Compatibilidad

Se agregó `/relaciones`, `Institucion`, `Persona` y la proyección de
conocimiento. No se modificaron rutas o componentes existentes. El motor utiliza
datos mock y queda desacoplado de la interfaz, Supabase e IA.

