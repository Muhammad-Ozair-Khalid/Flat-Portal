"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { fromNow } from "@/lib/format";

export type MapMarker = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  updatedAt?: string | null;
  you?: boolean;
};

// Leaflet needs the container's real size; when it mounts inside a freshly laid-out
// flex/grid cell it often reads 0×0 and renders grey tiles. Re-measure after paint,
// on resize, and fit the view to all markers.
function MapController({ markers }: { markers: MapMarker[] }) {
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize();
    const t = setTimeout(fix, 150);
    window.addEventListener("resize", fix);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", fix);
    };
  }, [map]);

  useEffect(() => {
    if (markers.length > 1) {
      map.fitBounds(L.latLngBounds(markers.map((m) => [m.lat, m.lng])), { padding: [50, 50], maxZoom: 15 });
    } else if (markers.length === 1) {
      map.setView([markers[0]!.lat, markers[0]!.lng], 15);
    }
    setTimeout(() => map.invalidateSize(), 100);
  }, [map, markers]);

  return null;
}

export default function FlatMap({
  markers,
  center,
  zoom = 13,
}: {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
}) {
  const fallback: [number, number] = markers[0] ? [markers[0].lat, markers[0].lng] : [51.5074, -0.1278];

  return (
    <MapContainer center={center ?? fallback} zoom={zoom} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController markers={markers} />
      {markers.map((m) => (
        <CircleMarker
          key={m.id}
          center={[m.lat, m.lng]}
          radius={11}
          pathOptions={{
            color: m.you ? "#a86f1c" : "#1f7a5e",
            fillColor: m.you ? "#c68a2e" : "#2f9e83",
            fillOpacity: 0.85,
            weight: 3,
          }}
        >
          <Popup>
            <strong>{m.name}</strong>
            {m.updatedAt && (
              <>
                <br />
                <span>Updated {fromNow(m.updatedAt)}</span>
              </>
            )}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
