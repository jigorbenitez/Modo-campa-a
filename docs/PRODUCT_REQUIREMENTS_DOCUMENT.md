# Product Requirements Document — Modo Campaña

**Estado:** Propuesta de producto  
**Versión del documento:** 1.0  
**Horizonte:** cinco años  
**Alcance actual:** definición estratégica posterior al Sprint 3  
**Decisión central:** Modo Campaña es un sistema operativo de estrategia, territorio y gestión pública; no una colección de herramientas políticas aisladas.

---

## Resumen ejecutivo

Modo Campaña organiza conocimiento municipal disperso y lo convierte en contexto
operativo reutilizable. Conecta territorio, problemas, propuestas, normativa,
agenda, compromisos, equipo y comunicación alrededor de una entidad común: el
municipio.

El producto no debe competir por cantidad de funciones. Debe competir por
reducir el tiempo entre cuatro momentos:

1. observar una situación;
2. comprender su contexto;
3. decidir una respuesta;
4. dar seguimiento hasta su resolución.

La ventaja defendible no será un chatbot ni la generación automática de textos.
Será el grafo de conocimiento operativo que relaciona evidencia territorial,
documentos, decisiones, responsables y resultados. La inteligencia artificial,
cuando se incorpore, será una interfaz y un acelerador sobre ese conocimiento,
nunca su sustituto.

El foco recomendado para la primera versión comercial es un circuito completo:

> Recorrida o fuente documental → problema validado → propuesta o compromiso →
> responsable → seguimiento → evidencia de resultado.

Todo módulo que no mejore ese circuito debe justificarse con evidencia de uso.

---

# 1. Visión del producto

## 1.1 Problema que resuelve

Los equipos electorales y municipales trabajan con información fragmentada:
planillas, conversaciones, documentos, carpetas compartidas, calendarios,
mensajería y memoria individual. Esa fragmentación produce:

- diagnósticos incompletos o contradictorios;
- compromisos que pierden seguimiento;
- recorridas sin conexión con decisiones posteriores;
- propuestas que duplican esfuerzos o carecen de fundamento;
- documentos difíciles de localizar y reutilizar;
- dependencia excesiva de unas pocas personas que conocen el contexto;
- reuniones dedicadas a reconstruir información en lugar de decidir;
- pérdida de continuidad entre campaña, transición y gestión.

Modo Campaña crea un espacio compartido donde la información conserva origen,
relaciones, estado, responsables y evolución.

## 1.2 Por qué existe

Existe para que un equipo pueda responder rápidamente:

- ¿Qué requiere atención hoy?
- ¿Qué sabemos y cuál es la evidencia?
- ¿Dónde sucede?
- ¿Qué decisiones o compromisos están relacionados?
- ¿Quién es responsable?
- ¿Qué cambió desde la última revisión?

La misión no es “digitalizar” prácticas desordenadas. Es ofrecer una forma de
trabajo más clara, trazable y acumulativa.

## 1.3 Diferenciación

Modo Campaña se diferencia de:

- **un CRM tradicional**, porque el centro no es el contacto comercial sino el
  contexto territorial y de gestión;
- **un gestor de tareas**, porque los compromisos conservan origen, evidencia y
  relación con problemas, documentos o propuestas;
- **un repositorio documental**, porque los documentos participan del análisis
  y se relacionan con decisiones;
- **una herramienta de comunicación**, porque la publicación se deriva de
  objetivos, territorio y políticas públicas;
- **un dashboard de BI**, porque prioriza interpretación y acción antes que
  visualización retrospectiva;
- **un chatbot**, porque la verdad del sistema reside en un dominio estructurado
  y auditable.

## 1.4 Qué no intenta resolver

En sus primeras versiones el producto no debe:

- predecir resultados electorales;
- perfilar o persuadir individuos mediante datos sensibles;
- reemplazar sistemas contables, de expedientes o recursos humanos;
- administrar padrones electorales;
- ser una red social interna generalista;
- reemplazar herramientas profesionales de diseño gráfico o edición audiovisual;
- automatizar decisiones públicas sin intervención humana;
- prometer “objetividad” algorítmica;
- almacenar información personal que no sea necesaria para un propósito
  legítimo y documentado.

Estas exclusiones reducen riesgo regulatorio, reputacional y de producto.

---

# 2. Filosofía y principios

## 2.1 Evidencia antes que opinión

Una recomendación debe indicar qué hechos, documentos o registros la originan.
Una métrica sin fuente o fecha debe considerarse incompleta.

## 2.2 Contexto antes que volumen

“32 barrios” es inventario. “7 barrios no tuvieron actividad en 30 días” es
contexto. Las pantallas deben explicar relevancia, cambio y próximo paso.

## 2.3 Capturar una vez, reutilizar muchas

Una observación territorial debe poder alimentar un problema, una propuesta,
una reunión, un documento de trabajo y una publicación sin duplicarse.

## 2.4 Simplicidad operativa

El sistema debe reducir carga administrativa. Si registrar información demanda
más esfuerzo que recuperarla después, la adopción fracasa.

## 2.5 Velocidad percibida y real

Las acciones frecuentes deben responder inmediatamente, aceptar guardado
progresivo y mostrar estados claros. La red no debe convertir una recorrida en
un formulario frágil.

## 2.6 Trazabilidad proporcional

Las decisiones importantes requieren historial; las interacciones triviales no
deben generar burocracia visible. La trazabilidad debe existir sin dominar la
interfaz.

## 2.7 Humano responsable

Reglas, automatizaciones y futuros agentes pueden sugerir. Una persona con
permiso explícito aprueba decisiones y cambios significativos.

## 2.8 Privacidad por diseño

Recolectar el mínimo dato personal, declarar finalidad, controlar acceso,
definir retención y permitir auditoría. “Podemos almacenarlo” no significa que
debamos hacerlo.

## 2.9 Configuración, no bifurcación

Un nuevo municipio se incorpora mediante configuración, permisos y contenido.
No se crea una copia del producto.

## 2.10 Calidad antes que catálogo

Un flujo completo y confiable vale más que diez módulos superficiales.

---

# 3. Público objetivo

## 3.1 Decisor ejecutivo: candidato o intendente

**Necesita:** una lectura breve de prioridades, riesgos, compromisos y cambios
relevantes.

**Casos de uso:**

- preparar una reunión territorial;
- revisar compromisos críticos;
- comprender el contexto de un barrio;
- comparar propuestas relacionadas;
- verificar fundamento y estado de una decisión.

**Diseño:** vista ejecutiva, lenguaje directo, posibilidad de profundizar sin
exponer complejidad operativa inicialmente.

## 3.2 Concejal y equipo legislativo

**Necesita:** normativa relacionada, antecedentes, impacto territorial y estado
de iniciativas.

**Casos de uso:**

- localizar ordenanzas vinculadas;
- relacionar documentos con problemas o propuestas;
- preparar sesiones y reuniones de comisión;
- dar seguimiento a compromisos legislativos.

## 3.3 Secretario o director

**Necesita:** responsabilidades, programas, problemas asignados, documentos,
indicadores y coordinación entre áreas.

**Casos de uso:**

- priorizar trabajo;
- revisar propuestas bajo su competencia;
- documentar avances;
- coordinar respuestas interárea;
- verificar vencimientos.

## 3.4 Asesor estratégico

**Necesita:** una visión transversal con evidencia, relaciones y evolución.

**Casos de uso:**

- detectar patrones territoriales;
- construir diagnósticos;
- identificar duplicaciones;
- preparar escenarios;
- elaborar recomendaciones trazables.

## 3.5 Equipo territorial

**Necesita:** captura rápida, funcionamiento móvil, agenda y devolución sobre lo
registrado.

**Casos de uso:**

- planificar una recorrida;
- registrar observaciones y evidencia;
- identificar problemas;
- crear compromisos;
- consultar antecedentes del barrio antes de una visita.

## 3.6 Prensa y comunicación

**Necesita:** fuentes verificadas, mensajes aprobados, calendario y relación
entre contenido y acciones reales.

**Casos de uso:**

- comprender el fundamento de una propuesta;
- preparar una vocería;
- reutilizar datos aprobados;
- coordinar variantes por canal;
- evitar contradicciones.

## 3.7 Voluntarios

**Necesita:** tareas acotadas, contexto mínimo, instrucciones y límites de
acceso.

**Casos de uso:**

- confirmar participación;
- completar una tarea;
- registrar una observación permitida;
- consultar materiales aprobados.

No deben acceder por defecto a información estratégica, documental o personal.

## 3.8 Administrador institucional

**Necesita:** usuarios, roles, configuración, seguridad, auditoría e
integraciones.

**Casos de uso:**

- incorporar equipos;
- configurar el municipio;
- asignar permisos;
- revisar accesos;
- gestionar políticas de conservación de datos.

---

# 4. Módulos del sistema

## 4.1 Inicio

Puerta de entrada operativa. Responde qué cambió, qué vence y qué acciones son
frecuentes para el rol actual. No debe duplicar el Centro de Inteligencia.

**Decisión:** el dashboard actual debe evolucionar a “Mi día” o “Inicio”,
personalizado por rol.

## 4.2 Centro de Inteligencia

Conecta datos del resto del sistema mediante reglas explicables. Presenta
alertas, oportunidades, tendencias, prioridades y actividad relacionada.

**No debe:** transformarse en una pared de gráficos ni mezclar recomendaciones
generadas con hechos sin distinguirlos.

## 4.3 Territorio

Mapa lógico de barrios, zonas y actividad territorial. Incluye cobertura,
recorridas, referentes institucionales, evidencia y prioridades.

**Decisión:** “Barrios” debe ser una vista de Territorio, no un módulo conceptual
separado a largo plazo.

## 4.4 Barrios

Página de contexto integral por unidad territorial:

- perfil y demografía;
- actividad reciente;
- problemas y fortalezas;
- propuestas y proyectos;
- documentos;
- compromisos;
- referentes autorizados;
- indicadores con fuente.

## 4.5 Problemas

Registro validable de situaciones. Debe diferenciar observación, problema
confirmado y percepción. Incluye categoría, gravedad, evidencia, origen,
ubicación, responsables e historial.

## 4.6 Propuestas

Políticas públicas desde diagnóstico hasta evaluación. Deben exigir progresivamente:

- objetivo;
- fundamento;
- beneficiarios;
- evidencia;
- costo estimado;
- indicadores;
- responsables;
- dependencias;
- documentos vinculados.

No toda idea necesita una ficha completa al nacer; el sistema debe mostrar su
nivel de madurez.

## 4.7 Documentos

Repositorio normativo y técnico con búsqueda, clasificación, relaciones,
versiones y permisos.

Debe soportar ordenanzas, decretos, leyes, presupuestos, informes, estadísticas
y rendiciones. La búsqueda transversal es una capacidad prioritaria de V1.

## 4.8 Biblioteca

Colección curada de recursos reutilizables: guías, plantillas, marcos de
diagnóstico, mensajes aprobados y materiales.

**Decisión:** no construirla como repositorio paralelo. Debe ser una vista
curada sobre Documentos y recursos, con metadatos compartidos.

## 4.9 Agenda

Reuniones, recorridas, sesiones, visitas, eventos y preparación asociada.

Cada evento importante debe responder:

- propósito;
- participantes;
- contexto relacionado;
- materiales de preparación;
- decisiones;
- compromisos posteriores.

## 4.10 Compromisos y trabajo

Seguimiento accionable de decisiones. Es una capacidad faltante en la interfaz
actual y crítica para cerrar el circuito.

**Decisión:** las tareas simples y los compromisos derivados deben compartir una
vista de trabajo, pero conservar diferencias de dominio. Un compromiso tiene
origen y responsabilidad institucional; una tarea puede ser meramente operativa.

## 4.11 Equipo

Miembros, áreas, roles, permisos, disponibilidad y responsabilidades.

No pretende reemplazar recursos humanos. Su finalidad es coordinar el uso del
producto y asignar trabajo.

## 4.12 Comunicación

Mensajes, vocerías, aprobaciones, publicaciones y reutilización de evidencia.
Debe conectar contenido con propuestas, documentos, territorio y agenda.

## 4.13 Marketing

Planificación de canales, campañas de contenido y análisis agregado.

**Decisión crítica:** Marketing no merece un módulo autónomo en V1. Debe ser una
vista dentro de Comunicación hasta demostrar flujos y permisos distintos.
Separarlo prematuramente aumenta navegación y duplicación.

## 4.14 Presupuesto

Costos estimados de propuestas, asignaciones, escenarios y seguimiento de
recursos.

No debe presentarse como sistema contable. Para gestión pública, los datos
oficiales deben importarse o referenciarse con fuente, período y versión.

## 4.15 Vecinos y actores territoriales

El nombre “Vecinos” sugiere un CRM de personas y aumenta riesgo de privacidad.

**Decisión recomendada:** evolucionar a **Actores y vínculos**, centrado en
organizaciones, instituciones, referentes por función y conversaciones con
finalidad legítima. Cualquier dato personal debe tener base legal, propósito,
acceso restringido y política de retención.

## 4.16 Configuración

Municipio, identidad visual, módulos, usuarios, roles, taxonomías, umbrales de
reglas, integraciones, seguridad y auditoría.

---

# 5. Flujo completo de uso

## 5.1 Incorporación de una organización

1. Un administrador crea la organización y el municipio.
2. Define país, provincia, zona horaria, idioma y moneda.
3. Configura marca y módulos habilitados.
4. Importa o crea barrios y estructura administrativa.
5. Invita al equipo y asigna roles mínimos.
6. Define taxonomías: categorías de problemas, prioridades y estados.
7. Importa documentos iniciales con fuente y permisos.
8. Completa un recorrido guiado con datos de ejemplo descartables.
9. Revisa seguridad, conservación de datos y auditoría.
10. Activa el espacio productivo.

**Objetivo de onboarding:** obtener el primer valor —contexto de un barrio o una
reunión preparada— dentro de la primera hora, sin exigir una migración total.

## 5.2 Configuración inicial

El equipo selecciona de tres a cinco barrios prioritarios, carga documentos
fundacionales, agenda actividades y registra compromisos existentes. El sistema
calcula cobertura y señala vacíos de información, sin etiquetarlos como fallas.

## 5.3 Operación diaria

1. El usuario entra a Inicio.
2. Revisa vencimientos, cambios y agenda según su rol.
3. Abre una prioridad con su contexto.
4. Actualiza un compromiso, registra una recorrida o revisa un documento.
5. Las relaciones alimentan el Centro de Inteligencia.
6. Las reglas recalculan insights con evidencia y fecha.
7. El equipo toma una decisión y registra responsable y seguimiento.

## 5.4 Preparación de una reunión

1. Abrir el evento.
2. Ver barrios, problemas, compromisos, documentos y propuestas vinculados.
3. Confirmar participantes y objetivos.
4. Generar un briefing estructurado, inicialmente sin IA.
5. Durante o después de la reunión, registrar decisiones.
6. Convertir decisiones en compromisos.
7. Revisar seguimiento en Inicio.

## 5.5 Trabajo territorial

1. Consultar ficha del barrio.
2. Revisar última actividad y compromisos.
3. Iniciar recorrida desde móvil.
4. Capturar observaciones y evidencia con guardado progresivo.
5. Clasificar posteriormente si la conectividad es limitada.
6. Validar problemas antes de tratarlos como hechos.
7. Crear responsables o propuestas relacionadas.

## 5.6 Ciclo de una propuesta

Idea → diagnóstico → borrador → revisión → aprobación → ejecución → evaluación
o archivo.

Cada transición debe indicar responsable, fecha, fundamento y requisitos
faltantes. El sistema no debe impedir comenzar con información incompleta, pero
sí hacer visible la madurez.

---

# 6. Roadmap

El roadmap se organiza por resultados de producto, no por acumulación de
módulos. Cada fase exige validación con usuarios antes de ampliar alcance.

## Versión 1 — Sistema de registro y seguimiento confiable

**Objetivo:** lograr que un equipo pequeño use el producto semanalmente como
fuente operativa común.

### Alcance

- autenticación y membresía multi-municipio;
- roles y permisos mínimos;
- Supabase con RLS y auditoría;
- onboarding de municipio;
- CRUD de barrios, problemas, recorridas, propuestas, documentos, eventos y
  compromisos;
- búsqueda global;
- vista de trabajo y vencimientos;
- Centro de Inteligencia con reglas configurables básicas;
- carga de archivos con límites y estados;
- importación inicial desde CSV;
- experiencia móvil robusta para territorio;
- actividad e historial por entidad;
- exportación básica y copias de seguridad;
- telemetría de producto respetuosa de privacidad.

### Fuera de alcance

- agentes autónomos;
- marketing avanzado;
- predicción electoral;
- integraciones contables;
- personalización visual profunda.

### Criterio de salida

Tres organizaciones piloto completan durante ocho semanas el circuito
territorio → problema → compromiso/propuesta → seguimiento, con más del 60 % de
usuarios activos semanalmente.

## Versión 2 — Conocimiento conectado y colaboración

**Objetivo:** reducir preparación y duplicación entre áreas.

### Alcance

- relaciones documentales avanzadas;
- búsqueda de texto completo;
- briefs de reunión;
- plantillas y Biblioteca como vistas curadas;
- flujos de aprobación;
- notificaciones configurables;
- paneles por rol;
- taxonomías por municipio;
- importaciones documentales asistidas;
- API e integraciones con calendario y almacenamiento;
- reglas compuestas y explicabilidad ampliada;
- comunicación conectada a evidencia.

### Criterio de salida

Reducción medible del tiempo de preparación de reuniones y recuperación
documental, sin aumento de datos duplicados.

## Versión 3 — Asistencia inteligente controlada

**Objetivo:** acelerar análisis y producción sin sacrificar trazabilidad.

### Alcance

- búsqueda semántica con citas;
- resúmenes documentales verificables;
- sugerencias de relaciones;
- redacción asistida basada en fuentes aprobadas;
- agentes especializados en modo recomendación;
- evaluación de calidad y alucinaciones;
- aprobaciones humanas;
- presupuestos y análisis legislativo asistidos;
- conectores adicionales;
- analítica longitudinal.

### Restricción

Ningún agente modifica datos críticos, publica contenido ni envía mensajes sin
un caso de uso autorizado y confirmación humana.

## Versión Enterprise — Plataforma de gobierno y red de municipios

**Objetivo:** operar con seguridad, cumplimiento y gobernanza a escala.

### Alcance

- SSO/SAML, SCIM y políticas corporativas;
- regiones de datos y residencia configurable;
- auditoría avanzada e integraciones SIEM;
- gestión de múltiples organizaciones y municipios;
- entornos separados;
- API empresarial y webhooks;
- SLA, soporte y recuperación ante desastres;
- marca blanca limitada;
- catálogo central de políticas y taxonomías;
- controles de IA y modelos por organización;
- exportación completa y portabilidad;
- analítica federada sin mezclar datos de tenants.

---

# 7. Modelo multi-municipio

## 7.1 Jerarquía recomendada

La unidad comercial y de seguridad no siempre será un municipio. Se recomienda:

```text
Organización
  ├─ Municipio A
  ├─ Municipio B
  └─ Espacio de campaña o gestión
```

El dominio actual usa `Municipio` como tenant. Es válido para pilotos, pero antes
de Enterprise conviene introducir `Organization` y `Workspace` como conceptos
separados:

- **Organización:** contrato, facturación, identidad y políticas.
- **Municipio:** contexto institucional y territorial.
- **Workspace:** espacio operativo de campaña, transición o gestión.

Esta mejora debe documentarse y migrarse de forma compatible; no corresponde
implementarla todavía sin validar casos reales.

## 7.2 Incorporación de un municipio

- registrar identidad institucional;
- seleccionar configuración regional;
- importar barrios y secretarías;
- definir taxonomías;
- habilitar módulos;
- asignar administradores;
- cargar documentos base;
- validar fuentes;
- ejecutar revisión de permisos;
- activar reglas e indicadores.

## 7.3 Aislamiento

Toda tabla operativa debe incluir `municipio_id` o el futuro `workspace_id`.
Las políticas RLS deben verificar membresía y rol. El filtro en código no es una
barrera de seguridad suficiente.

## 7.4 Configuración

Los estados esenciales deben ser estables para permitir análisis, mientras que
categorías, etiquetas, umbrales, marca y módulos pueden configurarse por tenant.
La personalización no debe romper reportes comparables.

---

# 8. Futuro sistema multiagente

## 8.1 Principios

- comparten un dominio canónico;
- reciben contexto limitado al municipio y al permiso;
- citan entidades y versiones;
- producen sugerencias estructuradas;
- declaran incertidumbre;
- no duplican bases de conocimiento;
- no escriben ni publican directamente;
- toda ejecución queda auditada.

## 8.2 Agentes previstos

### Estratega

Conecta problemas, objetivos, propuestas, agenda y riesgos. Identifica
inconsistencias y escenarios. No define posiciones políticas por cuenta propia.

### Territorio

Analiza cobertura, recurrencia de problemas, actividad y compromisos por zona.
Sugiere recorridas o validaciones, sin inferir atributos sensibles de personas.

### Comunicación

Verifica coherencia entre hechos, propuestas, vocerías y publicaciones.
Identifica mensajes contradictorios o sin respaldo.

### Analista

Explora indicadores, calidad de datos y cambios temporales. Distingue hechos,
estimaciones e hipótesis.

### Marketing

Propone calendarios, variantes por canal y experimentos de contenido basados en
objetivos aprobados. No realiza microsegmentación sensible.

### Jurídico

Localiza normativa, relaciones y posibles conflictos. Cita documentos y
versiones. Sus resultados son asistencia, no dictamen legal.

### Presupuesto

Revisa costos, supuestos, partidas y consistencia de estimaciones. Expone
incertidumbre y fuentes.

### Agenda

Prepara reuniones, detecta conflictos, reúne contexto y sugiere seguimiento.
No invita ni reprograma sin confirmación.

### Redactor

Produce borradores basados sólo en fuentes autorizadas y conserva citas
internas. No publica.

### Creativo

Propone conceptos y adaptaciones visuales dentro de la marca. Separa claramente
contenido real de material ilustrativo.

## 8.3 Orquestación

Un coordinador recibe el objetivo, selecciona agentes, limita contexto y
consolida sugerencias. Las tareas deben usar `correlationId`, referencias y
versiones. Si dos agentes discrepan, la interfaz muestra evidencia y diferencia,
no una respuesta artificialmente unificada.

## 8.4 Evaluación

Antes de producción deben medirse:

- exactitud de citas;
- tasa de sugerencias aceptadas;
- ediciones humanas necesarias;
- omisiones críticas;
- exposición indebida de datos;
- costo y latencia;
- estabilidad entre ejecuciones.

---

# 9. Experiencia de usuario

## 9.1 Reglas

1. Una acción frecuente debe encontrarse en tres interacciones o menos.
2. Cada pantalla responde primero “¿qué requiere atención?”.
3. Toda recomendación muestra por qué aparece, fecha y evidencia.
4. Barrio, propuesta y documento ofrecen contexto relacionado desde su ficha.
5. Los estados importantes se expresan con texto, no sólo color.
6. Los formularios largos permiten borrador y progreso.
7. Las acciones destructivas explican impacto y ofrecen recuperación cuando sea
   posible.
8. La interfaz recuerda filtros útiles por usuario, no de forma global.
9. El modo móvil prioriza captura y consulta rápida.
10. Las tablas admiten búsqueda, filtros, orden y vistas guardadas.
11. El sistema distingue vacío, error, falta de permiso y falta de datos.
12. La carga no debe bloquear el resto de la pantalla.
13. El usuario puede abrir el origen de una métrica o insight.
14. Las notificaciones son configurables y agrupadas.
15. La navegación usa lenguaje de trabajo, no lenguaje técnico del dominio.

## 9.2 Arquitectura de información

Navegación primaria recomendada para V1:

- Inicio
- Inteligencia
- Territorio
- Propuestas
- Documentos
- Agenda
- Trabajo
- Comunicación
- Configuración

Presupuesto puede vivir dentro de Propuestas hasta adquirir flujos propios.
Equipo se gestiona desde Trabajo/Configuración según el caso. Biblioteca es una
vista dentro de Documentos. Esta reducción evita una barra lateral extensa.

## 9.3 Accesibilidad

Objetivo mínimo WCAG 2.2 AA:

- navegación completa por teclado;
- foco visible;
- contraste suficiente;
- etiquetas accesibles;
- escalado de texto;
- no depender de animación;
- lenguaje claro;
- soporte para lectores de pantalla;
- áreas táctiles adecuadas.

---

# 10. Diseño visual

## 10.1 Principios

- jerarquía fuerte, ornamentación mínima;
- densidad adaptable al rol y dispositivo;
- superficies limpias y bordes sutiles;
- color reservado para estado, prioridad y acción;
- tipografía como principal herramienta de organización;
- consistencia sobre novedad;
- movimiento funcional y reducido;
- temas claro y oscuro equivalentes, no simples inversiones.

## 10.2 Sistema

El producto necesita tokens semánticos para:

- fondos y superficies;
- texto primario, secundario y deshabilitado;
- bordes;
- estados informativos, positivos, preventivos y críticos;
- espaciado;
- radios;
- sombras;
- tipografía;
- movimiento.

Los componentes deben documentar variantes, estados vacíos, errores, carga,
permisos y responsive. Antes de ampliar el catálogo conviene consolidar los
componentes ya existentes en un pequeño sistema de diseño probado.

## 10.3 Visualización de datos

- evitar gráficos si una frase comunica mejor el hallazgo;
- incluir período, unidad, fuente y denominador;
- no usar áreas o colores que exageren cambios;
- mostrar datos faltantes;
- permitir acceder al detalle;
- distinguir dato observado de estimación.

---

# 11. Modelo de datos y relaciones

## 11.1 Núcleo actual

`Municipio` es el agregado raíz del tenant. Sus entidades relacionadas son:

```text
Municipio
 ├─ Barrio
 │   ├─ Problema
 │   ├─ Recorrida
 │   ├─ Propuesta
 │   ├─ Documento
 │   └─ Compromiso
 ├─ Secretaría
 │   ├─ Unidades administrativas
 │   ├─ Propuesta
 │   ├─ Documento
 │   └─ Compromiso
 ├─ Evento
 │   ├─ Recorrida
 │   ├─ Decisiones
 │   └─ Compromiso
 ├─ Equipo
 │   ├─ Miembros
 │   ├─ Roles
 │   └─ Permisos
 └─ Publicación
     ├─ Propuesta
     ├─ Documento
     └─ Barrio
```

Las relaciones por identificador evitan cargar grafos completos y facilitan
consultas selectivas. `AuditMetadata` soporta historial y concurrencia.

## 11.2 Entidades necesarias antes de V1

### Organization

Unidad contractual, de seguridad y facturación.

### Workspace

Contexto operativo temporal: campaña, transición o gestión.

### User y Membership

Identidad global y relación con organización, municipio, workspace y roles.

### Task

Trabajo operativo simple, separado de `Compromiso`.

### Decision

Resultado explícito de reuniones o procesos, con fundamento y responsables.

### DataSource

Origen, licencia, fecha, confiabilidad y método de actualización.

### NotificationPreference

Preferencias por usuario y tipo de evento.

### AuditEvent

Registro inmutable de acciones relevantes.

### Taxonomy

Categorías configurables con claves estables.

## 11.3 Reglas de integridad

- toda entidad operativa pertenece a un tenant;
- una referencia no cruza tenant;
- los cambios de estado registran actor y momento;
- una métrica declara fuente, período y unidad;
- un compromiso completado registra evidencia o nota;
- un insight conserva regla y referencias;
- la eliminación de registros críticos debe ser lógica y auditable;
- documentos versionados no se sobrescriben silenciosamente.

---

# 12. Escalabilidad a cinco años

## Año 1: validar el núcleo

Monolito modular Next.js + Supabase, repositorios tipados, RLS, almacenamiento,
trabajos básicos en segundo plano y observabilidad. Es la opción más eficiente:
microservicios ahora aumentarían complejidad sin una carga demostrada.

## Año 2: fortalecer colaboración

Búsqueda especializada, colas para procesamiento documental, auditoría,
notificaciones, integraciones y API versionada.

## Año 3: inteligencia asistida

Índice semántico aislado por tenant, evaluación de agentes, trazabilidad de
prompts y fuentes, presupuestos de uso y controles humanos.

## Año 4: plataforma

Webhooks, catálogo de extensiones, administración multi-organización,
configuración regional y residencia de datos.

## Año 5: escala enterprise e internacional

Despliegue regional, alta disponibilidad, recuperación probada, SSO, SCIM,
controles regulatorios por país y analítica federada.

## Decisiones técnicas

- mantener monolito modular hasta que métricas de carga o equipos justifiquen
  separación;
- introducir colas sólo para trabajo asíncrono real;
- versionar APIs y eventos;
- usar migraciones revisadas;
- probar contratos de repositorios;
- instrumentar logs, métricas y trazas sin datos sensibles;
- definir SLO antes de prometer SLA;
- realizar restauraciones de backup, no sólo backups;
- presupuestar almacenamiento, procesamiento documental e IA por tenant.

---

# 13. Monetización SaaS

Los planes deben diferenciar valor, colaboración, seguridad y escala; no
fragmentar artificialmente funciones esenciales de integridad.

## Plan Gratuito — Evaluación

**Para:** equipos pequeños que quieren probar un flujo.

- un workspace de demostración;
- hasta tres usuarios;
- barrios, recorridas, problemas y compromisos con límites;
- documentos limitados;
- reglas básicas;
- exportación estándar;
- soporte de comunidad.

**Motivo:** permitir experimentar valor real sin alojar operaciones completas
de forma indefinida.

## Plan Profesional — Operación de campaña o equipo

**Para:** equipos electorales, concejales y consultoras pequeñas.

- usuarios y almacenamiento ampliados;
- propuestas, agenda y comunicación;
- Centro de Inteligencia completo;
- búsqueda global;
- permisos por rol;
- importación y exportación;
- plantillas;
- soporte estándar.

**Precio:** suscripción por workspace con banda de usuarios, no por cada
voluntario ocasional. Cobrar estrictamente por asiento puede desalentar adopción.

## Plan Gobierno — Gestión municipal

**Para:** municipios y organismos públicos.

- módulos completos;
- múltiples áreas;
- auditoría;
- conservación y políticas de datos;
- integraciones;
- API;
- capacitación;
- soporte prioritario;
- entornos de prueba;
- compromisos de disponibilidad.

**Precio:** contrato anual basado en tamaño, uso y servicios. Debe contemplar
procesos de compra pública y facturación local.

## Plan Enterprise — Red y gobernanza

**Para:** grandes municipios, provincias, alianzas o consultoras con múltiples
clientes.

- múltiples organizaciones y municipios;
- SSO/SAML y SCIM;
- controles centralizados;
- residencia de datos;
- SLA;
- soporte dedicado;
- auditoría avanzada;
- límites e infraestructura negociados;
- marca blanca limitada;
- portabilidad y asistencia de migración.

## Complementos

- procesamiento documental;
- almacenamiento adicional;
- conectores específicos;
- implementación y migración;
- capacitación;
- asistencia inteligente con presupuesto y controles.

La IA debe cobrarse por consumo transparente o capacidad contratada, no ocultar
costos variables dentro de planes ilimitados.

---

# 14. Riesgos y mitigaciones

## 14.1 Riesgos técnicos

### Aislamiento multi-tenant insuficiente

**Impacto:** exposición grave de información.  
**Mitigación:** RLS, pruebas automatizadas entre tenants, revisión de permisos,
auditoría y claves de almacenamiento aisladas.

### Dominio sobrediseñado antes de validar uso

**Impacto:** complejidad y baja velocidad.  
**Mitigación:** implementar verticales completas, medir uso y posponer agregados
sin flujo validado.

### Falta de pruebas automatizadas

**Impacto:** regresiones en reglas y estados.  
**Mitigación:** pruebas unitarias del dominio y Rule Engine, contratos de
repositorios, integración y recorridos críticos end-to-end antes de persistencia.

### PWA offline inconsistente

**Impacto:** datos obsoletos o pérdida de capturas.  
**Mitigación:** estrategia explícita de sincronización, colas locales,
resolución de conflictos y estados de conectividad. No cachear respuestas
privadas indiscriminadamente.

### Crecimiento documental

**Impacto:** costo, lentitud y búsqueda deficiente.  
**Mitigación:** límites, procesamiento asíncrono, versiones, índices y políticas
de retención.

## 14.2 Riesgos de producto

### Convertirse en “software para todo”

**Mitigación:** north star centrada en tiempo para comprender y dar seguimiento;
criterio de salida por módulo; eliminar vistas sin uso.

### Dashboard sin acción

**Mitigación:** cada resumen debe tener evidencia, responsable o próximo paso.

### Confusión entre campaña y gobierno

**Mitigación:** workspaces, vocabulario y módulos configurables; separar datos
cuando exista obligación legal o contractual.

### IA como demostración sin confianza

**Mitigación:** posponerla hasta tener fuentes, evaluación, permisos y aprobación.

## 14.3 Riesgos de adopción

### Carga de datos excesiva

**Mitigación:** importaciones, captura progresiva, defaults y valor visible en la
primera hora.

### Equipos con madurez digital desigual

**Mitigación:** modos simples, capacitación por rol, soporte móvil y plantillas.

### Regreso a WhatsApp y planillas

**Mitigación:** integraciones prudentes, acciones rápidas y briefs/exportaciones
útiles; no intentar prohibir herramientas existentes.

## 14.4 Riesgos éticos y regulatorios

### Datos personales y perfilado

**Mitigación:** minimización, finalidad, base legal, permisos, retención,
evaluaciones de impacto y prohibición de inferencias sensibles.

### Uso partidario de información institucional

**Mitigación:** separación por workspace, políticas, auditoría y exportación.

### Recomendaciones sesgadas

**Mitigación:** fuentes visibles, reglas auditables, revisión humana y pruebas
con contextos diversos.

## 14.5 Riesgos de mantenimiento

### Taxonomías incompatibles entre municipios

**Mitigación:** claves canónicas con etiquetas locales y mapeos versionados.

### Componentes duplicados

**Mitigación:** sistema de diseño pequeño, ownership y revisión de API.

### Dependencia de proveedor

**Mitigación:** repositorios, exportación completa, formatos abiertos y
adaptadores.

---

# 15. Criterios de éxito

## 15.1 Métrica principal

**Porcentaje de decisiones o compromisos relevantes que conservan contexto,
responsable y seguimiento dentro del sistema.**

Mide si el producto cumple su propósito sin atribuirse resultados políticos.

## 15.2 Activación

- tiempo hasta crear o importar el primer barrio;
- tiempo hasta registrar la primera recorrida;
- porcentaje de workspaces que completan un circuito vinculado en siete días;
- usuarios que consultan nuevamente un dato registrado.

## 15.3 Eficiencia

- tiempo promedio para preparar una reunión territorial;
- tiempo para localizar una ordenanza relacionada;
- tiempo desde observación hasta responsable asignado;
- tiempo para recuperar antecedentes de un barrio;
- reducción de carga duplicada.

## 15.4 Calidad de información

- porcentaje de problemas con origen y evidencia;
- propuestas con diagnóstico, responsable e indicadores;
- documentos clasificados;
- compromisos vencidos sin actualización;
- relaciones reutilizadas entre módulos;
- insights con evidencia accesible.

## 15.5 Adopción

- usuarios activos semanales por rol;
- retención de equipos a 4, 8 y 12 semanas;
- porcentaje de áreas activas;
- frecuencia de actualización;
- distribución de contribuciones para detectar dependencia de una sola persona.

## 15.6 Confianza

- tasa de insights abiertos y descartados;
- motivos de descarte;
- incidentes de permisos;
- correcciones de datos;
- satisfacción con búsqueda y preparación de reuniones.

## 15.7 Guardrails

- tiempo dedicado a carga administrativa;
- notificaciones ignoradas;
- datos sin uso durante períodos extensos;
- accesos a información sensible;
- costo de infraestructura por tenant;
- errores y sincronizaciones fallidas.

No se usarán votos, intención electoral ni resultados de elecciones como métrica
de éxito del producto.

---

# 16. Auditoría crítica del proyecto actual

## 16.1 Fortalezas

1. **Stack mínimo y moderno.** Next.js, React, TypeScript estricto, Tailwind y
   ESLint sin dependencias innecesarias reducen superficie de mantenimiento.
2. **Dominio desacoplado.** Las entidades no dependen de UI o persistencia.
3. **Multi-municipio temprano.** `municipioId` aparece en entidades operativas y
   contratos de repositorios.
4. **Puertos claros.** Repositorios y servicios permiten incorporar Supabase sin
   contaminar el dominio.
5. **Inteligencia explicable.** El Rule Engine ofrece una base más confiable que
   comenzar por IA generativa.
6. **Diseño coherente.** Existe tema, navegación responsive y componentes
   reutilizables.
7. **Build disciplinado.** Los sprints se cerraron con lint, tipado y build.
8. **Documentación arquitectónica.** Las decisiones principales están
   registradas.

## 16.2 Debilidades

1. **No hay persistencia ni flujos reales.** El producto todavía es una
   demostración visual y contractual, no un sistema operativo utilizable.
2. **No hay autenticación ni autorización.** El modelo de roles existe, pero no
   hay membresías, políticas ni aislamiento ejecutable.
3. **No hay pruebas automatizadas.** El motor de reglas y el dominio son ideales
   para pruebas, pero sólo se validan compilación y lint.
4. **No existe búsqueda.** Es una omisión crítica para documentos y contexto.
5. **La PWA tiene caché básica, no estrategia de datos offline.** Antes de datos
   privados debe revisarse el service worker para evitar respuestas obsoletas o
   exposición en dispositivos compartidos.
6. **Navegación conceptual superpuesta.** Resumen e Inteligencia pueden duplicar
   propósito; Marketing y Comunicación están separados en arquitectura, pero la
   UI sólo muestra Marketing.
7. **El dominio no modela todavía Organización, Workspace, Membership, Decision,
   Task, DataSource ni AuditEvent.**
8. **Las fechas mock son fijas.** Es correcto para repetibilidad, pero la UI no
   debe confundirse con datos actuales cuando evolucione.
9. **No hay estados de carga, error, permisos o datos vacíos probados.**
10. **No hay política explícita de privacidad**, especialmente relevante para
    Vecinos, referentes y comunicación.
11. **Los servicios son principalmente contratos.** Aún falta una capa coherente
    de casos de uso que aplique autorización y transacciones.
12. **El Rule Engine usa umbrales embebidos.** Deben convertirse en políticas
    configurables y versionadas antes de escalar.

## 16.3 Módulos que sobran o deben consolidarse

- **Marketing** sobra como módulo primario en V1; debe integrarse en Comunicación.
- **Biblioteca** no debe construirse como módulo de almacenamiento independiente;
  es una vista curada de Documentos y recursos.
- **Barrios** no debe competir con Territorio; es su principal vista y agregado.
- **Presupuesto** puede comenzar dentro de Propuestas mientras no exista un flujo
  presupuestario completo.
- **Vecinos**, tal como está nombrado, debe replantearse por privacidad y
  finalidad.

No se recomienda eliminar hoy las rutas existentes: la consolidación debe
realizarse después de pruebas de navegación y con redirecciones compatibles.

## 16.4 Módulos faltantes

Prioridad alta:

- búsqueda global;
- Trabajo/Compromisos;
- Documentos en la interfaz;
- Equipo y permisos;
- onboarding;
- auditoría;
- importación/exportación.

Prioridad media:

- decisiones;
- fuentes de datos;
- notificaciones;
- taxonomías;
- vistas guardadas;
- calidad de datos.

Prioridad posterior:

- Biblioteca curada;
- integraciones;
- IA y agentes;
- analítica comparativa.

## 16.5 Funcionalidades que eliminaría o evitaría

- contadores sin interpretación;
- datos personales de vecinos sin finalidad operacional legítima;
- predicciones electorales;
- feed social interno;
- editor gráfico propio;
- chatbot genérico;
- gamificación de voluntarios;
- notificaciones por cada cambio;
- personalización ilimitada por municipio;
- microservicios prematuros;
- publicación automática por agentes;
- métricas de vanidad como cantidad bruta de registros.

## 16.6 Funcionalidades que agregaría primero

1. autenticación, membresía y RLS;
2. casos de uso de CRUD con auditoría;
3. búsqueda global;
4. captura móvil de recorridas;
5. trabajo y compromisos;
6. documentos con fuentes y versiones;
7. permisos por rol;
8. estados vacíos, error y carga;
9. importación/exportación;
10. pruebas automatizadas y observabilidad.

Este orden prioriza confianza y operación antes que amplitud.

## 16.7 Qué cambiaría para un producto internacional

- separar `Organization`, `Municipality` y `Workspace`;
- usar códigos ISO para país, moneda, idioma y subdivisiones;
- evitar que `Secretaría`, `Barrio`, `Ordenanza` o `Concejo Deliberante` sean
  supuestos universales; modelar tipos administrativos configurables;
- internacionalizar textos, fechas, zonas horarias y formatos;
- soportar terminología local mediante diccionarios;
- definir residencia y transferencia internacional de datos;
- documentar bases legales por jurisdicción;
- ofrecer regiones de despliegue;
- soportar direcciones y geometrías diversas;
- desacoplar canales de comunicación de una lista cerrada;
- diseñar accesibilidad y lectura de derecha a izquierda cuando corresponda;
- separar características electorales de gestión pública mediante workspaces;
- evitar referencias visuales o de lenguaje partidarias;
- permitir exportación y portabilidad en formatos abiertos.

## 16.8 Veredicto

La base técnica es prometedora y está mejor estructurada que muchos prototipos
de su etapa. Sin embargo, todavía no existe evidencia de que los equipos
mantendrán los datos actualizados ni de que la estructura reduzca trabajo real.
El mayor riesgo no es técnico: es construir una ontología completa antes de
validar el circuito operativo.

La siguiente etapa no debería sumar otro dashboard ni un agente. Debería hacer
funcionar de punta a punta, con persistencia y permisos, un solo flujo de alto
valor. La recomendación es:

> Construir y pilotear territorio → problema → compromiso/propuesta →
> seguimiento, con documentos y búsqueda como soporte.

Si ese circuito logra adopción sostenida, el dominio y el Centro de Inteligencia
se convierten en ventajas reales. Si no la logra, agregar módulos sólo ampliará
la superficie de una aplicación que el equipo consulta pero no alimenta.

---

# 17. Decisiones pendientes de validación

Antes de comenzar V1, Product Management debe validar:

1. ¿Quién es el primer comprador: campaña, municipio o consultora?
2. ¿Cuál es el primer usuario diario?
3. ¿Qué información acepta registrar durante una recorrida?
4. ¿Qué constituye un compromiso relevante?
5. ¿Qué documentos necesita encontrar con mayor frecuencia?
6. ¿Qué datos personales son realmente indispensables?
7. ¿Campaña y gestión deben compartir organización pero usar workspaces separados?
8. ¿Qué permisos requiere cada rol?
9. ¿Qué integraciones son condición de adopción?
10. ¿Cuál es el proceso de salida y exportación de un cliente?

Estas respuestas determinan alcance, modelo comercial, seguridad y arquitectura
de datos. Implementarlas por suposición sería más costoso que validarlas ahora.
