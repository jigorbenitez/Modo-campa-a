import type {
  NeighborhoodContextView,
  TerritoryCircuitContextView,
  TerritoryFeature,
  TerritoryFilters,
  TerritoryHeatPoint,
  TerritorySnapshot,
  TerritoryStatsView,
  TerritoryView,
} from "../domain/territory";

const activeStatuses = new Set(["open", "reported", "validated", "assigned", "in_progress", "under_review"]);

function operationalLayerEnabled(feature: TerritoryFeature, enabled: Set<string>) {
  if (feature.layerId === "custom_markers") return enabled.has("custom_markers");
  if (feature.kind !== "institution") return enabled.has(feature.layerId);
  const subtype = feature.subtype?.toLocaleLowerCase("es-AR") ?? "";
  if (subtype.includes("escuela") || subtype.includes("jardín")) return enabled.has("schools");
  if (subtype.includes("hospital") || subtype.includes("clínica")) return enabled.has("hospitals");
  if (subtype.includes("caps") || subtype.includes("centro de salud")) return enabled.has("health_centers");
  if (subtype.includes("club") || subtype.includes("polideportivo")) return enabled.has("clubs");
  if (subtype.includes("bombero")) return enabled.has("firefighters");
  if (subtype.includes("polic")) return enabled.has("police");
  if (subtype.includes("biblioteca")) return enabled.has("libraries");
  if (subtype.includes("cultural")) return enabled.has("cultural_centers");
  if (subtype.includes("plaza") || subtype.includes("verde") || subtype.includes("parque")) return enabled.has("green_spaces");
  return enabled.has("institutions");
}

export class TerritoryViewService {
  project(snapshot: TerritorySnapshot, filters: TerritoryFilters): TerritoryView {
    const period = snapshot.periods.find((item) => item.id === filters.periodId) ?? snapshot.periods.at(-1);
    if (!period) throw new Error("El snapshot territorial no contiene períodos.");

    const visibleFeatures = snapshot.features.filter((feature) => {
      const withinTime = feature.occurredAt.slice(0, 10) <= period.cutoff;
      const layerEnabled = operationalLayerEnabled(feature, filters.enabledLayers);
      const withinNeighborhood =
        !filters.selectedNeighborhoodId || feature.barrioId === filters.selectedNeighborhoodId;
      const withinCircuit =
        !filters.selectedCircuitId || feature.circuitId === filters.selectedCircuitId;
      const search = filters.search?.trim().toLocaleLowerCase("es-AR");
      const matchesSearch =
        !search ||
        `${feature.title} ${feature.description} ${feature.subtype ?? ""} ${feature.localidad}`
          .toLocaleLowerCase("es-AR")
          .includes(search);
      const matchesCategory =
        !filters.category ||
        filters.category === "all" ||
        feature.subtype === filters.category ||
        feature.kind === filters.category;
      return (
        withinTime &&
        layerEnabled &&
        withinNeighborhood &&
        withinCircuit &&
        matchesSearch &&
        matchesCategory
      );
    });
    const allFeaturesAtCutoff = snapshot.features.filter(
      (feature) => feature.occurredAt.slice(0, 10) <= period.cutoff,
    );

    const visibleNeighborhoods = snapshot.neighborhoods.filter((area) =>
      area.level === "locality"
        ? filters.enabledLayers.has("localities")
        : filters.enabledLayers.has("neighborhoods"),
    );
    const visibleCircuits = filters.enabledLayers.has("circuits")
      ? snapshot.circuits
      : [];
    const selectedNeighborhood = filters.selectedNeighborhoodId
      ? this.buildNeighborhoodContext(
          snapshot,
          filters.selectedNeighborhoodId,
          allFeaturesAtCutoff,
        )
      : undefined;
    const selectedCircuit = filters.selectedCircuitId
      ? this.buildCircuitContext(
          snapshot,
          filters.selectedCircuitId,
          allFeaturesAtCutoff,
        )
      : undefined;

    return {
      cutoff: period.cutoff,
      visibleFeatures,
      visibleNeighborhoods,
      visibleCircuits,
      stats: this.buildStats(snapshot, allFeaturesAtCutoff, period.cutoff),
      selectedNeighborhood,
      selectedCircuit,
      heatPoints: filters.enabledLayers.has("heat")
        ? this.buildHeatPoints(snapshot, allFeaturesAtCutoff, filters.enabledLayers)
        : [],
    };
  }

  private buildCircuitContext(
    snapshot: TerritorySnapshot,
    circuitId: string,
    features: TerritoryFeature[],
  ): TerritoryCircuitContextView | undefined {
    const circuit = snapshot.circuits.find((item) => item.id === circuitId);
    if (!circuit) return undefined;
    const related = features
      .filter((feature) => feature.circuitId === circuitId)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

    return {
      circuit,
      features: related,
      activities: related.filter((feature) => feature.kind === "activity").length,
      problems: related.filter((feature) => feature.kind === "problem").length,
      commitments: related.filter((feature) => feature.kind === "commitment").length,
      institutions: related.filter((feature) => feature.kind === "institution").length,
      neighbors: related.filter((feature) => feature.layerId === "neighbors").length,
      schools: this.countSubtype(related, ["Escuela", "Jardín"]),
      clubs: this.countSubtype(related, ["Club", "Polideportivo"]),
      hospitals: this.countSubtype(related, ["Hospital", "Clínica"]),
      healthCenters: this.countSubtype(related, ["CAPS", "Centro de salud"]),
      tours: related.filter((feature) => feature.kind === "activity").length,
      proposals: related.filter((feature) => feature.kind === "proposal").length,
      documents: related.filter((feature) => feature.kind === "document").length,
      photos: related.reduce((total, feature) => total + feature.photos.length, 0),
    };
  }

  private buildStats(
    snapshot: TerritorySnapshot,
    features: TerritoryFeature[],
    cutoff: string,
  ): TerritoryStatsView {
    const activeNeighborhoods = new Set(
      features.filter((feature) => feature.kind === "activity").map((feature) => feature.barrioId),
    ).size;
    const openProblems = features.filter(
      (feature) => feature.kind === "problem" && activeStatuses.has(feature.status),
    ).length;
    const pendingCommitments = features.filter(
      (feature) => feature.kind === "commitment" && activeStatuses.has(feature.status),
    ).length;
    const cutoffTime = new Date(`${cutoff}T23:59:59.000Z`).getTime();
    const weekStart = cutoffTime - 7 * 24 * 60 * 60 * 1000;
    const weeklyActivity = features.filter(
      (feature) =>
        feature.kind === "activity" &&
        new Date(feature.occurredAt).getTime() >= weekStart,
    ).length;
    const latestTour = features
      .filter((feature) => feature.kind === "activity")
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];

    return {
      activeNeighborhoods,
      openProblems,
      pendingCommitments,
      weeklyActivity,
      latestTour: latestTour
        ? { title: latestTour.title, occurredAt: latestTour.occurredAt }
        : undefined,
    };
  }

  private buildNeighborhoodContext(
    snapshot: TerritorySnapshot,
    barrioId: string,
    features: TerritoryFeature[],
  ): NeighborhoodContextView | undefined {
    const neighborhood = snapshot.neighborhoods.find((item) => item.id === barrioId);
    if (!neighborhood) return undefined;
    const related = features.filter((feature) => feature.barrioId === barrioId);
    const latestActivity = related
      .filter((feature) => feature.kind === "activity")
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];

    return {
      neighborhood,
      latestActivity,
      tours: related.filter((feature) => feature.kind === "activity").length,
      activeProblems: related.filter(
        (feature) => feature.kind === "problem" && activeStatuses.has(feature.status),
      ).length,
      commitments: related.filter((feature) => feature.kind === "commitment").length,
      proposals: related.filter((feature) => feature.kind === "proposal").length,
      documents: related.filter((feature) => feature.kind === "document").length,
      publications: related.reduce(
        (total, feature) => total + feature.publications.length,
        0,
      ),
      schools: this.countSubtype(related, ["Escuela"]),
      kindergartens: this.countSubtype(related, ["Jardín"]),
      clubs: this.countSubtype(related, ["Club", "Polideportivo"]),
      squares: this.countSubtype(related, ["Plaza", "Espacio verde"]),
      healthCenters: this.countSubtype(related, ["CAPS", "Hospital", "Clínica", "Centro de salud"]),
      institutions: related.filter((feature) => feature.kind === "institution").length,
      activities: related.filter((feature) => feature.kind === "activity").length,
      photos: related.reduce((total, feature) => total + feature.photos.length, 0),
      latestTours: related
        .filter((feature) => feature.kind === "activity")
        .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
        .slice(0, 3),
      features: related.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
    };
  }

  private countSubtype(features: TerritoryFeature[], subtypes: string[]): number {
    return features.filter(
      (feature) => feature.kind === "institution" && feature.subtype && subtypes.includes(feature.subtype),
    ).length;
  }

  private buildHeatPoints(
    snapshot: TerritorySnapshot,
    features: TerritoryFeature[],
    enabledLayers: Set<string>,
  ): TerritoryHeatPoint[] {
    return snapshot.neighborhoods.map((neighborhood) => {
      const related = features.filter((feature) => feature.barrioId === neighborhood.id);
      const activityCount = enabledLayers.has("activities")
        ? related.filter((feature) => feature.kind === "activity").length
        : 0;
      const problemCount = enabledLayers.has("problems")
        ? related.filter((feature) => feature.kind === "problem").length
        : 0;
      const commitmentCount = enabledLayers.has("commitments")
        ? related.filter((feature) => feature.kind === "commitment").length
        : 0;
      const raw = activityCount + problemCount * 1.35 + commitmentCount * 1.15;

      return {
        barrioId: neighborhood.id,
        point: neighborhood.center,
        intensity: Math.min(1, raw / 10),
        activityCount,
        problemCount,
        commitmentCount,
      };
    });
  }
}
