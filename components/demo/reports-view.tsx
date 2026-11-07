"use client";

import { Download, FileText, Lightbulb, TrendingDown, UsersRound } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import { SourceBadge } from "@/components/data/source-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/workspace/panel";
import { ViewHeader } from "@/components/workspace/view-header";
import { getWeeklyReport } from "@/lib/ai/tools";
import type { StoredExperiment } from "@/lib/demo/experiment-state";
import { formatChange, formatNumber, formatPercent, formatPointChange } from "@/lib/format";
import { useDemoDate } from "@/lib/use-demo-date";
import { useStored } from "@/lib/storage";

export function ReportsView() {
  const asOf = useDemoDate();
  const report = useMemo(() => getWeeklyReport({ asOf }), [asOf]);
  const data = report.data;
  const [experiments] = useStored<StoredExperiment[]>("saved-experiments", []);
  const active = experiments.filter((item) => item.status === "running");
  const decided = experiments.filter((item) => item.status === "decided");

  const exportReport = () => {
    const markdown = [`# Informe semanal de Cuadra`, ``, `## Resumen`, `- Demos agendadas: ${data.demos} (${formatChange(data.demoChangePercent)})`, `- Paso afectado: ${data.dropStep.from} → ${data.dropStep.to} (${data.dropStep.previous} → ${data.dropStep.current})`, `- Conversión iOS: ${formatPercent(data.iosConversion)} (${formatPointChange(data.iosChangePoints)})`, `- Sesiones con fricción: ${data.problematicSessions}`, `- Leads recuperables: ${data.recoverableLeads}`, ``, `## Causa probable`, `- ${data.cause.title} · ${data.cause.date}`, `- Fuente: GA4 + Clarity`, ``, `## Experimentos`, ...active.map((item) => `- En curso: ${item.name}`), ...decided.map((item) => `- Decidido: ${item.name} · ${item.decision}`), ``, `## Recomendación`, `Corregir el calendario en Safari iOS, recontactar la cohorte afectada y continuar con el experimento de agenda integrada.`].join("\n");
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "informe-semanal-cuadra.md"; anchor.click(); URL.revokeObjectURL(url); toast.success("Informe exportado");
  };

  return (
    <>
      <ViewHeader title="Informes" status="Resumen semanal listo para compartir" />
      <Panel className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="mx-auto max-w-3xl rounded-xl border border-panel-outline bg-card/75 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
            <div><span className="flex items-center gap-2 text-xs text-muted-foreground"><FileText className="size-4" />Informe semanal</span><h2 className="mt-1 font-heading text-xl font-medium tracking-heading">Cuadra · Growth</h2><p className="text-xs text-muted-foreground">{data.range.start} → {data.range.end}</p></div>
            <Button size="sm" onClick={exportReport}><Download />Exportar .md</Button>
          </div>

          <div className="grid gap-3 py-4 sm:grid-cols-2">
            <ReportMetric icon={TrendingDown} label="Demos agendadas" value={formatNumber(data.demos)} detail={formatChange(data.demoChangePercent)} tone="danger" source={<SourceBadge source={data.metricSources.demos} calculation={report.calculation} />} />
            <ReportMetric icon={TrendingDown} label="Conversión iOS" value={formatPercent(data.iosConversion)} detail={formatPointChange(data.iosChangePoints)} tone="danger" source={<SourceBadge source={data.metricSources.ios} calculation={data.metricCalculations.ios} />} />
            <ReportMetric icon={Lightbulb} label="Sesiones con fricción" value={formatNumber(data.problematicSessions)} detail="Safari iOS" source={<SourceBadge source={data.metricSources.sessions} />} />
            <ReportMetric icon={UsersRound} label="Leads recuperables" value={formatNumber(data.recoverableLeads)} detail="Buen encaje sin demo" source={<SourceBadge source={data.metricSources.leads} />} />
          </div>

          <section className="rounded-xl bg-tone-info-soft p-4"><h3 className="text-sm font-medium text-tone-info">Recomendación</h3><p className="mt-2 text-sm leading-relaxed">Corregir el calendario en Safari iOS, recontactar la cohorte afectada y continuar con el experimento de agenda integrada dentro del formulario.</p></section>

          <section className="mt-3 rounded-xl border border-panel-outline p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-muted-foreground">Causa probable</p><p className="mt-1 text-sm font-medium">{data.cause.title}</p><p className="text-xs text-muted-foreground">Desplegado hace {data.cause.daysSinceDeploy} días · {data.cause.date}</p></div><SourceBadge source={data.metricSources.cause} /></div></section>

          {(active.length > 0 || decided.length > 0) && <section className="mt-3 grid gap-2 rounded-xl border border-panel-outline p-3"><p className="text-xs text-muted-foreground">Experimentos del workspace</p>{[...active, ...decided].map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-sm"><span>{item.name}</span><span className="flex items-center gap-1"><Badge variant="outline">{item.status === "running" ? "En curso" : "Decidido"}</Badge><SourceBadge source={item.source} /></span></div>)}</section>}

          {data.experiment && <section className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-panel-outline p-3"><div><p className="text-xs text-muted-foreground">Experimento para leer</p><p className="text-sm font-medium">{data.experiment.name}</p></div><Badge variant="outline" className="bg-tone-warning-soft text-tone-warning">No concluyente · iterar</Badge></section>}
        </div>
      </Panel>
    </>
  );
}

function ReportMetric({ icon: Icon, label, value, detail, source, tone }: { icon: typeof TrendingDown; label: string; value: string; detail: string; source: React.ReactNode; tone?: "danger" }) { return <section className="rounded-xl border border-panel-outline bg-muted/35 p-3"><div className="flex items-start justify-between gap-2"><span className={tone === "danger" ? "grid size-8 place-items-center rounded-lg bg-tone-danger-soft text-tone-danger" : "grid size-8 place-items-center rounded-lg bg-tone-info-soft text-tone-info"}><Icon className="size-4" /></span>{source}</div><p className="mt-3 text-xs text-muted-foreground">{label}</p><div className="mt-1 flex items-baseline gap-2"><p className="text-2xl font-medium tabular-nums">{value}</p><span className={tone === "danger" ? "text-xs font-medium text-tone-danger" : "text-xs text-muted-foreground"}>{detail}</span></div></section>; }
