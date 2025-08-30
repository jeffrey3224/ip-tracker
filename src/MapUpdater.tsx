import type { LatLngExpression } from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    const newCenter: LatLngExpression = [lat, lng];
    map.setView(newCenter);
  }, [lat, lng, map]);

  return null;
}
