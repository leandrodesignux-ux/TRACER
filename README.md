# Tracer

Workspace de growth con IA: encuentra dónde se pierde la conversión, explica por qué y diseña qué probar. Es un prototipo con datos demo y respuestas simuladas; todo corre en el navegador.

La especificación está en [docs/brief.md](docs/brief.md).

## Requisitos

- Node.js 20.9 o superior
- npm

## Comandos

```bash
npm install       # instala las dependencias
npm run dev       # servidor de desarrollo en http://localhost:3000
npm run lint      # revisa el código con ESLint
npm run build     # build de producción
npm run start     # sirve el build de producción
```

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Radix) y next-themes. Se despliega en Vercel sin variables de entorno.
