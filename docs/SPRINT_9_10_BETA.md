# Sprint 9 + 10 — Beta pública

## Objetivo

La beta transforma la arquitectura existente en una experiencia utilizable a diario desde un teléfono y presentable ante terceros. No incorpora nuevas entidades del dominio: `Actividad` continúa siendo el agregado operativo y los nuevos flujos producen contexto compatible con Diario, Territorio, Relaciones e Inteligencia.

## Arquitectura

La implementación separa cuatro responsabilidades:

```text
Experiencia móvil
  └─ Modo Recorrida y capturas rápidas
       ↓
Actividad existente
       ↓
Almacén local beta / repositorio persistente futuro
       ↓
Proyecciones de Diario, Territorio, Relaciones e Inteligencia
```

- `components/recorrido` contiene la experiencia y no redefine el dominio.
- `features/recorrido/beta-activity-store.ts` encapsula la persistencia local y emite eventos de actualización.
- `hooks` encapsula APIs variables del navegador: red, batería, cronómetro y actividad beta.
- `ContextSyncPulse` permite que los cuatro módulos confirmen inmediatamente el nuevo contexto.
- El adaptador local puede sustituirse por el repositorio Supabase del Sprint 8 sin cambiar la interfaz de captura.

## Modo Recorrida

La ruta `/recorrido` implementa el flujo completo:

1. Selección de barrio.
2. Inicio de cronómetro y creación lógica de la actividad.
3. Estado online/offline, sincronización y batería opcional.
4. Dock inferior para uso con el pulgar.
5. Captura de foto o video mediante controles nativos del dispositivo.
6. Registro inmediato de observaciones, problemas, oportunidades, compromisos, instituciones, personas y ubicación.
7. Punto de extensión explícito para nota de voz.
8. Resumen y guardado al finalizar.

La geolocalización se solicita únicamente al tocar “Ubicación”. La batería aparece solo si el navegador implementa Battery Status API. No se bloquea el flujo cuando una API no está disponible.

Las fotografías y videos se referencian durante esta beta; el almacenamiento binario durable se conectará al bucket privado de Supabase en la etapa de producción.

## Sincronización

El recorrido utiliza almacenamiento local para conservar la operación sin conexión. Cada actividad se marca como:

- `synced` si el dispositivo estaba conectado al finalizar.
- `pending` si debe permanecer en cola.

Esta marca expresa estado de experiencia, no simula una escritura remota. La sincronización durable futura debe usar:

- comandos idempotentes;
- identificadores generados en cliente;
- una cola IndexedDB;
- carga diferida de archivos;
- control optimista mediante `version`;
- resolución explícita de conflictos.

## Modo Demo

La ruta `/demo` ofrece siete pasos:

1. Plataforma.
2. Territorio.
3. Diario.
4. Relaciones.
5. Inteligencia.
6. Recorrido.
7. Cierre.

Utiliza San Fernando y métricas coherentes con los mocks. Funciona como superficie inmersiva, sin navegación técnica o lateral. El estado de visualización se conserva localmente.

## Presentación y dashboard ejecutivo

Las rutas `/presentacion` y `/ejecutivo` exponen una vista inmersiva compartida con:

- mapa territorial;
- estado general;
- barrios activos;
- problemas y compromisos;
- actividad semanal;
- instituciones y personas;
- línea temporal;
- actividad reciente.

El mapa se carga con `dynamic import` y sin renderizado de servidor, ya que Leaflet requiere APIs del navegador. La vista reutiliza `TerritoryViewService`, por lo que métricas, período y elementos visibles conservan las mismas reglas del módulo Territorio.

## Ayuda contextual

`ModuleTour` detecta la primera entrada a los módulos principales. Explica:

- qué hace la pantalla;
- cómo empezar;
- qué beneficio aporta.

Cada ayuda se muestra una sola vez y puede desactivarse globalmente. Este estado es una preferencia del dispositivo y por eso se guarda en `localStorage`; más adelante puede sincronizarse con las preferencias de `Usuario`.

## Experiencia PWA

La beta incluye:

- splash al abrir como aplicación instalada;
- indicador global sin conexión;
- fallback `/offline`;
- aviso de actualización disponible;
- acción de instalación cuando el navegador expone el evento correspondiente;
- caché de shell para Inicio, Offline, Recorrido y Demo;
- soporte standalone mediante manifest.

El service worker usa estrategia network-first para evitar servir información desactualizada cuando existe conexión y recurre al caché cuando falla la red.

## Experiencia móvil y accesibilidad

- Controles principales con áreas táctiles amplias.
- Dock fijo en la zona de alcance del pulgar.
- Formularios de una sola decisión por vez.
- Contraste alto durante trabajo en exterior.
- Estados que no dependen únicamente del color.
- Diálogos con roles y etiquetas accesibles.
- Inputs de archivo compatibles con cámara trasera.
- Respeto de `prefers-reduced-motion`.

## Rendimiento

- Leaflet se divide en un chunk cargado solo en Territorio o Presentación.
- Las pantallas de Demo, Recorrido y Presentación son rutas separadas por App Router.
- Las proyecciones territoriales se memoizan por período.
- Los listeners de red, batería y actividad se montan únicamente en componentes que los necesitan.
- La cantidad de actividades locales se limita para evitar crecimiento indefinido.
- Las transiciones utilizan propiedades simples y se desactivan para movimiento reducido.

No se agrega una librería de tour, estado global o animación: la complejidad requerida se resuelve con APIs del navegador y React.

## Preparación para producción

Antes de liberar información real:

1. Sustituir el almacén beta por repositorios Supabase con cola IndexedDB.
2. Subir medios a buckets privados con URLs firmadas y reintentos.
3. Implementar compresión de imagen y límites de video.
4. Añadir consentimiento y política de retención para geolocalización y medios.
5. Probar matrices de permisos y aislamiento entre municipios.
6. Instrumentar errores, latencia de sincronización y uso offline.
7. Generar iconos PWA dedicados en tamaños 192 y 512.
8. Ejecutar pruebas en Android, iOS y condiciones de conectividad degradada.

La beta mantiene explícitos los placeholders de voz y distancia para no presentar capacidades inexistentes como si fueran reales.
