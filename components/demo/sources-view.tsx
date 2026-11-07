"use client";

import { ArrowDown, ArrowUp, CheckCircle2, RefreshCw, RotateCcw } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import { SourceBadge } from "@/components/data/source-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/workspace/panel";
import { ViewHeader } from "@/components/workspace/view-header";
import { getFunnel, getSourceHealth } from "@/lib/ai/tools";
import { SOURCE_LABELS } from "@/lib/data/types";
import { useStored } from "@/lib/storage";
import { useDemoDate } from "@/lib/use-demo-date";

export function SourcesView() {
  const asOf = useDemoDate();
  const health = useMemo(() => getSourceHealth({ asOf }), [asOf]);
  const funnel = useMemo(() => getFunnel({ asOf }), [asOf]);
  const defaultOrder = funnel.data.stages.map((stage) => stage.id);
  const [config, setConfig] = useStored<{ labels: Record<string, string>; order: string[] }>(
    "funnel-stage-config",
    { labels: {}, order: defaultOrder },
  );
  const sources = Array.isArray(health.source) ? health.source : [health.source];
  const order = config.order.length === defaultOrder.length ? config.order : defaultOrder;
  const stages = order.map((id) => funnel.data.stages.find((stage) => stage.id === id)!).filter(Boolean);
  const move = (id: string, direction: -1 | 1) => {
    const index = order.indexOf(id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setConfig({ ...config, order: next });
  };

  return (
    <>
      <ViewHeader title="Fuentes" status="Conexiones y mapeo del funnel" />
      <Panel className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="grid gap-3 lg:grid-cols-3">
          {health.data.map((item) => {
            const source = sources.find((entry) => entry.id === item.id)!;
            return (
              <section key={item.id} className="rounded-xl border border-panel-outline bg-card/70 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div><p className="text-sm font-medium">{SOURCE_LABELS[item.id]}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-tone-success"><CheckCircle2 className="size-3.5" />Conectado</p></div>
                  <SourceBadge source={source} />
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><RefreshCw className="size-3.5" />Sincronizado hace {item.lastSyncMinutes} min</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.mappedEvents.map((event) => <Badge key={event} variant="secondary" className="font-mono text-[10px]">{event}</Badge>)}
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-4 rounded-xl border border-panel-outline bg-card/70 p-3 sm:p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-sm font-medium">Etapas del funnel</h2><p className="text-xs text-muted-foreground">Ajusta los nombres que usa Tracer en las vistas y respuestas.</p></div>
            <div className="flex items-center gap-2"><SourceBadge source={funnel.source} calculation={funnel.calculation} /><Button size="sm" variant="outline" className="text-xs" onClick={() => { setConfig({ labels: {}, order: defaultOrder }); toast.success("Etapas restauradas"); }}><RotateCcw />Restaurar</Button></div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {stages.map((stage, index) => (
              <div key={stage.id} className="grid grid-cols-[1fr_auto] items-end gap-2">
                <label className="grid gap-1.5 text-xs text-muted-foreground">
                  <span className="font-mono text-[10px]">{stage.id}</span>
                  <Input value={config.labels[stage.id] ?? stage.label} onChange={(event) => setConfig({ ...config, labels: { ...config.labels, [stage.id]: event.target.value } })} aria-label={`Nombre de ${stage.label}`} />
                </label>
                <span className="flex pb-0.5">
                  <Button size="icon-sm" variant="ghost" onClick={() => move(stage.id, -1)} disabled={index === 0} aria-label={`Subir ${stage.label}`}><ArrowUp /></Button>
                  <Button size="icon-sm" variant="ghost" onClick={() => move(stage.id, 1)} disabled={index === stages.length - 1} aria-label={`Bajar ${stage.label}`}><ArrowDown /></Button>
                </span>
              </div>
            ))}
          </div>
        </section>
      </Panel>
    </>
  );
}
