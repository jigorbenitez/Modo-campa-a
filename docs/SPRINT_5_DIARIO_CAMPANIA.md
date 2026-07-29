# Sprint 5 — Diario de Campaña

## Objetivo

El Diario de Campaña implementa el primer flujo vertical completo de Modo
Campaña. Permite registrar una acción del equipo, capturar su contexto y sus
resultados, y verla inmediatamente dentro de una cronología expandible.

En este sprint se utilizan únicamente datos mock y estado de sesión. No existe
persistencia, autenticación, integración externa ni inteligencia artificial.

## Por qué Actividad pasa a ser el eje operativo

Problemas, propuestas, documentos y compromisos explican qué sabe o qué decide
la organización, pero no siempre conservan el momento en que ese conocimiento
apareció. `Actividad` aporta ese origen operativo.

Una actividad responde:

- qué hizo el equipo;
- cuándo y dónde ocurrió;
- quiénes participaron;
- qué se observó;
- qué problemas u oportunidades surgieron;
- qué compromisos fueron asumidos;
- qué evidencia quedó adjunta.

Esto permite reconstruir el trabajo sin depender de memoria individual ni
duplicar información en múltiples módulos.

## Decisión de arquitectura

`Actividad` se incorpora como un nuevo agregado sin reemplazar `Evento` ni
`Recorrida`.

- `Evento` representa agenda y planificación temporal.
- `Recorrida` representa una actividad territorial especializada.
- `Actividad` representa el registro operativo transversal y conecta los
  resultados generados.

Una actividad puede relacionarse con un evento planificado o una recorrida
territorial mediante `eventIds` y `tourIds`. Esta estrategia mantiene
compatibilidad con los sprints anteriores y permite una migración gradual.

También se incorpora `Oportunidad`, porque una posibilidad detectada no es un
problema ni una propuesta madura. Puede validarse, descartarse o convertirse en
una propuesta posteriormente.

## Agregado Actividad

La entidad incluye:

- identidad y `municipioId`;
- tipo, título y descripción;
- fecha y horario;
- estado e historial;
- barrios y ubicación;
- organización y participantes;
- observaciones;
- fotografías, videos y archivos;
- etiquetas y prioridad;
- relaciones con problemas, oportunidades, compromisos, propuestas, documentos,
  publicaciones, equipo, agenda y recorridas;
- metadatos de auditoría.

Todas las relaciones se almacenan por identificador. El modelo de lectura
`ActivityRecord` reúne temporalmente la información necesaria para mostrar el
contexto completo sin introducir grafos de dominio difíciles de persistir.

## Flujo implementado

El asistente divide la captura en seis pasos:

1. datos básicos de la actividad;
2. barrios, ubicación y etiquetas;
3. observaciones y participantes;
4. problemas, oportunidades y compromisos;
5. archivos y fotografías;
6. revisión y guardado.

La interfaz evita un formulario extenso, ofrece controles táctiles y permite
quitar elementos antes de guardar. Al completar el flujo se crean en memoria:

- la actividad;
- problemas detectados;
- oportunidades;
- compromisos;
- referencias entre estas entidades.

La nueva actividad aparece al inicio del Diario y se abre automáticamente.

## Componentes reutilizables

- `ActivityCard`: resumen expandible.
- `ActivityTimeline`: orden cronológico.
- `ActivityDetails`: contexto completo de una actividad.
- `ActivityWizard`: flujo asistido de captura.
- `ActivitySummary`: recuento contextual de resultados.
- `ParticipantBadge`: representación compacta de participantes.
- `AttachmentGallery`: evidencia adjunta.
- `LinkedEntitiesPanel`: problemas, oportunidades, compromisos, propuestas,
  documentos y publicaciones relacionados.

Los componentes consumen modelos tipados y no conocen repositorios ni
proveedores de datos.

## Mock data

El diario contiene cinco actividades realistas de San Fernando:

- recorrida por un centro comercial;
- reunión por iluminación barrial;
- visita a un club;
- charla en una universidad;
- encuentro con comerciantes.

Cada actividad posee relaciones diferentes para validar el comportamiento de
la interfaz con información completa y parcial.

## Evolución hacia persistencia

Cuando se incorpore Supabase, el guardado debe realizarse mediante un caso de
uso transaccional:

1. validar permisos y tenant;
2. crear la actividad;
3. crear problemas, oportunidades y compromisos;
4. vincular entidades;
5. almacenar archivos;
6. registrar auditoría;
7. publicar un evento de dominio.

Si una parte falla, la operación debe revertirse o quedar marcada como
incompleta para reintento. El componente `ActivityWizard` no debe llamar al
cliente de Supabase directamente.

## Crecimiento futuro

El modelo habilita:

- preparación y cierre de reuniones;
- captura offline con sincronización posterior;
- generación de briefs;
- reglas de inteligencia basadas en frecuencia y resultados;
- trazabilidad entre actividad y propuesta;
- seguimiento de compromisos;
- búsqueda por participantes, territorio o etiquetas;
- resúmenes asistidos con fuentes, cuando se incorpore IA;
- métricas de operación sin depender de resultados políticos.

La actividad no debe convertirse en un contenedor ilimitado. Las entidades
relacionadas conservan su propio ciclo de vida y responsabilidad. El Diario es
la cronología que las conecta, no su reemplazo.
