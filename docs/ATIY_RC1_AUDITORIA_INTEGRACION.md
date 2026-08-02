# ATIY RC1 — Auditoría final de integración

## Alcance

La auditoría se realizó sobre Dashboard, Mapa, Territorio, Inteligencia, Diario, Recorridas, Relaciones, Administración, Calidad, Sincronización, Enriquecimiento, Configuración y Mi Cuenta. Se comprobó navegación directa, renderizado, acciones críticas y convergencia hacia fichas canónicas.

## Problemas encontrados y resolución

1. **Abrir registro contextual redirigía a Recorridas.** El componente compartido enviaba cualquier actividad a `/recorrido`. Ahora dirige a `/diario?activity=<id>`; el Diario localiza, desplaza y expande la actividad solicitada.
2. **Mapa y Relaciones no exponían la ficha territorial canónica.** Se agregó `Abrir ficha territorial` usando el mismo ID canónico que emplean Búsqueda, Territorio e Inteligencia.
3. **Hidratación inconsistente del mapa.** El modo cartográfico y las capas leían `localStorage` durante la inicialización del estado. Servidor y navegador podían renderizar modos diferentes. El primer render ahora es determinista; preferencias y elementos personalizados se cargan después del montaje y no se sobrescriben antes de estar disponibles.
4. **Administración podía regresar al Dashboard al no tener permisos.** El destino seguro ahora es Mi Cuenta, donde el usuario puede revisar su rol, sin confundir el Dashboard con el panel administrativo.

## Verificación funcional

- Las doce rutas obligatorias responden y muestran su pantalla esperada.
- `/admin` muestra Administración y no redirige al Dashboard en el contexto autorizado.
- `Abrir registro` de Inteligencia resuelve `/territorio/entidades/<id>` y nunca `/recorrido`.
- Leopoldo Lugones abrió con el mismo ID `pba-education-60486600` desde Territorio, Relaciones y Mapa.
- El Diario conserva implementaciones para abrir, editar, duplicar, eliminar con confirmación, finalizar y exportar.
- La búsqueda cartográfica localizó la institución, abrió su panel contextual y expuso la ficha completa.

## Auditoría automática

`tests/rc1-integration.test.mjs` valida rutas obligatorias, destino de Administración, navegación canónica desde cinco superficies, acciones del Diario, enlace contextual y estrategia de hidratación del mapa.

## Auditoría visual

Se revisaron los breakpoints de escritorio, tablet y Android sobre Mapa, Diario, Relaciones y Administración. Los paneles móviles se mantienen superpuestos únicamente cuando son necesarios; la navegación inferior reserva espacio mediante el `padding` del marco principal. No se detectaron botones tapados ni modales fuera de pantalla después de las correcciones.
