# Tracer: workspace de growth con IA — brief para Claude Code

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

De la referencia de Halo Lab tomamos la estructura de tres zonas: navegación, conversación al centro e historial a la derecha. Cada pieza cambia de función para servir a growth; la estética la ponen tu sistema visual y shadcn.

| Zona de la referencia | En Tracer | Por qué cambia |
| --- | --- | --- |
| Saludo genérico con ícono decorativo | Saludo con el hallazgo del día: “Hola, Valentina. Las demos agendadas cayeron 18 % esta semana.” | La primera pantalla ya entrega valor; es el momento memorable del producto |
| Tres tarjetas de acción (generar, mejorar, explorar) | Encontrar la fuga · Explicar una caída · Diseñar un experimento | Son los tres trabajos del producto |
| Composer con Adjuntar, Ajustes, Opciones y micrófono | Selector de fuentes (GA4, Clarity, CRM), periodo y segmento | El contexto de un análisis es qué datos y qué ventana; el micrófono no aporta |
| Menú: Home, Studio, Community, Collections, Library | Inicio, Análisis, Experimentos, Fuentes, Alertas | Navegación por objetos de trabajo de growth |
| Grupo “AI tools” | Herramientas: calculadora de muestra y editor de funnel | Utilidades que el asistente también usa por dentro |
| Tarjeta de perfil con “Upgrade now” | Tarjeta del workspace: empresa, estado de sincronización y “Conectar fuente” | El estado de los datos importa más que el plan |
| Historial con avatares e imágenes | Historial de análisis con fuentes usadas, mini gráfico de la métrica y estado (hipótesis, en prueba, decidido) | Cada hilo muestra en qué quedó, no quién participó |
| Botón “Create new chat” | Nuevo análisis | Mismo patrón, nombre del dominio |

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
| Tema | next-themes | Claro, oscuro y sistema (por defecto) |
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
  CLAUDE.md                         reglas del repo para Claude Code
```

## Tema shadcn con tu sistema visual

El tema claro sale directo de los tokens de tu `globals.css`: canvas, bosque, latón y vino. El oscuro es una propuesta nueva, porque el portfolio hoy es solo claro. Ya está aplicado en `app/globals.css`.

```css
:root {
  --radius: 0.5rem;
  --background: #FDFCFA;
  --foreground: #181512;
  --card: #FFFFFF;
  --card-foreground: #181512;
  --popover: #FFFFFF;
  --popover-foreground: #181512;
  --primary: #415445;            /* bosque */
  --primary-foreground: #FDFCFA;
  --secondary: #F5F1E8;
  --secondary-foreground: #181512;
  --muted: #F5F1E8;
  --muted-foreground: #7A746D;
  --accent: #ECE5D8;
  --accent-foreground: #181512;
  --destructive: #B93832;
  --border: #E5DDD3;
  --input: #D8D0C6;
  --ring: #415445;
  --chart-1: #415445;            /* bosque */
  --chart-2: #B38A3F;            /* latón */
  --chart-3: #65293B;            /* vino */
  --chart-4: #9A7F4C;
  --chart-5: #A7A098;
  --sidebar: #FDFCFA;
  --sidebar-foreground: #45413D;
  --sidebar-primary: #415445;
  --sidebar-primary-foreground: #FDFCFA;
  --sidebar-accent: #F5F1E8;
  --sidebar-accent-foreground: #181512;
  --sidebar-border: #E5DDD3;
  --sidebar-ring: #415445;
  /* Propios de Tracer: color por fuente de datos */
  --source-ga4: #7A5A1F;         /* latón legible como texto */
  --source-clarity: #65293B;
  --source-crm: #415445;
}

.dark {
  --background: #131612;
  --foreground: #F1EDE4;
  --card: #1B1F1A;
  --card-foreground: #F1EDE4;
  --popover: #1B1F1A;
  --popover-foreground: #F1EDE4;
  --primary: #9DB89F;
  --primary-foreground: #131612;
  --secondary: #252A23;
  --secondary-foreground: #F1EDE4;
  --muted: #1B1F1A;
  --muted-foreground: #9C968C;
  --accent: #252A23;
  --accent-foreground: #F1EDE4;
  --destructive: #E0645C;
  --border: #2C3229;
  --input: #3A4136;
  --ring: #BFD3BE;
  --chart-1: #9DB89F;
  --chart-2: #D2A75A;
  --chart-3: #C98A9A;
  --chart-4: #B79E6E;
  --chart-5: #6E695F;
  --sidebar: #131612;
  --sidebar-foreground: #CFC9BE;
  --sidebar-primary: #9DB89F;
  --sidebar-primary-foreground: #131612;
  --sidebar-accent: #1B1F1A;
  --sidebar-accent-foreground: #F1EDE4;
  --sidebar-border: #2C3229;
  --sidebar-ring: #BFD3BE;
  --source-ga4: #D9B26A;
  --source-clarity: #C98A9A;
  --source-crm: #9DB89F;
}

@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-heading: var(--font-space-grotesk);
  --color-source-ga4: var(--source-ga4);
  --color-source-clarity: var(--source-clarity);
  --color-source-crm: var(--source-crm);
}
```

**Tipografía.** Geist para todo el texto y Space Grotesk solo en títulos y en el saludo, con peso 300 y tracking negativo, igual que en el portfolio. Las dos se cargan con `next/font/google` en `lib/fonts.ts`.

**Reglas que Claude Code tiene que respetar.** Colores siempre por token semántico (`bg-primary`, `text-muted-foreground`), nunca valores sueltos ni `dark:` manuales. El latón `#B38A3F` no se usa como texto sobre fondo claro: para eso está `--source-ga4`. Las tarjetas de trabajo del inicio pueden usar vino, crema y bosque como fondo, como las tarjetas de servicio del portfolio; es el único lugar con color de fondo fuerte.

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

## Plan por fases y prompts para Claude Code

Son seis fases con una rama y un PR cada una; cada fase termina con algo que se puede abrir y probar, con su preview de Vercel para verla en el celular. El primer paso es dejar un `CLAUDE.md` en el repo para que todas las sesiones arranquen con las mismas reglas.

**`CLAUDE.md` del repo:** ver el archivo en la raíz.

**Fase 0. Setup** (hecha)

```text
Crea el proyecto Tracer: Next.js 16 App Router con TypeScript y Tailwind v4, y corre shadcn init con base Radix e íconos lucide. Reemplaza las variables de tema del globals.css con las de la sección “Tema shadcn” de docs/brief.md. Carga Geist y Space Grotesk con next/font. Agrega next-themes con selector claro, oscuro y sistema. Agrega CLAUDE.md y un README corto. Entrega: página con un Button y un Card que usen el tema, en claro y oscuro. Al cerrar, con lint y build en verde, se crea el repo en GitHub y se conecta a Vercel.
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
5. Cómo se construyó: Claude Code, shadcn y el sistema visual compartido con el portfolio.
6. Qué aprendí y qué validaría con usuarios reales.

Sumarlo a `projects-list.ts` sigue las reglas de tu `AGENTS.md`: primero la tabla de textos en español e inglés y después el código.

**Decisiones:**

- [x] **IA real o guionada en la demo pública.** Guionada. Tracer es una demo visual con respuestas simuladas en el cliente: sin costo por visita, sin claves y sin fallas de red. Las herramientas ya devuelven `{ data, source }`, así que pasar a un modelo real más adelante no cambia la arquitectura.
- [x] **Nombre.** Tracer.
- [ ] **Dónde vive.** Subdominio propio (por ejemplo tracer.leandrobalbian.com) o la URL de Vercel enlazada desde el caso.
- [ ] **Idioma.** El MVP en español; el inglés después, porque el portfolio es bilingüe.
- [ ] **Validación.** Tres o cuatro conversaciones cortas con PMs de growth para tener al menos un hallazgo real en el caso, no solo el concepto.
