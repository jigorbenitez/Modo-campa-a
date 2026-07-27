"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { TerritoryFeature, TerritoryLayerId } from "@/features/territorio-map";
import { TerritoryViewService } from "@/features/territorio-map";
import { mockTerritorySnapshot } from "@/mock";
import { FloatingMetrics } from "./floating-metrics";
import { LayerControl } from "./layer-control";
import { MapLegend } from "./map-legend";
import { MapToolbar } from "./map-toolbar";
import { TimelineSlider } from "./timeline-slider";
import { TerritorySidebar } from "./territory-sidebar";

const TerritoryMap = dynamic(
  () => import("./territory-map").then((module) => module.TerritoryMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center bg-[var(--surface-muted)] text-sm font-bold text-[var(--muted)]">
        Preparando el territorio…
      </div>
    ),
  },
);

const viewService = new TerritoryViewService();

export function TerritoryOperations() {
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

  const periodId = mockTerritorySnapshot.periods[periodIndex]?.id ?? "today";
  const view = useMemo(
    () =>
      viewService.project(mockTerritorySnapshot, {
        periodId,
        enabledLayers,
        selectedNeighborhoodId,
      }),
    [enabledLayers, periodId, selectedNeighborhoodId],
  );

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
    setSelectedNeighborhoodId(id);
    setSelectedFeature(undefined);
  }

  function selectFeature(feature: TerritoryFeature) {
    setSelectedFeature(feature);
    setSelectedNeighborhoodId(feature.barrioId);
  }

  function changePeriod(index: number) {
    setPeriodIndex(index);
    const cutoff = mockTerritorySnapshot.periods[index]?.cutoff;
    if (selectedFeature && cutoff && selectedFeature.occurredAt.slice(0, 10) > cutoff) {
      setSelectedFeature(undefined);
    }
  }

  function resetMap() {
    setSelectedFeature(undefined);
    setSelectedNeighborhoodId(undefined);
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
                Una lectura conectada de la actividad, los pendientes y las instituciones de Villa del Encuentro.
              </p>
            </div>
            <MapToolbar presentationMode={presentationMode} onTogglePresentation={() => setPresentationMode(true)} onReset={resetMap} />
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
            <LayerControl layers={mockTerritorySnapshot.layers} enabled={enabledLayers} onToggle={toggleLayer} />
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
                center={[
                  mockTerritorySnapshot.center.latitude,
                  mockTerritorySnapshot.center.longitude,
                ]}
                view={view}
                layers={mockTerritorySnapshot.layers}
                selectedFeature={selectedFeature}
                onSelectFeature={selectFeature}
                onSelectNeighborhood={selectNeighborhood}
                resetToken={resetToken}
              />

              <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] sm:inset-x-4 sm:top-4">
                <div className="pointer-events-auto">
                  <FloatingMetrics stats={view.stats} />
                </div>
              </div>

              <div className="absolute right-3 top-[9.4rem] z-[500] sm:right-4 lg:top-32">
                <MapToolbar
                  presentationMode={presentationMode}
                  onTogglePresentation={() => setPresentationMode((value) => !value)}
                  onReset={resetMap}
                />
              </div>

              {!presentationMode && (
                <>
                  <div className="absolute left-4 top-32 z-[500] hidden w-48 lg:block">
                    <LayerControl layers={mockTerritorySnapshot.layers} enabled={enabledLayers} onToggle={toggleLayer} />
                  </div>
                  <div className="absolute bottom-4 left-1/2 z-[500] hidden w-[min(34rem,65%)] -translate-x-1/2 lg:block">
                    <TimelineSlider periods={mockTerritorySnapshot.periods} value={periodIndex} onChange={changePeriod} />
                  </div>
                  <div className="absolute bottom-4 right-4 z-[500] hidden xl:block">
                    <MapLegend layers={mockTerritorySnapshot.layers} enabled={enabledLayers} />
                  </div>
                </>
              )}
            </div>

            {!presentationMode && (
              <div className="max-h-[70vh] border-t border-[var(--border)] lg:max-h-none lg:border-l lg:border-t-0">
                <TerritorySidebar
                  neighborhoods={mockTerritorySnapshot.neighborhoods}
                  selectedFeature={selectedFeature}
                  selectedNeighborhood={view.selectedNeighborhood}
                  onSelectNeighborhood={selectNeighborhood}
                  onSelectFeature={selectFeature}
                  onClear={resetMap}
                />
              </div>
            )}
          </div>
        </div>

        {!presentationMode && (
          <div className="px-4 pt-3 lg:hidden">
            <TimelineSlider periods={mockTerritorySnapshot.periods} value={periodIndex} onChange={changePeriod} />
          </div>
        )}
      </div>
    </div>
  );
}
