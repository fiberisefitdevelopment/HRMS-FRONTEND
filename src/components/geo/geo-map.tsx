"use client";

import { useCallback, useMemo, Fragment } from "react";
import { GoogleMap, MarkerF, CircleF, useJsApiLoader } from "@react-google-maps/api";
import { cn } from "@/lib/utils";

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
  color?: "green" | "amber" | "gray" | "blue";
  radiusMeters?: number;
}

interface GeoMapProps {
  center?: { latitude: number; longitude: number };
  zoom?: number;
  markers?: MapMarker[];
  /** When true, clicking the map calls onMapClick with lat/lng */
  pickMode?: boolean;
  onMapClick?: (coords: { latitude: number; longitude: number }) => void;
  className?: string;
  height?: number | string;
}

const COLOR_HEX: Record<NonNullable<MapMarker["color"]>, string> = {
  green: "#16a34a",
  amber: "#d97706",
  gray: "#6b7280",
  blue: "#2563eb",
};

const DEFAULT_CENTER = { latitude: 19.1136, longitude: 72.8697 };

function pinIcon(color: NonNullable<MapMarker["color"]>): google.maps.Icon {
  const hex = COLOR_HEX[color];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
    <path fill="${hex}" stroke="#fff" stroke-width="2" d="M14 1C7.4 1 2 6.4 2 13c0 9.5 12 25 12 25s12-15.5 12-25C26 6.4 20.6 1 14 1z"/>
    <circle cx="14" cy="13" r="4.5" fill="#fff"/>
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(28, 40),
    anchor: new google.maps.Point(14, 40),
  };
}

export function GeoMap({
  center = DEFAULT_CENTER,
  zoom = 15,
  markers = [],
  pickMode,
  onMapClick,
  className,
  height = 320,
}: GeoMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "hrms-google-maps",
    googleMapsApiKey: apiKey,
  });

  const mapCenter = useMemo(
    () => ({ lat: center.latitude, lng: center.longitude }),
    [center.latitude, center.longitude]
  );

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      if (markers.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach((m) => bounds.extend({ lat: m.latitude, lng: m.longitude }));
        map.fitBounds(bounds, 48);
      }
    },
    [markers]
  );

  const handleClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!pickMode || !e.latLng) return;
      onMapClick?.({
        latitude: e.latLng.lat(),
        longitude: e.latLng.lng(),
      });
    },
    [pickMode, onMapClick]
  );

  if (!apiKey) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border bg-muted/30 text-sm text-muted-foreground",
          className
        )}
        style={{ height }}
      >
        Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable the map
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border bg-muted/30 text-sm text-destructive",
          className
        )}
        style={{ height }}
      >
        Failed to load Google Maps
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border bg-muted/30 text-sm text-muted-foreground",
          className
        )}
        style={{ height }}
      >
        Loading map…
      </div>
    );
  }

  return (
    <div
      className={cn("z-0 w-full overflow-hidden rounded-md border", className)}
      style={{ height, cursor: pickMode ? "crosshair" : undefined }}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onClick={handleClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          clickableIcons: !pickMode,
        }}
      >
        {markers.map((m) => {
          const color = m.color ?? "blue";
          return (
            <Fragment key={m.id}>
              <MarkerF
                position={{ lat: m.latitude, lng: m.longitude }}
                title={m.label}
                icon={pinIcon(color)}
              />
              {m.radiusMeters != null && m.radiusMeters > 0 && (
                <CircleF
                  center={{ lat: m.latitude, lng: m.longitude }}
                  radius={m.radiusMeters}
                  options={{
                    strokeColor: COLOR_HEX[color],
                    strokeOpacity: 0.9,
                    strokeWeight: 2,
                    fillColor: COLOR_HEX[color],
                    fillOpacity: 0.12,
                    clickable: false,
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </GoogleMap>
    </div>
  );
}
