import { describe, expect, it } from "vitest";

import { formatPointChange } from "@/lib/format";

describe("formatPointChange", () => {
  it("evita presentar como cambio una diferencia menor a un punto", () => {
    expect(formatPointChange(0.53)).toBe("sin cambio");
    expect(formatPointChange(-0.99)).toBe("sin cambio");
    expect(formatPointChange(-38.1)).toBe("−38 pp");
  });
});
