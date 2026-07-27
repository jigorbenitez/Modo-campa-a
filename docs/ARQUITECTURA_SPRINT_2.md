# Arquitectura Sprint 2 — Núcleo de Modo Campaña

## 1. Filosofía del producto

Modo Campaña se modela como un sistema operativo para campañas electorales y
gestión pública. La interfaz actual es una de sus posibles superficies, pero el
activo central es el dominio: información municipal consistente, trazable y
reutilizable por personas, automatizaciones y futuros agentes.

El sistema es multi-municipio desde el núcleo. `Municipio` es el tenant raíz y
toda entidad operativa implementa `TenantScoped`, por lo que debe incluir
`municipioId`. Ninguna consulta o mutación de datos puede omitir ese límite.

## 2. Arquitectura elegida

Se adoptó una arquitectura híbrida:

- **DDD** para modelar el lenguaje y las relaciones del gobierno local.
- **Clean Architecture** para que el dominio no dependa de Next.js, Supabase,
  una librería de validación ni un proveedor de IA.
- **Feature First** como fachada de consumo para cada capacidad del producto.
- **Puertos y adaptadores** para persistencia, validación e integración futura.

Esta combinación es preferible a una estructura exclusivamente técnica o
exclusivamente feature-first. Las entidades compartidas deben tener una sola
definición canónica; duplicarlas dentro de cada feature generaría divergencias.
Por eso `domain/` es la fuente de verdad y `features/` reexporta únicamente los
contratos que necesita cada módulo.

## 3. Capas y dependencias

```text
app / components
        ↓
features
        ↓
application (casos de uso y contratos de servicios)
        ↓
domain (entidades, reglas y repositorios)

infrastructure / mock → implementan puertos, nunca son importados por domain
```

Reglas:

1. `domain` no importa React, Next.js, Supabase ni infraestructura.
2. `application` coordina contratos del dominio y devuelve `ServiceResult`.
3. `features` ofrece una API pública pequeña para cada módulo.
4. `app` y `components` pueden consumir features, no implementan reglas.
5. Los adaptadores futuros implementarán repositorios y gateways.

## 4. Organización del dominio

### Entidades

- `Municipio`: agregado raíz institucional y configuración del tenant.
- `Barrio`: unidad territorial con demografía, mapa, problemas, fortalezas,
  proyectos, recorridas, referentes, indicadores y documentos.
- `Problema`: hallazgo clasificable con evidencia, ubicación e historial.
- `Propuesta`: política pública vinculada con diagnóstico, beneficiarios,
  indicadores, costo, áreas responsables y evidencia documental.
- `Secretaria`: estructura administrativa, competencias y organigrama.
- `Documento`: pieza normativa o técnica con etiquetas y relaciones dirigidas.
- `Recorrida`: actividad territorial y sus observaciones, hallazgos y compromisos.
- `Evento`: agenda general de reuniones, actos, sesiones y visitas.
- `Compromiso`: unidad de seguimiento con responsable e historial de estados.
- `Publicacion`: contenido multicanal con variantes por plataforma.
- `Equipo`: miembros, áreas, roles y permisos preparados para autorización.

Las relaciones se expresan principalmente mediante identificadores. Esto evita
grafos de objetos difíciles de persistir y permite cargar sólo la información
necesaria. `AuditMetadata` aporta versionado optimista y trazabilidad futura.

### Repositorios

`src/domain/repositories` contiene sólo interfaces. Todo acceso exige
`municipioId`, salvo el repositorio de municipios, que administra el catálogo
de tenants. Los filtros son específicos por agregado y admiten paginación.

No existe implementación de base de datos en este sprint.

### Servicios de aplicación

`src/application/services` define los contratos para territorio, campaña,
documentos, comunicación, marketing, equipo, agenda y municipio. No contienen
IA ni reglas especulativas. `ServiceContext` lleva el tenant, actor y
correlation ID; `ServiceResult` hace explícitos errores esperables.

## 5. Escalabilidad

- Los módulos se activan por municipio mediante `enabledModules`.
- Los IDs no dependen de una tecnología de base de datos.
- Fechas, dinero, geografía, métricas y auditoría usan tipos compartidos.
- La persistencia queda detrás de repositorios.
- Los contratos de servicios permiten UI web, procesos en segundo plano o APIs.
- El versionado de entidades prepara concurrencia y auditoría.

Para alto volumen, cada repositorio podrá implementar paginación por cursor sin
cambiar las entidades. Las búsquedas documentales podrán vivir en un adaptador
especializado manteniendo `DocumentoRepository` como puerto del dominio.

## 6. Cómo agregar un módulo

1. Identificar el lenguaje del negocio y los agregados involucrados.
2. Agregar o extender entidades en `domain/entities` sin dependencias externas.
3. Definir puertos de persistencia en `domain/repositories`.
4. Definir casos de uso o contratos en `application/services`.
5. Crear `features/<modulo>/index.ts` con su API pública.
6. Implementar adaptadores y UI en capas externas.
7. Agregar pruebas de dominio y contratos antes de conectar datos reales.

Una feature no debe redeclarar una entidad existente.

## 7. Cómo agregar un municipio

1. Crear un registro `Municipio` con configuración, zona horaria y módulos.
2. Crear usuarios y membresías vinculadas al nuevo `municipioId`.
3. Importar barrios, secretarías y documentos siempre dentro de ese tenant.
4. Configurar marca y módulos sin bifurcar el código.
5. Aplicar aislamiento por tenant en cada repositorio y política de base de datos.

La personalización se basa en configuración y contenido; no en copias del
proyecto por municipio.

## 8. Integración futura con Supabase

Supabase debe incorporarse como infraestructura:

```text
src/infrastructure/supabase/
  client/
  mappers/
  repositories/
```

Cada tabla incluirá `municipio_id`, timestamps y versión. Row Level Security
deberá validar la membresía del usuario en el municipio activo. Los mappers
traducirán `snake_case` de base de datos a entidades del dominio. Las clases
`SupabaseBarrioRepository`, `SupabaseDocumentoRepository`, etc. implementarán
los puertos existentes; servicios y UI no conocerán el cliente de Supabase.

La autenticación se agregará por separado. La identidad autenticada no equivale
a autorización: roles, permisos y tenant activo deben evaluarse en cada caso de
uso y reforzarse mediante RLS.

## 9. Integración futura con IA

La IA será un adaptador, no una regla del dominio. Un modelo nunca recibirá
acceso directo a la base de datos ni modificará agregados sin pasar por casos de
uso. `AgentTask` transporta objetivo, referencias de dominio y alcance;
`AgentSuggestion` devuelve una propuesta trazable y siempre exige aprobación
humana.

El contexto debe construirse desde repositorios usando `municipioId`, referencias
y versiones. Las salidas estructuradas se validarán mediante el puerto
`Schema<T>` antes de transformarse en comandos de aplicación.

## 10. Sistema multiagente

Los tipos de agentes previstos están definidos en `config/agents.ts`. Todos
comparten:

- el mismo dominio canónico;
- un `AgentExecutionContext` con municipio y capacidades;
- referencias por entidad y versión;
- correlation ID para trazabilidad;
- resultados en forma de sugerencias, no mutaciones directas.

Un futuro orquestador dividirá tareas, recuperará contexto y llamará a un
`AgentGateway`. La autorización se expresará con `AgentCapability` por recurso y
acción. Esto evita que cada agente mantenga su propia copia de la información y
permite auditar qué evidencia sustentó cada recomendación.

## 11. Datos mock

`src/mock` contiene un municipio ficticio argentino, barrios, un problema, una
recorrida y una propuesta coherentes entre sí. No implementa repositorios ni
lógica de negocio; sirve como fixture inicial para pruebas y prototipos.

Los nombres de personas fueron deliberadamente omitidos. Los mocks no deben
confundirse con datos productivos ni convertirse en dependencias del dominio.

## 12. Compatibilidad con Sprint 1

Este sprint no modifica rutas, componentes, navegación, estilos ni PWA. La capa
nueva es aditiva y todavía no está conectada a la interfaz. Esto permite validar
el diseño del dominio sin introducir regresiones funcionales.
