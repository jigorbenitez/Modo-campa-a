"use client";

import { useEffect } from "react";
import { Circle, MapContainer, Polygon, TileLayer, useMap } from "react-leaflet";
import type {
  TerritoryFeature,
  TerritoryLayer,
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
  neighborhoodCenter,
  defaultCenter,
  resetToken,
}: {
  feature?: TerritoryFeature;
  neighborhoodCenter?: [number, number];
  defaultCenter: [number, number];
  resetToken: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (feature) {
      map.flyTo([feature.point.latitude, feature.point.longitude], 15, { duration: 0.6 });
    } else if (neighborhoodCenter) {
      map.flyTo(neighborhoodCenter, 14, { duration: 0.6 });
    } else {
      map.flyTo(defaultCenter, 13, { duration: 0.6 });
    }
  }, [defaultCenter, feature, map, neighborhoodCenter, resetToken]);

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
}: {
  center: [number, number];
  view: TerritoryView;
  layers: TerritoryLayer[];
  selectedFeature?: TerritoryFeature;
  onSelectFeature: (feature: TerritoryFeature) => void;
  onSelectNeighborhood: (id: string) => void;
  resetToken: number;
}) {
  const layerColors = new Map(layers.map((layer) => [layer.id, layer.color]));

  return (
    <MapContainer
      center={center}
      zoom={13}
      minZoom={11}
      maxZoom={18}
      scrollWheelZoom
      className="territory-map h-full w-full bg-[#dfe7df]"
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {view.visibleNeighborhoods.map((neighborhood) => (
        <Polygon
          key={neighborhood.id}
          positions={neighborhood.boundary.map((point) => [point.latitude, point.longitude])}
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
        defaultCenter={center}
        resetToken={resetToken}
        neighborhoodCenter={
          view.selectedNeighborhood
            ? [
                view.selectedNeighborhood.neighborhood.center.latitude,
                view.selectedNeighborhood.neighborhood.center.longitude,
              ]
            : undefined
        }
      />
    </MapContainer>
  );
}
