"use client";

import {
  CircleAlert,
  Clock3,
  Monitor,
  Pause,
  Play,
  Smartphone,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";

import { AskAssistantButton } from "@/components/data/ask-assistant-button";
import { SourceBadge } from "@/components/data/source-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Panel } from "@/components/workspace/panel";
import { ViewHeader } from "@/components/workspace/view-header";
import { getSessions } from "@/lib/ai/tools";
import type { DemoSession, DemoSessionEvent } from "@/lib/data/sessions";
import type { DeviceId } from "@/lib/data/types";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDemoDate } from "@/lib/use-demo-date";

type DeviceFilter = DeviceId | "all";

const DEVICES: { value: DeviceFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "desktop", label: "Desktop" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
];

export function SessionsView() {
  const [device, setDevice] = useState<DeviceFilter>("all");
  const [problematicOnly, setProblematicOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const asOf = useDemoDate();
  const result = useMemo(
    () => getSessions({ device, problematicOnly, asOf }),
    [device, problematicOnly, asOf],
  );
  const selected = result.data.find((session) => session.id === selectedId);
  const problematicCount = getSessions({ problematicOnly: true, asOf }).data.length;

  return (
    <>
      <ViewHeader title="Sesiones" status="Replays de la página de demo" />
      <Panel className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-panel-outline p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex flex-wrap gap-2 pb-0.5">
            <ToggleGroup
              type="single"
              value={device}
              onValueChange={(value) => value && setDevice(value as DeviceFilter)}
              variant="outline"
              size="sm"
              spacing={0}
            >
              {DEVICES.map((item) => (
                <ToggleGroupItem key={item.value} value={item.value}>
                  {item.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Button
              size="sm"
              variant={problematicOnly ? "default" : "outline"}
              onClick={() => setProblematicOnly((value) => !value)}
              aria-pressed={problematicOnly}
              className="text-xs"
            >
              <CircleAlert />
              Con fricción ({problematicCount})
            </Button>
          </div>
          <AskAssistantButton prompt="Analiza las sesiones con fricción y dime cuál es el patrón común." />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {result.data.length} sesiones visibles
            </p>
            <SourceBadge source={result.source} />
          </div>
          <div className="grid gap-2">
            {result.data.map((session) => {
              const problematic = session.calendarLoadMs > 8000 && session.rageClicks > 0;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setSelectedId(session.id)}
                  className={cn(
                    "grid gap-3 rounded-xl border border-panel-outline bg-card/65 p-3 text-left transition-colors hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/50 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center",
                    problematic && "border-tone-danger/35 bg-tone-danger-soft/35",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                      {session.device === "desktop" ? <Monitor /> : <Smartphone />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {session.browser} · {deviceLabel(session.device)}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {session.page} · {countryLabel(session.country)}
                      </span>
                    </span>
                  </span>
                  <SessionMetric label="Duración" value={formatDuration(session.durationSeconds)} />
                  <SessionMetric label="Carga calendario" value={`${(session.calendarLoadMs / 1000).toFixed(1)} s`} />
                  <span className="flex items-center justify-between gap-2 sm:justify-end">
                    <Badge variant={problematic ? "destructive" : "secondary"}>
                      {session.rageClicks} clics repetidos
                    </Badge>
                    <Play className="size-4 text-muted-foreground" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Panel>

      <Sheet open={selectedId !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-[36rem] max-w-[96vw] gap-0 sm:max-w-xl">
          {selected && <SessionReplay session={selected} source={result.source} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

function SessionReplay({ session, source }: { session: DemoSession; source: ReturnType<typeof getSessions>["source"] }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(38);
  const reduceMotion = useReducedMotion();

  return (
    <>
      <SheetHeader className="border-b border-border pr-12">
        <SheetTitle>Replay · {session.browser} en {deviceLabel(session.device)}</SheetTitle>
        <SheetDescription>
          {formatDuration(session.durationSeconds)} · {session.events.length} eventos
        </SheetDescription>
      </SheetHeader>
      <div className="grid min-h-0 gap-4 overflow-y-auto p-4">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-panel-outline bg-muted/45 p-4">
          <div className="mx-auto grid h-full max-w-sm grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
              <i className="size-1.5 rounded-full bg-tone-danger" />
              <i className="size-1.5 rounded-full bg-chart-3" />
              <i className="size-1.5 rounded-full bg-chart-2" />
              <span className="ml-2 text-[9px] text-muted-foreground">/demo</span>
            </div>
            <div className="grid content-start gap-2 p-4">
              <div className="h-3 w-28 rounded bg-foreground/15" />
              <div className="h-2 w-40 rounded bg-foreground/8" />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="h-8 rounded bg-muted" />
                <div className="h-8 rounded bg-muted" />
              </div>
              <div className="mt-1 h-16 rounded border border-dashed border-tone-danger/50 bg-tone-danger-soft/50" />
              <div className="h-7 rounded bg-primary/80" />
            </div>
          </div>
          <motion.span
            aria-hidden
            className="absolute left-[38%] top-[42%] size-3 rounded-full border-2 border-card bg-tone-danger shadow-md"
            animate={playing && !reduceMotion ? { x: [0, 72, 58], y: [0, 36, 70] } : { x: 0, y: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 0.5 }}
          />
          {session.rageClicks > 0 && (
            <span aria-hidden className="absolute left-[59%] top-[61%] grid size-8 place-items-center">
              {[0, 1, 2].map((ring) => (
                <motion.i
                  key={ring}
                  className="absolute size-3 rounded-full border border-tone-danger"
                  animate={reduceMotion ? { opacity: 0.55, scale: 1 } : { opacity: [0.7, 0], scale: [0.5, 2.6] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: ring * 0.28 }}
                />
              ))}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button size="icon-sm" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pausar" : "Reproducir"}>
            {playing ? <Pause /> : <Play />}
          </Button>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(event) => setProgress(Number(event.target.value))}
            aria-label="Progreso del replay"
            className="h-1.5 min-w-0 flex-1 accent-primary"
          />
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatDuration(Math.round(session.durationSeconds * progress / 100))} / {formatDuration(session.durationSeconds)}
          </span>
        </div>

        <div className="grid gap-2">
          {session.events.map((event) => <ReplayEvent key={`${event.atMs}-${event.type}`} event={event} />)}
        </div>
        <SourceBadge source={source} />
      </div>
    </>
  );
}

function ReplayEvent({ event }: { event: DemoSessionEvent }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-muted/55 px-3 py-2">
      <Clock3 className="mt-0.5 size-3.5 text-muted-foreground" />
      <span className="w-10 shrink-0 text-xs tabular-nums text-muted-foreground">
        {formatDuration(Math.round(event.atMs / 1000))}
      </span>
      <span className="text-xs font-medium">{eventLabel(event.type)}</span>
      <span className="ml-auto text-right text-xs text-muted-foreground">{event.target}</span>
    </div>
  );
}

function SessionMetric({ label, value }: { label: string; value: string }) {
  return <span className="flex justify-between gap-3 text-xs sm:grid sm:gap-0"><span className="text-muted-foreground">{label}</span><span className="font-medium tabular-nums">{value}</span></span>;
}

function deviceLabel(device: DeviceId) { return device === "ios" ? "iOS" : device === "android" ? "Android" : "Desktop"; }
function countryLabel(country: DemoSession["country"]) { return country === "chile" ? "Chile" : "México"; }
function eventLabel(type: DemoSessionEvent["type"]) {
  return ({ page_view: "Vista", click: "Clic", wait: "Espera", rage_click: "Clic repetido", exit: "Salida", demo_scheduled: "Demo agendada" })[type];
}
