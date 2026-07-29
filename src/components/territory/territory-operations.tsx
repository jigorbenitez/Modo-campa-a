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
import { territorialEntityToMapFeature, useTerritorialEntities } from "@/features/territorial-engine";
import { territorialBaseSnapshot, territoryCategories } from "@/data/territorial-base";
import { FloatingMetrics } from "./floating-metrics";
import { LayerControl } from "./layer-control";
import { MapLegend } from "./map-legend";
import { TimelineSlider } from "./timeline-slider";
import { TerritorySidebar } from "./territory-sidebar";
import { TerritorySearch } from "./territory-search";
import type { TerritorySearchResult } from "./territory-search";
import { GisToolbox } from "./gis-toolbox";
import type { GisTool } from "./gis-toolbox";
import { MapCommandMenu } from "./map-command-menu";
import type { MapPanel } from "./map-command-menu";
import { cartographicModes, MapModeSwitcher } from "./map-mode-switcher";
import type { CartographicMode } from "./map-mode-switcher";

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
const LAYERS_STORAGE_KEY = "atiy:territory:layers:v1";
const MODE_STORAGE_KEY = "atiy:territory:mode:v1";
const CUSTOM_FEATURES_KEY = "atiy:territory:custom-features:v1";

export function TerritoryOperations() {
  const territorialEntities = useTerritorialEntities();
  const searchParams = useSearchParams();
  const requestedActivityId = searchParams.get("activity");
  const requestedEntityId = searchParams.get("entity");
  const requestedAreaId = searchParams.get("area");
  const requestedCircuitId = searchParams.get("circuit");
  const { records: journalRecords } = useActivityJournal(emptyActivityRecords);
  const [customFeatures, setCustomFeatures] = useState<TerritoryFeature[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(window.localStorage.getItem(CUSTOM_FEATURES_KEY) ?? "[]") as TerritoryFeature[];
  });
  const snapshot = useMemo(() => {
    const journalFeatures = journalRecords
      .map((record) =>
        activityRecordToTerritoryFeature(record, territorialBaseSnapshot.neighborhoods),
      )
      .filter((feature): feature is TerritoryFeature => Boolean(feature));

    const synchronizedFeatures = territorialEntities
      .map((entity) => territorialEntityToMapFeature(
        entity,
        territorialBaseSnapshot.neighborhoods,
        territorialBaseSnapshot.circuits,
      ))
      .filter((feature): feature is TerritoryFeature => Boolean(feature));
    return {
      ...territorialBaseSnapshot,
      features: [
        ...synchronizedFeatures,
        ...journalFeatures,
        ...customFeatures,
      ],
    };
  }, [customFeatures, journalRecords, territorialEntities]);
  const [cartographicMode, setCartographicMode] = useState<CartographicMode>(() => {
    if (requestedCircuitId) return "electoral";
    if (typeof window === "undefined") return "territorial";
    const stored = window.localStorage.getItem(MODE_STORAGE_KEY);
    return stored && stored in cartographicModes ? stored as CartographicMode : "territorial";
  });
  const [enabledLayers, setEnabledLayers] = useState<Set<TerritoryLayerId>>(
    () => {
      const defaults = [...cartographicModes[cartographicMode].layers];
      if (requestedCircuitId && !defaults.includes("circuits")) defaults.push("circuits");
      if (typeof window === "undefined") return new Set(defaults);
      const stored = window.localStorage.getItem(LAYERS_STORAGE_KEY);
      const valid = new Set(defaults);
      return new Set(stored ? (JSON.parse(stored) as TerritoryLayerId[]).filter((id) => valid.has(id)) : defaults);
    },
  );
  const [periodIndex, setPeriodIndex] = useState(territorialBaseSnapshot.periods.length - 1);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>();
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>();
  const [selectedFeature, setSelectedFeature] = useState<TerritoryFeature>();
  const [presentationMode, setPresentationMode] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [requestedSelectionDismissed, setRequestedSelectionDismissed] = useState(false);
  const [activeTool, setActiveTool] = useState<GisTool>("navigate");
  const [selectedCircuitIds, setSelectedCircuitIds] = useState<Set<string>>(new Set());
  const [pendingPoint, setPendingPoint] = useState<[number, number]>();
  const [newPointTitle, setNewPointTitle] = useState("");
  const [newPointType, setNewPointType] = useState<"institution" | "activity" | "commitment" | "proposal" | "photo" | "document">("institution");
  const [newPointArea, setNewPointArea] = useState("");
  const [activePanel, setActivePanel] = useState<MapPanel>(null);
  const [contextPanelOpen, setContextPanelOpen] = useState(Boolean(requestedActivityId || requestedEntityId || requestedAreaId || requestedCircuitId));

  const periodId = snapshot.periods[periodIndex]?.id ?? "today";
  const requestedFeature = useMemo(
    () =>
      requestedSelectionDismissed || !requestedActivityId
        ? undefined
        : snapshot.features.find(
            (feature) => feature.id === requestedEntityId || feature.id === `journal-${requestedActivityId}`,
          ),
    [requestedActivityId, requestedEntityId, requestedSelectionDismissed, snapshot.features],
  );
  const safeSelection = useMemo(() => {
    const cutoff = snapshot.periods[periodIndex]?.cutoff ?? "9999-12-31";
    return sanitizeTerritorySelection(
      {
        neighborhoodId: selectedNeighborhoodId ?? requestedAreaId ?? requestedFeature?.barrioId,
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
    requestedAreaId,
    selectedFeature?.id,
    selectedNeighborhoodId,
    snapshot,
  ]);
  const safeSelectedFeature = useMemo(
    () => snapshot.features.find((item) => item.id === safeSelection.featureId),
    [safeSelection.featureId, snapshot.features],
  );
  const safeSelectedCircuitId =
    enabledLayers.has("circuits") &&
    snapshot.circuits.some((circuit) => circuit.id === (selectedCircuitId ?? requestedCircuitId))
      ? (selectedCircuitId ?? requestedCircuitId ?? undefined)
      : undefined;
  useEffect(() => {
    window.localStorage.setItem(LAYERS_STORAGE_KEY, JSON.stringify([...enabledLayers]));
  }, [enabledLayers]);
  useEffect(() => {
    window.localStorage.setItem(MODE_STORAGE_KEY, cartographicMode);
  }, [cartographicMode]);

  const searchResults = useMemo<TerritorySearchResult[]>(() => {
    const term = search.trim().toLocaleLowerCase("es-AR");
    if (!term) return [];
    const featureResults = snapshot.features.filter((feature) => {
      const matchesTerm =
        !term ||
        `${feature.title} ${feature.description} ${feature.subtype ?? ""} ${feature.localidad}`
          .toLocaleLowerCase("es-AR")
          .includes(term);
      const matchesCategory =
        category === "all" || feature.subtype === category || feature.kind === category;
      return matchesTerm && matchesCategory;
    }).map((feature) => ({ id: feature.id, title: feature.title, subtitle: `${feature.subtype ?? feature.kind} · ${feature.localidad}`, kind: "feature" as const }));
    const areaResults = snapshot.neighborhoods
      .filter((area) => `${area.name} ${area.locality}`.toLocaleLowerCase("es-AR").includes(term))
      .map((area) => ({ id: area.id, title: area.name, subtitle: area.level === "locality" ? "Localidad" : "Barrio", kind: "area" as const }));
    const circuitResults = snapshot.circuits
      .filter((circuit) => `${circuit.name} ${circuit.code}`.toLocaleLowerCase("es-AR").includes(term))
      .map((circuit) => ({ id: circuit.id, title: `Circuito ${circuit.code.replace(/^0/, "")}`, subtitle: "Circuito electoral oficial", kind: "circuit" as const }));
    return [...circuitResults, ...areaResults, ...featureResults];
  }, [category, search, snapshot]);

  function selectSearchResult(result: TerritorySearchResult) {
    if (result.kind === "circuit") return selectCircuit(result.id);
    if (result.kind === "area") return selectNeighborhood(result.id);
    const feature = snapshot.features.find((item) => item.id === result.id);
    if (feature) selectFeature(feature);
  }

  function saveCustomPoint() {
    const area = snapshot.neighborhoods.find((item) => item.id === newPointArea);
    if (!pendingPoint || !area || !newPointTitle.trim()) return;
    const now = new Date().toISOString();
    const layerByType = { institution: "custom_markers", activity: "activities", commitment: "commitments", proposal: "proposals", photo: "photos", document: "documents" } as const;
    const feature: TerritoryFeature = {
      id: `custom-${crypto.randomUUID()}`,
      municipioId: snapshot.municipioId,
      layerId: layerByType[newPointType],
      kind: newPointType,
      subtype: "Creado desde el mapa",
      title: newPointTitle.trim(),
      description: "Elemento georreferenciado creado desde el Centro de Operaciones Territorial.",
      point: { latitude: pendingPoint[0], longitude: pendingPoint[1] },
      barrioId: area.id,
      localidad: area.locality,
      occurredAt: now,
      status: "open",
      updatedAt: now,
      source: "Carga operativa ATIY",
      participants: [],
      problems: [],
      commitments: [],
      proposals: [],
      documents: [],
      publications: [],
      photos: [],
      videos: [],
      history: [{ at: now, label: "Creado desde el mapa" }],
    };
    const next = [...customFeatures, feature];
    setCustomFeatures(next);
    window.localStorage.setItem(CUSTOM_FEATURES_KEY, JSON.stringify(next));
    setEnabledLayers((current) => new Set([...current, feature.layerId, "custom_markers"]));
    setPendingPoint(undefined);
    setNewPointTitle("");
    setActiveTool("navigate");
    setSelectedFeature(feature);
  }
  const view = useMemo(
    () =>
      viewService.project(snapshot, {
        periodId,
        enabledLayers,
        selectedNeighborhoodId: safeSelection.neighborhoodId,
        selectedCircuitId: safeSelectedCircuitId,
        search,
        category,
      }),
    [
      category,
      enabledLayers,
      periodId,
      safeSelectedCircuitId,
      safeSelection.neighborhoodId,
      search,
      snapshot,
    ],
  );

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setRequestedSelectionDismissed(true);
        setSelectedFeature(undefined);
        setSelectedNeighborhoodId(undefined);
        setSelectedCircuitId(undefined);
        setResetToken((value) => value + 1);
        setContextPanelOpen(false);
        setActivePanel(null);
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
    if (id === "circuits" && selectedCircuitId) setSelectedCircuitId(undefined);
  }

  function selectNeighborhood(id: string) {
    setRequestedSelectionDismissed(true);
    setSelectedNeighborhoodId(id);
    setSelectedCircuitId(undefined);
    setSelectedFeature(undefined);
    setContextPanelOpen(true);
  }

  function selectCircuit(id: string) {
    setRequestedSelectionDismissed(true);
    setEnabledLayers((current) => {
      if (current.has("circuits")) return current;
      return new Set([...current, "circuits"]);
    });
    if (activeTool === "multi") {
      setSelectedCircuitIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
      return;
    }
    setSelectedCircuitId(id);
    setSelectedNeighborhoodId(undefined);
    setSelectedFeature(undefined);
    setContextPanelOpen(true);
  }

  function selectFeature(feature: TerritoryFeature) {
    setRequestedSelectionDismissed(true);
    setSelectedFeature(feature);
    setSelectedNeighborhoodId(feature.barrioId);
    setSelectedCircuitId(feature.circuitId);
    setContextPanelOpen(true);
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
    setSelectedCircuitId(undefined);
    setResetToken((value) => value + 1);
    setContextPanelOpen(false);
  }

  function clearMarkerSelection() {
    setRequestedSelectionDismissed(true);
    setSelectedFeature(undefined);
    setSelectedNeighborhoodId(undefined);
    setSelectedCircuitId(undefined);
    setResetToken((value) => value + 1);
    setContextPanelOpen(false);
  }

  function changeCartographicMode(mode: CartographicMode) {
    setCartographicMode(mode);
    setEnabledLayers(new Set(cartographicModes[mode].layers));
    clearMarkerSelection();
    setActivePanel(null);
  }

  return (
    <div className={presentationMode ? "bg-[var(--background)]" : undefined}>
      <div className="h-[calc(100dvh-4rem)] min-h-[560px]">
        <div
          className="h-full overflow-hidden bg-[var(--surface)]"
        >
          <div className="relative grid h-full grid-cols-1">
            <div className="relative h-full min-h-[560px]">
              <TerritoryMap
                center={[snapshot.center.latitude, snapshot.center.longitude]}
                view={view}
                layers={snapshot.layers}
                selectedFeature={safeSelectedFeature}
                onSelectFeature={selectFeature}
                onSelectNeighborhood={selectNeighborhood}
                onSelectCircuit={selectCircuit}
                resetToken={resetToken}
                onClearSelection={clearMarkerSelection}
                municipalityBoundaries={snapshot.municipalityBoundaries}
                enabledLayers={enabledLayers}
                activeTool={activeTool}
                selectedCircuitIds={selectedCircuitIds}
                onCreatePoint={setPendingPoint}
              />

              {activePanel === "metrics" && <div className="pointer-events-none absolute inset-x-3 top-32 z-[500] sm:inset-x-4">
                <div className="pointer-events-auto">
                  <FloatingMetrics stats={view.stats} />
                </div>
              </div>}

              {!presentationMode && <div className="absolute left-3 top-3 z-[510] sm:left-4 sm:top-4">
                <MapModeSwitcher value={cartographicMode} onChange={changeCartographicMode} />
              </div>}

              {!presentationMode && <div className="absolute left-3 top-16 z-[510] w-[calc(100%-5rem)] sm:left-4 sm:w-80">
                <TerritorySearch query={search} category={category} categories={territoryCategories} results={searchResults} onQueryChange={setSearch} onCategoryChange={setCategory} onSelect={selectSearchResult} />
              </div>}

              <div className="absolute right-3 top-3 z-[620] sm:right-4 sm:top-4">
                <MapCommandMenu
                  activePanel={activePanel}
                  presentationMode={presentationMode}
                  onPanel={setActivePanel}
                  onTogglePresentation={() => setPresentationMode((value) => !value)}
                  onReset={resetMap}
                  onClearSelection={clearMarkerSelection}
                  hasSelection={Boolean(safeSelectedFeature || safeSelection.neighborhoodId || safeSelectedCircuitId)}
                />
              </div>

              {!presentationMode && activePanel === "gis" && <div className="absolute right-3 top-16 z-[505] sm:right-4">
                <GisToolbox
                  activeTool={activeTool}
                  onToolChange={setActiveTool}
                  circuits={snapshot.circuits}
                  neighborhoods={view.visibleNeighborhoods}
                  features={view.visibleFeatures}
                  selectedCircuitIds={selectedCircuitIds}
                  onClearMultiSelection={() => setSelectedCircuitIds(new Set())}
                />
              </div>}

              {pendingPoint && <div role="dialog" aria-modal="true" aria-label="Crear elemento georreferenciado" className="absolute inset-x-3 bottom-4 z-[700] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl sm:left-auto sm:right-4 sm:w-80">
                <div className="flex items-center justify-between"><h2 className="text-sm font-extrabold">Nuevo elemento</h2><button type="button" onClick={() => setPendingPoint(undefined)} aria-label="Cerrar">×</button></div>
                <p className="mt-1 text-[10px] text-[var(--muted)]">{pendingPoint[0].toFixed(6)}, {pendingPoint[1].toFixed(6)}</p>
                <input autoFocus value={newPointTitle} onChange={(event) => setNewPointTitle(event.target.value)} placeholder="Nombre" className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <select value={newPointType} onChange={(event) => setNewPointType(event.target.value as typeof newPointType)} className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-xs"><option value="institution">Institución</option><option value="activity">Recorrida</option><option value="commitment">Compromiso</option><option value="proposal">Propuesta</option><option value="photo">Fotografía</option><option value="document">Documento</option></select>
                  <select value={newPointArea} onChange={(event) => setNewPointArea(event.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-xs"><option value="">Área…</option>{snapshot.neighborhoods.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select>
                </div>
                <button type="button" disabled={!newPointTitle.trim() || !newPointArea} onClick={saveCustomPoint} className="mt-3 w-full rounded-xl bg-[var(--primary)] px-3 py-2.5 text-xs font-extrabold text-white disabled:opacity-40">Guardar en el mapa</button>
              </div>}

              {!presentationMode && (
                <>
                  {activePanel === "layers" && <div className="absolute bottom-4 left-3 top-32 z-[500] w-[min(20rem,calc(100%-1.5rem))] overflow-y-auto sm:left-4">
                    <LayerControl layers={snapshot.layers.filter((layer) => cartographicModes[cartographicMode].layers.includes(layer.id))} enabled={enabledLayers} onToggle={toggleLayer} />
                  </div>}
                  {activePanel === "history" && <div className="absolute bottom-4 left-1/2 z-[500] w-[min(34rem,calc(100%-1.5rem))] -translate-x-1/2">
                    <TimelineSlider periods={snapshot.periods} value={periodIndex} onChange={changePeriod} />
                  </div>}
                  {activePanel === "legend" && <div className="absolute bottom-4 left-1/2 z-[500] max-w-[calc(100%-1.5rem)] -translate-x-1/2">
                    <MapLegend layers={snapshot.layers} enabled={enabledLayers} />
                  </div>}
                </>
              )}
            </div>

            {!presentationMode && contextPanelOpen && Boolean(safeSelectedFeature || safeSelection.neighborhoodId || safeSelectedCircuitId) && (
              <div className="absolute inset-x-0 bottom-0 z-[600] max-h-[72dvh] overflow-y-auto rounded-t-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:inset-y-3 sm:left-auto sm:right-3 sm:max-h-none sm:w-[min(380px,38vw)] sm:rounded-2xl">
                <TerritorySidebar
                  neighborhoods={snapshot.neighborhoods}
                  circuits={snapshot.circuits}
                  selectedFeature={safeSelectedFeature}
                  selectedNeighborhood={view.selectedNeighborhood}
                  selectedCircuit={view.selectedCircuit}
                  onSelectNeighborhood={selectNeighborhood}
                  onSelectCircuit={selectCircuit}
                  onSelectFeature={selectFeature}
                  onClearFeature={clearMarkerSelection}
                  onClearAll={resetMap}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
