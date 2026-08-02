# ATIY RC2 — Estabilización final y corrección de flujos

## Incidentes y causas

1. `/diario?activity=...` podía congelarse porque `CampaignDiary` entregaba un arreglo literal nuevo a `useActivityJournal` en cada render. El efecto del hook dependía de esa referencia, volvía a leer el almacenamiento, actualizaba estado y provocaba un ciclo continuo.
2. Centro Operativo y Territorio podían quedar activos simultáneamente. Ambas rutas comparten el prefijo `/territorio` y la selección anterior evaluaba cada enlace por separado.
3. El aviso `Abrir registro` utilizaba la última recorrida guardada sin comprobar que su conversión existiera todavía en el Diario.
4. El directorio territorial no exponía el acceso operativo compartido al último registro, a diferencia de Mapa, Relaciones e Inteligencia.
5. El Dashboard sumaba las recorridas dos veces: una desde el Diario y otra desde el almacenamiento de recorridas, aunque guardar una recorrida ya crea su actividad de Diario.

## Resolución

- El Diario utiliza una referencia de fallback estable y conserva el desplazamiento a la actividad solicitada sin actualizar estado durante el efecto.
- La navegación calcula un único destino activo y elige siempre la coincidencia de ruta más específica, tanto en escritorio como en móvil.
- El acceso compartido cruza los IDs de recorridas con los IDs existentes en el Diario. Si no hay coincidencia, el botón no se renderiza.
- Mapa, Relaciones, Inteligencia y Territorio utilizan el mismo componente de acceso validado y el mismo parámetro `activity`.
- Los indicadores de actividad se calculan una sola vez desde el Diario. Recorridas continúa siendo la fuente específica para métricas propias de recorrida, y los textos aclaran la unidad de cada indicador.

Las métricas visibles distinguen explícitamente actividades del Diario, sesiones de recorrida, compromisos de Agenda y entidades del repositorio canónico.

## Regresión

`tests/rc2-regression.test.mjs` cubre los cinco incidentes: estabilidad de la suscripción, selección de navegación, existencia del registro, convergencia entre módulos y ausencia de doble conteo.
