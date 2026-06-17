import { z } from "zod";

type CacheEntry<T> = { value: T; expires: number };
const cache = new Map<string, CacheEntry<any>>();
const TTL_4_HOURS = 4 * 60 * 60 * 1000;

export type DisasterAlert = {
  id: string;
  type: string; // DR, FL, TC, EQ, WF
  name: string;
  description: string;
  alertLevel: string; // Green, Orange, Red
  lat: number;
  lon: number;
};

export async function getDisasterAlerts(): Promise<DisasterAlert[]> {
  const cacheKey = "gdacs_alerts";
  const now = Date.now();
  const hit = cache.get(cacheKey);
  if (hit && hit.expires > now) return hit.value;

  try {
    const res = await fetch("https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?severity=Orange,Red");
    if (!res.ok) throw new Error("GDACS API failed");
    const data = await res.json();
    
    const alerts: DisasterAlert[] = [];
    if (data && data.features) {
      for (const f of data.features) {
        if (f.geometry && f.geometry.coordinates) {
          alerts.push({
            id: String(f.properties?.eventid || Math.random()),
            type: f.properties?.eventtype || "UNKNOWN",
            name: f.properties?.name || "Unknown Event",
            description: f.properties?.htmldescription || "",
            alertLevel: f.properties?.alertlevel || "Orange",
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
          });
        }
      }
    }
    
    // Sort by severe ones or just keep all (GDACS already filters by Orange/Red)
    cache.set(cacheKey, { value: alerts, expires: now + TTL_4_HOURS });
    return alerts;
  } catch (err) {
    console.error("[data-sources] GDACS fetch failed:", err);
    return [];
  }
}

export type NewsArticle = {
  title: string;
  description: string;
  url: string;
};

export async function getWeatherNews(countryName?: string): Promise<NewsArticle[]> {
  const cacheKey = `news_${countryName || "global"}`;
  const now = Date.now();
  const hit = cache.get(cacheKey);
  if (hit && hit.expires > now) return hit.value;

  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) {
    console.warn("[data-sources] NEWSDATA_API_KEY is missing");
    return [];
  }

  try {
    const query = "weather OR storm OR flood OR wildfire OR earthquake OR climate";
    const url = new URL("https://newsdata.io/api/1/latest");
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("q", query);
    url.searchParams.set("language", "en");
    url.searchParams.set("size", "6");
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("NewsData API failed");
    const data = await res.json();
    
    const articles: NewsArticle[] = (data.results || []).map((r: any) => ({
      title: r.title,
      description: r.description || "",
      url: r.link,
    }));

    cache.set(cacheKey, { value: articles, expires: now + TTL_4_HOURS });
    return articles;
  } catch (err) {
    console.error("[data-sources] NewsData fetch failed:", err);
    return [];
  }
}
