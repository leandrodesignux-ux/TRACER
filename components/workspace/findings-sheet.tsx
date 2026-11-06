"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { FindingsPanel } from "@/components/workspace/findings-panel";
import { useWorkspace } from "@/components/workspace/workspace-provider";

/** Por debajo de 1280 px los hallazgos se abren en un Sheet desde el encabezado. */
export function FindingsSheet() {
  const { findingsOpen, setFindingsOpen } = useWorkspace();

  return (
    <Sheet open={findingsOpen} onOpenChange={setFindingsOpen}>
      <SheetContent side="right" className="w-[22rem] max-w-[90vw] gap-0 bg-background p-0">
        <SheetTitle className="sr-only">Hallazgos</SheetTitle>
        <SheetDescription className="sr-only">
          Alertas, experimentos y fuentes de Cuadra.
        </SheetDescription>
        <FindingsPanel />
      </SheetContent>
    </Sheet>
  );
}
