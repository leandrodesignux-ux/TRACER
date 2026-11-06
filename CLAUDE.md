# Tracer

Workspace de growth con IA. Prototipo funcional para el portfolio de Leandro Balbian.
Es una demo visual: el asistente responde con guiones simulados en el cliente, sin IA real.
La especificación completa está en docs/brief.md.

@AGENTS.md

## Reglas
- Antes de escribir código: plan corto y preguntas abiertas. Espera mi OK.
- shadcn primero: `npx shadcn@latest info` para el contexto y `npx shadcn@latest docs <componente>` antes de usar uno nuevo. No edites a mano components/ui.
- Colores solo por token semántico. Nada de valores sueltos ni `dark:` manuales.
- Ninguna cifra sin fuente: todo número que muestre el asistente viene de una herramienta de lib/ai/tools.ts y lleva su SourceBadge. Los guiones de lib/demo/ nunca escriben cifras a mano.
- Todo corre en el cliente: nada de rutas de API, claves ni variables de entorno.
- Las páginas se tienen que poder prerenderizar. Lo que dependa de localStorage o del tema se lee después de montar (`useMounted`), y todo acceso a localStorage va en try/catch.
- Movimiento con motion, siempre respetando prefers-reduced-motion.
- Textos de interfaz en español neutro, con tuteo y en frases cortas.
- Una rama por fase, commits chicos, `npm run lint` y `npm run build` antes de cada commit.
- No digas que algo funciona sin probarlo en el navegador a 1440 px y 390 px.
