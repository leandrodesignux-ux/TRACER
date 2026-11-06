# Tracer — handoff para Codex

Estado al 6 de noviembre de 2026. Este archivo resume qué es Tracer, cómo está el repo hoy, qué falta y en qué orden construirlo. Va en la raíz del repo junto a `docs/brief.md`, que sigue siendo la especificación completa.

- **Repo:** `TRACER` en GitHub, rama `main` al día.
- **Deploy:** Vercel, con un preview por cada rama.
- **Stack:** Next.js 16.4 (App Router), React 19.3, TypeScript, Tailwind CSS v4, shadcn/ui (base Radix, estilo `radix-nova`, íconos lucide), motion, next-themes y sonner.

---

## 1. Qué es Tracer

Tracer es un workspace de growth con IA. Un PM pregunta dónde se pierde la conversión y el asistente responde cruzando GA4, Clarity y el CRM. Después explica por qué con evidencia y termina con un experimento diseñado.

Es un **prototipo para el portfolio de Leandro Balbian** (leandrobalbian.com): una demo visual y muy interactiva, con datos de una empresa ficticia y **respuestas simuladas**. No hay IA real, API, claves ni variables de entorno: todo corre en el navegador.

- **Empresa demo:** Cuadra, un SaaS B2B de turnos para cadenas de restaurantes en Chile y México.
- **Usuaria demo:** Valentina R., PM de Growth.
- **Principio de diseño:** ninguna cifra sin fuente. Cada número que muestra la interfaz sale de una herramienta local que devuelve `{ data, source }`, y se muestra con su etiqueta de fuente (GA4, Clarity o CRM).

**El guion de la demo (unos 2 minutos):**

1. Valentina abre Tracer y ve el hallazgo: las demos agendadas cayeron 18 % esta semana.
2. Toca “Explicar la caída de demos”. El asistente muestra el funnel y marca el paso que cae: formulario completado → demo agendada, sobre todo en iOS.
3. Abre la evidencia: tres sesiones de Clarity donde el calendario no carga en Safari iOS, y 42 leads del CRM con formulario completo y sin demo.
4. Pide “Diseñar un experimento”. El asistente separa el bug de iOS (se arregla sin test) de lo que sí vale la pena probar: agendar la demo dentro del mismo formulario. Entrega hipótesis, métricas y una duración de unas tres semanas.
5. Guarda el experimento y copia el resumen para su equipo.
6. En el estado demo “tres semanas después”, lee el resultado y decide escalar.

---

## 2. Estado actual

| Fase | Qué es | Estado |
| --- | --- | --- |
| 0. Setup | Next.js, shadcn, tema, fuentes, next-themes, CLAUDE.md, README | Hecha |
| 1. Estructura e inicio | Barra superior en pastillas, sidebar, Asistente al centro, panel de Hallazgos, composer, responsive | Hecha |
| 1b. Acabado visual | Paleta fría, Plus Jakarta Sans, paneles traslúcidos, brillo azul, tonos de los íconos, modo oscuro azul marino | Hecha |
| 2. Datos demo y herramientas | `lib/data`, `lib/ai/tools.ts`, tests de totales | **Falta** |
| 2b. Vistas de la barra superior | Resumen, Funnel, Segmentos, Sesiones, CRM | **Falta** (hoy muestran un estado vacío) |
| 3. Respuestas simuladas | Motor de guion en `lib/demo/`, bloques ricos, hilos guardados | **Falta** (enviar solo muestra el mensaje y “Analizando…”) |
| 4. Experimentos | Diálogo de diseño, calculadora de duración, tablero | Falta |
| 5. Fuentes, alertas y pulido | Fuentes, Alertas, Análisis, Informes, ⌘K, reiniciar demo | Falta |
| 6. Lanzamiento | Deploy de producción, prueba del guion, capturas y video | Falta |

Capturas del estado actual: `docs/capturas/fase-1-material/` (claro y oscuro, 1440 px y 390 px, y comparación con la referencia).

---

## 3. Revisión: qué está bien y qué hay que corregir

**Lo que está bien:**

- **Estructura y material:** coinciden con la referencia `docs/referencias/workspace.png`, en claro y en oscuro.
- **Tokens:** todo el color pasa por tokens semánticos, sin valores sueltos en los componentes.
- **localStorage:** `lib/storage.ts` lo lee con `useSyncExternalStore`, sin errores de hidratación y con try/catch.
- **Datos:** los textos y cifras del inicio viven en `lib/demo/home.ts`, no en los componentes.
- **Lint:** `npm run lint` pasa sin errores (verificado).

**Lo que hay que corregir antes de seguir:**

1. **Las reglas del repo están en `CLAUDE.md` y Codex lee `AGENTS.md`.** Hoy `AGENTS.md` solo tiene el bloque que genera Next.js. Hay que mover las reglas a `AGENTS.md`, conservando ese bloque, y dejar `CLAUDE.md` con una sola línea: `@AGENTS.md`.
2. **La fuente depende de internet al hacer build.** `next/font/google` descarga Plus Jakarta Sans durante `next build`. En un entorno sin red, como el sandbox de Codex, el build falla con `Can't resolve '@vercel/turbopack-next/internal/font/google/font'`. Pasó al verificarlo aquí. La solución es alojar la fuente en el repo con `next/font/local` y los archivos `.woff2` en `app/fonts/`.
3. **Requisito de Node desactualizado.** El README pide Node 20.9, pero el paquete `cn` (la utilidad oficial nueva de shadcn, que reemplaza a clsx + tailwind-merge) exige Node 22 o más. Hay que actualizar el README, agregar `"engines": { "node": ">=22" }` en package.json, subir `@types/node` a la versión 22 y elegir Node 22 o 24 en Vercel.
4. **El brief describe la referencia anterior.** La sección “De la referencia al producto” de `docs/brief.md` habla de la referencia de Halo Lab y de un saludo con el hallazgo. La interfaz actual sigue a `workspace.png`: pastillas arriba, “¿Qué quieres analizar hoy?” al centro y panel de Hallazgos a la derecha. Hay que reescribir esa sección con la tabla de la sección 5 de este archivo.
5. **Texto de desarrollo visible para usuarios.** El estado “Analizando…” muestra “Las respuestas llegan en la Fase 3”, y las vistas vacías mencionan números de fase. Se quitan cuando se construya cada parte.
6. **Fases mal etiquetadas.** En `UPCOMING_VIEWS` de `lib/demo/home.ts`, Sesiones y CRM dicen Fase 3, pero se construyen en la 2b.
7. **Mensajes sin persistencia.** Los mensajes viven en el estado de React del `WorkspaceProvider`: sobreviven a la navegación, pero no a recargar la página. La Fase 3 los guarda como hilos.
8. **Compartir y Exportar sin comportamiento definido.** Propuesta: Compartir copia el enlace con un toast, y Exportar descarga el hilo como `.md` desde el cliente.

---

## 4. Reglas del repo (para `AGENTS.md`)

Pegar esto en `AGENTS.md`, encima del bloque de Next.js:

```markdown
# Tracer

Workspace de growth con IA. Prototipo para el portfolio de Leandro Balbian: demo visual con datos ficticios y respuestas simuladas en el cliente, sin IA real.
Especificación: docs/brief.md. Estado y próximas tareas: TRACER-HANDOFF.md.

## Reglas
- Antes de escribir código, un plan corto con preguntas abiertas. En sesiones interactivas, espera el OK. En tareas sin interacción, pon el plan y las decisiones que tomaste al principio de la descripción del PR.
- shadcn primero: `npx shadcn@latest info` para el contexto y `npx shadcn@latest docs <componente>` antes de usar uno nuevo. No edites a mano components/ui.
- Colores solo por token semántico. Nada de valores sueltos ni `dark:` manuales.
- Ninguna cifra sin fuente: todo número viene de una herramienta de lib/ai/tools.ts que devuelve { data, source } y se muestra con SourceBadge. Los guiones de lib/demo/ nunca escriben cifras a mano.
- Todo corre en el cliente: nada de rutas de API, claves ni variables de entorno.
- Las páginas se tienen que poder prerenderizar. Lo que dependa de localStorage o del tema se lee después de montar, y todo acceso a localStorage pasa por lib/storage.ts.
- Movimiento con motion, siempre respetando prefers-reduced-motion.
- Textos de interfaz en español neutro, con tuteo y frases cortas. Sin textos de desarrollo visibles (“Fase 3”, “TODO”).
- Una rama por tarea, commits chicos. `npm run lint`, `npm test` y `npm run build` en verde antes de abrir el PR.
- No digas que algo funciona sin verlo a 1440 px y a 390 px, en claro y en oscuro (capturas con `npm run capturas`).
```

---

## 5. Sistema visual

Los valores viven en `app/globals.css`; esto es el resumen para no romper el lenguaje.

- **Referencia:** `docs/referencias/workspace.png`. De ella se toman la estructura, la densidad y el material, no el logo, los textos ni los colores exactos.
- **Tipografía:** Plus Jakarta Sans (400, 500, 600) para todo. Títulos en 500 con tracking −0.02em (`tracking-heading`). Sin pesos 300.
- **Paleta:** fría. Fondo `#F4F6FA`, degradado del contenedor de `--shell-from #DCE4F3` a `--shell-to #EEF2F9`, primary `#4D74E6` y pastilla activa `--nav-active #1E2330`. El modo oscuro es azul marino: fondo `#0D111C`, primary `#7C9BFF`.
- **Material:** la utilidad `panel-surface` arma los paneles: fondo blanco al 72 % (`--panel`), borde exterior fino (`--panel-outline`) y un filo interior claro (`--panel-border`), con sombra mínima. `glow-bottom` es el brillo azul del panel central. `--radius` vale 0.75rem y los paneles grandes usan `rounded-2xl`.
- **Tonos de estado:** `tone-danger`, `tone-warning`, `tone-info` y `tone-success`, cada uno con su variante `-soft` para el fondo del ícono.
- **Fuentes de datos:** `source-ga4` (ámbar), `source-clarity` (violeta) y `source-crm` (verde), legibles como texto en los dos modos.
- **Gráficos:** `chart-1` a `chart-5` en la familia azul y lavanda; `chart-1` es el primary.
- **Tema:** claro por defecto (`defaultTheme="light"`), con selector entre claro, oscuro y sistema.

**Cómo se tradujo la referencia:**

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

---

## 6. Mapa del código actual

| Ruta | Qué hace |
| --- | --- |
| `app/layout.tsx` | Fuentes, ThemeProvider (claro por defecto) y metadata |
| `app/(workspace)/layout.tsx` | Estructura: barra superior, contenedor con degradado, sidebar, centro y panel de Hallazgos |
| `app/(workspace)/page.tsx` | Asistente (inicio) |
| `app/(workspace)/{resumen,funnel,segmentos,sesiones,crm,analisis,experimentos,informes,fuentes,alertas}/page.tsx` | Hoy son estados vacíos (`upcoming-page`) |
| `components/workspace/workspace-provider.tsx` | Estado compartido: borrador, mensajes, fuentes, periodo, hallazgos leídos, nuevo análisis, reiniciar demo |
| `components/workspace/assistant-view.tsx` | Estado vacío, lista de mensajes, “Analizando…” y chips |
| `components/workspace/composer.tsx` | Campo de pregunta, menú + con fuentes y periodo, botón enviar |
| `components/workspace/findings-panel.tsx` y `findings-sheet.tsx` | Panel de Hallazgos (Sheet en pantallas medianas y chicas) |
| `components/workspace/top-bar.tsx`, `app-sidebar.tsx`, `workspace-card.tsx`, `view-header.tsx`, `panel.tsx`, `tracer-logo.tsx` | Piezas de la estructura |
| `lib/demo/home.ts` | Textos, navegación, sugerencias y hallazgos. `DEMO_DROP` es provisional hasta que exista `getFunnel()` |
| `lib/storage.ts` | localStorage seguro con el prefijo `tracer:` |
| `lib/fonts.ts` | Plus Jakarta Sans (pasa a `next/font/local`) |
| `docs/brief.md` | Especificación completa |
| `docs/referencias/workspace.png` | Referencia visual |
| `docs/capturas/` | Capturas por fase |

---

## 7. Datos demo (deben cuadrar exacto)

Las fechas se calculan relativas a hoy, para que la demo siempre parezca de esta semana. Lo que se genera con semilla fija debe dar siempre el mismo resultado.

**Funnel semanal:**

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

Además: 8 semanas de historial por etapa, estables hasta la semana anterior, con la caída solo en la actual y solo desde el paso “demo agendada”.

**El paso que cae, por dispositivo (formulario completado → demo agendada):**

| Segmento | Semana actual | Semana anterior |
| --- | --- | --- |
| Desktop | 175 de 230 (76 %) | 170 de 225 (76 %) |
| Mobile iOS | 8 de 105 (8 %) | 46 de 100 (46 %) |
| Mobile Android | 22 de 75 (29 %) | 34 de 77 (44 %) |

Los totales cuadran: 205 de 410 en la actual y 250 de 402 en la anterior.

**Evidencia:**

- **Changelog:** hace 9 días se desplegó el widget de calendario v2.3.
- **Clarity:** 12 sesiones de la semana. Tres son de Safari iOS: el calendario queda cargando más de 8 segundos, hay clics de rabia en “Elegir horario” y la persona sale de la página. El resto son sesiones normales de desktop y Android, como contraste.
- **CRM:** unos 120 leads generados con semilla (empresa, locales, país, dispositivo, estado, fecha del formulario, si tiene demo). Exactamente 42 son de iOS, con formulario completo, sin demo y con buen encaje (más de 20 locales).
- **Experimento anterior “Formulario en un solo paso”** (el hallazgo “Experimento listo para leer”): duró 3 semanas y terminó hace 5. Midió formulario iniciado → completado: control 49 %, variante 51 %, con un intervalo que cruza el cero. Resultado no concluyente, estado “para leer”, recomendación iterar. Es coherente con el 50 % actual (410 de 820).

**Lo que concluye el asistente:** lo de iOS es un bug; se arregla y se monitorea, sin test. Lo que sí vale la pena probar es agendar la demo dentro del mismo formulario. Con unas 410 personas por semana, una tasa base cercana al 60 % (la de la semana anterior) y un efecto mínimo de 8 puntos, hacen falta unas 1.100 personas en total: alrededor de tres semanas. `estimateDuration` debe dar ese resultado.

---

## 8. Próximas tareas, en orden

Cada tarea es una rama y un PR con su preview en Vercel.

### Tarea 0. Preparar el repo para Codex (rama `chore/codex`)

```text
Prepara el repo para trabajar con Codex, sin cambios visuales:
1. Mueve las reglas de CLAUDE.md a AGENTS.md según la sección 4 de TRACER-HANDOFF.md, conservando el bloque de Next.js. CLAUDE.md queda con una línea: @AGENTS.md.
2. Cambia next/font/google por next/font/local: descarga Plus Jakarta Sans (400, 500, 600, subconjunto latino, woff2) a app/fonts/ y usa la misma variable --font-jakarta. El build no debe necesitar internet.
3. package.json: "engines": { "node": ">=22" }, @types/node en la versión 22, y los scripts "test" (Vitest) y "capturas" (un script de Playwright que guarda en docs/capturas/<nombre>/ cada ruta a 1440 y 390 px, en claro y en oscuro).
4. README: Node 22 o superior y los comandos nuevos.
5. docs/brief.md: reescribe “De la referencia al producto” con la tabla de la sección 5 del handoff, y corrige en lib/demo/home.ts las fases de Sesiones y CRM.
Verifica lint, test y build sin red.
```

### Tarea 1. Datos demo y herramientas (rama `fase-2-datos`)

```text
Crea el dataset de Cuadra en lib/data/ (company, funnel, segments, sessions, crm-leads, changelog, alerts, experiments) según la sección 7 de TRACER-HANDOFF.md, con fechas relativas a hoy y una semilla fija para lo generado.
Crea lib/ai/tools.ts con getFunnel, getSegments, getSessions, getCrmLeads, getChangelog, getExperiments y estimateDuration. Cada una recibe filtros (periodo, segmento) y devuelve { data, source }. El source es { id: "ga4" | "clarity" | "crm", label, query, rango, muestra }.
Crea components/data/source-badge.tsx: una Badge con el color de la fuente que, al tocarla, abre un Sheet con query, rango y muestra.
Reemplaza DEMO_DROP por el resultado de getFunnel().
Tests con Vitest: 205 demos y −18 %, totales por dispositivo, 42 leads de iOS con buen encaje sin demo, unas 3 semanas en estimateDuration, y que la semilla dé siempre lo mismo.
```

### Tarea 2. Vistas de la barra superior (rama `fase-2-vistas`)

```text
Construye las cinco vistas con los datos de lib/ai/tools.ts. Cada cifra lleva SourceBadge. Todas usan el mismo material (panel-surface, encabezado con ViewHeader) y tienen la acción “Preguntar al asistente”, que llama a fillComposer con una pregunta relacionada. Agrega el Chart de shadcn (Recharts) con los colores chart-*.

- Resumen: cuatro KPIs (visitas, formularios completados, demos agendadas y clientes pagando) con variación y sparkline de 8 semanas; funnel compacto; últimos hallazgos.
- Funnel: barras horizontales de las 8 etapas, semana actual contra anterior, con la conversión entre etapas y el paso que cae resaltado en tone-danger. ToggleGroup de segmento (Todos, Desktop, iOS, Android) y de periodo (semana, 4 semanas). Al tocar una etapa se abre un Sheet con el detalle y “Analizar este paso”.
- Segmentos: tabla de segmento por paso, con conversión y variación, intensidad de color por token, orden por columna y filtros de dispositivo, país (Chile, México) y canal.
- Sesiones: lista con dispositivo, duración, clics de rabia y página, más filtros. Al abrir una sesión, un Sheet muestra una reproducción simulada: un wireframe del formulario de demo con un cursor animado que sigue la línea de tiempo de eventos, ondas en los clics de rabia, scrubber, play y pausa. Con prefers-reduced-motion, la línea de tiempo es estática.
- CRM: tabla de leads con filtros. El filtro rápido “Buen encaje sin demo” deja los 42. Seleccionar filas habilita “Exportar lista” (descarga un CSV en el cliente) y “Crear tarea de recontacto” (toast).

En 390 px, las tablas se convierten en listas de tarjetas y los gráficos se adaptan al ancho, sin scroll horizontal de la página. Capturas de las cinco vistas.
```

### Tarea 3. Respuestas simuladas (rama `fase-3-respuestas`)

```text
Implementa el motor de guion en lib/demo/ sobre las herramientas.

- Cada respuesta es una secuencia de pasos: chips de paso (“Consultando GA4: funnel semanal”, “Cruzando con CRM”) que se resuelven uno por uno con su fuente; texto que aparece de a poco, y bloques ricos con SourceBadge: funnel con el paso marcado, tabla de segmentos, tarjetas de sesión que abren la reproducción de Sesiones y lista de leads que enlaza al filtro de CRM.
- Guiones completos para los tres chips y para cada hallazgo del panel derecho. “Diseñar un experimento” separa el bug de iOS de lo que vale la pena probar y termina en una tarjeta de experimento con hipótesis (si…, entonces…, porque…), métrica principal, métrica guardiana, segmento y duración calculada con estimateDuration. “Guardar” la manda a Experimentos.
- Preguntas de seguimiento en el mismo hilo (“¿y en Android?”, “¿cuántos leads hay que recontactar?”, “¿qué pasó con el experimento del formulario?”). El texto libre se resuelve por palabras clave. Si nada coincide, el asistente lo dice con honestidad y ofrece los caminos disponibles.
- Botón para detener, opción para saltar la animación, y con prefers-reduced-motion la respuesta aparece completa.
- Los hilos se guardan en localStorage con lib/storage.ts y se listan en Análisis (título, fuentes usadas, estado y fecha). “Nuevo análisis” limpia el centro.
- Compartir copia el enlace con un toast. Exportar descarga el hilo como .md.
- Quita los textos de desarrollo (“Las respuestas llegan en la Fase 3”).
```

### Tarea 4. Experimentos (rama `fase-4-experimentos`)

```text
- Diálogo “Diseñar experimento”, abierto desde la tarjeta del asistente o desde Experimentos: FieldGroup prellenado (hipótesis, cambio, métrica principal, métrica guardiana, segmento, efecto mínimo con Slider) y duración recalculada en vivo con estimateDuration.
- Tablero de Experimentos por estado: por diseñar, en curso, para leer, decidido. Cada tarjeta lleva insignia de decisión (escalar, iterar, descartar). Se guarda en localStorage.
- El experimento anterior “Formulario en un solo paso” aparece en “para leer” con su resultado no concluyente.
- Selector de estado demo “tres semanas después”: el experimento nuevo pasa a “para leer” con un resultado positivo, y la usuaria decide escalar.
- “Copiar resumen” en markdown.
```

### Tarea 5. Fuentes, alertas y pulido (rama `fase-5-pulido`)

```text
- Fuentes: tarjetas de GA4, Clarity y CRM con estado, última sincronización y eventos mapeados, más un editor simple de las etapas del funnel.
- Alertas: lista de caídas detectadas; cada una abre un análisis con contexto.
- Informes: un informe semanal generado a partir de los datos, con “Exportar .md”.
- Búsqueda global con Command y ⌘K: vistas, hilos y experimentos.
- “Reiniciar demo” en el menú de la tarjeta del workspace.
- Revisión de accesibilidad: foco visible, navegación por teclado, etiquetas, contraste en claro y oscuro, prefers-reduced-motion.
- Revisión en 390 px de todas las vistas.
```

### Tarea 6. Lanzamiento

Deploy de producción en Vercel con Node 22 o 24, prueba del guion de la sección 1 de punta a punta, capturas finales y un video corto para el caso del portfolio.

---

## 9. Criterios de aceptación de la demo

- El guion de la sección 1 se recorre completo sin recargar y sin pantallas vacías.
- Toda cifra visible tiene su fuente, y al tocarla se ve de dónde sale.
- Ninguna pastilla, botón ni opción del menú lleva a algo falso o roto.
- Claro y oscuro se ven igual de cuidados; a 390 px no hay scroll horizontal ni nada cortado.
- Con prefers-reduced-motion todo sigue funcionando, sin animaciones.
- `npm run lint`, `npm test` y `npm run build` pasan sin red.

---

## 10. Decisiones

**Tomadas:**

- **Nombre:** Tracer.
- **Respuestas:** simuladas en el cliente, sin IA real. Las herramientas ya devuelven `{ data, source }`, así que conectar un modelo más adelante no cambia la arquitectura.
- **Repo:** separado del portfolio; el portfolio enlaza a la demo.
- **Identidad visual:** propia y fría, distinta de la paleta del portfolio.
- **Tema:** claro por defecto.

**Abiertas:**

- **Dominio:** subdominio propio (por ejemplo `tracer.leandrobalbian.com`) o la URL de Vercel.
- **Idioma:** inglés después del MVP, porque el portfolio es bilingüe.
- **Validación:** tres o cuatro conversaciones con PMs de growth para sumar un hallazgo real al caso.
- **Ficha del portfolio:** el caso entra con la etiqueta “Concepto con prototipo funcional, datos demo”, siguiendo las reglas del `AGENTS.md` del portfolio (primero la tabla de textos en español e inglés).

