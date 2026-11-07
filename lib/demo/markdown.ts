import type { DataSource } from "@/lib/ai/tools";
import type { DemoResponse, ResponseBlock } from "@/lib/demo/responses";
import { formatNumber, formatPercent, formatPointChange } from "@/lib/format";

function sources(value: DataSource | DataSource[]) {
  return Array.isArray(value) ? value : [value];
}

function sourceLine(block: ResponseBlock) {
  const detail = sources(block.source)
    .map((item) => `${item.label} · ${item.rango} · ${item.muestra}`)
    .join(" | ");
  return `Fuente: ${detail}`;
}

export function responseToMarkdown(response: DemoResponse) {
  const lines = [`**Tracer:** ${response.text}`, ``];
  for (const block of response.blocks) {
    if (block.kind === "funnel") {
      lines.push(
        `### Funnel`,
        `| Etapa | Anterior | Actual | Conversión anterior | Conversión actual |`,
        `| --- | ---: | ---: | ---: | ---: |`,
        ...block.stages.map((stage) => `| ${stage.label} | ${formatNumber(stage.previous)} | ${formatNumber(stage.current)} | ${formatPercent(stage.conversionPrevious)} | ${formatPercent(stage.conversionCurrent)} |`),
      );
    } else if (block.kind === "segments") {
      lines.push(
        `### Segmentos`,
        ...block.rows.map((row) => `- ${row.label}: ${formatPercent(row.currentRate)} · ${formatPointChange(row.changePoints)}`),
      );
    } else if (block.kind === "sessions") {
      lines.push(`### Sesiones`, `- ${block.sessions.length} sesiones con fricción`);
    } else if (block.kind === "leads") {
      lines.push(`### Cohorte`, `- ${block.leads.length} leads recuperables`);
    } else if (block.kind === "timeline") {
      lines.push(`### Cambio reciente`, `- ${block.changelog.title}: ${block.changelog.date}`, `- Desplegado hace ${block.daysSinceDeploy} días`);
    } else if (block.kind === "experiment-plan") {
      lines.push(`### ${block.name}`, `- ${block.hypothesis}`, `- Duración: ${block.estimate.weeks} semanas`, `- Muestra: ${formatNumber(block.estimate.totalSample)} personas`);
    } else {
      lines.push(`### ${block.experiment.name}`, `- Control: ${formatPercent(block.experiment.controlRate)}`, `- Variante: ${formatPercent(block.experiment.variantRate)}`);
    }
    lines.push(sourceLine(block), ``);
  }
  return lines.join("\n");
}
