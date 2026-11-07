import { describe, expect, it } from "vitest";

import { resolveDemoResponse } from "@/lib/demo/responses";
import { SUGGESTIONS } from "@/lib/demo/home";

const base = {
  period: "7d" as const,
  enabledSources: ["ga4", "clarity", "crm"] as const,
};

describe("resolveDemoResponse", () => {
  it("explica la caída con cambio reciente, sesiones y CRM", () => {
    const response = resolveDemoResponse({
      prompt: "¿Por qué cayeron las demos esta semana?",
      period: base.period,
      enabledSources: [...base.enabledSources],
    });

    expect(response.intent).toBe("explain-drop");
    expect(response.blocks.map((block) => block.kind)).toEqual([
      "timeline",
      "sessions",
      "leads",
    ]);
    expect(response.steps).toHaveLength(4);
    expect(response.text).toContain("v2.3");
  });

  it("devuelve una intención distinta para cada chip del inicio", () => {
    const intents = SUGGESTIONS.map((suggestion) => resolveDemoResponse({
      prompt: suggestion.prompt,
      period: base.period,
      enabledSources: [...base.enabledSources],
    }).intent);

    expect(new Set(intents).size).toBe(3);
    expect(intents).toEqual(["find-leak", "explain-drop", "design-experiment"]);
  });

  it("todos los bloques declaran procedencia y los calculados, fórmula", () => {
    const responses = SUGGESTIONS.map((suggestion) => resolveDemoResponse({
      prompt: suggestion.prompt,
      period: base.period,
      enabledSources: [...base.enabledSources],
    }));
    const calculated = new Set(["funnel", "segments", "experiment-plan", "experiment-result"]);

    for (const block of responses.flatMap((response) => response.blocks)) {
      expect(block.source).toBeTruthy();
      if (calculated.has(block.kind)) {
        expect("calculation" in block && block.calculation).toBeTruthy();
      }
    }
  });

  it("responde el seguimiento de Android dentro del mismo modelo", () => {
    const response = resolveDemoResponse({
      prompt: "¿Y en Android?",
      period: base.period,
      enabledSources: [...base.enabledSources],
    });
    const block = response.blocks[0];

    expect(response.intent).toBe("android-followup");
    expect(block?.kind).toBe("segments");
    if (block?.kind === "segments") expect(block.rows[0]?.id).toBe("android");
  });

  it("prepara exactamente la cohorte recuperable", () => {
    const response = resolveDemoResponse({
      prompt: "¿Cuántos leads hay que recontactar?",
      period: base.period,
      enabledSources: [...base.enabledSources],
    });
    const block = response.blocks[0];

    expect(block?.kind).toBe("leads");
    if (block?.kind === "leads") expect(block.leads).toHaveLength(42);
  });

  it("diseña un experimento con duración calculada", () => {
    const response = resolveDemoResponse({
      prompt: "Diseña un experimento",
      period: base.period,
      enabledSources: [...base.enabledSources],
    });
    const block = response.blocks[0];

    expect(block?.kind).toBe("experiment-plan");
    if (block?.kind === "experiment-plan") expect(block.estimate.weeks).toBe(3);
  });

  it("es honesto cuando no reconoce una pregunta", () => {
    const response = resolveDemoResponse({
      prompt: "¿Cuál es el clima?",
      period: base.period,
      enabledSources: [...base.enabledSources],
    });

    expect(response.intent).toBe("fallback");
    expect(response.suggestions).not.toHaveLength(0);
  });
});
