"use client";

import { Download, ListPlus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AskAssistantButton } from "@/components/data/ask-assistant-button";
import { SourceBadge } from "@/components/data/source-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Panel } from "@/components/workspace/panel";
import { ViewHeader } from "@/components/workspace/view-header";
import { getCrmLeads } from "@/lib/ai/tools";
import type { CrmLead } from "@/lib/data/crm-leads";
import type { CountryId, DeviceId } from "@/lib/data/types";
import { useDemoDate } from "@/lib/use-demo-date";
import { useStored } from "@/lib/storage";

type DeviceFilter = DeviceId | "all";
type CountryFilter = CountryId | "all";

export function CrmView() {
  const [device, setDevice] = useState<DeviceFilter>("all");
  const [country, setCountry] = useState<CountryFilter>("all");
  const [followUpOnly, setFollowUpOnly] = useStored("crm-good-fit-filter", false);
  const [query, setQuery] = useStored("crm-search-query", "");
  const [selected, setSelected] = useState<string[]>([]);
  const asOf = useDemoDate();
  const result = useMemo(() => getCrmLeads({ device, country, goodFitWithoutDemo: followUpOnly, asOf }), [device, country, followUpOnly, asOf]);
  const followUpCount = getCrmLeads({ goodFitWithoutDemo: true, asOf }).data.length;
  const leads = result.data.filter((lead) => lead.company.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")));
  const allSelected = leads.length > 0 && leads.every((lead) => selected.includes(lead.id));

  const toggleAll = () => setSelected(allSelected ? selected.filter((id) => !leads.some((lead) => lead.id === id)) : [...new Set([...selected, ...leads.map((lead) => lead.id)])]);
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const exportCsv = () => {
    const rows = leads.filter((lead) => selected.length === 0 || selected.includes(lead.id));
    const header = ["empresa", "locales", "pais", "dispositivo", "canal", "estado"];
    const content = [header, ...rows.map((lead) => [lead.company, lead.locations, lead.country, lead.device, lead.channel, lead.status])].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tracer-leads.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(`${rows.length} leads exportados`);
  };

  return (
    <>
      <ViewHeader title="CRM" status="Leads y seguimiento comercial" />
      <Panel className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="grid gap-3 border-b border-panel-outline p-3 sm:p-4 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap gap-2">
            <label className="relative min-w-44 flex-1 sm:max-w-64">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar empresa" className="pl-8" />
            </label>
            <Select value={device} onValueChange={(value) => setDevice(value as DeviceFilter)}>
              <SelectTrigger size="sm" className="w-32"><SelectValue placeholder="Dispositivo" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="desktop">Desktop</SelectItem><SelectItem value="ios">iOS</SelectItem><SelectItem value="android">Android</SelectItem></SelectContent>
            </Select>
            <Select value={country} onValueChange={(value) => setCountry(value as CountryFilter)}>
              <SelectTrigger size="sm" className="w-28"><SelectValue placeholder="País" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="chile">Chile</SelectItem><SelectItem value="mexico">México</SelectItem></SelectContent>
            </Select>
            <Button size="sm" variant={followUpOnly ? "default" : "outline"} onClick={() => setFollowUpOnly(!followUpOnly)} aria-pressed={followUpOnly} className="text-xs">
              Buen encaje sin demo ({followUpCount})
            </Button>
          </div>
          <AskAssistantButton prompt="Prioriza los leads sin demo y sugiere un plan de seguimiento." />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-panel-outline px-3 py-2 sm:px-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{leads.length} leads</span>
            <SourceBadge source={result.source} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={selected.length === 0} onClick={() => toast.success(`Tarea creada para ${selected.length} leads`)} aria-label="Crear tarea de recontacto" className="text-xs"><ListPlus /><span className="hidden sm:inline">Crear tarea de recontacto</span><span className="sm:hidden">Recontactar</span></Button>
            <Button size="sm" variant="outline" onClick={exportCsv} aria-label="Exportar lista" className="text-xs"><Download /><span className="hidden sm:inline">Exportar lista</span><span className="sm:hidden">CSV</span></Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="hidden md:block">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card"><TableRow><TableHead className="w-10"><Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Seleccionar todos" /></TableHead><TableHead>Empresa</TableHead><TableHead>Locales</TableHead><TableHead>País</TableHead><TableHead>Dispositivo</TableHead><TableHead>Canal</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
              <TableBody>{leads.map((lead) => <LeadRow key={lead.id} lead={lead} checked={selected.includes(lead.id)} onToggle={() => toggle(lead.id)} />)}</TableBody>
            </Table>
          </div>
          <div className="grid gap-2 p-3 md:hidden">
            {leads.map((lead) => <LeadCard key={lead.id} lead={lead} checked={selected.includes(lead.id)} onToggle={() => toggle(lead.id)} />)}
          </div>
        </div>
      </Panel>
    </>
  );
}

function LeadRow({ lead, checked, onToggle }: LeadProps) {
  return <TableRow data-state={checked ? "selected" : undefined}><TableCell><Checkbox checked={checked} onCheckedChange={onToggle} aria-label={`Seleccionar ${lead.company}`} /></TableCell><TableCell className="font-medium">{lead.company}</TableCell><TableCell className="tabular-nums">{lead.locations}</TableCell><TableCell>{countryLabel(lead.country)}</TableCell><TableCell>{deviceLabel(lead.device)}</TableCell><TableCell>{channelLabel(lead.channel)}</TableCell><TableCell><StatusBadge lead={lead} /></TableCell></TableRow>;
}

function LeadCard({ lead, checked, onToggle }: LeadProps) {
  return <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-xl border border-panel-outline bg-card/65 p-3 text-left"><Checkbox checked={checked} onCheckedChange={onToggle} aria-label={`Seleccionar ${lead.company}`} /><span><span className="block text-sm font-medium">{lead.company}</span><span className="block text-xs text-muted-foreground">{lead.locations} locales · {countryLabel(lead.country)} · {deviceLabel(lead.device)}</span></span><StatusBadge lead={lead} /></div>;
}

type LeadProps = { lead: CrmLead; checked: boolean; onToggle: () => void };
function StatusBadge({ lead }: { lead: CrmLead }) { return <Badge variant={lead.status === "demo_agendada" ? "secondary" : lead.status === "sin_demo" ? "destructive" : "outline"}>{lead.status === "demo_agendada" ? "Demo agendada" : lead.status === "sin_demo" ? "Sin demo" : "Incompleto"}</Badge>; }
function countryLabel(value: CountryId) { return value === "chile" ? "Chile" : "México"; }
function deviceLabel(value: DeviceId) { return value === "ios" ? "iOS" : value === "android" ? "Android" : "Desktop"; }
function channelLabel(value: CrmLead["channel"]) { return ({ organico: "Orgánico", paid: "Paid", referidos: "Referidos", directo: "Directo" })[value]; }
