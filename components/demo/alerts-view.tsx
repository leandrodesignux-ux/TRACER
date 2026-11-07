"use client";

import { ArrowRight, BellRing, TrendingDown } from "lucide-react";
import { useMemo, useState } from "react";

import { SourceBadge } from "@/components/data/source-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Panel } from "@/components/workspace/panel";
import { ViewHeader } from "@/components/workspace/view-header";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { getAlerts } from "@/lib/ai/tools";
import type { DemoAlert } from "@/lib/data/alerts";
import { formatChange } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDemoDate } from "@/lib/use-demo-date";
import { useStored } from "@/lib/storage";

type Filter = "all" | DemoAlert["severity"];

export function AlertsView() {
  const [filter, setFilter] = useState<Filter>("all");
  const asOf = useDemoDate();
  const { fillComposer, newAnalysis } = useWorkspace();
  const [readIds, setReadIds] = useStored<string[]>("read-alerts", []);
  const result = useMemo(() => getAlerts({ asOf, severity: filter === "all" ? undefined : filter }), [asOf, filter]);

  return (
    <>
      <ViewHeader title="Alertas" status="Cambios detectados automáticamente" />
      <Panel className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-panel-outline p-3 sm:p-4">
          <ToggleGroup type="single" value={filter} onValueChange={(value) => value && setFilter(value as Filter)} variant="outline" size="sm" spacing={0}>
            <ToggleGroupItem value="all">Todas</ToggleGroupItem><ToggleGroupItem value="high">Alta</ToggleGroupItem><ToggleGroupItem value="medium">Media</ToggleGroupItem>
          </ToggleGroup>
          <SourceBadge source={result.source} calculation={result.calculation} />
        </div>
        <div className="grid min-h-0 flex-1 content-start gap-2 overflow-y-auto p-3 sm:p-4">
          {result.data.map((alert) => (
            <article key={alert.id} className={cn("grid gap-3 rounded-xl border border-panel-outline bg-card/70 p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center", alert.severity === "high" && "border-tone-danger/35 bg-tone-danger-soft/35", readIds.includes(alert.id) && "opacity-70")}>
              <span className={cn("grid size-9 place-items-center rounded-lg bg-tone-warning-soft text-tone-warning", alert.severity === "high" && "bg-tone-danger-soft text-tone-danger")}><TrendingDown /></span>
              <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-medium">{alert.metric}</h2><Badge variant={alert.severity === "high" ? "destructive" : "outline"}>{alert.severity === "high" ? "Alta" : "Media"}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{alert.segment} · {formatAlertDate(alert.detectedAt)}</p><p className="mt-2 text-xl font-medium tabular-nums text-tone-danger">{formatChange(alert.changePercent)}</p></div>
              <Button size="sm" variant="outline" onClick={() => { setReadIds([...new Set([...readIds, alert.id])]); newAnalysis(); fillComposer(alert.prompt); }}><BellRing />Analizar alerta<ArrowRight /></Button>
            </article>
          ))}
          {result.data.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No hay alertas con este filtro.</p>}
        </div>
      </Panel>
    </>
  );
}

function formatAlertDate(value: string) { return new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
