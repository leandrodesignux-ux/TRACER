import { describe, expect, it } from "vitest";

import { formatAgo, formatDelta } from "@/lib/demo/home";

describe("formatos del inicio", () => {
  it("muestra una variación negativa con signo tipográfico", () => {
    expect(formatDelta({ value: -18, unit: "%" })).toBe("−18 %");
  });

  it("mantiene deterministas los tiempos relativos del demo", () => {
    expect(formatAgo(15)).toBe("hace 15 min");
    expect(formatAgo(9 * 24 * 60)).toBe("hace 9 días");
  });
});
