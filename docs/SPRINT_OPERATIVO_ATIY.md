# ATIY — Consolidación operativa

## Alcance implementado

La iteración consolida la aplicación existente sin reemplazar su arquitectura DDD, sus repositorios ni la integración opcional con Supabase.

- El módulo Municipio permite editar y conservar localmente la ficha general, autoridades, secretarías, delegaciones, localidades y barrios.
- Los circuitos electorales oficiales de San Fernando se incorporan como una capa independiente, complementaria de barrios y localidades.
- Recorrido exige una posición válida antes de comenzar y registra localidad, barrio, circuito, institución, persona y adjuntos dentro de la actividad.
- Presupuesto, Propuestas, Marketing, Agenda y Vecinos utilizan un gestor reutilizable con altas, edición, búsqueda, archivo, duplicación, eliminación y metadatos de adjuntos.
- Entidades territoriales permite administrar categorías, coordenadas y relaciones, con acceso directo a la verificación cartográfica.
- Configuración conserva preferencias, aplica colores operativos y permite exportar e importar un respaldo de los registros locales de ATIY.
- Administración suma un registro de auditoría de sesión y exportación.

## Datos territoriales y límites de verificación

Los polígonos de circuitos provienen del recurso público de Circuitos Electorales de la Provincia de Buenos Aires, elaborado por la Cámara Nacional Electoral, en WGS84 y con licencia CC BY 4.0. El archivo derivado conserva la atribución y puede regenerarse mediante `scripts/generate-san-fernando-circuits.mjs`.

La imagen aportada se utilizó solamente como referencia visual. No se copiaron colores partidarios ni se dibujaron límites a mano.

No se encontró una fuente pública oficial suficientemente precisa y reutilizable que delimite todos los barrios de San Fernando. Por esa razón se conserva únicamente la geometría barrial previamente verificada y la interfaz deja preparada la incorporación de nuevas geometrías. Inventar polígonos hubiera degradado la confiabilidad territorial.

## Persistencia y escalabilidad

Los gestores operativos usan claves versionadas `atiy:*` en almacenamiento local para mantener funcionalidad inmediata y compatibilidad PWA. Los componentes no consultan Supabase directamente. La migración futura se realiza sustituyendo el adaptador de persistencia por repositorios de infraestructura, manteniendo los mismos modelos de formulario y servicios de aplicación.

La migración SQL de circuitos incorpora tabla, índices espaciales, restricciones y políticas RLS por municipio. Las asociaciones se representan mediante identificadores de circuito en las entidades del dominio.

## Pendientes que requieren fuentes o infraestructura

- Completar polígonos oficiales de todos los barrios cuando exista una fuente pública verificable.
- Persistir archivos binarios en Supabase Storage; hoy se conservan metadatos locales.
- Ejecutar respaldos programados y restauraciones de base de datos desde infraestructura, no desde el navegador.
- Sustituir progresivamente los gestores locales por repositorios Supabase sin cambiar la interfaz.
- Incorporar asignación administrativa de usuarios y permisos contra el backend; la visualización actual respeta el modelo de permisos existente.

## Validación

La entrega se valida con lint, TypeScript, pruebas automatizadas, verificación UTF-8 y compilación de producción.
