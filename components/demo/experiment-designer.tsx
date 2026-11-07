"use client";

import { FlaskConical } from "lucide-react";
import { useMemo, useState } from "react";

import { SourceBadge } from "@/components/data/source-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { estimateDuration, getFunnel } from "@/lib/ai/tools";
import type { StoredExperiment } from "@/lib/demo/experiment-state";
import { formatNumber, formatPercent } from "@/lib/format";
import { useDemoDate } from "@/lib/use-demo-date";

export function ExperimentDesigner({
  initial,
  onClose,
  onSave,
}: {
  initial?: StoredExperiment;
  onClose: () => void;
  onSave: (experiment: StoredExperiment) => void;
}) {
  const asOf = useDemoDate();
  const funnel = useMemo(() => getFunnel({ asOf }), [asOf]);
  const completed = funnel.data.stages.find((stage) => stage.id === "demo_form_completed")!;
  const scheduled = funnel.data.stages.find((stage) => stage.id === "demo_scheduled")!;
  const [name, setName] = useState(initial?.name ?? "Agenda integrada en el formulario");
  const [hypothesis, setHypothesis] = useState(initial?.hypothesis ?? "Si permitimos agendar dentro del formulario, entonces aumentará la conversión a demo porque eliminamos la espera y el cambio de contexto.");
  const [change, setChange] = useState(initial?.change ?? "Integrar la selección de horario dentro del formulario.");
  const [primaryMetric, setPrimaryMetric] = useState(initial?.primaryMetric ?? "Formulario completado → demo agendada");
  const [guardrail, setGuardrail] = useState(initial?.guardrail ?? "Tasa de demos realizadas");
  const [segment, setSegment] = useState(initial?.segment ?? "Todo el tráfico elegible, después de corregir iOS");
  const [effectPoints, setEffectPoints] = useState(Math.round((initial?.minimumEffect ?? 0.08) * 100));
  const baselineRate = initial?.baselineRate ?? scheduled.conversionPrevious;
  const weeklyTraffic = initial?.weeklyTraffic ?? completed.current;
  const estimate = useMemo(() => estimateDuration({ baselineRate, minimumEffect: effectPoints / 100, weeklyTraffic, asOf }), [asOf, baselineRate, effectPoints, weeklyTraffic]);

  const save = () => onSave({
    id: initial?.id ?? "agenda-integrada",
    name,
    status: initial?.status ?? "draft",
    hypothesis,
    change,
    primaryMetric,
    guardrail,
    segment,
    minimumEffect: effectPoints / 100,
    baselineRate,
    weeklyTraffic,
    durationWeeks: estimate.data.weeks,
    totalSample: estimate.data.totalSample,
    source: estimate.source,
    calculation: estimate.calculation,
    result: initial?.result,
    decision: initial?.decision,
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Diseñar experimento</DialogTitle>
          <DialogDescription>Ajusta la hipótesis y el efecto mínimo. La muestra se recalcula en vivo.</DialogDescription>
        </DialogHeader>

        <FieldGroup className="gap-4">
          <Field><FieldLabel htmlFor="experiment-name">Nombre</FieldLabel><Input id="experiment-name" value={name} onChange={(event) => setName(event.target.value)} /></Field>
          <Field><FieldLabel htmlFor="experiment-hypothesis">Hipótesis</FieldLabel><Textarea id="experiment-hypothesis" value={hypothesis} onChange={(event) => setHypothesis(event.target.value)} /></Field>
          <Field><FieldLabel htmlFor="experiment-change">Cambio</FieldLabel><Textarea id="experiment-change" value={change} onChange={(event) => setChange(event.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field><FieldLabel htmlFor="experiment-primary">Métrica principal</FieldLabel><Input id="experiment-primary" value={primaryMetric} onChange={(event) => setPrimaryMetric(event.target.value)} /></Field>
            <Field><FieldLabel htmlFor="experiment-guardrail">Métrica guardiana</FieldLabel><Input id="experiment-guardrail" value={guardrail} onChange={(event) => setGuardrail(event.target.value)} /></Field>
          </div>
          <Field><FieldLabel htmlFor="experiment-segment">Segmento</FieldLabel><Input id="experiment-segment" value={segment} onChange={(event) => setSegment(event.target.value)} /></Field>
          <Field>
            <div className="flex items-center justify-between gap-3"><FieldLabel htmlFor="experiment-effect">Efecto mínimo</FieldLabel><span className="text-sm font-medium tabular-nums">{effectPoints} pp</span></div>
            <Slider id="experiment-effect" min={4} max={12} step={1} value={[effectPoints]} onValueChange={(value) => setEffectPoints(value[0] ?? effectPoints)} />
            <FieldDescription>Tasa base {formatPercent(baselineRate)} · volumen semanal {formatNumber(weeklyTraffic)}</FieldDescription>
          </Field>
        </FieldGroup>

        <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/60 p-3">
          <div><p className="text-xs text-muted-foreground">Duración estimada</p><p className="mt-1 text-xl font-medium tabular-nums">{estimate.data.weeks} semanas</p></div>
          <div><p className="text-xs text-muted-foreground">Muestra total</p><p className="mt-1 text-xl font-medium tabular-nums">{formatNumber(estimate.data.totalSample)}</p></div>
          <SourceBadge source={estimate.source} calculation={estimate.calculation} className="col-span-2" />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={!name.trim() || !hypothesis.trim()}><FlaskConical />Guardar diseño</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
