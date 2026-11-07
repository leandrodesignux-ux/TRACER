"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";

import { AskAssistantButton } from "@/components/data/ask-assistant-button";
import { SourceBadge } from "@/components/data/source-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Panel } from "@/components/workspace/panel";
import { ViewHeader } from "@/components/workspace/view-header";
import { getSegments } from "@/lib/ai/tools";
import type { SegmentDimension } from "@/lib/data/segments";
import { formatPercent, formatPointChange } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDemoDate } from "@/lib/use-demo-date";

type SortKey = "label" | "completed" | "scheduled" | "rate" | "change";

const DIMENSIONS: { value: SegmentDimension; label: string }[] = [
  { value: "device", label: "Dispositivo" },
  { value: "country", label: "País" },
  { value: "channel", label: "Canal" },
];

export function SegmentsView() {
  const [dimension, setDimension] = useState<SegmentDimension>("device");
  const [sortKey, setSortKey] = useState<SortKey>("change");
  const [descending, setDescending] = useState(false);
  const asOf = useDemoDate();
  const result = useMemo(() => getSegments({ dimension, asOf }), [dimension, asOf]);
  const rows = useMemo(() => [...result.data].sort((a, b) => {
    const values = (row: typeof a) => ({ label: row.label, completed: row.current.completed, scheduled: row.current.scheduled, rate: row.currentRate, change: row.changePoints });
    const av = values(a)[sortKey];
    const bv = values(b)[sortKey];
    const order = typeof av === "string" ? av.localeCompare(String(bv), "es") : av - Number(bv);
    return descending ? -order : order;
  }), [result.data, sortKey, descending]);

  const sort = (key: SortKey) => {
    if (key === sortKey) setDescending((value) => !value);
    else { setSortKey(key); setDescending(key !== "label"); }
  };

  return (
    <>
      <ViewHeader title="Segmentos" status="Formulario completado a demo agendada" />
      <Panel className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-panel-outline p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <ToggleGroup type="single" value={dimension} onValueChange={(value) => value && setDimension(value as SegmentDimension)} variant="outline" size="sm" spacing={0}>
            {DIMENSIONS.map((item) => <ToggleGroupItem key={item.value} value={item.value}>{item.label}</ToggleGroupItem>)}
          </ToggleGroup>
          <AskAssistantButton prompt={`Compara la conversión por ${DIMENSIONS.find((item) => item.value === dimension)!.label.toLocaleLowerCase("es")} y explica la mayor caída.`} />
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-panel-outline px-3 py-2 sm:px-4">
          <p className="text-xs text-muted-foreground">{rows.length} segmentos visibles</p>
          <SourceBadge source={result.source} calculation={result.calculation} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="hidden md:block">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card"><TableRow><SortableHead label="Segmento" active={sortKey === "label"} descending={descending} onClick={() => sort("label")} /><SortableHead label="Formularios" active={sortKey === "completed"} descending={descending} onClick={() => sort("completed")} /><SortableHead label="Demos" active={sortKey === "scheduled"} descending={descending} onClick={() => sort("scheduled")} /><SortableHead label="Conversión" active={sortKey === "rate"} descending={descending} onClick={() => sort("rate")} /><SortableHead label="Variación" active={sortKey === "change"} descending={descending} onClick={() => sort("change")} /><TableHead>Fuente</TableHead></TableRow></TableHeader>
              <TableBody>{rows.map((row) => <TableRow key={row.id} className={cn(row.changePoints <= -20 && "bg-tone-danger-soft/45")}><TableCell className="font-medium">{row.label}</TableCell><TableCell className="tabular-nums">{row.current.completed}</TableCell><TableCell className="tabular-nums">{row.current.scheduled}</TableCell><TableCell><RateBar rate={row.currentRate} danger={row.changePoints <= -20} /></TableCell><TableCell className={cn("font-medium tabular-nums", row.changePoints < 0 ? "text-tone-danger" : "text-tone-success")}>{formatPointChange(row.changePoints)}</TableCell><TableCell><SourceBadge source={result.source} calculation={result.calculation} /></TableCell></TableRow>)}</TableBody>
            </Table>
          </div>
          <div className="grid gap-2 p-3 md:hidden">
            {rows.map((row) => <article key={row.id} className={cn("rounded-xl border border-panel-outline bg-card/65 p-3", row.changePoints <= -20 && "border-tone-danger/35 bg-tone-danger-soft/40")}><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-medium">{row.label}</p><p className="text-xs text-muted-foreground">{row.current.scheduled} demos de {row.current.completed} formularios</p></div><SourceBadge source={result.source} calculation={result.calculation} /></div><div className="mt-3 flex items-end justify-between gap-3"><RateBar rate={row.currentRate} danger={row.changePoints <= -20} /><span className={cn("text-xs font-medium tabular-nums", row.changePoints < 0 ? "text-tone-danger" : "text-tone-success")}>{formatPointChange(row.changePoints)}</span></div></article>)}
          </div>
        </div>
      </Panel>
    </>
  );
}

function SortableHead({ label, active, descending, onClick }: { label: string; active: boolean; descending: boolean; onClick: () => void }) {
  const Icon = !active ? ChevronsUpDown : descending ? ArrowDown : ArrowUp;
  return <TableHead><Button variant="ghost" size="sm" onClick={onClick} className="-ml-3 h-7 px-2 text-xs">{label}<Icon className="size-3" /></Button></TableHead>;
}

function RateBar({ rate, danger }: { rate: number; danger: boolean }) {
  return <span className="grid min-w-28 gap-1"><span className="font-medium tabular-nums">{formatPercent(rate)}</span><span className="h-1.5 overflow-hidden rounded-full bg-muted"><span className={cn("block h-full rounded-full", danger ? "bg-tone-danger" : "bg-chart-1")} style={{ width: `${rate * 100}%` }} /></span></span>;
}
