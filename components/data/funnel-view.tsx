"use client";

import { ArrowRight, TrendingDown } from "lucide-react";
import { useMemo, useState } from "react";

import { AskAssistantButton } from "@/components/data/ask-assistant-button";
import { SourceBadge } from "@/components/data/source-badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Panel } from "@/components/workspace/panel";
import { ViewHeader } from "@/components/workspace/view-header";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { findSource } from "@/lib/ai/source";
import { getFunnel } from "@/lib/ai/tools";
import type { FunnelStageId } from "@/lib/data/funnel";
import type { DeviceId, PeriodId } from "@/lib/data/types";
import {
  formatChange,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDemoDate } from "@/lib/use-demo-date";

type SegmentFilter = DeviceId | "all";

const SEGMENTS: { value: SegmentFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "desktop", label: "Desktop" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
];

export function FunnelView() {
  const [segment, setSegment] = useState<SegmentFilter>("all");
  const [period, setPeriod] = useState<PeriodId>("7d");
  const [selectedStage, setSelectedStage] = useState<FunnelStageId | null>(null);
  const asOf = useDemoDate();
  const { fillComposer } = useWorkspace();
  const result = useMemo(
    () => getFunnel({ segment, period, asOf }),
    [segment, period, asOf],
  );
  const stage = result.data.stages.find((item) => item.id === selectedStage);
  const segmentRow = result.data.segment;

  return (
    <>
      <ViewHeader
        title="Funnel"
        status="Semana actual comparada con la anterior"
      />

      <Panel className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-panel-outline p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex min-w-0 flex-wrap gap-2 pb-0.5">
            <ToggleGroup
              type="single"
              value={segment}
              onValueChange={(value) => value && setSegment(value as SegmentFilter)}
              variant="outline"
              size="sm"
              spacing={0}
            >
              {SEGMENTS.map((item) => (
                <ToggleGroupItem key={item.value} value={item.value}>
                  {item.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ToggleGroup
              type="single"
              value={period}
              onValueChange={(value) => value && setPeriod(value as PeriodId)}
              variant="outline"
              size="sm"
              spacing={0}
            >
              <ToggleGroupItem value="7d">Semana</ToggleGroupItem>
              <ToggleGroupItem value="28d">4 semanas</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <AskAssistantButton prompt="Analiza el paso del funnel que más cayó y explícame qué segmento lo provoca." />
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="grid content-start gap-2">
            {result.data.stages.map((item) => {
              const max = Math.max(item.current, item.previous);
              const source = findSource(result.source, item.sourceId);
              const isDrop = item.id === "demo_scheduled";
              return (
                <div
                  key={item.id}
                  className={cn(
                    "grid gap-2 rounded-xl border border-panel-outline bg-card/65 p-3 text-left transition-colors hover:bg-card",
                    isDrop && "border-tone-danger/40 bg-tone-danger-soft/45",
                  )}
                >
                  <span className="flex flex-wrap items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStage(item.id)}
                      className="grid gap-0.5 rounded text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        {isDrop && (
                          <TrendingDown className="size-3.5 text-tone-danger" />
                        )}
                        {item.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {item.id === "site_visit"
                          ? "Entrada al funnel"
                          : `${formatPercent(item.conversionCurrent)} desde el paso anterior`}
                      </span>
                    </button>
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-medium tabular-nums",
                          item.changePercent < 0 && "text-tone-danger",
                        )}
                      >
                        {formatChange(item.changePercent)}
                      </span>
                      <SourceBadge source={source} calculation={result.calculation} />
                    </span>
                  </span>

                  <span className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-2 text-[11px]">
                    <span className="text-muted-foreground">Actual</span>
                    <span className="h-2 overflow-hidden rounded-full bg-muted">
                      <span
                        className={cn(
                          "block h-full rounded-full",
                          isDrop ? "bg-tone-danger" : "bg-chart-1",
                        )}
                        style={{ width: `${(item.current / max) * 100}%` }}
                      />
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatNumber(item.current)}
                    </span>
                    <span className="text-muted-foreground">Anterior</span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-chart-4"
                        style={{ width: `${(item.previous / max) * 100}%` }}
                      />
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatNumber(item.previous)}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          <aside className="grid content-start gap-3">
            <div className="rounded-xl border border-panel-outline bg-card/65 p-3">
              <p className="text-xs text-muted-foreground">Paso que cae</p>
              <p className="mt-1 text-sm font-medium">
                Formulario completado <ArrowRight className="inline size-3.5" /> demo agendada
              </p>
              <p className="mt-2 text-2xl font-medium tracking-heading text-tone-danger">
                −18 %
              </p>
              <p className="text-xs text-muted-foreground">205 frente a 250 demos</p>
              <div className="mt-3">
                <SourceBadge
                  source={findSource(result.source, "crm")}
                  calculation={result.calculation}
                />
              </div>
            </div>

            {segmentRow && (
              <div className="rounded-xl border border-panel-outline bg-card/65 p-3">
                <p className="text-xs text-muted-foreground">Segmento activo</p>
                <p className="mt-1 text-sm font-medium">{segmentRow.label}</p>
                <p className="mt-2 text-xl font-medium tracking-heading">
                  {formatPercent(
                    segmentRow.current.scheduled / segmentRow.current.completed,
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {segmentRow.current.scheduled} de {segmentRow.current.completed}
                </p>
                <div className="mt-3">
                  <SourceBadge source={result.source} calculation={result.calculation} />
                </div>
              </div>
            )}
          </aside>
        </div>
      </Panel>

      <Sheet
        open={selectedStage !== null}
        onOpenChange={(open) => !open && setSelectedStage(null)}
      >
        <SheetContent className="w-[24rem] max-w-[92vw] gap-0">
          {stage && (
            <>
              <SheetHeader className="border-b border-border pr-12">
                <SheetTitle>{stage.label}</SheetTitle>
                <SheetDescription>
                  Detalle de la semana actual frente a la anterior.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 p-4">
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="Actual" value={formatNumber(stage.current)} />
                  <Metric label="Anterior" value={formatNumber(stage.previous)} />
                  <Metric
                    label="Variación"
                    value={formatChange(stage.changePercent)}
                  />
                  <Metric
                    label="Conversión"
                    value={formatPercent(stage.conversionCurrent)}
                  />
                </div>
                <SourceBadge
                  source={findSource(result.source, stage.sourceId)}
                  calculation={result.calculation}
                />
                <Button
                  onClick={() => {
                    setSelectedStage(null);
                    fillComposer(`Analiza el paso ${stage.label} del funnel y explica su variación.`);
                  }}
                >
                  Analizar este paso
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/70 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-medium tabular-nums">{value}</p>
    </div>
  );
}
