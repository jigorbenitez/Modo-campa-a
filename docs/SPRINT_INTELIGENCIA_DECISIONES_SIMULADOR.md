# ATIY — Inteligencia territorial determinística

## Propósito

Este incremento transforma el Centro de Inteligencia en un sistema de apoyo a decisiones. ATIY no predice ni utiliza modelos de IA: calcula cobertura, prioridad e impacto mediante reglas visibles, configurables y reproducibles.

## Arquitectura

La implementación respeta la separación existente:

1. `domain`: contratos de cobertura, prioridad, auditoría y simulación.
2. `application`: cálculo de cobertura, motor de prioridades, generación de decisiones, planificador territorial y simulador.
3. `presentation`: Centro de Decisiones, configuración de reglas, planificador y Simulador de Impacto.
4. `infrastructure`: persistencia local versionada para preferencias y escenarios; los repositorios reales no se modifican.

Supabase continúa siendo infraestructura. Los componentes React no ejecutan SQL ni incorporan conceptos del proveedor al dominio.

## Motor de prioridades

Cada regla declara identificador, estado, peso, tope de normalización y, cuando corresponde, sentido inverso. El puntaje es la suma acotada de contribuciones y se clasifica con umbrales municipales.

Las variables disponibles incluyen antigüedad de recorridas, compromisos abiertos y vencidos, propuestas, brecha de cobertura, instituciones sin visitar, documentación, fotografías, actividad reciente, eventos, alertas y problemas.

Cada resultado conserva:

- puntaje y nivel;
- contribución de cada regla;
- motivos ordenados por relevancia;
- versión de configuración;
- fecha de cálculo y entidad relacionada.

La configuración se guarda por municipio. Desactivar una regla elimina completamente su contribución.

## Índice de cobertura

La cobertura pondera evidencia territorial existente: recorridas recientes, instituciones relevadas, compromisos activos, documentos, fotografías y actividad reciente. Se calcula de forma independiente para localidades, barrios y circuitos electorales. Un cero significa ausencia de evidencia cargada, no ausencia de trabajo en el territorio.

## Centro de Decisiones y planificador

Las recomendaciones se ordenan por puntaje y explican motivo, impacto esperado, duración y ubicación. Pueden marcarse como completadas, pospuestas o descartadas sin alterar la regla que las originó.

El planificador aplica una estrategia determinística: maximiza prioridad relativa a cercanía, respeta el tiempo disponible y filtra por zona. La distancia se calcula mediante Haversine; no se presenta como navegación vial.

## Simulador de Impacto Territorial

El simulador copia las variables de entrada, aplica únicamente las acciones seleccionadas y recalcula cobertura y prioridad con los mismos motores. Nunca escribe en repositorios territoriales.

Permite combinar recorridas, cierre de compromisos, relevamientos, fotografías, documentos, propuestas, datos públicos, actividades y relaciones. El comparador muestra antes, después, diferencia y explicación de cada indicador. Los escenarios guardados incluyen municipio, acciones, resultado y fecha para permitir auditoría y comparación posterior.

## DataHub

Administración incorpora un catálogo de datos públicos con fuente, publicador, licencia, versión, formato, cantidad de registros, validación y procedencia. Los datos oficiales se mantienen separados de observaciones propias.

La consulta de actualizaciones solo registra candidatos: ninguna versión se acepta automáticamente. La arquitectura contempla CSV, GeoJSON, JSON, XLSX y un puerto futuro para convertir Shapefile antes de validarlo. No se completan catálogos faltantes con datos sintéticos.

## Multi-municipio, rendimiento y crecimiento

Configuraciones, escenarios y catálogos usan `municipalityId` en sus contratos y claves de persistencia. Los cálculos son funciones acotadas sobre snapshots; la interfaz memoriza resultados y no recalcula por renders ajenos. En una infraestructura de mayor volumen, los mismos puertos admiten materialización en PostgreSQL/PostGIS, workers de sincronización y cachés por versión sin cambiar el dominio.

## Garantías

- Sin IA, aleatoriedad ni predicción estadística.
- Igual entrada, configuración, versión y fecha producen igual resultado.
- Las simulaciones no mutan datos reales.
- Toda fuente pública declara procedencia.
- Las pruebas automatizadas cubren determinismo, reglas desactivadas y no mutación.
