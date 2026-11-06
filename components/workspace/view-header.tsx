"use client";

import {
  Download,
  Ellipsis,
  ListChecks,
  Plus,
  RotateCcw,
  Share,
} from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { COMPANY, FINDINGS } from "@/lib/demo/home";

export function ViewHeader({
  title,
  status,
  actions = false,
}: {
  title: string;
  status?: ReactNode;
  actions?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-1 pt-1 pb-3 lg:pt-2">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-medium tracking-heading">
          {title}
        </h1>
        {status && (
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span aria-hidden className="size-1.5 rounded-full bg-primary" />
            {status}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {actions && <AssistantActions />}
        <FindingsTrigger />
      </div>
    </div>
  );
}

function FindingsTrigger() {
  const { setFindingsOpen, isUnread } = useWorkspace();
  const unread = FINDINGS.filter(isUnread).length;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setFindingsOpen(true)}
      className="relative text-xs hover:bg-panel xl:hidden"
    >
      <ListChecks />
      <span className="max-sm:sr-only">Hallazgos</span>
      {unread > 0 && (
        <>
          <span
            aria-hidden
            className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary"
          />
          <span className="sr-only">, sin leer</span>
        </>
      )}
    </Button>
  );
}

function AssistantActions() {
  const { messages, newAnalysis, resetDemo } = useWorkspace();

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado");
    } catch {
      toast.error("No pudimos copiar el enlace");
    }
  };

  const exportMarkdown = () => {
    const lines = [
      `# Análisis en Tracer`,
      ``,
      `${COMPANY.name} · ${COMPANY.dataNote}`,
      ``,
      ...messages.map((message) =>
        message.role === "user"
          ? `**Tú:** ${message.text}\n`
          : `**Tracer:** ${message.response.text}\n`,
      ),
    ];
    try {
      const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tracer-analisis.md";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Análisis exportado");
    } catch {
      toast.error("No pudimos exportar el análisis");
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={share}
        className="text-xs hover:bg-panel"
      >
        <Share />
        <span className="max-md:sr-only">Compartir</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={exportMarkdown}
        disabled={messages.length === 0}
        title={messages.length === 0 ? "Escribe una pregunta para exportar" : undefined}
        className="text-xs hover:bg-panel max-sm:hidden"
      >
        <Download />
        <span className="max-md:sr-only">Exportar</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Más acciones"
            className="hover:bg-panel"
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={newAnalysis}>
            <Plus />
            Nuevo análisis
          </DropdownMenuItem>
          <DropdownMenuItem
            className="sm:hidden"
            disabled={messages.length === 0}
            onSelect={exportMarkdown}
          >
            <Download />
            Exportar
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              resetDemo();
              toast.success("Demo reiniciada");
            }}
          >
            <RotateCcw />
            Reiniciar demo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
