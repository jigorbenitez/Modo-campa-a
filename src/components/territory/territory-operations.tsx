"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ActivityRecord } from "@/features/diario";
import type { TerritoryFeature, TerritoryLayerId } from "@/features/territorio-map";
import {
  activityRecordToTerritoryFeature,
  sanitizeTerritorySelection,
  TerritoryViewService,
} from "@/features/territorio-map";
import { useActivityJournal } from "@/hooks/use-activity-journal";
import { mockTerritorySnapshot, territoryCategories } from "@/mock";
import { FloatingMetrics } from "./floating-metrics";
import { LayerControl } from "./layer-control";
import { MapLegend } from "./map-legend";
import { MapToolbar } from "./map-toolbar";
import { TimelineSlider } from "./timeline-slider";
import { TerritorySidebar } from "./territory-sidebar";
import { TerritorySearch } from "./territory-search";

const TerritoryMap = dynamic(
  () => import("./territory-map").then((module) => module.TerritoryMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center bg-[var(--surface-muted)] text-sm font-bold text-[var(--muted)]">
        <span className="atiy-spinner mr-2 inline-block size-5 animate-spin rounded-full border-2" />
        Preparando el territorio…
      </div>
    ),
  },
);

const viewService = new TerritoryViewService();
const emptyActivityRecords: ActivityRecord[] = [];

export function TerritoryOperations() {
  const searchParams = useSearchParams();
  const requestedActivityId = searchParams.get("activity");
  const { records: journalRecords, hasStoredJournal } =
    useActivityJournal(emptyActivityRecords);
  const snapshot = useMemo(() => {
    const journalFeatures = journalRecords
      .map((record) =>
        activityRecordToTerritoryFeature(record, mockTerritorySnapshot.neighborhoods),
      )
      .filter((feature): feature is TerritoryFeature => Boolean(feature));

    return {
      ...mockTerritorySnapshot,
      features: [
        ...mockTerritorySnapshot.features.filter(
          (feature) => !hasStoredJournal || feature.layerId !== "activities",
        ),
        ...journalFeatures,
      ],
    };
  }, [hasStoredJournal, journalRecords]);
  const [enabledLayers, setEnabledLayers] = useState<Set<TerritoryLayerId>>(
    () =>
      new Set(
        mockTerritorySnapshot.layers
          .filter((layer) => layer.enabledByDefault)
          .map((layer) => layer.id),
      ),
  );
  const [periodIndex, setPeriodIndex] = useState(mockTerritorySnapshot.periods.length - 1);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>();
  const [selectedFeature, setSelectedFeature] = useState<TerritoryFeature>();
  const [presentationMode, setPresentationMode] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [requestedSelectionDismissed, setRequestedSelectionDismissed] = useState(false);

  const periodId = snapshot.periods[periodIndex]?.id ?? "today";
  const requestedFeature = useMemo(
    () =>
      requestedSelectionDismissed || !requestedActivityId
        ? undefined
        : snapshot.features.find(
            (feature) => feature.id === `journal-${requestedActivityId}`,
          ),
    [requestedActivityId, requestedSelectionDismissed, snapshot.features],
  );
  const safeSelection = useMemo(() => {
    const cutoff = snapshot.periods[periodIndex]?.cutoff ?? "9999-12-31";
    return sanitizeTerritorySelection(
      {
        neighborhoodId: selectedNeighborhoodId ?? requestedFeature?.barrioId,
        featureId: selectedFeature?.id ?? requestedFeature?.id,
      },
      snapshot.features,
      new Set(snapshot.neighborhoods.map((item) => item.id)),
      enabledLayers,
      cutoff,
    );
  }, [
    enabledLayers,
    periodIndex,
    requestedFeature?.barrioId,
    requestedFeature?.id,
    selectedFeature?.id,
    selectedNeighborhoodId,
    snapshot,
  ]);
  const safeSelectedFeature = useMemo(
    () => snapshot.features.find((item) => item.id === safeSelection.featureId),
    [safeSelection.featureId, snapshot.features],
  );
  const searchResults = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es-AR");
    return snapshot.features.filter((feature) => {
      const matchesTerm =
        !term ||
        `${feature.title} ${feature.description} ${feature.subtype ?? ""} ${feature.localidad}`
          .toLocaleLowerCase("es-AR")
          .includes(term);
      const matchesCategory =
        category === "all" || feature.subtype === category || feature.kind === category;
      return enabledLayers.has(feature.layerId) && matchesTerm && matchesCategory;
    });
  }, [category, enabledLayers, search, snapshot.features]);
  const view = useMemo(
    () =>
      viewService.project(snapshot, {
        periodId,
        enabledLayers,
        selectedNeighborhoodId: safeSelection.neighborhoodId,
        search,
        category,
      }),
    [category, enabledLayers, periodId, safeSelection.neighborhoodId, search, snapshot],
  );

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setRequestedSelectionDismissed(true);
        setSelectedFeature(undefined);
        setSelectedNeighborhoodId(undefined);
        setResetToken((value) => value + 1);
      }
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  function toggleLayer(id: TerritoryLayerId) {
    setEnabledLayers((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (selectedFeature?.layerId === id) setSelectedFeature(undefined);
  }

  function selectNeighborhood(id: string) {
    setRequestedSelectionDismissed(true);
    setSelectedNeighborhoodId(id);
    setSelectedFeature(undefined);
  }

  function selectFeature(feature: TerritoryFeature) {
    setRequestedSelectionDismissed(true);
    setSelectedFeature(feature);
    setSelectedNeighborhoodId(feature.barrioId);
  }

  function changePeriod(index: number) {
    setPeriodIndex(index);
    const cutoff = snapshot.periods[index]?.cutoff;
    if (selectedFeature && cutoff && selectedFeature.occurredAt.slice(0, 10) > cutoff) {
      setSelectedFeature(undefined);
    }
  }

  function resetMap() {
    setRequestedSelectionDismissed(true);
    setSelectedFeature(undefined);
    setSelectedNeighborhoodId(undefined);
    setResetToken((value) => value + 1);
  }

  function clearMarkerSelection() {
    setRequestedSelectionDismissed(true);
    setSelectedFeature(undefined);
    setResetToken((value) => value + 1);
  }

  return (
    <div className={presentationMode ? "bg-[var(--background)]" : undefined}>
      {!presentationMode && (
        <header className="mx-auto max-w-[1600px] px-4 pb-5 pt-7 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">
                Centro de Operaciones Territorial
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">Mapa Vivo</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Una lectura conectada de la base territorial y las instituciones de San Fernando.
              </p>
            </div>
            <MapToolbar presentationMode={presentationMode} onTogglePresentation={() => setPresentationMode(true)} onReset={resetMap} onClearSelection={clearMarkerSelection} hasSelection={Boolean(safeSelectedFeature || safeSelection.neighborhoodId)} />
          </div>
        </header>
      )}

      <div
        className={`mx-auto max-w-[1600px] ${
          presentationMode ? "h-[calc(100vh-4rem)] p-0" : "px-0 pb-8 sm:px-4 lg:px-8"
        }`}
      >
        {!presentationMode && (
          <div className="px-4 pb-3 lg:hidden">
            <LayerControl layers={snapshot.layers} enabled={enabledLayers} onToggle={toggleLayer} />
          </div>
        )}

        <div
          className={`overflow-hidden border-y border-[var(--border)] bg-[var(--surface)] sm:border sm:shadow-[var(--shadow)] ${
            presentationMode ? "h-full" : "sm:rounded-3xl"
          }`}
        >
          <div className={`grid h-full ${presentationMode ? "grid-cols-1" : "lg:grid-cols-[minmax(0,1fr)_360px]"}`}>
            <div className={`relative ${presentationMode ? "h-full" : "h-[68vh] min-h-[590px] lg:h-[calc(100vh-13rem)]"}`}>
              <TerritoryMap
                center={[snapshot.center.latitude, snapshot.center.longitude]}
                view={view}
                layers={snapshot.layers}
                selectedFeature={safeSelectedFeature}
                onSelectFeature={selectFeature}
                onSelectNeighborhood={selectNeighborhood}
                resetToken={resetToken}
                onClearSelection={clearMarkerSelection}
                municipalityBoundaries={snapshot.municipalityBoundaries}
              />

              <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] sm:inset-x-4 sm:top-4">
                <div className="pointer-events-auto">
                  <FloatingMetrics stats={view.stats} />
                </div>
              </div>

              {!presentationMode && <div className="absolute left-3 top-[9.4rem] z-[510] w-[calc(100%-8rem)] sm:left-4 sm:w-96 lg:top-32">
                <TerritorySearch query={search} category={category} categories={territoryCategories} results={searchResults} onQueryChange={setSearch} onCategoryChange={setCategory} onSelect={selectFeature} />
              </div>}

              <div className="absolute right-3 top-[9.4rem] z-[500] sm:right-4 lg:top-32">
                <MapToolbar
                  presentationMode={presentationMode}
                  onTogglePresentation={() => setPresentationMode((value) => !value)}
                  onReset={resetMap}
                  onClearSelection={clearMarkerSelection}
                  hasSelection={Boolean(safeSelectedFeature || safeSelection.neighborhoodId)}
                />
              </div>

              {!presentationMode && (
                <>
                  <div className="absolute left-4 top-64 z-[500] hidden w-48 lg:block">
                    <LayerControl layers={snapshot.layers} enabled={enabledLayers} onToggle={toggleLayer} />
                  </div>
                  <div className="absolute bottom-4 left-1/2 z-[500] hidden w-[min(34rem,65%)] -translate-x-1/2 lg:block">
                    <TimelineSlider periods={snapshot.periods} value={periodIndex} onChange={changePeriod} />
                  </div>
                  <div className="absolute bottom-4 right-4 z-[500] hidden xl:block">
                    <MapLegend layers={snapshot.layers} enabled={enabledLayers} />
                  </div>
                </>
              )}
            </div>

            {!presentationMode && (
              <div className="max-h-[70vh] border-t border-[var(--border)] lg:max-h-none lg:border-l lg:border-t-0">
                <TerritorySidebar
                  neighborhoods={snapshot.neighborhoods}
                  selectedFeature={safeSelectedFeature}
                  selectedNeighborhood={view.selectedNeighborhood}
                  onSelectNeighborhood={selectNeighborhood}
                  onSelectFeature={selectFeature}
                  onClearFeature={clearMarkerSelection}
                  onClearAll={resetMap}
                />
              </div>
            )}
          </div>
        </div>

        {!presentationMode && (
          <div className="px-4 pt-3 lg:hidden">
            <TimelineSlider periods={snapshot.periods} value={periodIndex} onChange={changePeriod} />
          </div>
        )}
      </div>
    </div>
  );
}
