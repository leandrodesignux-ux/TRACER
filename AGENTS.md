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

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
