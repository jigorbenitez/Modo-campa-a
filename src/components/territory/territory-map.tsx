"use client";

import { useEffect } from "react";
import { Circle, MapContainer, Polygon, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type {
  TerritoryFeature,
  TerritoryLayer,
  TerritoryNeighborhood,
  TerritoryView,
} from "@/features/territorio-map";
import {
  ActivityMarker,
  CommitmentMarker,
  GenericTerritoryMarker,
  ProblemMarker,
} from "./markers";

function MapFocus({
  feature,
  neighborhoodLatitude,
  neighborhoodLongitude,
  neighborhood,
  municipalityBoundaries,
  defaultLatitude,
  defaultLongitude,
  resetToken,
}: {
  feature?: TerritoryFeature;
  neighborhoodLatitude?: number;
  neighborhoodLongitude?: number;
  neighborhood?: TerritoryNeighborhood;
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

function MapDismissSelection({ onClearSelection }: { onClearSelection: () => void }) {
  useMapEvents({ click: onClearSelection });
  return null;
}

export function TerritoryMap({
  center,
  view,
  layers,
  selectedFeature,
  onSelectFeature,
  onSelectNeighborhood,
  resetToken,
  onClearSelection,
  municipalityBoundaries,
}: {
  center: [number, number];
  view: TerritoryView;
  layers: TerritoryLayer[];
  selectedFeature?: TerritoryFeature;
  onSelectFeature: (feature: TerritoryFeature) => void;
  onSelectNeighborhood: (id: string) => void;
  resetToken: number;
  onClearSelection: () => void;
  municipalityBoundaries: TerritoryNeighborhood["boundaries"];
}) {
  const layerColors = new Map(layers.map((layer) => [layer.id, layer.color]));

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
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Polygon
        positions={municipalityBoundaries.map((ring) =>
          ring.map((point) => [point.latitude, point.longitude] as [number, number]),
        )}
        interactive={false}
        pathOptions={{
          color: "var(--accent)",
          fillColor: "var(--accent)",
          fillOpacity: 0.015,
          weight: 2,
          dashArray: "6 6",
        }}
      />

      {view.visibleNeighborhoods.map((neighborhood) => (
        <Polygon
          key={neighborhood.id}
          positions={neighborhood.boundaries.map((ring) =>
            ring.map((point) => [point.latitude, point.longitude] as [number, number]),
          )}
          pathOptions={{
            color: layerColors.get("neighborhoods"),
            fillColor: layerColors.get("neighborhoods"),
            fillOpacity: view.selectedNeighborhood?.neighborhood.id === neighborhood.id ? 0.18 : 0.07,
            weight: view.selectedNeighborhood?.neighborhood.id === neighborhood.id ? 3 : 1.5,
          }}
          eventHandlers={{ click: () => onSelectNeighborhood(neighborhood.id) }}
        />
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
        municipalityBoundaries={municipalityBoundaries}
      />
      <MapDismissSelection onClearSelection={onClearSelection} />
    </MapContainer>
  );
}
