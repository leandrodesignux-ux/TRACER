"use client";

import { Database } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type {
  CalculationDetails,
  DataSource,
} from "@/lib/ai/tools";
import { SOURCE_LABELS, type SourceId } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const SOURCE_TONES: Record<SourceId, string> = {
  ga4: "border-source-ga4/30 bg-source-ga4/10 text-source-ga4 hover:bg-source-ga4/15",
  clarity:
    "border-source-clarity/30 bg-source-clarity/10 text-source-clarity hover:bg-source-clarity/15",
  crm: "border-source-crm/30 bg-source-crm/10 text-source-crm hover:bg-source-crm/15",
  derived:
    "border-source-derived/30 bg-source-derived/10 text-source-derived hover:bg-source-derived/15",
  tracer:
    "border-source-tracer/30 bg-source-tracer/10 text-source-tracer hover:bg-source-tracer/15",
};

export function SourceBadge({
  source,
  calculation,
  className,
}: {
  source: DataSource | DataSource[];
  calculation?: CalculationDetails;
  className?: string;
}) {
  const sources = Array.isArray(source) ? source : [source];

  if (calculation) {
    return (
      <CalculationBadge
        calculation={calculation}
        className={className}
      />
    );
  }

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      {sources.map((item) => (
        <SourceBadgeItem
          key={`${item.id}-${item.query}`}
          source={item}
        />
      ))}
    </span>
  );
}

function SourceBadgeItem({
  source,
}: {
  source: DataSource;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Badge
          asChild
          variant="outline"
          className={cn(
            "h-6 px-2 text-[11px] font-medium focus-visible:ring-3 focus-visible:ring-ring/50",
            SOURCE_TONES[source.id],
          )}
        >
          <button type="button" aria-label={`Ver fuente ${source.label}`}>
            <Database data-icon="inline-start" />
            {source.label}
          </button>
        </Badge>
      </SheetTrigger>

      <SheetContent className="w-[22rem] max-w-[92vw] gap-0">
        <SheetHeader className="border-b border-border pr-12">
          <SheetTitle>{source.label}</SheetTitle>
          <SheetDescription>
            Procedencia y alcance de esta cifra.
          </SheetDescription>
        </SheetHeader>

        <dl className="grid gap-5 overflow-y-auto p-4">
          <SourceDetail label="Consulta">
            <code className="rounded-lg bg-muted px-2.5 py-2 font-mono text-xs leading-relaxed text-foreground">
              {source.query}
            </code>
          </SourceDetail>
          <SourceDetail label="Rango">
            <span>{source.rango}</span>
          </SourceDetail>
          <SourceDetail label="Muestra">
            <span>{source.muestra}</span>
          </SourceDetail>
        </dl>
      </SheetContent>
    </Sheet>
  );
}

function CalculationBadge({
  calculation,
  className,
}: {
  calculation: CalculationDetails;
  className?: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Badge
          asChild
          variant="outline"
          className={cn(
            "h-6 px-2 text-[11px] font-medium focus-visible:ring-3 focus-visible:ring-ring/50",
            SOURCE_TONES.derived,
            className,
          )}
        >
          <button type="button" aria-label={`Ver cálculo ${calculation.label}`}>
            <Database data-icon="inline-start" />
            Calculado
          </button>
        </Badge>
      </SheetTrigger>
      <SheetContent className="w-[22rem] max-w-[92vw] gap-0">
        <SheetHeader className="border-b border-border pr-12">
          <SheetTitle>{calculation.label}</SheetTitle>
          <SheetDescription>
            Fórmula y fuentes usadas por Tracer.
          </SheetDescription>
        </SheetHeader>
        <dl className="grid gap-5 overflow-y-auto p-4">
          <SourceDetail label="Fórmula">
            <code className="rounded-lg bg-muted px-2.5 py-2 font-mono text-xs leading-relaxed text-foreground">
              {calculation.formula}
            </code>
          </SourceDetail>
          <SourceDetail label="Fuentes de entrada">
            <span className="flex flex-wrap gap-1">
              {calculation.inputs.map((id) => (
                  <Badge
                    key={id}
                    variant="outline"
                    className={SOURCE_TONES[id]}
                  >
                    {SOURCE_LABELS[id]}
                  </Badge>
                ))}
            </span>
          </SourceDetail>
        </dl>
      </SheetContent>
    </Sheet>
  );
}

function SourceDetail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="grid text-sm leading-relaxed">{children}</dd>
    </div>
  );
}
