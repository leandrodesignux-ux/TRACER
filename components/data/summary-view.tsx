"use client";

import { ArrowRight, CircleAlert, MousePointerClick, UsersRound } from "lucide-react";
import { Line, LineChart } from "recharts";

import { AskAssistantButton } from "@/components/data/ask-assistant-button";
import { SourceBadge } from "@/components/data/source-badge";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { Panel } from "@/components/workspace/panel";
import { ViewHeader } from "@/components/workspace/view-header";
import { findSource } from "@/lib/ai/source";
import { getCrmLeads, getFunnel, getSessions } from "@/lib/ai/tools";
import type { FunnelStageId } from "@/lib/data/funnel";
import { formatChange, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDemoDate } from "@/lib/use-demo-date";

const KPI_IDS: FunnelStageId[] = [
  "site_visit",
  "demo_form_completed",
  "demo_scheduled",
  "paying_customer",
];

const chartConfig = { value: { label: "Valor", color: "var(--chart-1)" } } satisfies ChartConfig;

export function SummaryView() {
  const asOf = useDemoDate();
  const funnel = getFunnel({ period: "90d", asOf });
  const sessions = getSessions({ problematicOnly: true, asOf });
  const leads = getCrmLeads({ goodFitWithoutDemo: true, asOf });
  const stages = KPI_IDS.map((id) => funnel.data.stages.find((stage) => stage.id === id)!);

  return (
    <>
      <ViewHeader title="Resumen" status="Pulso de la semana actual" />
      <Panel className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">Métricas principales</p>
          <AskAssistantButton prompt="Resume qué cambió esta semana y qué debería investigar primero." />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stages.map((stage) => {
            const history = funnel.data.history.map((week) => ({ value: week.values[stage.id] }));
            return (
              <section key={stage.id} className="rounded-xl border border-panel-outline bg-card/65 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{stage.label}</p>
                    <p className="mt-1 text-2xl font-medium tracking-heading tabular-nums">{formatNumber(stage.current)}</p>
                  </div>
                  <SourceBadge source={findSource(funnel.source, stage.sourceId)} calculation={funnel.calculation} />
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className={cn("text-xs font-medium tabular-nums", stage.changePercent < 0 ? "text-tone-danger" : "text-tone-success")}>{formatChange(stage.changePercent)}</span>
                  <span className="text-[11px] text-muted-foreground">vs. semana anterior</span>
                </div>
                <ChartContainer config={chartConfig} className="mt-2 h-14 w-full aspect-auto">
                  <LineChart data={history} margin={{ top: 5, right: 2, bottom: 2, left: 2 }}>
                    <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ChartContainer>
              </section>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.6fr)]">
          <section className="rounded-xl border border-panel-outline bg-card/65 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div><p className="text-sm font-medium">Funnel compacto</p><p className="text-xs text-muted-foreground">Volumen y conversión desde el paso anterior</p></div>
              <SourceBadge source={funnel.source} calculation={funnel.calculation} />
            </div>
            <div className="grid gap-2">
              {funnel.data.stages.map((stage) => (
                <div key={stage.id} className={cn("grid grid-cols-[minmax(8rem,1fr)_4rem_minmax(5rem,1fr)] items-center gap-2 rounded-lg px-2 py-1.5 text-xs", stage.id === "demo_scheduled" && "bg-tone-danger-soft text-tone-danger")}>
                  <span className="truncate font-medium">{stage.label}</span>
                  <span className="text-right tabular-nums">{formatNumber(stage.current)}</span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-muted"><span className={cn("block h-full rounded-full", stage.id === "demo_scheduled" ? "bg-tone-danger" : "bg-chart-1")} style={{ width: `${Math.max(3, stage.conversionCurrent * 100)}%` }} /></span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-panel-outline bg-card/65 p-3 sm:p-4">
            <p className="text-sm font-medium">Señales recientes</p>
            <div className="mt-3 grid gap-2">
              <Signal icon={CircleAlert} title={`${formatChange(funnel.data.drop.percent)} en demos agendadas`} detail={`${funnel.data.drop.current} frente a ${funnel.data.drop.previous}`} source={<SourceBadge source={findSource(funnel.source, "crm")} calculation={funnel.calculation} />} danger />
              <Signal icon={MousePointerClick} title={`${sessions.data.length} sesiones con fricción`} detail="Carga lenta y clics repetidos" source={<SourceBadge source={sessions.source} />} />
              <Signal icon={UsersRound} title={`${leads.data.length} leads para contactar`} detail="Buen encaje, formulario completo y sin demo" source={<SourceBadge source={leads.source} />} />
            </div>
          </section>
        </div>
      </Panel>
    </>
  );
}

function Signal({ icon: Icon, title, detail, source, danger = false }: { icon: typeof CircleAlert; title: string; detail: string; source: React.ReactNode; danger?: boolean }) {
  return <div className="grid grid-cols-[auto_1fr_auto] items-start gap-2 rounded-lg bg-muted/55 p-2.5"><span className={cn("grid size-7 place-items-center rounded-lg bg-tone-info-soft text-tone-info", danger && "bg-tone-danger-soft text-tone-danger")}><Icon className="size-3.5" /></span><span><span className="block text-xs font-medium">{title}</span><span className="block text-[11px] text-muted-foreground">{detail}</span></span><span className="flex items-center gap-1">{source}<ArrowRight className="size-3 text-muted-foreground" /></span></div>;
}
