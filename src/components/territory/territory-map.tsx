"use client";

import { useEffect, useState } from "react";
import { Circle, MapContainer, Polygon, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import type {
  TerritoryCircuit,
  TerritoryFeature,
  TerritoryLayer,
  TerritoryNeighborhood,
  TerritoryView,
  TerritoryLayerId,
} from "@/features/territorio-map";
import {
  ActivityMarker,
  CommitmentMarker,
  GenericTerritoryMarker,
  ProblemMarker,
} from "./markers";
import type { GisTool } from "./gis-toolbox";

function MapFocus({
  feature,
  neighborhoodLatitude,
  neighborhoodLongitude,
  neighborhood,
  circuit,
  municipalityBoundaries,
  defaultLatitude,
  defaultLongitude,
  resetToken,
}: {
  feature?: TerritoryFeature;
  neighborhoodLatitude?: number;
  neighborhoodLongitude?: number;
  neighborhood?: TerritoryNeighborhood;
  circuit?: TerritoryCircuit;
  municipalityBoundaries: TerritoryNeighborhood["boundaries"];
  defaultLatitude: number;
  defaultLongitude: number;
  resetToken: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
    map.touchZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    map.closePopup();
    if (feature) {
      map.flyTo([feature.point.latitude, feature.point.longitude], 15, { duration: 0.6 });
    } else if (circuit?.boundaries.length) {
      map.fitBounds(
        circuit.boundaries.flatMap((ring) =>
          ring.map((point) => [point.latitude, point.longitude] as [number, number]),
        ),
        { animate: true, duration: 0.6, padding: [28, 28], maxZoom: 15 },
      );
    } else if (neighborhood?.boundaries.length) {
      map.fitBounds(
        neighborhood.boundaries.flatMap((ring) =>
          ring.map((point) => [point.latitude, point.longitude] as [number, number]),
        ),
        { animate: true, duration: 0.6, padding: [28, 28], maxZoom: 15 },
      );
    } else if (neighborhoodLatitude !== undefined && neighborhoodLongitude !== undefined) {
      map.flyTo([neighborhoodLatitude, neighborhoodLongitude], 14, { duration: 0.6 });
    } else if (municipalityBoundaries.length) {
      map.fitBounds(
        municipalityBoundaries.flatMap((ring) =>
          ring.map((point) => [point.latitude, point.longitude] as [number, number]),
        ),
        { animate: true, duration: 0.6, padding: [20, 20], maxZoom: 12 },
      );
    } else {
      map.flyTo([defaultLatitude, defaultLongitude], 13, { duration: 0.6 });
    }
  }, [
    defaultLatitude,
    defaultLongitude,
    circuit,
    feature,
    map,
    municipalityBoundaries,
    neighborhood,
    neighborhoodLatitude,
    neighborhoodLongitude,
    resetToken,
  ]);

  return null;
}

function MapInteraction({ tool, onClearSelection, onPoint }: { tool: GisTool; onClearSelection: () => void; onPoint: (point: [number, number]) => void }) {
  useMapEvents({
    click: (event) => tool === "navigate" ? onClearSelection() : onPoint([event.latlng.lat, event.latlng.lng]),
  });
  return null;
}

function ZoomObserver({ onChange }: { onChange: (zoom: number) => void }) {
  const map = useMapEvents({ zoomend: () => onChange(map.getZoom()) });
  return null;
}

export function TerritoryMap({
  center,
  view,
  layers,
  selectedFeature,
  onSelectFeature,
  onSelectNeighborhood,
  onSelectCircuit,
  resetToken,
  onClearSelection,
  municipalityBoundaries,
  enabledLayers,
  activeTool,
  selectedCircuitIds,
  onCreatePoint,
}: {
  center: [number, number];
  view: TerritoryView;
  layers: TerritoryLayer[];
  selectedFeature?: TerritoryFeature;
  onSelectFeature: (feature: TerritoryFeature) => void;
  onSelectNeighborhood: (id: string) => void;
  onSelectCircuit?: (id: string) => void;
  resetToken: number;
  onClearSelection: () => void;
  municipalityBoundaries: TerritoryNeighborhood["boundaries"];
  enabledLayers: Set<TerritoryLayerId>;
  activeTool: GisTool;
  selectedCircuitIds: Set<string>;
  onCreatePoint: (point: [number, number]) => void;
}) {
  const layerColors = new Map(layers.map((layer) => [layer.id, layer.color]));
  const [zoom, setZoom] = useState(13);
  const [toolPoints, setToolPoints] = useState<Array<[number, number]>>([]);

  const distanceMeters = toolPoints.slice(1).reduce((total, point, index) => {
    const previous = toolPoints[index];
    const latitudeDistance = (point[0] - previous[0]) * 111_320;
    const longitudeDistance = (point[1] - previous[1]) * 111_320 * Math.cos((point[0] * Math.PI) / 180);
    return total + Math.hypot(latitudeDistance, longitudeDistance);
  }, 0);

  return (
    <MapContainer
      center={center}
      zoom={13}
      minZoom={8}
      maxZoom={18}
      scrollWheelZoom
      dragging
      doubleClickZoom
      touchZoom
      boxZoom
      keyboard
      className="territory-map h-full w-full bg-[#dfe7df]"
      zoomControl
    >
      {enabledLayers.has("streets") && <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        opacity={0.68}
      />}

      {enabledLayers.has("municipality") && <Polygon
        positions={municipalityBoundaries.map((ring) =>
          ring.map((point) => [point.latitude, point.longitude] as [number, number]),
        )}
        interactive={false}
        pathOptions={{
          color: "#0A1D3D",
          fillColor: "#0A1D3D",
          fillOpacity: 0.012,
          weight: 4,
        }}
      />}

      {view.visibleNeighborhoods.map((neighborhood) => (
        <Polygon
          key={neighborhood.id}
          positions={neighborhood.boundaries.map((ring) =>
            ring.map((point) => [point.latitude, point.longitude] as [number, number]),
          )}
          pathOptions={{
            color: layerColors.get(neighborhood.level === "locality" ? "localities" : "neighborhoods"),
            fillColor: layerColors.get(neighborhood.level === "locality" ? "localities" : "neighborhoods"),
            fillOpacity: view.selectedNeighborhood?.neighborhood.id === neighborhood.id ? 0.18 : 0.07,
            weight: view.selectedNeighborhood?.neighborhood.id === neighborhood.id ? 3.5 : neighborhood.level === "locality" ? 2.25 : 1.25,
          }}
          eventHandlers={{ click: (event) => { event.originalEvent.stopPropagation(); onSelectNeighborhood(neighborhood.id); } }}
        />
      ))}

      {view.visibleCircuits.map((circuit) => (
        <Polygon
          key={circuit.id}
          positions={circuit.boundaries.map((ring) =>
            ring.map((point) => [point.latitude, point.longitude] as [number, number]),
          )}
          pathOptions={{
            color: layerColors.get("circuits"),
            fillColor: layerColors.get("circuits"),
            fillOpacity: selectedCircuitIds.has(circuit.id) || view.selectedCircuit?.circuit.id === circuit.id ? 0.2 : view.selectedCircuit ? 0.012 : 0.035,
            opacity: view.selectedCircuit && view.selectedCircuit.circuit.id !== circuit.id && !selectedCircuitIds.has(circuit.id) ? 0.22 : 1,
            weight: selectedCircuitIds.has(circuit.id) || view.selectedCircuit?.circuit.id === circuit.id ? 4 : 2,
          }}
          eventHandlers={{
            click: (event) => { event.originalEvent.stopPropagation(); onSelectCircuit?.(circuit.id); },
          }}
        >
          <Tooltip permanent={zoom >= 14 || view.selectedCircuit?.circuit.id === circuit.id} sticky={zoom < 14} direction="center" className="atiy-territory-label">
            Circuito {circuit.code.replace(/^0/, "")}
          </Tooltip>
        </Polygon>
      ))}

      {view.heatPoints.map((point) => (
        <Circle
          key={point.barrioId}
          center={[point.point.latitude, point.point.longitude]}
          radius={500 + point.intensity * 1050}
          pathOptions={{
            color: "#f06a3c",
            fillColor: "#f06a3c",
            fillOpacity: 0.08 + point.intensity * 0.2,
            weight: 0,
          }}
        />
      ))}

      {toolPoints.length > 1 && activeTool === "distance" && <Polyline positions={toolPoints} pathOptions={{ color: "#00BBD4", weight: 4 }}><Tooltip permanent direction="top">{distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(2)} km` : `${Math.round(distanceMeters)} m`}</Tooltip></Polyline>}
      {toolPoints.length > 2 && (activeTool === "area" || activeTool === "zone") && <Polygon positions={toolPoints} pathOptions={{ color: "#00BBD4", fillColor: "#00BBD4", fillOpacity: 0.14, weight: 3 }}><Tooltip permanent direction="center">Área temporal · {toolPoints.length} vértices</Tooltip></Polygon>}

      {view.visibleFeatures.map((feature) => {
        if (feature.kind === "activity") {
          return <ActivityMarker key={feature.id} feature={feature} onSelect={onSelectFeature} />;
        }
        if (feature.kind === "problem") {
          return <ProblemMarker key={feature.id} feature={feature} onSelect={onSelectFeature} />;
        }
        if (feature.kind === "commitment") {
          return <CommitmentMarker key={feature.id} feature={feature} onSelect={onSelectFeature} />;
        }
        return <GenericTerritoryMarker key={feature.id} feature={feature} onSelect={onSelectFeature} />;
      })}

      <MapFocus
        feature={selectedFeature}
        defaultLatitude={center[0]}
        defaultLongitude={center[1]}
        resetToken={resetToken}
        neighborhoodLatitude={view.selectedNeighborhood?.neighborhood.center.latitude}
        neighborhoodLongitude={view.selectedNeighborhood?.neighborhood.center.longitude}
        neighborhood={view.selectedNeighborhood?.neighborhood}
        circuit={view.selectedCircuit?.circuit}
        municipalityBoundaries={municipalityBoundaries}
      />
      <MapInteraction tool={activeTool} onClearSelection={onClearSelection} onPoint={(point) => {
        if (activeTool === "create") onCreatePoint(point);
        else setToolPoints((items) => [...items, point]);
      }} />
      <ZoomObserver onChange={setZoom} />
    </MapContainer>
  );
}
