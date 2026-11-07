"use client";

import { Bell, Building2, FlaskConical, LayoutGrid, MessagesSquare, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { getAlerts, getCrmLeads } from "@/lib/ai/tools";
import { getPreviousBoardExperiment, type StoredExperiment } from "@/lib/demo/experiment-state";
import { SIDE_NAV, TOP_NAV } from "@/lib/demo/home";
import { useStored, writeStored } from "@/lib/storage";
import { useDemoDate } from "@/lib/use-demo-date";

const EXTRA_VIEWS = [{ label: "Alertas", href: "/alertas" }];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { threads, openThread, fillComposer, newAnalysis } = useWorkspace();
  const [storedExperiments] = useStored<StoredExperiment[]>("saved-experiments", []);
  const [readAlertIds, setReadAlertIds] = useStored<string[]>("read-alerts", []);
  const asOf = useDemoDate();
  const previous = useMemo(() => getPreviousBoardExperiment(asOf), [asOf]);
  const views = useMemo(() => Array.from(new Map([...TOP_NAV, ...SIDE_NAV, ...EXTRA_VIEWS].map((item) => [item.href, item])).values()), []);
  const experiments = [previous, ...storedExperiments.filter((item) => item?.id && item.id !== previous.id)];
  const alerts = useMemo(() => getAlerts({ asOf }).data, [asOf]);
  const leads = useMemo(() => getCrmLeads({ asOf, period: "28d" }).data, [asOf]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLocaleLowerCase("es") === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const onOpen = () => setOpen(true);
    document.addEventListener("tracer:open-search", onOpen);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("tracer:open-search", onOpen);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label="Buscar en Tracer" className="gap-2 hover:bg-panel"><Search /><span className="hidden xl:inline text-xs text-muted-foreground">Buscar</span><kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground xl:inline">⌘K</kbd></Button>
      {open && (
        <CommandDialog open onOpenChange={setOpen} title="Buscar en Tracer" description="Busca vistas, análisis, experimentos, alertas y leads" showCloseButton>
          <Command>
            <CommandInput placeholder="Busca una vista, análisis o experimento…" autoFocus />
            <CommandList>
              <CommandEmpty>Sin resultados.</CommandEmpty>
              <CommandGroup heading="Vistas">
                {views.map((item) => <CommandItem key={item.href} value={`vista ${item.label}`} onSelect={() => go(item.href)}><LayoutGrid />{item.label}{item.href === "/" && <CommandShortcut>Inicio</CommandShortcut>}</CommandItem>)}
              </CommandGroup>
              {threads.length > 0 && <CommandGroup heading="Análisis">{threads.map((thread) => <CommandItem key={thread.id} value={`analisis ${thread.title}`} onSelect={() => { setOpen(false); openThread(thread.id); }}><MessagesSquare />{thread.title}</CommandItem>)}</CommandGroup>}
              <CommandGroup heading="Experimentos">
                {experiments.map((experiment) => <CommandItem key={experiment.id} value={`experimento ${experiment.name}`} onSelect={() => go("/experimentos")}><FlaskConical />{experiment.name}<CommandShortcut>{statusLabel(experiment.status)}</CommandShortcut></CommandItem>)}
              </CommandGroup>
              <CommandGroup heading="Alertas">
                {alerts.map((alert) => <CommandItem key={alert.id} value={`alerta ${alert.metric} ${alert.segment}`} onSelect={() => { setReadAlertIds([...new Set([...readAlertIds, alert.id])]); setOpen(false); newAnalysis(); fillComposer(alert.prompt); }}><Bell />{alert.metric}<CommandShortcut>{alert.segment}</CommandShortcut></CommandItem>)}
              </CommandGroup>
              <CommandGroup heading="Leads">
                {leads.map((lead) => <CommandItem key={lead.id} value={`lead empresa ${lead.company}`} onSelect={() => { writeStored("crm-search-query", lead.company); go("/crm"); }}><Building2 />{lead.company}<CommandShortcut>{lead.locations} locales</CommandShortcut></CommandItem>)}
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      )}
    </>
  );
}

function statusLabel(status: StoredExperiment["status"]) { return status === "draft" ? "Por diseñar" : status === "running" ? "En curso" : status === "ready_to_read" ? "Para leer" : "Decidido"; }
