import { describe, expect, it } from "vitest";

import { resolveDemoResponse } from "@/lib/demo/responses";

const base = {
  period: "7d" as const,
  enabledSources: ["ga4", "clarity", "crm"] as const,
};

describe("resolveDemoResponse", () => {
  it("explica la caída con funnel, segmentos, sesiones y CRM", () => {
    const response = resolveDemoResponse({
      prompt: "¿Por qué cayeron las demos esta semana?",
      period: base.period,
      enabledSources: [...base.enabledSources],
    });

    expect(response.intent).toBe("explain-drop");
    expect(response.blocks.map((block) => block.kind)).toEqual([
      "funnel",
      "segments",
      "sessions",
      "leads",
    ]);
    expect(response.steps).toHaveLength(4);
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
