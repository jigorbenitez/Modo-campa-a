# Sprint 5 â€” Diario de CampaÃ±a

## Objetivo

El Diario de CampaÃ±a implementa el primer flujo vertical completo de Modo
CampaÃ±a. Permite registrar una acciÃ³n del equipo, capturar su contexto y sus
resultados, y verla inmediatamente dentro de una cronologÃ­a expandible.

En este sprint se utilizan Ãºnicamente datos mock y estado de sesiÃ³n. No existe
persistencia, autenticaciÃ³n, integraciÃ³n externa ni inteligencia artificial.

## Por quÃ© Actividad pasa a ser el eje operativo

Problemas, propuestas, documentos y compromisos explican quÃ© sabe o quÃ© decide
la organizaciÃ³n, pero no siempre conservan el momento en que ese conocimiento
apareciÃ³. `Actividad` aporta ese origen operativo.

Una actividad responde:

- quÃ© hizo el equipo;
- cuÃ¡ndo y dÃ³nde ocurriÃ³;
- quiÃ©nes participaron;
- quÃ© se observÃ³;
- quÃ© problemas u oportunidades surgieron;
- quÃ© compromisos fueron asumidos;
- quÃ© evidencia quedÃ³ adjunta.

Esto permite reconstruir el trabajo sin depender de memoria individual ni
duplicar informaciÃ³n en mÃºltiples mÃ³dulos.

## DecisiÃ³n de arquitectura

`Actividad` se incorpora como un nuevo agregado sin reemplazar `Evento` ni
`Recorrida`.

- `Evento` representa agenda y planificaciÃ³n temporal.
- `Recorrida` representa una actividad territorial especializada.
- `Actividad` representa el registro operativo transversal y conecta los
  resultados generados.

Una actividad puede relacionarse con un evento planificado o una recorrida
territorial mediante `eventIds` y `tourIds`. Esta estrategia mantiene
compatibilidad con los sprints anteriores y permite una migraciÃ³n gradual.

TambiÃ©n se incorpora `Oportunidad`, porque una posibilidad detectada no es un
problema ni una propuesta madura. Puede validarse, descartarse o convertirse en
una propuesta posteriormente.

## Agregado Actividad

La entidad incluye:

- identidad y `municipioId`;
- tipo, tÃ­tulo y descripciÃ³n;
- fecha y horario;
- estado e historial;
- barrios y ubicaciÃ³n;
- organizaciÃ³n y participantes;
- observaciones;
- fotografÃ­as, videos y archivos;
- etiquetas y prioridad;
- relaciones con problemas, oportunidades, compromisos, propuestas, documentos,
  publicaciones, equipo, agenda y recorridas;
- metadatos de auditorÃ­a.

Todas las relaciones se almacenan por identificador. El modelo de lectura
`ActivityRecord` reÃºne temporalmente la informaciÃ³n necesaria para mostrar el
contexto completo sin introducir grafos de dominio difÃ­ciles de persistir.

## Flujo implementado

El asistente divide la captura en seis pasos:

1. datos bÃ¡sicos de la actividad;
2. barrios, ubicaciÃ³n y etiquetas;
3. observaciones y participantes;
4. problemas, oportunidades y compromisos;
5. archivos y fotografÃ­as;
6. revisiÃ³n y guardado.

La interfaz evita un formulario extenso, ofrece controles tÃ¡ctiles y permite
quitar elementos antes de guardar. Al completar el flujo se crean en memoria:

- la actividad;
- problemas detectados;
- oportunidades;
- compromisos;
- referencias entre estas entidades.

La nueva actividad aparece al inicio del Diario y se abre automÃ¡ticamente.

## Componentes reutilizables

- `ActivityCard`: resumen expandible.
- `ActivityTimeline`: orden cronolÃ³gico.
- `ActivityDetails`: contexto completo de una actividad.
- `ActivityWizard`: flujo asistido de captura.
- `ActivitySummary`: recuento contextual de resultados.
- `ParticipantBadge`: representaciÃ³n compacta de participantes.
- `AttachmentGallery`: evidencia adjunta.
- `LinkedEntitiesPanel`: problemas, oportunidades, compromisos, propuestas,
  documentos y publicaciones relacionados.

Los componentes consumen modelos tipados y no conocen repositorios ni
proveedores de datos.

## Mock data

El diario contiene cinco actividades realistas de San Fernando:

- recorrida por un centro comercial;
- reuniÃ³n por iluminaciÃ³n barrial;
- visita a un club;
- charla en una universidad;
- encuentro con comerciantes.

Cada actividad posee relaciones diferentes para validar el comportamiento de
la interfaz con informaciÃ³n completa y parcial.

## EvoluciÃ³n hacia persistencia

Cuando se incorpore Supabase, el guardado debe realizarse mediante un caso de
uso transaccional:

1. validar permisos y tenant;
2. crear la actividad;
3. crear problemas, oportunidades y compromisos;
4. vincular entidades;
5. almacenar archivos;
6. registrar auditorÃ­a;
7. publicar un evento de dominio.

Si una parte falla, la operaciÃ³n debe revertirse o quedar marcada como
incompleta para reintento. El componente `ActivityWizard` no debe llamar al
cliente de Supabase directamente.

## Crecimiento futuro

El modelo habilita:

- preparaciÃ³n y cierre de reuniones;
- captura offline con sincronizaciÃ³n posterior;
- generaciÃ³n de briefs;
- reglas de inteligencia basadas en frecuencia y resultados;
- trazabilidad entre actividad y propuesta;
- seguimiento de compromisos;
- bÃºsqueda por participantes, territorio o etiquetas;
- resÃºmenes asistidos con fuentes, cuando se incorpore IA;
- mÃ©tricas de operaciÃ³n sin depender de resultados polÃ­ticos.

La actividad no debe convertirse en un contenedor ilimitado. Las entidades
relacionadas conservan su propio ciclo de vida y responsabilidad. El Diario es
la cronologÃ­a que las conecta, no su reemplazo.
