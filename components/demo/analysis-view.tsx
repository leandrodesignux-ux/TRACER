"use client";

import { ArrowRight, MessagesSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/workspace/panel";
import { ViewHeader } from "@/components/workspace/view-header";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { SOURCE_LABELS } from "@/lib/data/types";

export function AnalysisView() {
  const { threads, openThread, newAnalysis } = useWorkspace();

  return (
    <>
      <ViewHeader title="Análisis" status="Conversaciones guardadas en este navegador" />
      <Panel className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Tus hilos</p>
            <p className="text-xs text-muted-foreground">Retoma una investigación con todo su contexto.</p>
          </div>
          <Button size="sm" onClick={newAnalysis}>Nuevo análisis</Button>
        </div>

        {threads.length === 0 ? (
          <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-panel-outline text-center">
            <div className="grid max-w-xs justify-items-center gap-2 p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><MessagesSquare /></span>
              <p className="text-sm font-medium">Todavía no hay análisis</p>
              <p className="text-xs text-muted-foreground">Haz una pregunta al asistente y el hilo aparecerá aquí.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-2">
            {threads.map((thread) => (
              <button key={thread.id} type="button" onClick={() => openThread(thread.id)} className="grid gap-3 rounded-xl border border-panel-outline bg-card/65 p-3 text-left transition-colors hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/50 sm:grid-cols-[1fr_auto] sm:items-center">
                <span>
                  <span className="block text-sm font-medium">{thread.title}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{thread.messages.filter((message) => message.role === "user").length} preguntas · {formatThreadDate(thread.updatedAt)}</span>
                </span>
                <span className="flex items-center gap-2">
                  {thread.sources.map((source) => <Badge key={source} variant="outline">{SOURCE_LABELS[source]}</Badge>)}
                  <Badge variant={thread.status === "completo" ? "secondary" : "outline"}>{thread.status === "completo" ? "Completo" : "En curso"}</Badge>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </span>
              </button>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}

function formatThreadDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
