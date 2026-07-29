import assert from "node:assert/strict";
import test from "node:test";
import { TerritorialPriorityEngine, defaultPriorityConfiguration } from "../src/features/territorial-intelligence/application/priority-engine.ts";
import { TerritorialSimulationService } from "../src/features/territorial-intelligence/application/simulation-service.ts";

const referenceDate = "2026-07-28T12:00:00.000Z";
const input = {
  entityId: "circuit-873",
  entityName: "Circuito 873",
  entityType: "circuit",
  relatedIds: [],
  variables: {
    daysSinceLastTour: 74,
    openCommitments: 5,
    overdueCommitments: 1,
    pendingProposals: 2,
    coverageGap: 58,
    unvisitedInstitutions: 2,
    pendingDocuments: 2,
    pendingPhotos: 1,
    recentActivity: 1,
    upcomingEvents: 0,
    openAlerts: 1,
    registeredProblems: 3,
  },
};
const coverage = {
  entityId: "circuit-873",
  entityName: "Circuito 873",
  entityType: "circuit",
  percentage: 42,
  level: "low",
  factors: [],
  calculatedAt: referenceDate,
};

test("el puntaje territorial es determinístico y explica sus reglas", () => {
  const engine = new TerritorialPriorityEngine();
  const first = engine.calculate(input, defaultPriorityConfiguration, referenceDate);
  const second = engine.calculate(input, defaultPriorityConfiguration, referenceDate);
  assert.deepEqual(first, second);
  assert.ok(first.reasons.some((reason) => reason.ruleId === "daysSinceLastTour"));
  assert.ok(first.score >= 0 && first.score <= 100);
});

test("una regla desactivada no contribuye al puntaje", () => {
  const configuration = {
    ...defaultPriorityConfiguration,
    rules: defaultPriorityConfiguration.rules.map((rule) =>
      rule.id === "daysSinceLastTour" ? { ...rule, enabled: false } : rule),
  };
  const result = new TerritorialPriorityEngine().calculate(input, configuration, referenceDate);
  assert.equal(result.reasons.some((reason) => reason.ruleId === "daysSinceLastTour"), false);
});

test("una simulación no modifica la entrada ni los datos base", () => {
  const engine = new TerritorialPriorityEngine();
  const before = engine.calculate(input, defaultPriorityConfiguration, referenceDate);
  const snapshot = structuredClone(input);
  const result = new TerritorialSimulationService(engine).simulate(
    input,
    coverage,
    before,
    [{ id: "tour-1", type: "tour", quantity: 1, targetEntityId: input.entityId, estimatedMinutes: 60 }],
    defaultPriorityConfiguration,
    referenceDate,
  );
  assert.deepEqual(input, snapshot);
  assert.equal(result.indicators.find((indicator) => indicator.id === "last-tour")?.after, 0);
  assert.ok(result.priorityAfter.score <= result.priorityBefore.score);
});
