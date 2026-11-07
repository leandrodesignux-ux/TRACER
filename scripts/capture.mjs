import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { chromium } from "@playwright/test";

const routes = [
  ["asistente", "/"],
  ["resumen", "/resumen"],
  ["funnel", "/funnel"],
  ["segmentos", "/segmentos"],
  ["sesiones", "/sesiones"],
  ["crm", "/crm"],
  ["analisis", "/analisis"],
  ["experimentos", "/experimentos"],
  ["informes", "/informes"],
  ["fuentes", "/fuentes"],
  ["alertas", "/alertas"],
];

const viewports = [
  ["desktop", { width: 1440, height: 1000 }],
  ["mobile", { width: 390, height: 844 }],
];

const themes = [
  ["claro", "light"],
  ["oscuro", "dark"],
];

const captureName = (process.argv[2] ?? "actual").toLowerCase();
if (!/^[a-z0-9][a-z0-9-]*$/.test(captureName)) {
  throw new Error("El nombre de captura solo puede usar letras, números y guiones.");
}

const port = 3100;
const baseUrl = `http://127.0.0.1:${port}`;
const outputDir = path.join(process.cwd(), "docs", "capturas", captureName);
const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

await mkdir(outputDir, { recursive: true });

async function runNext(args) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [nextBin, ...args], {
      cwd: process.cwd(),
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Next.js terminó con código ${code}.`)));
  });
}

await runNext(["build"]);

const server = spawn(process.execPath, [nextBin, "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  cwd: process.cwd(),
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});

server.stdout.on("data", (chunk) => process.stdout.write(chunk));
server.stderr.on("data", (chunk) => process.stderr.write(chunk));

async function waitForServer() {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Next.js terminó antes de iniciar (${server.exitCode}).`);
    }
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // El servidor todavía está iniciando.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Next.js no respondió antes del límite de 60 segundos.");
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });

  for (const [viewportName, viewport] of viewports) {
    for (const [themeName, theme] of themes) {
      const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
      await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
      const page = await context.newPage();

      for (const [routeName, route] of routes) {
        await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle");
        await page.waitForFunction((value) => document.documentElement.classList.contains(value), theme);
        await page.evaluate(() => document.fonts.ready);
        await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
        await page.screenshot({
          path: path.join(outputDir, `${routeName}-${viewportName}-${themeName}.png`),
          fullPage: true,
          animations: "disabled",
        });

        if (routeName === "asistente") {
          if (viewportName === "mobile") {
            await page.getByRole("button", { name: /Hallazgos/ }).click();
          }
          const sourceButton = page.getByRole("button", {
            name: /Ver (fuente CRM|cálculo Variación semanal)/,
          });
          if ((await sourceButton.count()) > 0) {
            await sourceButton.click();
            const sourceDialog = page.getByRole("dialog").filter({
              has: page.getByText("Fórmula", { exact: true }),
            });
            await sourceDialog.waitFor();
            await page.screenshot({
              path: path.join(
                outputDir,
                `${routeName}-fuente-${viewportName}-${themeName}.png`,
              ),
              fullPage: true,
              animations: "disabled",
            });
            await page.keyboard.press("Escape");
            await sourceDialog.waitFor({ state: "hidden" });
          }

          if (viewportName === "mobile") {
            const findingsDialog = page.getByRole("dialog").filter({
              has: page.getByRole("heading", { name: "Hallazgos" }),
            });
            await page.keyboard.press("Escape");
            await findingsDialog.waitFor({ state: "hidden" });
          }
          await page.getByRole("button", { name: "Encontrar la fuga" }).click();
          await page.getByRole("button", { name: "Enviar" }).click();
          const leakTitle = page.getByText("Dónde se abre la fuga");
          await leakTitle.waitFor();
          await leakTitle.scrollIntoViewIfNeeded();
          await page.screenshot({
            path: path.join(outputDir, `${routeName}-fuga-${viewportName}-${themeName}.png`),
            fullPage: true,
            animations: "disabled",
          });
          await page.getByRole("textbox", { name: "Pregunta para el asistente" }).fill("¿Por qué cae en iOS?");
          await page.getByRole("button", { name: "Enviar" }).click();
          const causeTitle = page.getByText("Cambio reciente y caída diaria");
          await causeTitle.waitFor();
          await causeTitle.scrollIntoViewIfNeeded();
          await page.screenshot({
            path: path.join(outputDir, `${routeName}-causa-${viewportName}-${themeName}.png`),
            fullPage: true,
            animations: "disabled",
          });
        }
      }

      await context.close();
    }
  }

  console.log(`Capturas guardadas en ${outputDir}`);
} finally {
  await browser?.close();
  if (server.exitCode === null) server.kill();
}
