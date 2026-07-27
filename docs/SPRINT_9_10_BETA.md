# Sprint 9 + 10 â€” Beta pÃºblica

## Objetivo

La beta transforma la arquitectura existente en una experiencia utilizable a diario desde un telÃ©fono y presentable ante terceros. No incorpora nuevas entidades del dominio: `Actividad` continÃºa siendo el agregado operativo y los nuevos flujos producen contexto compatible con Diario, Territorio, Relaciones e Inteligencia.

## Arquitectura

La implementaciÃ³n separa cuatro responsabilidades:

```text
Experiencia mÃ³vil
  â””â”€ Modo Recorrida y capturas rÃ¡pidas
       â†“
Actividad existente
       â†“
AlmacÃ©n local beta / repositorio persistente futuro
       â†“
Proyecciones de Diario, Territorio, Relaciones e Inteligencia
```

- `components/recorrido` contiene la experiencia y no redefine el dominio.
- `features/recorrido/beta-activity-store.ts` encapsula la persistencia local y emite eventos de actualizaciÃ³n.
- `hooks` encapsula APIs variables del navegador: red, baterÃ­a, cronÃ³metro y actividad beta.
- `ContextSyncPulse` permite que los cuatro mÃ³dulos confirmen inmediatamente el nuevo contexto.
- El adaptador local puede sustituirse por el repositorio Supabase del Sprint 8 sin cambiar la interfaz de captura.

## Modo Recorrida

La ruta `/recorrido` implementa el flujo completo:

1. SelecciÃ³n de barrio.
2. Inicio de cronÃ³metro y creaciÃ³n lÃ³gica de la actividad.
3. Estado online/offline, sincronizaciÃ³n y baterÃ­a opcional.
4. Dock inferior para uso con el pulgar.
5. Captura de foto o video mediante controles nativos del dispositivo.
6. Registro inmediato de observaciones, problemas, oportunidades, compromisos, instituciones, personas y ubicaciÃ³n.
7. Punto de extensiÃ³n explÃ­cito para nota de voz.
8. Resumen y guardado al finalizar.

La geolocalizaciÃ³n se solicita Ãºnicamente al tocar â€œUbicaciÃ³nâ€. La baterÃ­a aparece solo si el navegador implementa Battery Status API. No se bloquea el flujo cuando una API no estÃ¡ disponible.

Las fotografÃ­as y videos se referencian durante esta beta; el almacenamiento binario durable se conectarÃ¡ al bucket privado de Supabase en la etapa de producciÃ³n.

## SincronizaciÃ³n

El recorrido utiliza almacenamiento local para conservar la operaciÃ³n sin conexiÃ³n. Cada actividad se marca como:

- `synced` si el dispositivo estaba conectado al finalizar.
- `pending` si debe permanecer en cola.

Esta marca expresa estado de experiencia, no simula una escritura remota. La sincronizaciÃ³n durable futura debe usar:

- comandos idempotentes;
- identificadores generados en cliente;
- una cola IndexedDB;
- carga diferida de archivos;
- control optimista mediante `version`;
- resoluciÃ³n explÃ­cita de conflictos.

## Modo Demo

La ruta `/demo` ofrece siete pasos:

1. Plataforma.
2. Territorio.
3. Diario.
4. Relaciones.
5. Inteligencia.
6. Recorrido.
7. Cierre.

Utiliza San Fernando y mÃ©tricas coherentes con los mocks. Funciona como superficie inmersiva, sin navegaciÃ³n tÃ©cnica o lateral. El estado de visualizaciÃ³n se conserva localmente.

## PresentaciÃ³n y dashboard ejecutivo

Las rutas `/presentacion` y `/ejecutivo` exponen una vista inmersiva compartida con:

- mapa territorial;
- estado general;
- barrios activos;
- problemas y compromisos;
- actividad semanal;
- instituciones y personas;
- lÃ­nea temporal;
- actividad reciente.

El mapa se carga con `dynamic import` y sin renderizado de servidor, ya que Leaflet requiere APIs del navegador. La vista reutiliza `TerritoryViewService`, por lo que mÃ©tricas, perÃ­odo y elementos visibles conservan las mismas reglas del mÃ³dulo Territorio.

## Ayuda contextual

`ModuleTour` detecta la primera entrada a los mÃ³dulos principales. Explica:

- quÃ© hace la pantalla;
- cÃ³mo empezar;
- quÃ© beneficio aporta.

Cada ayuda se muestra una sola vez y puede desactivarse globalmente. Este estado es una preferencia del dispositivo y por eso se guarda en `localStorage`; mÃ¡s adelante puede sincronizarse con las preferencias de `Usuario`.

## Experiencia PWA

La beta incluye:

- splash al abrir como aplicaciÃ³n instalada;
- indicador global sin conexiÃ³n;
- fallback `/offline`;
- aviso de actualizaciÃ³n disponible;
- acciÃ³n de instalaciÃ³n cuando el navegador expone el evento correspondiente;
- cachÃ© de shell para Inicio, Offline, Recorrido y Demo;
- soporte standalone mediante manifest.

El service worker usa estrategia network-first para evitar servir informaciÃ³n desactualizada cuando existe conexiÃ³n y recurre al cachÃ© cuando falla la red.

## Experiencia mÃ³vil y accesibilidad

- Controles principales con Ã¡reas tÃ¡ctiles amplias.
- Dock fijo en la zona de alcance del pulgar.
- Formularios de una sola decisiÃ³n por vez.
- Contraste alto durante trabajo en exterior.
- Estados que no dependen Ãºnicamente del color.
- DiÃ¡logos con roles y etiquetas accesibles.
- Inputs de archivo compatibles con cÃ¡mara trasera.
- Respeto de `prefers-reduced-motion`.

## Rendimiento

- Leaflet se divide en un chunk cargado solo en Territorio o PresentaciÃ³n.
- Las pantallas de Demo, Recorrido y PresentaciÃ³n son rutas separadas por App Router.
- Las proyecciones territoriales se memoizan por perÃ­odo.
- Los listeners de red, baterÃ­a y actividad se montan Ãºnicamente en componentes que los necesitan.
- La cantidad de actividades locales se limita para evitar crecimiento indefinido.
- Las transiciones utilizan propiedades simples y se desactivan para movimiento reducido.

No se agrega una librerÃ­a de tour, estado global o animaciÃ³n: la complejidad requerida se resuelve con APIs del navegador y React.

## PreparaciÃ³n para producciÃ³n

Antes de liberar informaciÃ³n real:

1. Sustituir el almacÃ©n beta por repositorios Supabase con cola IndexedDB.
2. Subir medios a buckets privados con URLs firmadas y reintentos.
3. Implementar compresiÃ³n de imagen y lÃ­mites de video.
4. AÃ±adir consentimiento y polÃ­tica de retenciÃ³n para geolocalizaciÃ³n y medios.
5. Probar matrices de permisos y aislamiento entre municipios.
6. Instrumentar errores, latencia de sincronizaciÃ³n y uso offline.
7. Generar iconos PWA dedicados en tamaÃ±os 192 y 512.
8. Ejecutar pruebas en Android, iOS y condiciones de conectividad degradada.

La beta mantiene explÃ­citos los placeholders de voz y distancia para no presentar capacidades inexistentes como si fueran reales.
