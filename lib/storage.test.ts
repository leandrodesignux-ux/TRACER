import { beforeEach, describe, expect, it } from "vitest";

import {
  readStored,
  STORAGE_VERSION,
  writeStored,
} from "@/lib/storage";
import {
  persistExperiment,
  type StoredExperiment,
} from "@/lib/demo/experiment-state";

function experiment(id: string): StoredExperiment {
  return {
    id,
    name: id,
    status: "draft",
    hypothesis: "Hipótesis",
    change: "Cambio",
    primaryMetric: "Conversión",
    guardrail: "Calidad",
    segment: "Todo el tráfico",
    minimumEffect: 0.08,
    baselineRate: 0.6,
    weeklyTraffic: 410,
    durationWeeks: 3,
    totalSample: 1100,
    source: {
      id: "tracer",
      label: "Tracer",
      query: "experimento creado por la usuaria",
      rango: "actual",
      muestra: "1 experimento",
    },
  };
}

describe("storage versionado", () => {
  beforeEach(() => window.localStorage.clear());

  it("ignora datos guardados con una versión anterior", () => {
    window.localStorage.setItem("tracer:v0:analysis-threads", JSON.stringify([{ id: "viejo" }]));
    expect(readStored("analysis-threads", [])).toEqual([]);
  });

  it("descarta JSON inválido y escribe en la versión actual", () => {
    window.localStorage.setItem(`tracer:v${STORAGE_VERSION}:demo`, "{");
    expect(readStored("demo", "limpio")).toBe("limpio");
    writeStored("demo", "vigente");
    expect(window.localStorage.getItem(`tracer:v${STORAGE_VERSION}:demo`)).toBe('"vigente"');
  });

  it("conserva dos experimentos guardados", () => {
    persistExperiment(experiment("uno"));
    persistExperiment(experiment("dos"));
    expect(readStored<StoredExperiment[]>("saved-experiments", []).map((item) => item.id)).toEqual(["dos", "uno"]);
  });
});
