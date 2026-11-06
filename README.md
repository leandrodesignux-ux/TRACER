# Tracer

Workspace de growth con IA: encuentra dónde se pierde la conversión, explica por qué y diseña qué probar. Es un prototipo con datos demo y respuestas simuladas; todo corre en el navegador.

La especificación está en [docs/brief.md](docs/brief.md).

## Requisitos

- Node.js 22 o superior
- npm

## Comandos

```bash
npm install       # instala las dependencias
npm run dev       # servidor de desarrollo en http://localhost:3000
npm run lint      # revisa el código con ESLint
npm test          # ejecuta las pruebas unitarias con Vitest
npm run build     # build de producción
npm run start     # sirve el build de producción
npm run capturas -- fase-0  # captura todas las rutas en claro/oscuro y desktop/mobile
```

Las capturas se guardan en `docs/capturas/<nombre>/`. La primera ejecución puede requerir `npx playwright install chromium`.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Radix) y next-themes. Se despliega en Vercel sin variables de entorno.
