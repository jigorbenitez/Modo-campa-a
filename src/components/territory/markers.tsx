"use client";

import { divIcon } from "leaflet";
import { Marker } from "react-leaflet";
import type { TerritoryFeature } from "@/features/territorio-map";

function markerIcon(color: string, symbol: string) {
  return divIcon({
    className: "territory-div-icon",
    html: `<span class="territory-marker" style="background:${color}"><span>${symbol}</span></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
  });
}

type MarkerProps = {
  feature: TerritoryFeature;
  onSelect: (feature: TerritoryFeature) => void;
};

export function ActivityMarker({ feature, onSelect }: MarkerProps) {
  return (
    <Marker
      position={[feature.point.latitude, feature.point.longitude]}
      icon={markerIcon("#16a05d", "A")}
      eventHandlers={{ click: () => onSelect(feature) }}
      title={feature.title}
      keyboard
    />
  );
}

export function ProblemMarker({ feature, onSelect }: MarkerProps) {
  return (
    <Marker
      position={[feature.point.latitude, feature.point.longitude]}
      icon={markerIcon("#e5484d", "!")}
      eventHandlers={{ click: () => onSelect(feature) }}
      title={feature.title}
      keyboard
    />
  );
}

export function CommitmentMarker({ feature, onSelect }: MarkerProps) {
  return (
    <Marker
      position={[feature.point.latitude, feature.point.longitude]}
      icon={markerIcon("#d99a18", "C")}
      eventHandlers={{ click: () => onSelect(feature) }}
      title={feature.title}
      keyboard
    />
  );
}

export function GenericTerritoryMarker({ feature, onSelect }: MarkerProps) {
  const styles = {
    proposal: ["#2878d0", "P"],
    document: ["#8856d8", "D"],
    institution: ["#7b8794", "I"],
    photo: ["#2f9e9e", "F"],
  } as const;
  const [color, symbol] = styles[feature.kind as keyof typeof styles] ?? ["#64748b", "•"];

  return (
    <Marker
      position={[feature.point.latitude, feature.point.longitude]}
      icon={markerIcon(color, symbol)}
      eventHandlers={{ click: () => onSelect(feature) }}
      title={feature.title}
      keyboard
    />
  );
}
