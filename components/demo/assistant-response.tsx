"use client";

import {
  Check,
  CalendarDays,
  ChevronRight,
  CircleStop,
  FlaskConical,
  Play,
  SkipForward,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SessionReplay } from "@/components/data/sessions-view";
import { SourceBadge } from "@/components/data/source-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TracerMark } from "@/components/workspace/tracer-logo";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  responseForMessage,
  type AssistantMessage,
} from "@/lib/demo/threads";
import {
  experimentFromPlan,
  persistExperiment,
} from "@/lib/demo/experiment-state";
import type {
  ExperimentPlanResponseBlock,
  ExperimentResultResponseBlock,
  FunnelResponseBlock,
  LeadsResponseBlock,
  ResponseBlock,
  SegmentsResponseBlock,
  SessionsResponseBlock,
  TimelineResponseBlock,
} from "@/lib/demo/responses";
import type { DemoSession } from "@/lib/data/sessions";
import {
  formatNumber,
  formatPercent,
  formatPointChange,
} from "@/lib/format";
import { writeStored } from "@/lib/storage";
import { cn } from "@/lib/utils";

export function AssistantResponse({ message }: { message: AssistantMessage }) {
  const { setAssistantStatus, fillComposer } = useWorkspace();
  const reduceMotion = useReducedMotion();
  const response = responseForMessage(message);
  const total = response.steps.length + 2;
  const [progress, setProgress] = useState(
    message.status === "complete" || reduceMotion ? total : 0,
  );

  useEffect(() => {
    if (message.status !== "running") return;
    if (reduceMotion) {
      const timer = window.setTimeout(
        () => setAssistantStatus(message.id, "complete"),
        0,
      );
      return () => window.clearTimeout(timer);
    }
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(total, current + 1);
        if (next === total) {
          window.clearInterval(timer);
          window.setTimeout(
            () => setAssistantStatus(message.id, "complete"),
            0,
          );
        }
        return next;
      });
    }, 520);
    return () => window.clearInterval(timer);
  }, [message.id, message.status, reduceMotion, setAssistantStatus, total]);

  const stepCount = Math.min(progress, response.steps.length);
  const showText = progress > response.steps.length;
  const showBlocks = progress >= total;

  return (
    <div className="grid gap-3">
      <div className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <TracerMark className="size-4" />
        </span>
        <div className="grid min-w-0 flex-1 gap-2 pt-0.5">
          {response.steps.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {response.steps.slice(0, stepCount).map((step) => (
                <motion.span
                  key={step.label}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-panel-outline bg-card/80 px-2 py-1 text-[11px]"
                >
                  <Check className="size-3 text-tone-success" />
                  {step.label}
                  <SourceBadge source={step.source} />
                </motion.span>
              ))}
            </div>
          )}

          {showText && (
            <p className="max-w-prose text-sm leading-relaxed text-foreground">
              <WordReveal text={response.text} animate={message.status === "running" && !reduceMotion} />
            </p>
          )}

          {message.status === "stopped" && (
            <p className="text-xs text-muted-foreground">Respuesta detenida.</p>
          )}
        </div>
      </div>

      {showBlocks && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="ml-0 grid gap-3 sm:ml-10"
        >
          {response.blocks.map((block, index) => (
            <ResponseBlockView key={`${block.kind}-${index}`} block={block} />
          ))}
          {response.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {response.suggestions.map((suggestion) => (
                <Button key={suggestion} size="sm" variant="outline" className="h-7 rounded-full bg-card/70 text-[11px]" onClick={() => fillComposer(suggestion)}>
                  {suggestion}<ChevronRight />
                </Button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {message.status === "running" && (
        <div className="ml-10 flex gap-2">
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAssistantStatus(message.id, "stopped")}><CircleStop />Detener</Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setProgress(total); setAssistantStatus(message.id, "complete"); }}><SkipForward />Saltar animación</Button>
        </div>
      )}
    </div>
  );
}

function WordReveal({ text, animate }: { text: string; animate: boolean }) {
  return <>{text.split(" ").map((word, index) => <motion.span key={`${word}-${index}`} initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: animate ? index * 0.018 : 0 }} className="inline">{word}{" "}</motion.span>)}</>;
}

function ResponseBlockView({ block }: { block: ResponseBlock }) {
  if (block.kind === "funnel") return <FunnelBlock block={block} />;
  if (block.kind === "segments") return <SegmentsBlock block={block} />;
  if (block.kind === "sessions") return <SessionsBlock block={block} />;
  if (block.kind === "leads") return <LeadsBlock block={block} />;
  if (block.kind === "timeline") return <TimelineBlock block={block} />;
  if (block.kind === "experiment-plan") return <ExperimentPlanBlock block={block} />;
  return <ExperimentResultBlock block={block} />;
}

function BlockShell({ title, source, calculation, children }: { title: string; source: Parameters<typeof SourceBadge>[0]["source"]; calculation?: Parameters<typeof SourceBadge>[0]["calculation"]; children: React.ReactNode }) {
  return <section className="rounded-xl border border-panel-outline bg-card/70 p-3 shadow-xs"><div className="mb-3 flex items-start justify-between gap-2"><h3 className="text-sm font-medium">{title}</h3><SourceBadge source={source} calculation={calculation} /></div>{children}</section>;
}

function FunnelBlock({ block }: { block: FunnelResponseBlock }) {
  return <BlockShell title="Dónde se abre la fuga" source={block.source} calculation={block.calculation}><div className="grid gap-1.5">{block.stages.map((stage) => <div key={stage.id} className={cn("grid gap-1 rounded-lg px-2 py-1.5 text-xs sm:grid-cols-[1fr_auto] sm:gap-2", stage.id === "demo_scheduled" && "bg-tone-danger-soft text-tone-danger")}><span>{stage.label}</span><span className="font-medium tabular-nums">{formatNumber(stage.previous)} → {formatNumber(stage.current)}{stage.id !== "site_visit" && ` · ${formatPercent(stage.conversionPrevious)} → ${formatPercent(stage.conversionCurrent)}`}</span></div>)}</div></BlockShell>;
}

function SegmentsBlock({ block }: { block: SegmentsResponseBlock }) {
  return <BlockShell title="Conversión por dispositivo" source={block.source} calculation={block.calculation}><div className="grid gap-2 sm:grid-cols-3">{block.rows.map((row) => <div key={row.id} className={cn("rounded-lg bg-muted/55 p-2.5", row.changePoints <= -20 && "bg-tone-danger-soft")}><p className="text-xs font-medium">{row.label}</p><p className="mt-1 text-lg font-medium tabular-nums">{formatPercent(row.currentRate)}</p><p className={cn("text-[11px]", row.changePoints < 0 ? "text-tone-danger" : "text-tone-success")}>{formatPointChange(row.changePoints)}</p></div>)}</div></BlockShell>;
}

function TimelineBlock({ block }: { block: TimelineResponseBlock }) {
  const max = Math.max(...block.series.flatMap((item) => [item.ios, item.android]));
  return (
    <BlockShell title="Cambio reciente y caída diaria" source={block.source}>
      <div className="mb-3 flex items-start gap-2 rounded-lg bg-tone-info-soft p-2.5 text-xs">
        <CalendarDays className="mt-0.5 size-4 shrink-0 text-tone-info" />
        <span><strong>{block.changelog.title}</strong><span className="block text-muted-foreground">{block.changelog.date} · hace {block.daysSinceDeploy} días</span></span>
      </div>
      <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] items-end gap-1" aria-label="Demos diarias en iOS y Android">
        {block.series.map((item) => (
          <div key={item.date} className="grid h-20 grid-cols-2 items-end gap-px" title={`${item.date}: iOS ${item.ios}, Android ${item.android}`}>
            <span className="min-h-px rounded-t bg-tone-danger" style={{ height: `${(item.ios / max) * 100}%` }} />
            <span className="min-h-px rounded-t bg-tone-warning" style={{ height: `${(item.android / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground"><span><i className="mr-1 inline-block size-2 rounded-sm bg-tone-danger" />iOS</span><span><i className="mr-1 inline-block size-2 rounded-sm bg-tone-warning" />Android</span></div>
    </BlockShell>
  );
}

function SessionsBlock({ block }: { block: SessionsResponseBlock }) {
  const [selected, setSelected] = useState<DemoSession | null>(null);
  return <><BlockShell title="Evidencia de sesión" source={block.source}><div className="grid gap-2 sm:grid-cols-3">{block.sessions.map((session) => <button key={session.id} type="button" onClick={() => setSelected(session)} className="rounded-lg border border-tone-danger/25 bg-tone-danger-soft/45 p-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"><span className="flex items-center justify-between gap-2 text-xs font-medium">Safari · iOS <Play className="size-3" /></span><span className="mt-1 block text-[11px] text-muted-foreground">{(session.calendarLoadMs / 1000).toFixed(1)} s · {session.rageClicks} clics repetidos</span></button>)}</div></BlockShell><Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}><SheetContent className="w-[36rem] max-w-[96vw] gap-0 sm:max-w-xl">{selected && <SessionReplay session={selected} source={block.source} />}</SheetContent></Sheet></>;
}

function LeadsBlock({ block }: { block: LeadsResponseBlock }) {
  const router = useRouter();
  return <BlockShell title="Cohorte para recontactar" source={block.source}><div className="grid gap-1.5">{block.leads.slice(0, 4).map((lead) => <div key={lead.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/55 px-2.5 py-2 text-xs"><span className="truncate font-medium">{lead.company}</span><span className="shrink-0 text-muted-foreground">{lead.locations} locales</span></div>)}</div><Button size="sm" variant="outline" className="mt-3 w-full text-xs" onClick={() => { writeStored("crm-good-fit-filter", true); router.push("/crm"); }}><span className="tabular-nums">Ver {block.leads.length} leads en CRM</span><ChevronRight /></Button></BlockShell>;
}

function ExperimentPlanBlock({ block }: { block: ExperimentPlanResponseBlock }) {
  const router = useRouter();
  const save = () => { persistExperiment(experimentFromPlan(block)); writeStored("open-experiment-designer", true); toast.success("Diseño preparado"); router.push("/experimentos"); };
  return <BlockShell title={block.name} source={block.source} calculation={block.calculation}><div className="grid gap-3"><p className="rounded-lg bg-primary/8 p-3 text-sm leading-relaxed"><Sparkles className="mr-1.5 inline size-4 text-primary" />{block.hypothesis}</p><dl className="grid gap-2 text-xs sm:grid-cols-2"><Metric label="Métrica principal" value={block.primaryMetric} /><Metric label="Guardiana" value={block.guardrail} /><Metric label="Segmento" value={block.segment} /><Metric label="Duración estimada" value={`${block.estimate.weeks} semanas · ${formatNumber(block.estimate.totalSample)} personas`} /></dl><Button size="sm" onClick={save}><FlaskConical />Diseñar experimento</Button></div></BlockShell>;
}

function ExperimentResultBlock({ block }: { block: ExperimentResultResponseBlock }) {
  const item = block.experiment;
  return <BlockShell title={item.name} source={block.source} calculation={block.calculation}><div className="grid gap-3"><div className="grid grid-cols-2 gap-2"><Metric label="Control" value={formatPercent(item.controlRate)} /><Metric label="Variante" value={formatPercent(item.variantRate)} /></div><Badge variant="outline" className="bg-tone-warning-soft text-tone-warning">Resultado no concluyente · iterar</Badge></div></BlockShell>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-muted/55 p-2.5"><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>; }
