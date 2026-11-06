"use client";

import { ArrowUp, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { ASSISTANT, PERIODS, SOURCES, type PeriodId } from "@/lib/demo/home";

export function Composer() {
  const {
    draft,
    setDraft,
    composerRef,
    sendMessage,
    sources,
    setSources,
    period,
    setPeriod,
  } = useWorkspace();

  const canSend = draft.trim().length > 0;
  const periodLabel = PERIODS.find((p) => p.id === period)?.label;
  const sourceLabel = SOURCES.filter((s) => sources.includes(s.id))
    .map((s) => s.label)
    .join(", ");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        sendMessage();
      }}
      className="grid gap-1.5"
    >
      {/* InputGroup atenúa todo el grupo si hay un hijo deshabilitado; el envío vacío no debe apagar el campo. */}
      <InputGroup className="min-h-12 rounded-3xl border-panel-border bg-card py-1.5 pr-1.5 pl-1.5 shadow-xs has-disabled:bg-card has-disabled:opacity-100 has-[>textarea]:h-auto dark:bg-card dark:has-disabled:bg-card">
        <InputGroupAddon align="inline-start" className="self-end pb-0.5 pl-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton
                size="icon-sm"
                variant="ghost"
                className="rounded-full"
                aria-label="Fuentes y periodo"
              >
                <Plus />
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Fuentes
              </DropdownMenuLabel>
              {SOURCES.map((source) => {
                const checked = sources.includes(source.id);
                const isLast = checked && sources.length === 1;
                return (
                  <DropdownMenuCheckboxItem
                    key={source.id}
                    checked={checked}
                    disabled={isLast}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(next) =>
                      setSources(
                        next
                          ? SOURCES.map((s) => s.id).filter(
                              (id) => id === source.id || sources.includes(id),
                            )
                          : sources.filter((id) => id !== source.id),
                      )
                    }
                  >
                    {source.label}
                  </DropdownMenuCheckboxItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Periodo
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={period}
                onValueChange={(value) => setPeriod(value as PeriodId)}
              >
                {PERIODS.map((p) => (
                  <DropdownMenuRadioItem key={p.id} value={p.id}>
                    {p.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>

        <InputGroupTextarea
          ref={composerRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          placeholder={ASSISTANT.placeholder}
          aria-label="Pregunta para el asistente"
          className="max-h-32 min-h-9 py-2 text-sm md:text-sm"
        />

        <InputGroupAddon align="inline-end" className="self-end pr-0 pb-0.5">
          <InputGroupButton
            type="submit"
            size="icon-sm"
            variant="default"
            disabled={!canSend}
            className="rounded-full"
            aria-label="Enviar"
          >
            <ArrowUp />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <p className="px-4 text-[11px] text-muted-foreground">
        {sourceLabel} · {periodLabel}
      </p>
    </form>
  );
}
