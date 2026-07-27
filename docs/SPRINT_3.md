# Sprint 3 — Centro de Inteligencia Estratégica

## Objetivo

El Centro de Inteligencia conecta información territorial, documental y
operativa para ofrecer contexto accionable. No es un chat, un sistema de IA ni
un dashboard de métricas aisladas. Cada cifra se acompaña de una interpretación
y, cuando corresponde, de un siguiente paso.

El módulo utiliza exclusivamente datos mock y no introduce persistencia,
integraciones externas ni decisiones automáticas.

## Arquitectura

Se implementó una vertical Feature First en `src/features/inteligencia`:

```text
features/inteligencia/
  domain/
    insight.ts
    rule.ts
  application/
    insight-service.ts
    rule-engine.ts
  rules/
    ...
```

Esta estructura es superior a ubicar cálculos dentro de componentes React:

- mantiene la UI libre de reglas de negocio;
- permite probar cada regla sin renderizar la aplicación;
- conserva el dominio del Sprint 2 como fuente única de verdad;
- permite reemplazar mocks por repositorios sin cambiar los componentes;
- evita acoplar la inteligencia derivada a Next.js o a una base de datos.

`IntelligenceSnapshot` es el modelo de entrada del módulo. Agrupa una fotografía
consistente de un municipio y conserva `municipioId` como límite de tenant.
`IntelligenceViewModel` es el modelo de lectura que consume la pantalla.

## Motor de reglas

`RuleEngine<TContext>` ejecuta una colección de `InsightRule<TContext>`. Cada
regla declara:

- identificador estable;
- descripción legible;
- función pura `evaluate`;
- cero o más insights como resultado.

El motor es determinista, no usa IA y aísla fallas: si una regla presenta un
error, las restantes continúan su evaluación. Además registra duración y
cantidad de resultados por regla, dejando preparada la observabilidad futura.

Las reglas iniciales detectan:

- barrios sin recorridas durante 30 días;
- concentraciones de problemas de una misma categoría por barrio;
- propuestas activas con etiquetas compartidas;
- documentos sin clasificar o sin texto disponible;
- compromisos vencidos;
- propuestas sin indicadores o área responsable.

Agregar una regla requiere implementar `InsightRule`, incluir evidencia y
referencias de dominio, y registrarla en la composición de `InsightService`.
No es necesario modificar el motor.

## Generación de insights

Un `Insight` contiene:

- regla que lo originó;
- categoría y severidad;
- título y explicación;
- acción sugerida opcional;
- evidencia textual;
- referencias a entidades del dominio;
- fecha de generación.

Esto garantiza explicabilidad. El usuario puede entender por qué apareció una
alerta y cuáles son los datos relacionados. Los insights son derivados y no se
persisten en este sprint.

`InsightService` coordina el motor y genera también:

- resúmenes estratégicos por área;
- métricas contextualizadas;
- actividad reciente normalizada;
- prioridades operativas;
- lectura general del estado.

## Componentes reutilizables

La interfaz se compone con piezas independientes:

- `InsightCard`: insight explicable con severidad y acción.
- `MetricCard`: métrica acompañada de contexto y tono.
- `TrendCard`: cambio operativo favorable o desfavorable.
- `ActivityCard`: evento normalizado de la línea de tiempo.
- `WarningCard`: presentación específica para alertas.
- `Timeline`: secuencia cronológica reutilizable.
- `RecentActivity`: composición de actividad conectada.
- `PriorityList`: lista accionable con nivel y destino.
- `QuickActions`: accesos a flujos existentes.
- `StrategicAreaCard`: composición de estado por dominio.

Los componentes reciben modelos tipados y no acceden directamente a mocks,
repositorios ni reglas.

## Datos mock

`src/mock/inteligencia.mock.ts` incorpora un escenario municipal ficticio con
barrios, problemas, propuestas, documentos, recorridas, reuniones, compromisos
y equipo. Los datos usan las entidades del Sprint 2 y están relacionados
mediante identificadores reales del mock.

La fecha de referencia es fija para que las reglas produzcan resultados
repetibles durante desarrollo y pruebas.

## Escalabilidad

### Persistencia

Cuando se integre Supabase, un caso de uso deberá construir
`IntelligenceSnapshot` mediante repositorios del dominio. Ni el motor, ni las
reglas, ni los componentes necesitan conocer el proveedor de datos.

### Nuevas áreas

Una nueva área estratégica puede agregarse extendiendo `InsightCategory`,
creando sus reglas y componiendo su `StrategicArea`. No requiere modificar las
entidades que no participan.

### Configuración por municipio

Los umbrales —por ejemplo, 30 días sin recorridas o tres problemas de una misma
categoría— podrán extraerse a una política configurable por `municipioId`. La
interfaz de las reglas admite recibir ese contexto sin cambiar el motor.

### IA futura

La IA no reemplazará este motor. Las reglas deterministas seguirán siendo la
fuente de alertas auditables. Un futuro agente podrá consumir insights como
contexto o proponer interpretaciones adicionales mediante los contratos del
Sprint 2, siempre con referencias y aprobación humana.

## Compatibilidad

Se agregó la ruta `/inteligencia` y una entrada de navegación. No se cambiaron
las rutas, contratos ni pantallas existentes. El módulo mantiene tema
claro/oscuro, navegación responsive y los mismos tokens visuales del producto.
