import { describe, expect, it } from "vitest";

import {
  estimateDuration,
  getDemoExperimentOutcome,
  getChangelog,
  getCrmLeads,
  getDropTimeline,
  getExperiments,
  getFunnel,
  getAlerts,
  getSourceHealth,
  getWeeklyReport,
  getSegments,
  getSessions,
} from "@/lib/ai/tools";
import { createCrmLeads } from "@/lib/data/crm-leads";
import { createSessionsData } from "@/lib/data/sessions";

const AS_OF = new Date(2026, 10, 6, 12);

describe("herramientas de datos demo", () => {
  it("devuelve 205 demos y una caída semanal de 18 %", () => {
    const result = getFunnel({ asOf: AS_OF });
    const demos = result.data.stages.find(
      (stage) => stage.id === "demo_scheduled",
    );

    expect(result.data.history).toHaveLength(2);
    expect(demos?.current).toBe(205);
    expect(demos?.previous).toBe(250);
    expect(result.data.drop.percent).toBe(-18);
  });

  it("mantiene ocho semanas estables y concentra la caída desde demo agendada", () => {
    const result = getFunnel({ asOf: AS_OF, period: "90d" });
    const completed = result.data.stages.find(
      (stage) => stage.id === "demo_form_completed",
    )!;
    const scheduled = result.data.stages.find(
      (stage) => stage.id === "demo_scheduled",
    )!;

    expect(result.data.history).toHaveLength(8);
    expect(completed.changePercent).toBe(2);
    expect(scheduled.changePercent).toBe(-18);
  });

  it("cuadra los totales por dispositivo", () => {
    const result = getSegments({ asOf: AS_OF, dimension: "device" });
    const totals = result.data.reduce(
      (sum, row) => ({
        currentCompleted: sum.currentCompleted + row.current.completed,
        currentScheduled: sum.currentScheduled + row.current.scheduled,
        previousCompleted: sum.previousCompleted + row.previous.completed,
        previousScheduled: sum.previousScheduled + row.previous.scheduled,
      }),
      {
        currentCompleted: 0,
        currentScheduled: 0,
        previousCompleted: 0,
        previousScheduled: 0,
      },
    );

    expect(totals).toEqual({
      currentCompleted: 410,
      currentScheduled: 205,
      previousCompleted: 402,
      previousScheduled: 250,
    });
  });

  it("encuentra exactamente 42 leads de iOS con buen encaje y sin demo", () => {
    const all = getCrmLeads({ asOf: AS_OF });
    const followUp = getCrmLeads({
      asOf: AS_OF,
      goodFitWithoutDemo: true,
    });

    expect(all.data).toHaveLength(120);
    expect(followUp.data).toHaveLength(42);
    expect(
      followUp.data.every(
        (lead) =>
          lead.device === "ios" &&
          lead.formCompleted &&
          !lead.demoScheduled &&
          lead.locations > 20,
      ),
    ).toBe(true);
  });

  it("genera tres sesiones problemáticas de Safari iOS", () => {
    const sessions = getSessions({ asOf: AS_OF });
    const problematic = getSessions({
      asOf: AS_OF,
      device: "ios",
      problematicOnly: true,
    });

    expect(sessions.data).toHaveLength(12);
    expect(problematic.data).toHaveLength(3);
    expect(
      problematic.data.every(
        (session) =>
          session.browser === "Safari" &&
          session.calendarLoadMs > 8000 &&
          session.rageClicks > 0 &&
          session.outcome === "exit",
      ),
    ).toBe(true);
  });

  it("estima unas 1.100 personas y tres semanas", () => {
    const result = estimateDuration({
      baselineRate: 0.6,
      minimumEffect: 0.08,
      weeklyTraffic: 410,
      asOf: AS_OF,
    });

    expect(result.data.totalSample).toBeGreaterThanOrEqual(1100);
    expect(result.data.totalSample).toBeLessThanOrEqual(1150);
    expect(result.data.weeks).toBe(3);
  });

  it("mantiene deterministas los datos generados con semilla", () => {
    expect(createCrmLeads(AS_OF)).toEqual(createCrmLeads(AS_OF));
    expect(createSessionsData(AS_OF)).toEqual(createSessionsData(AS_OF));
  });

  it("calcula fechas relativas al reloj inyectado", () => {
    const changelog = getChangelog({ asOf: AS_OF });
    const experiment = getExperiments({ asOf: AS_OF }).data[0]!;

    expect(changelog.data[0]?.date).toBe("2026-10-28");
    expect(experiment.endedAt).toBe("2026-10-02");
    expect(experiment.confidenceInterval[0]).toBeLessThan(0);
    expect(experiment.confidenceInterval[1]).toBeGreaterThan(0);
  });

  it("simula un resultado positivo trazable para el estado futuro", () => {
    const result = getDemoExperimentOutcome({
      baselineRate: 0.6,
      asOf: AS_OF,
    });

    expect(result.data.variantRate).toBeCloseTo(0.7);
    expect(result.data.result).toBe("positive");
    expect(result.data.confidenceInterval[0]).toBeGreaterThan(0);
    expect(result.source.id).toBe("ga4");
  });

  it("expone query, rango y muestra en cada fuente", () => {
    const sources = getFunnel({ asOf: AS_OF }).source;
    const list = Array.isArray(sources) ? sources : [sources];

    expect(list).toHaveLength(2);
    for (const item of list) {
      expect(item.query.length).toBeGreaterThan(0);
      expect(item.rango.length).toBeGreaterThan(0);
      expect(item.muestra.length).toBeGreaterThan(0);
    }
  });

  it("construye alertas, salud de fuentes e informe semanal trazables", () => {
    const alerts = getAlerts({ asOf: AS_OF });
    const health = getSourceHealth({ asOf: AS_OF });
    const report = getWeeklyReport({ asOf: AS_OF });

    expect(alerts.data).toHaveLength(3);
    expect(health.data).toHaveLength(3);
    expect(report.data.problematicSessions).toBe(3);
    expect(report.data.recoverableLeads).toBe(42);
    expect(report.source).toHaveLength(8);
  });

  it("conecta el despliegue v2.3 con la caída diaria de iOS", () => {
    const timeline = getDropTimeline({ asOf: AS_OF });
    const previous = timeline.data.series.slice(0, 7);
    const current = timeline.data.series.slice(7);

    expect(timeline.data.changelog.title).toContain("v2.3");
    expect(timeline.data.daysSinceDeploy).toBe(9);
    expect(previous.reduce((sum, day) => sum + day.ios, 0)).toBe(46);
    expect(current.reduce((sum, day) => sum + day.ios, 0)).toBe(8);
    expect(previous.reduce((sum, day) => sum + day.android, 0)).toBe(34);
    expect(current.reduce((sum, day) => sum + day.android, 0)).toBe(22);
  });

  it("genera nombres de empresas creíbles sin sufijos numéricos", () => {
    const leads = getCrmLeads({ asOf: AS_OF, period: "28d" }).data;
    expect(leads).toHaveLength(120);
    expect(leads.every((lead) => !/\d/.test(lead.company))).toBe(true);
    expect(new Set(leads.map((lead) => lead.company)).size).toBe(120);
  });
});
