# Tracer: workspace de growth con IA — brief del producto

6 de noviembre de 2026

## El producto

**Tracer** es un workspace con IA donde un PM de growth pregunta en lenguaje natural dónde se pierde la conversión. Recibe una respuesta que cruza GA4, Clarity y el CRM, y sale con un experimento diseñado y listo para compartir. Lo construimos como prototipo funcional con datos demo y respuestas simuladas, y lo publicamos como caso nuevo en leandrobalbian.com.

**Para quién.** PM o líder de growth en un SaaS B2B o marketplace de 5 a 50 personas. Tiene los datos repartidos en tres herramientas y nadie que los cruce.

**El problema.** Cada herramienta cuenta una parte. GA4 dice cuántos se van, Clarity muestra cómo se comportan y el CRM dice quiénes eran. El cruce se hace a mano en una planilla, o no se hace, y el equipo discute opiniones en vez de evidencia.

**Los tres trabajos que resuelve:**

1. Ubicar la fuga: en qué paso del funnel y en qué segmento cae la conversión.
2. Explicar por qué: sesiones de Clarity y registros del CRM que respaldan la hipótesis.
3. Diseñar qué probar: hipótesis, cambio, métrica principal y guardiana, duración estimada y criterio para escalar o descartar.

**Principio de diseño.** Ninguna cifra sin fuente. Cada número que dice el asistente lleva una etiqueta (GA4, Clarity o CRM) que abre el dato de origen. Es la versión de producto de tu regla de trabajo: no presentar un número sin validarlo.

**Alcance del MVP.** Una empresa ficticia, datos demo creíbles, sin conectores reales y **sin IA real**. Tracer es una demo visual: el asistente responde con guiones simulados que corren en el cliente y que leen el mismo dataset demo. Lo que se evalúa es el diseño de la decisión, no la integración.

**Qué tiene que demostrar en el portfolio.** Que diseñas productos de IA con criterio de growth y que llevas un concepto a un prototipo funcional con agentes de código. Complementa a Sentinel OS (supervisar agentes) y Ghosts (cruzar bases para encontrar leads perdidos) sin repetirlos.

## De la referencia al producto

La interfaz sigue `docs/referencias/workspace.png`. De la referencia toma la estructura, la densidad y el material; la marca, los textos y la paleta son propios de Tracer.

| En la referencia | En Tracer |
| --- | --- |
| Pastillas Overview, Analytics, Sales, Marketing, Customers, AI Assistant | Resumen, Funnel, Segmentos, Sesiones, CRM y Asistente (activa) |
| Sidebar: búsqueda, Notification, Home, Contacts, Deals, Tasks, Reports, Automations, New Chat | Búsqueda, Alertas (3), Inicio, Análisis, Experimentos, Informes, Fuentes y Nuevo análisis |
| Tarjeta de usuario con plan y “Upgrade” | Valentina R., PM de Growth en Cuadra, con la nota “Datos demo” |
| “AI Assistant · Connected to Analytics Engine” | “Asistente · Conectado a GA4, Clarity y CRM”, con Compartir, Exportar y más acciones |
| “What would you like to analyze today?” | “¿Qué quieres analizar hoy?” con la marca de Tracer |
| Chips Analyze revenue, Identify churn, Forecast | Encontrar la fuga, Explicar la caída de demos, Diseñar un experimento |
| Composer con +, micrófono y voz | Composer con + (fuentes y periodo) y enviar. Sin micrófono: no hay controles que no hagan nada |
| “AI Insights Timeline” con All, Alerts, Forecast, Automation | “Hallazgos” con Todo, Alertas, Experimentos y Fuentes |

## Pantallas y flujos del MVP

El MVP son siete pantallas, pero la demo del portfolio recorre solo el flujo principal en unos dos minutos. Todo lo demás existe para que el producto se sienta real cuando alguien explore.

**Flujo principal (el guion de la demo):**

1. Valentina, PM de growth de Cuadra, abre Tracer y ve el hallazgo del día: las demos agendadas cayeron 18 % esta semana.
2. Toca “Explicar una caída”. El asistente dibuja el funnel y marca el paso: formulario completado → demo agendada, solo en mobile.
3. Abre la evidencia: tres sesiones de Clarity donde el calendario no carga en iOS y 42 leads del CRM con formulario completo y sin demo.
4. Pide “Diseñar experimento”. El asistente separa lo que es bug (el calendario en iOS se arregla sin test) de lo que vale la pena probar: agendar la demo dentro del mismo formulario. Recibe hipótesis, métricas y una duración de tres semanas calculada con su tráfico.
5. Lo guarda en Experimentos y copia el resumen para su equipo.
6. En el estado demo “tres semanas después”, lee el resultado y marca la decisión: escalar.

**Pantallas:**

| Pantalla | Qué hace | Piezas clave |
| --- | --- | --- |
| Inicio | Saludo con hallazgo, tres tarjetas de trabajo, composer e historial | Tarjeta de hallazgo con mini gráfico, chips de fuente |
| Hilo de análisis | Conversación con respuestas enriquecidas | Funnel con el paso marcado, tabla de segmentos, tarjetas de evidencia, etiqueta de fuente en cada cifra |
| Panel de evidencia | Se abre al tocar una etiqueta de fuente | Origen del dato, rango de fechas, tamaño de muestra, sesiones o registros |
| Diseño de experimento | Formulario que el asistente deja prellenado y la persona ajusta | Hipótesis “si…, entonces…, porque…”, métricas, segmento, duración, criterio de decisión |
| Experimentos | Tablero por estado | Columnas: por diseñar, en curso, para leer, decidido; insignia escalar, iterar o descartar |
| Fuentes | Estado de GA4, Clarity y CRM | Última sincronización, eventos mapeados, editor de etapas del funnel |
| Alertas | Caídas detectadas automáticamente | Cada alerta tiene “Analizar”, que abre un hilo con el contexto |

**Estados que hay que diseñar desde el inicio:** carga mientras el asistente responde (con botón para detener y opción de saltar la animación), fuente desconectada, periodo sin datos suficientes, y pregunta que el asistente no puede respaldar con datos (lo dice en vez de inventar y ofrece los tres caminos).

## Stack técnico

Repo nuevo y separado del portfolio, con Next.js App Router, Tailwind v4 y shadcn/ui, desplegado en Vercel. El portfolio solo enlaza a la demo. Así el `shadcn init` no toca el `globals.css` del sitio ni choca con la regla de 0 px en español de tu `AGENTS.md`.

Todo corre en el cliente: no hay rutas de API, claves ni variables de entorno. Las páginas se prerenderizan y se despliegan como estáticas en Vercel.

| Capa | Elección | Nota |
| --- | --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript | Misma versión mayor que el portfolio (16.x) para no aprender dos APIs |
| UI | shadcn/ui, base Radix, íconos lucide | El portfolio ya usa lucide-react |
| Tema | next-themes | Claro por defecto; selector con claro, oscuro y sistema |
| Movimiento | motion (sucesor de framer-motion), desde la Fase 1 | Transiciones; respeta `prefers-reduced-motion` |
| Gráficos | Componente Chart de shadcn (Recharts) | Funnel, tendencias y mini gráficos del historial |
| Asistente | Motor de guion en el cliente (`lib/demo/`) sobre herramientas locales (`lib/ai/tools.ts`) | Respuestas simuladas; solo cita cifras que devuelven las herramientas |
| Datos | Archivos TypeScript con el dataset demo | Sin base de datos en el MVP |
| Estado | Historial y experimentos en localStorage | Envuelto en try/catch y leído después de montar |

**Por qué herramientas con fuente aunque la IA sea simulada.** El asistente “consulta” funciones locales como `getFunnel`, `getSegments`, `getSessions`, `getCrmLeads`, `getChangelog` y `estimateDuration`. Cada una devuelve `{ data, source }`, y el front pinta cada resultado como bloque rico (gráfico, tabla, tarjeta de evidencia) con su etiqueta. Los guiones no escriben cifras a mano: las leen de esas herramientas. Así el principio “ninguna cifra sin fuente” lo garantiza la arquitectura, y el día que entre un modelo real, las herramientas ya están listas para tool use.

**Motor de respuestas simuladas (`lib/demo/`).** Cada respuesta es una secuencia de pasos:

1. Chips de consulta (“Consultando GA4: funnel semanal”) que se van resolviendo uno a uno.
2. Texto que aparece de a poco.
3. Bloques ricos al final: funnel, segmentos, evidencia y propuesta de experimento.

Las tres tarjetas de trabajo disparan guiones completos. El texto libre se resuelve por palabras clave; si nada coincide, el asistente responde con honestidad que no puede respaldar esa pregunta con los datos que tiene y ofrece los tres caminos. Siempre hay botón para detener, opción de saltar la animación, y con `prefers-reduced-motion` la respuesta aparece completa sin animar.

**Reglas para que el deploy salga sin sorpresas:**

- Todas las páginas se pueden prerenderizar. Nada de rutas de API ni de código que solo funcione en local.
- Lo que depende de localStorage o del tema se lee después de montar (hook `useMounted`), para no tener errores de hidratación.
- Todo acceso a localStorage va envuelto en try/catch y la página funciona igual si falla.

**Componentes shadcn por pantalla:**

- Estructura: `Sidebar` a la izquierda, `SidebarInset` al centro, panel de historial con `ScrollArea` a la derecha (en mobile, `Sheet`).
- Inicio: `Card` para el hallazgo y las tres tarjetas de trabajo; `Chart` para el mini gráfico.
- Composer: `InputGroup` con `InputGroupTextarea`; `ToggleGroup` múltiple para fuentes; `Select` para periodo; `DropdownMenu` para segmento; `Button` con `Spinner` mientras responde.
- Hilo: `Chart` de barras para el funnel, `Table` para segmentos, `Badge` de fuente con `HoverCard`, `Sheet` para la evidencia, `Skeleton` en carga, `Alert` cuando no hay datos suficientes.
- Experimento: `Dialog` con `FieldGroup`, `Field`, `Textarea`, `Select` y `Slider` para el efecto mínimo; `sonner` para confirmar.
- Experimentos: columnas con `Card` por estado y `Badge` de decisión.
- Fuentes y alertas: `Card`, `Switch`, `Table`, `Empty` para el estado vacío.
- Búsqueda global: `Command` dentro de `Dialog` con ⌘K.

**Estructura de carpetas:**

```
tracer/
  app/
    (workspace)/layout.tsx          sidebar + historial
    (workspace)/page.tsx            inicio
    (workspace)/analisis/[id]/page.tsx
    (workspace)/experimentos/page.tsx
    (workspace)/fuentes/page.tsx
    (workspace)/alertas/page.tsx
  components/ui/                    shadcn, sin editar a mano
  components/workspace/             app-sidebar, history-panel, composer, finding-card
  components/analysis/              message, funnel-chart, segment-table, evidence-sheet, source-badge
  components/experiments/           experiment-dialog, board
  hooks/                            use-mounted y otros hooks de cliente
  lib/data/                         dataset demo de Cuadra
  lib/ai/                           tools.ts: herramientas locales que devuelven { data, source }
  lib/demo/                         motor de guion: guiones, pasos y resolución por palabras clave
  lib/stats.ts                      tamaño de muestra y duración
  docs/brief.md                     este archivo
  AGENTS.md                         reglas del repo para agentes de código
  CLAUDE.md                         referencia a AGENTS.md
```

## Tema shadcn: sistema visual de Tracer

Tracer tiene una paleta propia, fría y azulada, separada del sistema del portfolio (bosque, latón y vino). Sale de la referencia de `docs/referencias/workspace.png`: paneles traslúcidos sobre un degradado suave, bordes finos y muy redondeados, sombras mínimas y un brillo azul en el panel central. El tema claro es el de entrada (`defaultTheme="light"`); el selector sigue ofreciendo claro, oscuro y sistema. Los valores viven en `app/globals.css`:

```css
:root {
  --radius: 0.75rem;
  --background: #F4F6FA;
  --foreground: #1A1F2C;
  --card: #FFFFFF;
  --card-foreground: #1A1F2C;
  --popover: #FFFFFF;
  --popover-foreground: #1A1F2C;
  --primary: #4D74E6;
  --primary-foreground: #FFFFFF;
  --secondary: #EDF1F8;
  --secondary-foreground: #1A1F2C;
  --muted: #EDF1F8;
  --muted-foreground: #6B7385;
  --accent: #E6ECF7;
  --accent-foreground: #1A1F2C;
  --destructive: #D64545;
  --border: #DDE3EE;
  --input: #D3DAE7;
  --ring: #4D74E6;
  --chart-1: #4D74E6;            /* primary */
  --chart-2: #7B95F0;
  --chart-3: #A99BEF;            /* lavanda */
  --chart-4: #C6D3F7;
  --chart-5: #94A0B8;
  --sidebar: #F4F6FA;            /* sólido para el Sheet; en escritorio va sobre el shell */
  --sidebar-foreground: #3A4152;
  --sidebar-primary: #4D74E6;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #E6ECF7;
  --sidebar-accent-foreground: #1A1F2C;
  --sidebar-border: #DDE3EE;
  --sidebar-ring: #4D74E6;
  /* Fuentes de datos, legibles como texto */
  --source-ga4: #9A5B00;         /* ámbar */
  --source-clarity: #7A4FD6;     /* violeta */
  --source-crm: #1A7A50;         /* verde */
  /* Tonos de estado */
  --tone-danger: #D64545;
  --tone-danger-soft: #FDECEC;
  --tone-warning: #C27A0E;
  --tone-warning-soft: #FDF3E1;
  --tone-info: #4D74E6;
  --tone-info-soft: #E8EEFC;
  --tone-success: #1F9D6B;
  --tone-success-soft: #E3F6EE;
  /* Material del workspace */
  --shell-from: #DCE4F3;
  --shell-to: #EEF2F9;
  --panel: rgb(255 255 255 / 0.72);
  --panel-border: rgb(255 255 255 / 0.9);   /* borde interior */
  --panel-outline: #DDE3EE;                 /* borde exterior */
  --nav-active: #1E2330;
  --nav-active-foreground: #FFFFFF;
  --glow: rgb(77 116 230 / 0.18);
  --brand-from: #4D74E6;
  --brand-to: #A99BEF;
}

.dark {
  --background: #0D111C;
  --foreground: #E7EBF5;
  --card: #161C2B;
  --card-foreground: #E7EBF5;
  --popover: #161C2B;
  --popover-foreground: #E7EBF5;
  --primary: #7C9BFF;
  --primary-foreground: #0D111C;
  --secondary: #1C2335;
  --secondary-foreground: #E7EBF5;
  --muted: #1C2335;
  --muted-foreground: #8A93A8;
  --accent: #1C2335;
  --accent-foreground: #E7EBF5;
  --destructive: #F06A6A;
  --border: #263049;
  --input: #263049;
  --ring: #7C9BFF;
  --chart-1: #7C9BFF;            /* primary */
  --chart-2: #A3B6FF;
  --chart-3: #C2B5FF;
  --chart-4: #5468B8;
  --chart-5: #4A5470;
  --sidebar: #0D111C;
  --sidebar-foreground: #C3CADB;
  --sidebar-primary: #7C9BFF;
  --sidebar-primary-foreground: #0D111C;
  --sidebar-accent: #1C2335;
  --sidebar-accent-foreground: #E7EBF5;
  --sidebar-border: #263049;
  --sidebar-ring: #7C9BFF;
  --source-ga4: #F5B754;
  --source-clarity: #B79CFF;
  --source-crm: #4CD4A0;
  --tone-danger: #FF8A8A;
  --tone-danger-soft: rgb(255 138 138 / 0.14);
  --tone-warning: #F5B754;
  --tone-warning-soft: rgb(245 183 84 / 0.14);
  --tone-info: #7C9BFF;
  --tone-info-soft: rgb(124 155 255 / 0.16);
  --tone-success: #4CD4A0;
  --tone-success-soft: rgb(76 212 160 / 0.14);
  --shell-from: #141A2A;
  --shell-to: #1A2236;
  --panel: rgb(255 255 255 / 0.04);
  --panel-border: rgb(255 255 255 / 0.06);
  --panel-outline: #263049;
  --nav-active: #E7EBF5;
  --nav-active-foreground: #0D111C;
  --glow: rgb(124 155 255 / 0.22);
  --brand-from: #7C9BFF;
  --brand-to: #B79CFF;
}
```

**Material.** Dos utilidades en `globals.css` arman el material sin valores sueltos en los componentes:

- `panel-surface`: fondo `--panel`, borde exterior `--panel-outline` y filo interior `--panel-border` como sombra inset, más una sombra mínima. La usa el componente `Panel`.
- `glow-bottom`: degradado radial con `--glow` que sube desde abajo del panel central, detrás de los chips y el composer.

El shell es un degradado de `--shell-from` a `--shell-to`. La marca es el glifo de líneas que convergen sobre un cuadrado con degradado de `--brand-from` (primary) a `--brand-to` (lavanda).

**Tonos de estado.** `--tone-danger`, `--tone-warning`, `--tone-info` y `--tone-success`, cada uno con su `-soft` para el fondo del ícono. Los hallazgos usan danger para la caída de demos, warning para Android, info para el calendario y Clarity, y success para el experimento listo.

**Tipografía.** Plus Jakarta Sans para todo, alojada en `app/fonts/` y cargada con `next/font/local` desde `lib/fonts.ts` en pesos 400, 500 y 600. Los títulos van en 400 o 500 con `tracking-heading` (−0.02em); no se usan pesos 300.

**Reglas que Claude Code tiene que respetar.** Colores siempre por token semántico (`bg-primary`, `text-muted-foreground`, `text-tone-danger`), nunca valores sueltos ni `dark:` manuales. Las cifras por fuente usan `text-source-ga4`, `text-source-clarity` y `text-source-crm`, legibles como texto en los dos modos. En oscuro, el texto sobre `primary` es oscuro (`#0D111C`), porque el blanco no llega al contraste mínimo.

## Datos demo

La empresa ficticia es **Cuadra**, un SaaS B2B de gestión de turnos para cadenas de restaurantes en Chile y México. Los números están armados para que la historia de la demo cierre sola: la caída de 18 % existe, se concentra en iOS y tiene evidencia en las tres fuentes. Las fechas se calculan relativas a hoy, para que la demo siempre parezca de esta semana.

**Funnel semanal (GA4 + CRM):**

| Etapa | Semana actual | Semana anterior | Fuente |
| --- | --- | --- | --- |
| Visitas al sitio | 12.400 | 12.100 | GA4 |
| Vista de precios | 3.100 | 3.050 | GA4 |
| Formulario de demo iniciado | 820 | 810 | GA4 |
| Formulario completado | 410 | 402 | GA4 |
| Demo agendada | 205 | 250 | CRM |
| Demo realizada | 150 | 182 | CRM |
| Trial activo | 74 | 88 | CRM |
| Cliente pagando | 21 | 24 | CRM |

**El paso que cae, por dispositivo (formulario completado → demo agendada):**

| Segmento | Semana actual | Semana anterior |
| --- | --- | --- |
| Desktop | 175 de 230 (76 %) | 170 de 225 (76 %) |
| Mobile iOS | 8 de 105 (8 %) | 46 de 100 (46 %) |
| Mobile Android | 22 de 75 (29 %) | 34 de 77 (44 %) |

**Evidencia que tiene que existir en el dataset:**

- Registro de cambios: hace 9 días se desplegó el widget de calendario v2.3. Es la pista que el asistente conecta con la caída.
- Clarity: tres sesiones de Safari iOS donde el calendario queda cargando más de 8 segundos, con clics de rabia en “Elegir horario” y salida de la página.
- CRM: 42 leads de iOS con formulario completo, sin demo y con buen encaje (más de 20 locales). Son los que hay que recontactar hoy.

**Lo que el asistente debería concluir.** Lo de iOS es un bug: se arregla y se monitorea, sin test. Lo que sí vale la pena probar es agendar la demo dentro del mismo formulario. Con unas 410 personas por semana que completan el formulario, una tasa base cercana al 60 % (la de la semana anterior) y un efecto mínimo de 8 puntos, hacen falta unas 1.100 personas en total: alrededor de tres semanas.

**Archivos sugeridos en `lib/data/`:** `company.ts`, `funnel.ts`, `segments.ts`, `sessions.ts`, `crm-leads.ts`, `changelog.ts`, `alerts.ts` y `experiments.ts` (con un experimento ya decidido para el estado “tres semanas después”).

## Plan por fases y prompts para agentes de código

Son seis fases con una rama y un PR cada una; cada fase termina con algo que se puede abrir y probar, con su preview de Vercel para verla en el celular. Las reglas compartidas viven en `AGENTS.md`; `CLAUDE.md` solo apunta a ese archivo.

**`AGENTS.md` del repo:** ver el archivo en la raíz.

**Fase 0. Setup** (hecha)

```text
Crea el proyecto Tracer: Next.js 16 App Router con TypeScript y Tailwind v4, y corre shadcn init con base Radix e íconos lucide. Reemplaza las variables de tema del globals.css con las de la sección “Tema shadcn” de docs/brief.md. Carga las fuentes con next/font. Agrega next-themes con selector claro, oscuro y sistema. Agrega CLAUDE.md y un README corto. Entrega: página con un Button y un Card que usen el tema, en claro y oscuro. Al cerrar, con lint y build en verde, se crea el repo en GitHub y se conecta a Vercel.
```

**Fase 1. Estructura e inicio**

```text
Instala motion (sucesor de framer-motion) para las transiciones, respetando prefers-reduced-motion. Arma el layout del workspace: Sidebar a la izquierda (Inicio, Análisis, Experimentos, Fuentes, Alertas, grupo Herramientas y tarjeta del workspace abajo), contenido al centro y panel de historial a la derecha con búsqueda y “Nuevo análisis”. En mobile, sidebar e historial van en Sheet. Construye el Inicio: saludo con el hallazgo del día, tres tarjetas de trabajo y el composer con fuentes, periodo y segmento. Todo con datos fijos por ahora.
```

**Fase 2. Datos demo y herramientas**

```text
Crea el dataset de Cuadra en lib/data según la sección “Datos demo” de docs/brief.md, con fechas relativas a hoy. Luego crea lib/ai/tools.ts con funciones locales getFunnel, getSegments, getSessions, getCrmLeads, getChangelog y estimateDuration. Cada herramienta devuelve { data, source }, con source = {tool, origen, rango, muestra}. Agrega tests que comprueben que los totales cuadran (205 demos agendadas, 18 % de caída).
```

**Fase 3. Motor de respuestas simuladas**

```text
Crea el motor de guion en lib/demo/. Cada respuesta es una secuencia de pasos: chips de “Consultando GA4: funnel semanal” que se van resolviendo, texto que aparece de a poco y, al final, bloques ricos (funnel con el paso marcado, tabla de segmentos, tarjetas de sesión y de leads, propuesta de experimento). Los guiones leen las cifras de lib/ai/tools.ts; ninguna se escribe a mano. Las tres tarjetas de trabajo disparan guiones completos; el texto libre se resuelve por palabras clave, y si nada coincide el asistente lo dice con honestidad y ofrece los tres caminos. Cada cifra lleva SourceBadge, que abre un Sheet con el detalle. Incluye botón para detener, opción de saltar la animación, respeto a prefers-reduced-motion, y los estados de error y de “no hay datos suficientes”. Todo en el cliente: sin rutas de API ni claves.
```

**Fase 4. Experimentos**

```text
Agrega la acción “Diseñar experimento”: un Dialog con FieldGroup prellenado por el asistente (hipótesis si/entonces/porque, cambio, métrica principal, métrica guardiana, segmento, efecto mínimo con Slider y duración calculada en vivo con lib/stats.ts). Guardar lo lleva al tablero de Experimentos (por diseñar, en curso, para leer, decidido), persistido en localStorage. Suma “Copiar resumen” en markdown.
```

**Fase 5. Fuentes, alertas y pulido**

```text
Construye Fuentes (estado de GA4, Clarity y CRM, última sincronización y editor de etapas del funnel) y Alertas (cada alerta abre un análisis con contexto). Agrega búsqueda con Command y ⌘K. Revisa foco visible, navegación por teclado, movimiento reducido, y mobile a 390 px. Agrega un botón “Reiniciar demo” y un selector de estado “tres semanas después”.
```

**Fase 6. Lanzamiento**: deploy de producción en Vercel, prueba del guion de la demo de punta a punta, capturas y video corto para el caso del portfolio.

## Cómo entra al portfolio y qué falta decidir

Tracer entra como un caso nuevo con la etiqueta honesta que ya usas en otros proyectos: **“Concepto con prototipo funcional, datos demo”**. El caso cuenta la decisión de producto y la demo en vivo la prueba.

**Estructura sugerida del caso** (la misma lógica de Ghosts: de la señal a la decisión):

1. El problema: tres herramientas, tres verdades y nadie que las cruce.
2. La decisión de diseño: ninguna cifra sin fuente, llevada a la arquitectura con herramientas que devuelven su fuente.
3. Del layout de referencia a un producto de growth: la tabla de esta doc, en versión visual.
4. El momento clave: el asistente distingue un bug de algo que vale la pena testear.
5. Cómo se construyó: agentes de código, shadcn y un sistema visual propio, frío, tomado de la referencia.
6. Qué aprendí y qué validaría con usuarios reales.

Sumarlo a `projects-list.ts` sigue las reglas de tu `AGENTS.md`: primero la tabla de textos en español e inglés y después el código.

**Decisiones:**

- [x] **IA real o guionada en la demo pública.** Guionada. Tracer es una demo visual con respuestas simuladas en el cliente: sin costo por visita, sin claves y sin fallas de red. Las herramientas ya devuelven `{ data, source }`, así que pasar a un modelo real más adelante no cambia la arquitectura.
- [x] **Nombre.** Tracer.
- [ ] **Dónde vive.** Subdominio propio (por ejemplo tracer.leandrobalbian.com) o la URL de Vercel enlazada desde el caso.
- [ ] **Idioma.** El MVP en español; el inglés después, porque el portfolio es bilingüe.
- [ ] **Validación.** Tres o cuatro conversaciones cortas con PMs de growth para tener al menos un hallazgo real en el caso, no solo el concepto.
