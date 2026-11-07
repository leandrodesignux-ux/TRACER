"use client";

import {
  CheckCircle2,
  Clipboard,
  FlaskConical,
  Pencil,
  Play,
  Plus,
  Rocket,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { SourceBadge } from "@/components/data/source-badge";
import { ExperimentDesigner } from "@/components/demo/experiment-designer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Panel } from "@/components/workspace/panel";
import { ViewHeader } from "@/components/workspace/view-header";
import {
  advanceExperiment,
  getPreviousBoardExperiment,
  type BoardExperimentStatus,
  type ExperimentDecision,
  type StoredExperiment,
} from "@/lib/demo/experiment-state";
import { formatNumber, formatPercent } from "@/lib/format";
import { useStored } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { useDemoDate } from "@/lib/use-demo-date";

const COLUMNS: { id: BoardExperimentStatus; label: string }[] = [
  { id: "draft", label: "Por diseñar" },
  { id: "running", label: "En curso" },
  { id: "ready_to_read", label: "Para leer" },
  { id: "decided", label: "Decidido" },
];

const DECISIONS: { id: ExperimentDecision; label: string }[] = [
  { id: "scale", label: "Escalar" },
  { id: "iterate", label: "Iterar" },
  { id: "discard", label: "Descartar" },
];

export function ExperimentsView() {
  const asOf = useDemoDate();
  const [stored, setStored] = useStored<StoredExperiment[]>("saved-experiments", []);
  const [openRequested, setOpenRequested] = useStored("open-experiment-designer", false);
  const [demoState, setDemoState] = useStored<"current" | "future">("demo-state", "current");
  const [designerOpen, setDesignerOpen] = useState(false);
  const [editing, setEditing] = useState<StoredExperiment | undefined>();
  const previousExperiment = useMemo(
    () => getPreviousBoardExperiment(asOf),
    [asOf],
  );
  const validStored = stored.filter((item) => item && typeof item.id === "string");
  const previousOverride = validStored.find((item) => item.id === previousExperiment.id);
  const experiments = useMemo(() => {
    const items = [
      previousOverride ?? previousExperiment,
      ...validStored.filter((item) => item.id !== previousExperiment.id),
    ];
    return demoState === "future"
      ? items.map((item) => item.status === "running" ? advanceExperiment(item, asOf) : item)
      : items;
  }, [asOf, demoState, previousExperiment, previousOverride, validStored]);
  const open = designerOpen || openRequested;

  const upsert = (experiment: StoredExperiment) => {
    setStored([experiment, ...validStored.filter((item) => item.id !== experiment.id)]);
  };

  const closeDesigner = () => {
    setDesignerOpen(false);
    setOpenRequested(false);
    setEditing(undefined);
  };

  const setFuture = (value: "current" | "future") => {
    setDemoState(value);
    if (value === "future") {
      toast.success("La demo avanzó tres semanas");
    }
  };

  return (
    <>
      <ViewHeader title="Experimentos" status="De la hipótesis a la decisión" />
      <Panel className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-panel-outline p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Estado demo</span>
            <ToggleGroup type="single" value={demoState} onValueChange={(value) => value && setFuture(value as "current" | "future")} variant="outline" size="sm" spacing={0}>
              <ToggleGroupItem value="current">Hoy</ToggleGroupItem>
              <ToggleGroupItem value="future">Tres semanas después</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Button size="sm" onClick={() => { setEditing(undefined); setDesignerOpen(true); }}><Plus />Diseñar experimento</Button>
        </div>

        <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-3 sm:p-4 xl:grid-cols-4">
          {COLUMNS.map((column) => {
            const items = experiments.filter((experiment) => experiment.status === column.id);
            return (
              <section key={column.id} className="grid content-start gap-2 rounded-xl border border-panel-outline bg-muted/25 p-2.5">
                <div className="flex items-center justify-between gap-2 px-1 py-0.5">
                  <h2 className="text-xs font-medium">{column.label}</h2>
                  <Badge variant="secondary" className="tabular-nums">{items.length}</Badge>
                </div>
                {items.map((experiment) => (
                  <ExperimentCard
                    key={experiment.id}
                    experiment={experiment}
                    onUpdate={upsert}
                    onEdit={() => { setEditing(experiment); setDesignerOpen(true); }}
                  />
                ))}
                {items.length === 0 && <p className="rounded-lg border border-dashed border-panel-outline px-3 py-6 text-center text-[11px] text-muted-foreground">Sin experimentos</p>}
              </section>
            );
          })}
        </div>
      </Panel>

      {open && (
        <ExperimentDesigner
          initial={editing ?? experiments.find((item) => item.id === "agenda-integrada" && item.status === "draft")}
          onClose={closeDesigner}
          onSave={(experiment) => {
            upsert(experiment);
            setDemoState("current");
            closeDesigner();
            toast.success("Diseño guardado");
          }}
        />
      )}
    </>
  );
}

function ExperimentCard({ experiment, onUpdate, onEdit }: { experiment: StoredExperiment; onUpdate: (experiment: StoredExperiment) => void; onEdit: () => void }) {
  const copySummary = async () => {
    const result = experiment.result ? `\n- Control: ${formatPercent(experiment.result.controlRate)}\n- Variante: ${formatPercent(experiment.result.variantRate)}` : "";
    const sources = (Array.isArray(experiment.source) ? experiment.source : [experiment.source]).map((item) => item.label).join(" + ");
    const decision = experiment.decision ? `\n- Decisión: ${experiment.decision}${experiment.decidedAt ? ` · ${experiment.decidedAt.slice(0, 10)}` : ""}` : "";
    const summary = `## ${experiment.name}\n\n${experiment.hypothesis}\n\n- Métrica: ${experiment.primaryMetric}\n- Segmento: ${experiment.segment}\n- Duración: ${experiment.durationWeeks} semanas\n- Muestra: ${formatNumber(experiment.totalSample)}${result}${decision}\n- Fuente: ${sources}${experiment.calculation ? ` · ${experiment.calculation.formula}` : ""}`;
    try {
      await navigator.clipboard.writeText(summary);
      toast.success("Resumen copiado");
    } catch {
      toast.error("No pudimos copiar el resumen");
    }
  };

  return (
    <article className="grid gap-3 rounded-xl border border-panel-outline bg-card/75 p-3 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0"><h3 className="text-sm font-medium leading-snug">{experiment.name}</h3><p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-muted-foreground">{experiment.hypothesis}</p></div>
        <span className="flex flex-wrap justify-end gap-1"><SourceBadge source={experiment.source} />{experiment.calculation && <SourceBadge source={experiment.source} calculation={experiment.calculation} />}</span>
      </div>

      <dl className="grid gap-1.5 text-[11px]">
        <CardMetric label="Métrica" value={experiment.primaryMetric} />
        <CardMetric label="Duración" value={`${experiment.durationWeeks} semanas · ${formatNumber(experiment.totalSample)} personas`} />
      </dl>

      {experiment.result && (
        <div className={cn("grid grid-cols-2 gap-2 rounded-lg p-2.5", experiment.result.outcome === "positive" ? "bg-tone-success-soft" : "bg-tone-warning-soft")}>
          <CardMetric label="Control" value={formatPercent(experiment.result.controlRate)} />
          <CardMetric label="Variante" value={formatPercent(experiment.result.variantRate)} />
          <p className={cn("col-span-2 text-[11px] font-medium", experiment.result.outcome === "positive" ? "text-tone-success" : "text-tone-warning")}>{experiment.result.outcome === "positive" ? "Resultado positivo" : "Resultado no concluyente"}</p>
        </div>
      )}

      {experiment.decision && <DecisionBadge decision={experiment.decision} />}

      <div className="flex flex-wrap gap-1.5">
        {experiment.status === "draft" && <><Button size="sm" variant="outline" className="h-7 flex-1 text-[11px]" onClick={onEdit}><Pencil />Editar</Button><Button size="sm" className="h-7 flex-1 text-[11px]" onClick={() => onUpdate({ ...experiment, status: "running" })}><Play />Iniciar</Button></>}
        {experiment.status === "running" && <Badge variant="outline" className="bg-tone-info-soft text-tone-info"><FlaskConical />Recolectando datos</Badge>}
        {experiment.status === "ready_to_read" && DECISIONS.map((decision) => <Button key={decision.id} size="sm" variant={decision.id === "scale" ? "default" : "outline"} className="h-7 flex-1 px-2 text-[10px]" onClick={() => onUpdate({ ...experiment, status: "decided", decision: decision.id, decidedAt: new Date().toISOString() })}>{decision.label}</Button>)}
        <Button size="icon-sm" variant="ghost" onClick={copySummary} aria-label={`Copiar resumen de ${experiment.name}`} className="ml-auto"><Clipboard /></Button>
      </div>
    </article>
  );
}

function CardMetric({ label, value }: { label: string; value: string }) { return <div><dt className="text-muted-foreground">{label}</dt><dd className="font-medium leading-snug">{value}</dd></div>; }

function DecisionBadge({ decision }: { decision: ExperimentDecision }) {
  const item = DECISIONS.find((option) => option.id === decision)!;
  const Icon = decision === "scale" ? Rocket : CheckCircle2;
  return <Badge variant="outline" className={cn(decision === "scale" ? "bg-tone-success-soft text-tone-success" : decision === "iterate" ? "bg-tone-warning-soft text-tone-warning" : "bg-tone-danger-soft text-tone-danger")}><Icon />{item.label}</Badge>;
}
