"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/workspace/workspace-provider";

export function AskAssistantButton({ prompt }: { prompt: string }) {
  const { fillComposer } = useWorkspace();

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => fillComposer(prompt)}
      className="bg-card/70 text-xs shadow-xs"
    >
      <Sparkles />
      Preguntar al asistente
    </Button>
  );
}
