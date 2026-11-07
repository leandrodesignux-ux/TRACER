import { chromium, expect } from "@playwright/test";

const baseUrl = process.env.TRACER_URL ?? "http://127.0.0.1:3100";
const routes = ["/", "/resumen", "/funnel", "/segmentos", "/sesiones", "/crm", "/analisis", "/experimentos", "/informes", "/fuentes", "/alertas"];
const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await context.addInitScript(() => {
    localStorage.setItem("theme", "light");
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(baseUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Encontrar la fuga" }).click();
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText("Dónde se abre la fuga")).toBeVisible();
  await expect(page.getByText(/250 → 205/)).toBeVisible();

  const composer = page.getByRole("textbox", { name: "Pregunta para el asistente" });
  await composer.fill("¿Por qué cae en iOS?");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText("Cambio reciente y caída diaria")).toBeVisible();
  await expect(page.getByText(/v2\.3/).first()).toBeVisible();

  await page.getByRole("button", { name: /Safari · iOS/ }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Ver 42 leads en CRM/ }).click();
  await expect(page).toHaveURL(/\/crm$/);
  await expect(page.getByText("42 leads", { exact: true })).toBeVisible();

  await page.goto(baseUrl);
  await composer.fill("Diseña un experimento");
  await page.getByRole("button", { name: "Enviar" }).click();
  await page.getByRole("button", { name: "Diseñar experimento", exact: true }).last().click();
  await expect(page).toHaveURL(/\/experimentos$/);
  await expect(page.getByRole("dialog", { name: "Diseñar experimento" })).toBeVisible();
  await page.getByRole("button", { name: "Guardar diseño" }).click();
  await page.getByRole("button", { name: "Iniciar" }).click();
  await page.getByRole("radio", { name: "Tres semanas después" }).click();
  const newExperiment = page.locator("article").filter({ hasText: "Agenda integrada en el formulario" });
  await newExperiment.getByRole("button", { name: "Escalar" }).click();
  await expect(newExperiment.getByText("Escalar", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator("article").filter({ hasText: "Agenda integrada en el formulario" }).getByText("Escalar", { exact: true })).toBeVisible();

  await page.keyboard.press("Control+K");
  await page.getByPlaceholder(/Busca una vista/).fill("Don Rafa");
  await page.getByRole("option").first().click();
  await expect(page).toHaveURL(/\/crm$/);
  await expect(page.getByPlaceholder("Buscar empresa")).toHaveValue(/Don Rafa/);
  await context.close();

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await mobile.addInitScript(() => localStorage.setItem("theme", "dark"));
  const mobilePage = await mobile.newPage();
  mobilePage.on("pageerror", (error) => errors.push(error.message));
  for (const route of routes) {
    await mobilePage.goto(`${baseUrl}${route}`);
    const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) throw new Error(`${route} tiene ${overflow}px de scroll horizontal`);
  }
  await mobile.close();

  if (errors.length > 0) throw new Error(`Errores de navegador:\n${errors.join("\n")}`);
  console.log("Guion, búsqueda, experimentos y responsive verificados.");
} finally {
  await browser.close();
}
