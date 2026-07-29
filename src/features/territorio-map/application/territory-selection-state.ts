import type { TerritoryFeature, TerritoryLayerId } from "../domain/territory";

export interface TerritorySelection {
  neighborhoodId?: string;
  featureId?: string;
}

export function sanitizeTerritorySelection(
  selection: TerritorySelection,
  features: TerritoryFeature[],
  neighborhoodIds: ReadonlySet<string>,
  enabledLayers: ReadonlySet<TerritoryLayerId>,
  cutoff: string,
): TerritorySelection {
  const neighborhoodId =
    selection.neighborhoodId && neighborhoodIds.has(selection.neighborhoodId)
      ? selection.neighborhoodId
      : undefined;
  const feature = selection.featureId
    ? features.find(
        (item) =>
          item.id === selection.featureId &&
          (enabledLayers.has(item.layerId) ||
            (item.kind === "institution" &&
              ["schools", "hospitals", "health_centers", "clubs", "firefighters", "police", "libraries", "cultural_centers", "green_spaces"].some((layer) =>
                enabledLayers.has(layer as TerritoryLayerId),
              ))) &&
          item.occurredAt.slice(0, 10) <= cutoff,
      )
    : undefined;

  if (!feature) return neighborhoodId ? { neighborhoodId } : {};
  return { neighborhoodId: feature.barrioId, featureId: feature.id };
}
