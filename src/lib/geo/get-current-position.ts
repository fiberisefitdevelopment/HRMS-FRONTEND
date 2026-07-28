export class GeolocationError extends Error {
  code: "unsupported" | "permission_denied" | "unavailable" | "timeout" | "unknown";

  constructor(
    code: GeolocationError["code"],
    message: string
  ) {
    super(message);
    this.name = "GeolocationError";
    this.code = code;
  }
}

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

const DEFAULT_TIMEOUT_MS = 12_000;

export function getCurrentPosition(options?: {
  timeoutMs?: number;
  enableHighAccuracy?: boolean;
}): Promise<GeoPosition> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return Promise.reject(
      new GeolocationError("unsupported", "Geolocation is not supported in this browser")
    );
  }

  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters:
            typeof pos.coords.accuracy === "number" ? Math.round(pos.coords.accuracy) : undefined,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(
            new GeolocationError(
              "permission_denied",
              "Location permission denied. Enable location access to punch in/out."
            )
          );
          return;
        }
        if (err.code === err.POSITION_UNAVAILABLE) {
          reject(
            new GeolocationError("unavailable", "Location unavailable. Try again near a window or with GPS on.")
          );
          return;
        }
        if (err.code === err.TIMEOUT) {
          reject(new GeolocationError("timeout", "Timed out while getting your location. Try again."));
          return;
        }
        reject(new GeolocationError("unknown", err.message || "Could not get your location"));
      },
      {
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: timeoutMs,
        maximumAge: 30_000,
      }
    );
  });
}

export function detectPunchSource(): "web" | "mobile" {
  if (typeof navigator === "undefined") return "web";
  const ua = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ? "mobile" : "web";
}
