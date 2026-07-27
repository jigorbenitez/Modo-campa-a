# Sprint 8 — Plataforma colaborativa

## Resultado

Este sprint incorpora una infraestructura real de autenticación, persistencia, permisos y auditoría sin trasladar conceptos de Supabase al dominio. El prototipo conserva sus repositorios mock como mecanismo de transición y puede activarse contra Supabase mediante configuración, sin cambiar las entidades ni los componentes de negocio.

## Arquitectura

La dirección de dependencias es:

```text
React / Next.js
      ↓
Servicios de aplicación y autorización
      ↓
Contratos de repositorio y autenticación
      ↓
Adaptadores de infraestructura
      ↓
Supabase (Auth + PostgreSQL + RLS)
```

- `src/domain` contiene `Usuario`, roles y contratos de repositorio. No importa SDKs externos.
- `src/application/auth` define el contrato de autenticación y la matriz de permisos.
- `src/infrastructure/supabase` concentra clientes, contexto de sesión y adaptadores.
- Los componentes React consumen servicios o contexto; no ejecutan SQL.
- `supabase/migrations` es la fuente versionada del esquema y sus políticas.

La aplicación continúa operativa sin variables de Supabase. En ese caso usa el contexto demostrativo y los datos mock existentes. Con las variables configuradas, el middleware refresca la sesión, protege rutas y los adaptadores quedan disponibles para la migración progresiva.

## Integración con Supabase

Variables requeridas:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Los clientes se dividen por entorno:

- Cliente de navegador para login, registro, recuperación, actualización de contraseña y cierre de sesión.
- Cliente de servidor para obtener el usuario verificado, su perfil y datos administrativos.
- Proxy de Next.js para refrescar cookies y redirigir visitantes no autenticados.
- Ruta `/auth/callback` para completar intercambios PKCE y futuros proveedores OAuth.

No se incluye una `service_role` en la aplicación. Las operaciones normales usan la sesión del usuario y quedan sujetas a RLS.

## Flujo de autenticación

1. El usuario se registra con nombre, apellido, correo, contraseña y nombre inicial del municipio.
2. Supabase Auth crea la identidad.
3. Un trigger crea el perfil desacoplado.
4. La función `bootstrap_municipality` crea el municipio inicial y la membresía administrativa cuando corresponde.
5. El proxy mantiene la sesión y bloquea rutas privadas.
6. Los datos de `/mi-cuenta` se resuelven en servidor desde la sesión verificada.
7. Recuperación y cambio de contraseña utilizan el callback seguro previsto por Supabase.

La estructura está preparada para sumar Google o Microsoft OAuth usando el mismo callback, sin modificar el dominio.

## Usuario, roles y permisos

`Usuario` contiene:

- Identidad y `municipioId`.
- Nombre, apellido, correo y avatar.
- Rol y estado.
- Fecha de alta y último acceso.
- Preferencias.
- Metadatos de auditoría.

Los roles iniciales son Administrador, Coordinador, Responsable Territorial, Responsable Institucional, Voluntario, Consultor, Invitado y Solo lectura.

La autorización se aplica en tres niveles:

1. **Interfaz:** `PermissionGate` permite ocultar o deshabilitar acciones.
2. **Aplicación:** `AuthorizationService.assert` protege casos de uso y accesos administrativos.
3. **Base:** `has_permission` y las policies RLS son la autoridad final.

Ocultar una acción en React es una mejora de UX, no una barrera de seguridad. La política de base siempre decide si la operación está permitida.

## Modelo de datos

La migración crea:

- `municipalities`
- `user_profiles`
- `municipality_memberships`
- `role_permissions`
- `activities`
- `neighborhoods`
- `problems`
- `opportunities`
- `commitments`
- `proposals`
- `institutions`
- `people`
- `documents`
- `activity_neighborhoods`
- `entity_relationships`
- `audit_logs`

Los nueve agregados priorizados conservan un documento `aggregate` JSONB junto con columnas estables para identidad, municipio, estado, fechas y relaciones principales. Esto permite persistir las entidades actuales sin reescribir el dominio y promover gradualmente campos consultados a columnas normalizadas.

Cada tabla multi-municipio incluye `municipality_id`, índices por municipio y restricciones de integridad. Las relaciones usan claves foráneas cuando la estabilidad del vínculo ya está definida.

## Aislamiento multi-municipio y RLS

RLS está habilitado en todas las tablas operativas. Las políticas comprueban membresía activa y, para escrituras, el permiso asociado al agregado. El cliente no elige el ámbito de seguridad: PostgreSQL lo deriva del `auth.uid()` y de las membresías.

Los administradores pueden gestionar su propio municipio, pero no consultar otro. La vista de perfiles usa `security_invoker`, por lo que conserva las políticas de las tablas subyacentes.

## Auditoría

Los triggers de auditoría registran automáticamente:

- Usuario autenticado.
- Municipio.
- Fecha.
- Acción `INSERT`, `UPDATE` o `DELETE`.
- Tipo e identificador de entidad.
- Valor anterior.
- Valor nuevo.

El registro es append-only para clientes normales. Su estructura permite incorporar restauraciones, comparaciones y retención histórica en una etapa futura.

## Repositorios y migración desde mocks

`SupabaseRepository` es un adaptador genérico del contrato `Repository<T>` y aplica siempre el municipio al listar, buscar, guardar o eliminar. Las fábricas especializadas exponen repositorios para Actividades, Barrios, Problemas, Oportunidades, Compromisos, Propuestas, Instituciones, Personas y Documentos.

Estrategia de adopción:

1. Mantener los repositorios mock como fallback.
2. Activar Supabase en un entorno de desarrollo.
3. Migrar un agregado por vez detrás del mismo contrato.
4. Comparar comportamiento y auditoría.
5. Retirar el mock de ese agregado cuando la paridad esté validada.

Este patrón evita un cambio masivo y mantiene intactas las pantallas de los sprints anteriores.

## Paneles

- `/mi-cuenta` muestra perfil, rol, municipio, último acceso y preferencias.
- `/admin` muestra usuarios, roles, municipios y estado del sistema.
- Las rutas de autenticación cubren acceso, registro, recuperación y actualización de contraseña.
- En modo no configurado, los paneles explicitan que operan con datos demostrativos.

## PWA y operación offline

El shell y los mocks continúan disponibles con la estrategia PWA existente. La persistencia remota no reemplaza todavía la cola offline. Para una siguiente fase se recomienda:

1. Almacén local por municipio.
2. Cola de comandos con identificadores idempotentes.
3. Sincronización al recuperar conectividad.
4. Resolución explícita de conflictos mediante `version` y `updated_at`.
5. Cifrado y borrado seguro de datos locales al cerrar sesión.

No se simula sincronización offline antes de contar con esas garantías.

## Escalabilidad y seguridad operativa

- Índices compuestos comienzan por `municipality_id`, la dimensión dominante.
- Las filas poseen `version` para futura concurrencia optimista.
- JSONB facilita la transición; los campos con filtros intensivos pueden normalizarse sin cambiar contratos.
- El motor de relaciones puede migrar posteriormente a vistas materializadas o un grafo sin afectar a React.
- Secretos administrativos y migraciones deben ejecutarse únicamente en CI/CD o entornos de administración.
- La clave anónima puede vivir en el cliente porque RLS es la frontera; una `service_role` nunca debe exponerse.

## Puesta en marcha

1. Crear un proyecto Supabase.
2. Copiar `.env.example` a `.env.local` y completar las variables públicas.
3. Ejecutar `supabase/migrations/202607260001_platform.sql` con la herramienta de migraciones elegida.
4. Configurar en Supabase Auth la URL del sitio y `/auth/callback`.
5. Registrar el primer usuario y completar el bootstrap del municipio.
6. Validar las policies con usuarios de dos municipios diferentes antes de usar datos reales.

La migración no incluye información real. Solo incorpora permisos de sistema y las estructuras mínimas necesarias.
