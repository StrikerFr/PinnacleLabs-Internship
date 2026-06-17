import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLiveWeather, type LiveWeather } from "@/lib/weather.functions";

type Coords = {
  lat: number;
  lon: number;
  name?: string;
  country?: string;
  source: "geolocation" | "ip";
};

async function resolveByIp(): Promise<Coords | null> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const j = (await res.json()) as {
      latitude?: number;
      longitude?: number;
      city?: string;
      country_name?: string;
    };
    if (typeof j.latitude !== "number" || typeof j.longitude !== "number") return null;
    return {
      lat: j.latitude,
      lon: j.longitude,
      name: j.city,
      country: j.country_name,
      source: "ip",
    };
  } catch {
    return null;
  }
}

async function reverseGeocode(lat: number, lon: number) {
  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/reverse");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set("count", "1");
    const res = await fetch(url);
    if (!res.ok) return {};
    const j = (await res.json()) as {
      results?: { name?: string; country?: string }[];
    };
    const r = j.results?.[0];
    return { name: r?.name, country: r?.country };
  } catch {
    return {};
  }
}

function useCoords() {
  const [coords, setCoords] = useState<Coords | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (typeof window === "undefined") return;
      // Try browser geolocation first (only if user already granted, otherwise
      // it will prompt — that's the desired behavior).
      const tryGeo = () =>
        new Promise<Coords | null>((resolve) => {
          if (!("geolocation" in navigator)) return resolve(null);
          const timeout = window.setTimeout(() => resolve(null), 6000);
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              window.clearTimeout(timeout);
              const { name, country } = await reverseGeocode(
                pos.coords.latitude,
                pos.coords.longitude,
              );
              resolve({
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
                name,
                country,
                source: "geolocation",
              });
            },
            () => {
              window.clearTimeout(timeout);
              resolve(null);
            },
            { timeout: 5500, maximumAge: 10 * 60 * 1000 },
          );
        });

      const geo = await tryGeo();
      if (cancelled) return;
      if (geo) {
        setCoords(geo);
        return;
      }
      const ip = await resolveByIp();
      if (cancelled) return;
      if (ip) {
        setCoords(ip);
      } else {
        // Ultimate fallback if geolocation blocked and IP rate-limited
        setCoords({
          lat: 28.6139,
          lon: 77.2090,
          name: "New Delhi",
          country: "India",
          source: "ip",
        });
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return coords;
}

export function useLiveWeather() {
  const coords = useCoords();
  const fetchWeather = useServerFn(getLiveWeather);

  const query = useQuery<LiveWeather>({
    queryKey: coords
      ? ["live-weather", coords.lat.toFixed(2), coords.lon.toFixed(2)]
      : ["live-weather", "pending"],
    queryFn: () =>
      fetchWeather({
        data: {
          lat: coords!.lat,
          lon: coords!.lon,
          name: coords!.name,
          country: coords!.country,
        },
      }),
    enabled: !!coords,
    staleTime: 3 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    coords,
    data: query.data,
    isLoading: query.isLoading || !coords,
    error: query.error,
  };
}

export type { LiveWeather };