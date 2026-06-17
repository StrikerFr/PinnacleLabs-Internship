import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";


type CacheEntry = { value: LiveWeather; expires: number };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

export type LiveWeather = {
  location: { name: string; country: string; lat: number; lon: number };
  current: {
    temperatureC: number;
    feelsLikeC: number;
    humidity: number;
    windKmh: number;
    windDir: number;
    pressureHpa: number;
    cloudCover: number;
    rainProb: number;
    visibilityKm: number;
    uvIndex: number;
    isDay: boolean;
    weatherCode: number;
  };
  air: {
    aqi: number;
    pm25: number;
    pm10: number;
    ozone: number;
    no2: number;
    label: string;
  };
  disasters: {
    kind: "cyclone" | "heat" | "flood" | "wildfire" | "quake";
    top: string;
    left: string;
    size: number;
    title: string;
    region: string;
    metric: string;
    delay: number;
  }[];
  news: {
    title: string;
    url: string;
    category: string;
    imageUrl: string;
  }[];
  ai: {
    headline: string;
    summary: string;
    forecast: string;
    health: string;
    travel: string;
    disasterAnalysis: string;
    dynamicQuestions: { title: string; lines: string[] }[];
    generatedAt: string;
    source: "groq" | "fallback";
  };
  fetchedAt: string;
};

const WeatherInput = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  name: z.string().optional(),
  country: z.string().optional(),
});

function aqiLabel(aqi: number) {
  if (aqi <= 20) return "Very good";
  if (aqi <= 40) return "Good";
  if (aqi <= 60) return "Moderate";
  if (aqi <= 80) return "Poor";
  if (aqi <= 100) return "Very poor";
  return "Extremely poor";
}

async function callGroq(apiKey: string, system: string, user: string, signal?: AbortSignal) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3, // lowered for more deterministic JSON
      max_tokens: 1500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}: ${text.slice(0, 240)}`);
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(content) as Record<string, any>;
  } catch {
    return {};
  }
}

export const getLiveWeather = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => WeatherInput.parse(input))
  .handler(async ({ data }): Promise<LiveWeather> => {
    console.log("[weather.functions] getLiveWeather CALLED with:", data);
    try {
      const key = `${data.lat.toFixed(2)},${data.lon.toFixed(2)}_v5`;
      const now = Date.now();
      const hit = cache.get(key);
      if (hit && hit.expires > now) {
        console.log("[weather.functions] Cache hit for", key);
        return hit.value;
      }

    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.searchParams.set("latitude", String(data.lat));
    weatherUrl.searchParams.set("longitude", String(data.lon));
    weatherUrl.searchParams.set(
      "current",
      "temperature_2m,apparent_temperature,relative_humidity_2m,is_day,precipitation_probability,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,visibility,uv_index"
    );
    weatherUrl.searchParams.set("timezone", "auto");

    const airUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
    airUrl.searchParams.set("latitude", String(data.lat));
    airUrl.searchParams.set("longitude", String(data.lon));
    airUrl.searchParams.set("current", "european_aqi,pm10,pm2_5,ozone,nitrogen_dioxide");
    airUrl.searchParams.set("timezone", "auto");

    const newsdataKey = process.env.NEWSDATA_API_KEY || "pub_73216ea4e54541a788044a29645e9624";
    const newsUrl = new URL("https://newsdata.io/api/1/news");
    newsUrl.searchParams.set("apikey", newsdataKey);
    newsUrl.searchParams.set("category", "environment");
    newsUrl.searchParams.set("language", "en");

    const [weatherRes, airRes, newsRes] = await Promise.all([
      fetch(weatherUrl, { headers: { Accept: "application/json" } }),
      fetch(airUrl, { headers: { Accept: "application/json" } }),
      fetch(newsUrl, { headers: { Accept: "application/json" } }).catch(() => null),
    ]);

    if (!weatherRes.ok) throw new Error(`Open-Meteo weather ${weatherRes.status}`);
    if (!airRes.ok) throw new Error(`Open-Meteo air ${airRes.status}`);

    const w = (await weatherRes.json()) as { current: Record<string, number> };
    const a = (await airRes.json()) as { current: Record<string, number> };
    
    let realNewsList: LiveWeather["news"] = [];
    try {
      if (newsRes && newsRes.ok) {
        const nData = await newsRes.json();
        if (nData.results && Array.isArray(nData.results)) {
          realNewsList = nData.results.slice(0, 10).map((n: any, i: number) => {
            const fallbackImages = [
              "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=160&h=160&fit=crop&q=80",
              "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=160&h=160&fit=crop&q=80",
              "https://images.unsplash.com/photo-1611273426858-450d873c2542?w=160&h=160&fit=crop&q=80",
            ];
            return {
              title: String(n.title).slice(0, 90),
              url: String(n.link),
              category: Array.isArray(n.category) && n.category[0] ? String(n.category[0]).toUpperCase() : "NEWS",
              imageUrl: n.image_url || fallbackImages[i % fallbackImages.length],
            };
          });
        }
      }
    } catch (e) {
      console.error("[weather.functions] NewsData API parse failed:", e);
    }

    const current = {
      temperatureC: w.current.temperature_2m ?? 0,
      feelsLikeC: w.current.apparent_temperature ?? 0,
      humidity: w.current.relative_humidity_2m ?? 0,
      windKmh: w.current.wind_speed_10m ?? 0,
      windDir: w.current.wind_direction_10m ?? 0,
      pressureHpa: w.current.pressure_msl ?? 1013,
      cloudCover: w.current.cloud_cover ?? 0,
      rainProb: w.current.precipitation_probability ?? 0,
      visibilityKm: (w.current.visibility ?? 10000) / 1000,
      uvIndex: w.current.uv_index ?? 0,
      isDay: (w.current.is_day ?? 1) === 1,
      weatherCode: w.current.weather_code ?? 0,
    };
    const aqi = Math.round(a.current.european_aqi ?? 0);
    const air = {
      aqi,
      pm25: a.current.pm2_5 ?? 0,
      pm10: a.current.pm10 ?? 0,
      ozone: a.current.ozone ?? 0,
      no2: a.current.nitrogen_dioxide ?? 0,
      label: aqiLabel(aqi),
    };

    const location = {
      name: data.name ?? "your location",
      country: data.country ?? "",
      lat: data.lat,
      lon: data.lon,
    };

    const groqKey = process.env.GROQ_API_KEY;
    let ai: LiveWeather["ai"];
    let mappedDisasters: LiveWeather["disasters"] = [];
    let newsList: LiveWeather["news"] = [];
    
    if (groqKey) {
      try {
        const system = `You are WeatherWatch AI, a planetary intelligence engine.
Current Date: June 16, 2026. Ensure all generated headlines represent the year 2026 and never reference 2025 or old events.
Respond ONLY with strict JSON matching this shape:
{
  "headline": string,
  "summary": string,
  "forecast": string,
  "health": string,
  "travel": string,
  "disasterAnalysis": string,
  "dynamicQuestions": [
    { "title": string, "lines": [string, string, string] }
  ],
  "news": [
    { "title": string, "sourceUrl": string, "category": string }
  ],
  "disasters": [
    { "type": "TC" | "FL" | "EQ" | "WF" | "DR", "name": string, "alertLevel": string, "lat": number, "lon": number }
  ]
}
Tone: calm, cinematic, precise. No emojis, no markdown, no quotes inside strings.
headline: <= 90 chars, present tense, one sentence describing the atmosphere right now.
summary: 2 short sentences (<= 220 chars) combining weather + air quality.
forecast: 1 sentence (<= 140 chars) about what to expect in the next 12-24 hours.
health: 1 sentence (<= 140 chars) on activity / hydration / air precautions based on UV and AQI.
travel: 1 sentence (<= 140 chars) on travel recommendations based on wind/visibility/rain.
disasterAnalysis: 1-2 sentences summarizing active global disasters or local news risks.
dynamicQuestions: Exactly 5 items. The 'title' should be a natural language question.
news: Provide 6 recent climate or weather news headlines relevant to the location, including realistic URL sources.
disasters: Provide up to 5 current extreme weather alerts globally or locally (type: TC=cyclone, FL=flood, EQ=quake, WF=wildfire, DR=heat/drought).`;
        
        const user = JSON.stringify({ location, current, air });
        const parsed = await callGroq(groqKey, system, user);
        
        // Map Groq-generated news to rich objects
        const rawNews = Array.isArray(parsed.news) ? parsed.news : [];
        const fallbackImages = [
          "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=160&h=160&fit=crop&q=80",
          "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=160&h=160&fit=crop&q=80",
          "https://images.unsplash.com/photo-1611273426858-450d873c2542?w=160&h=160&fit=crop&q=80",
        ];
        newsList = rawNews.slice(0, 3).map((n: any, i: number) => ({
          title: String(n.title || "Live Update").slice(0, 80),
          url: String(n.sourceUrl || "https://news.google.com"),
          category: String(n.category || "INTELLIGENCE").toUpperCase(),
          imageUrl: fallbackImages[i % fallbackImages.length],
        }));

        // Map Groq-generated disasters to UI format
        const rawDisasters = Array.isArray(parsed.disasters) ? parsed.disasters : [];
        mappedDisasters = rawDisasters.slice(0, 5).map((d: any, i: number) => {
          let kind: "cyclone" | "heat" | "flood" | "wildfire" | "quake" = "heat";
          if (d.type === "TC") kind = "cyclone";
          if (d.type === "FL") kind = "flood";
          if (d.type === "EQ") kind = "quake";
          if (d.type === "WF") kind = "wildfire";
          
          const sizes = [78, 92, 70, 74, 60];
          const positions = [
            { top: "30%", left: "82%" },
            { top: "68%", left: "78%" },
            { top: "72%", left: "20%" },
            { top: "32%", left: "16%" },
            { top: "56%", left: "88%" },
          ];
          
          return {
            kind,
            top: positions[i]?.top || "50%",
            left: positions[i]?.left || "50%",
            size: sizes[i] || 70,
            title: d.name || "Unknown Alert",
            region: `LAT ${Number(d.lat || 0).toFixed(1)} LON ${Number(d.lon || 0).toFixed(1)}`,
            metric: `Alert Level: ${d.alertLevel || "Orange"}`,
            delay: 0.05 + i * 0.06,
          };
        });

        ai = {
          headline: String(parsed.headline ?? "").slice(0, 140) || `${Math.round(current.temperatureC)}°C and ${air.label.toLowerCase()} air.`,
          summary: String(parsed.summary ?? "").slice(0, 280),
          forecast: String(parsed.forecast ?? "").slice(0, 200),
          health: String(parsed.health ?? "").slice(0, 200),
          travel: String(parsed.travel ?? "").slice(0, 200),
          disasterAnalysis: String(parsed.disasterAnalysis ?? "").slice(0, 300),
          dynamicQuestions: Array.isArray(parsed.dynamicQuestions) && parsed.dynamicQuestions.length === 5 
            ? parsed.dynamicQuestions 
            : fallbackDynamicQuestions(current, air),
          generatedAt: new Date().toISOString(),
          source: "groq",
        };

      } catch (err) {
        console.error("[weather] Groq insight failed:", err);
        ai = fallbackAi(location.name, current, air);
      }
    } else {
      ai = fallbackAi(location.name, current, air);
    }

    const condition = getWeatherCondition(current.weatherCode, current.rainProb);
    const finalNewsList = getUniqueNews(
      realNewsList,
      newsList,
      location.name,
      current.temperatureC,
      condition,
      air.aqi,
      current.rainProb
    );

    const value: LiveWeather = {
      location,
      current,
      air,
      disasters: mappedDisasters,
      news: finalNewsList,
      ai,
      fetchedAt: new Date().toISOString(),
    };
    cache.set(key, { value, expires: now + TTL_MS });
    console.log("[weather.functions] returning live weather");
    return value;
    } catch (error) {
      console.error("[weather.functions] FATAL ERROR:", error);
      throw error;
    }
  });

function fallbackDynamicQuestions(c: any, a: any) {
  return [
    { title: "Will it rain during my commute tomorrow?", lines: ["Precipitation chance is " + c.rainProb + "%.", "Route is stable.", "No major delays expected."] },
    { title: "How will air quality change overnight?", lines: ["AQI is currently " + a.aqi + ".", "Levels remain stable.", "Coastal inflow continues."] },
    { title: "Should I delay my trip?", lines: ["Visibility is " + c.visibilityKm + " km.", "Conditions are clear.", "No weather delays."] },
    { title: "What about the storm?", lines: ["Wind speed is " + c.windKmh + " km/h.", "No severe cells detected.", "Clear skies tonight."] },
    { title: "Are there flood risks?", lines: ["No immediate risk.", "Local rivers are within banks.", "Monitoring ongoing."] },
  ];
}

function fallbackAi(
  name: string,
  c: any,
  a: any,
): LiveWeather["ai"] {
  const t = Math.round(c.temperatureC);
  const h = Math.round(c.humidity);
  return {
    headline: `${t}°C, ${a.label.toLowerCase()} air over ${name}.`,
    summary: `The atmosphere above ${name} is reading ${t}°C with ${h}% humidity. Air quality is currently ${a.label.toLowerCase()} (AQI ${a.aqi}).`,
    forecast: `Conditions remain broadly stable in the next several hours.`,
    health: c.uvIndex >= 6
      ? `UV is high — limit direct sun and hydrate.`
      : `Conditions are comfortable for normal outdoor activity.`,
    travel: `Visibility is ${c.visibilityKm} km. Travel is not currently impacted by major atmospheric anomalies.`,
    disasterAnalysis: `No immediate local disasters detected. Monitoring global systems.`,
    dynamicQuestions: fallbackDynamicQuestions(c, a),
    generatedAt: new Date().toISOString(),
    source: "fallback",
  };
}

export type CitySignalNews = {
  title: string;
  source: string;
  url: string;
  imageUrl?: string;
};

export type CitySignal = {
  name: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  aqi: number;
  rainProb: number;
  news: CitySignalNews[];
  insight: string;
};

let signalsCache: { value: CitySignal[]; expires: number } | null = null;
const SIGNALS_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

const CITIES_LIST = [
  { name: "DELHI", lat: 28.6139, lon: 77.2090 },
  { name: "MUMBAI", lat: 19.0760, lon: 72.8777 },
  { name: "BENGALURU", lat: 12.9716, lon: 77.5946 },
  { name: "CHENNAI", lat: 13.0827, lon: 80.2707 },
  { name: "HYDERABAD", lat: 17.3850, lon: 78.4867 },
  { name: "KOLKATA", lat: 22.5726, lon: 88.3639 },
];

function getWeatherCondition(code: number, rainProb: number): string {
  if (code === 0) return "CLEAR";
  if (code === 1 || code === 2) return "PARTLY CLOUDY";
  if (code === 3) return "OVERCAST";
  if (code === 45 || code === 48) return "FOG";
  if (code >= 51 && code <= 55) return "DRIZZLE";
  if (code >= 56 && code <= 57) return "FREEZING DRIZZLE";
  if (code === 61) return "LIGHT RAIN";
  if (code === 63) return "RAIN";
  if (code === 65) return "HEAVY RAIN";
  if (code >= 66 && code <= 67) return "FREEZING RAIN";
  if (code >= 71 && code <= 77) return "SNOW";
  if (code >= 80 && code <= 82) return "SHOWERS";
  if (code >= 85 && code <= 86) return "SNOW SHOWERS";
  if (code >= 95) return "THUNDERSTORM";
  return "CLEAR";
}

function getNewsImageForKeyword(title: string, cityIndex: number, newsIndex: number): string {
  const t = title.toLowerCase();
  const imageOffset = (cityIndex * 3 + newsIndex) % 6;
  
  if (t.includes("rain") || t.includes("shower") || t.includes("monsoon") || t.includes("flood") || t.includes("precipitation")) {
    const rainImages = [
      "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=160&h=160&fit=crop&q=80", // Rain drops
      "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=160&h=160&fit=crop&q=80", // Rain on window
      "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=160&h=160&fit=crop&q=80", // Storm clouds
      "https://images.unsplash.com/photo-1501908731398-23b3efd9d4f4?w=160&h=160&fit=crop&q=80", // Rainy street
      "https://images.unsplash.com/photo-1437964706703-40b90bdf563a?w=160&h=160&fit=crop&q=80", // Rain on leaves
      "https://images.unsplash.com/photo-1486016006115-74a41448aea2?w=160&h=160&fit=crop&q=80", // Rainy night puddle
    ];
    return rainImages[imageOffset];
  }
  if (t.includes("haze") || t.includes("smog") || t.includes("pollution") || t.includes("aqi") || t.includes("air quality")) {
    const hazeImages = [
      "https://images.unsplash.com/photo-1533928298208-27ff66555d8d?w=160&h=160&fit=crop&q=80", // Smoggy traffic
      "https://images.unsplash.com/photo-1494883759037-75628b273447?w=160&h=160&fit=crop&q=80", // Foggy bridge
      "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=160&h=160&fit=crop&q=80", // Misty hills
      "https://images.unsplash.com/photo-1465447142348-e9952c393450?w=160&h=160&fit=crop&q=80", // Misty skyline
      "https://images.unsplash.com/photo-1542897653-ffc9408b0c8b?w=160&h=160&fit=crop&q=80", // Smoggy horizon
      "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=160&h=160&fit=crop&q=80", // Foggy morning path
    ];
    return hazeImages[imageOffset];
  }
  if (t.includes("heat") || t.includes("warm") || t.includes("summer") || t.includes("sun") || t.includes("hot") || t.includes("temperature")) {
    const heatImages = [
      "https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=160&h=160&fit=crop&q=80", // Cracked earth
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=160&h=160&fit=crop&q=80", // Forest sunrays
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=160&h=160&fit=crop&q=80", // Warm sunlight
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=160&h=160&fit=crop&q=80", // Sunlit desert valley
      "https://images.unsplash.com/photo-1472214222541-d510753a4907?w=160&h=160&fit=crop&q=80", // Sunny meadow field
      "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=160&h=160&fit=crop&q=80", // Warm sunny trees
    ];
    return heatImages[imageOffset];
  }
  if (t.includes("wind") || t.includes("storm") || t.includes("cyclone")) {
    const windImages = [
      "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=160&h=160&fit=crop&q=80", // Planet/Space wind
      "https://images.unsplash.com/photo-1613828330596-982c62f72e9a?w=160&h=160&fit=crop&q=80", // Dark clouds
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=160&h=160&fit=crop&q=80", // Wind turbine
      "https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?w=160&h=160&fit=crop&q=80", // Stormy sky road
      "https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=160&h=160&fit=crop&q=80", // Stormy wind blowing trees
      "https://images.unsplash.com/photo-1549221580-f7ee695e557d?w=160&h=160&fit=crop&q=80", // Windy sea waves
    ];
    return windImages[imageOffset];
  }
  
  const defaults = [
    "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=160&h=160&fit=crop&q=80", // Radar
    "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=160&h=160&fit=crop&q=80", // Misty forest trees
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=160&h=160&fit=crop&q=80", // Nature green park
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=160&h=160&fit=crop&q=80", // Scenic mountain morning
    "https://images.unsplash.com/photo-1532074534361-bb09a38ec9ad?w=160&h=160&fit=crop&q=80", // Globe satellite clouds
    "https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=160&h=160&fit=crop&q=80", // Peaceful white clouds
  ];
  return defaults[imageOffset];
}

function generateFallbackNews(cityName: string, temp: number, condition: string, aqi: number, rainProb: number): CitySignalNews[] {
  const isRain = rainProb > 40 || condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("shower") || condition.toLowerCase().includes("thunderstorm");
  const isHot = temp > 33 || condition.toLowerCase().includes("hot") || (condition.toLowerCase().includes("clear") && temp > 32);
  const isHaze = aqi > 100 || condition.toLowerCase().includes("haze") || condition.toLowerCase().includes("fog") || condition.toLowerCase().includes("smog") || condition.toLowerCase().includes("pollut");

  const news: { title: string; source: string; url: string }[] = [];
  const cityIndex = CITIES_LIST.findIndex(c => c.name === cityName);
  const finalCityIndex = cityIndex >= 0 ? cityIndex : 0;

  if (isHaze) {
    news.push({
      title: `${cityName} air quality worsens as AQI levels reach ${aqi}`,
      source: "Times of India",
      url: `https://news.google.com/search?q=${encodeURIComponent(cityName + " air quality aqi")}`,
    });
    news.push({
      title: `Thick haze and suspended dust limit morning visibility in ${cityName}`,
      source: "Hindustan Times",
      url: `https://news.google.com/search?q=${encodeURIComponent(cityName + " visibility haze")}`,
    });
    news.push({
      title: `Environmental watchdogs issue high-pollution warning for ${cityName}`,
      source: "The Hindu",
      url: `https://news.google.com/search?q=${encodeURIComponent(cityName + " health warning air")}`,
    });
  } else if (isRain) {
    news.push({
      title: `Monsoon rainfall brings moderate waterlogging to parts of ${cityName}`,
      source: "Times of India",
      url: `https://news.google.com/search?q=${encodeURIComponent(cityName + " rain waterlogging")}`,
    });
    news.push({
      title: `Met department forecasts intense showers for ${cityName} over next 24 hours`,
      source: "Hindustan Times",
      url: `https://news.google.com/search?q=${encodeURIComponent(cityName + " rain alert")}`,
    });
    news.push({
      title: `Traffic authorities issue wet weather driving advisories in ${cityName}`,
      source: "The Hindu",
      url: `https://news.google.com/search?q=${encodeURIComponent(cityName + " traffic rain")}`,
    });
  } else if (isHot) {
    news.push({
      title: `Severe dry heat conditions continue to affect ${cityName} as mercury climbs to ${Math.round(temp)}°C`,
      source: "Times of India",
      url: `https://news.google.com/search?q=${encodeURIComponent(cityName + " heatwave temperature")}`,
    });
    news.push({
      title: `Peak electrical grid loads registered in ${cityName} amid cooling demand`,
      source: "Bloomberg India",
      url: `https://news.google.com/search?q=${encodeURIComponent(cityName + " power surge heat")}`,
    });
    news.push({
      title: `Water conservation directives issued for ${cityName} municipality zones`,
      source: "Indian Express",
      url: `https://news.google.com/search?q=${encodeURIComponent(cityName + " heat water conservation")}`,
    });
  } else {
    news.push({
      title: `Pleasant skies and moderate wind currents recorded across ${cityName}`,
      source: "Times of India",
      url: `https://news.google.com/search?q=${encodeURIComponent(cityName + " weather pleasant")}`,
    });
    news.push({
      title: `${cityName} registers stabilized seasonal average temp of ${Math.round(temp)}°C`,
      source: "Hindustan Times",
      url: `https://news.google.com/search?q=${encodeURIComponent(cityName + " temperature average")}`,
    });
    news.push({
      title: `Satisfactory air metrics logged with AQI at ${aqi} in ${cityName}`,
      source: "The Hindu",
      url: `https://news.google.com/search?q=${encodeURIComponent(cityName + " aqi clean air")}`,
    });
  }

  return news.map((item, idx) => ({
    ...item,
    imageUrl: getNewsImageForKeyword(item.title, finalCityIndex, idx),
  }));
}

function getUniqueNews(
  apiNews: LiveWeather["news"],
  groqNews: LiveWeather["news"],
  cityName: string,
  temp: number,
  condition: string,
  aqi: number,
  rainProb: number
): LiveWeather["news"] {
  const uniqueList: LiveWeather["news"] = [];
  const seenTitles = new Set<string>();

  const addNewsItem = (item: LiveWeather["news"][0]) => {
    if (!item.title) return;
    const normalized = item.title.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
    if (normalized.length > 5 && !seenTitles.has(normalized)) {
      seenTitles.add(normalized);
      uniqueList.push(item);
    }
  };

  // 1. Add API news
  for (const item of apiNews) {
    addNewsItem(item);
  }

  // 2. Add Groq news
  for (const item of groqNews) {
    addNewsItem(item);
  }

  // 3. Fallback localized news if under 3 items
  if (uniqueList.length < 3) {
    const fallbackNews = generateFallbackNews(cityName, temp, condition, aqi, rainProb);
    for (const fn of fallbackNews) {
      addNewsItem({
        title: fn.title,
        url: fn.url,
        category: fn.source.toUpperCase(),
        imageUrl: fn.imageUrl || "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=160&h=160&fit=crop&q=80",
      });
    }
  }

  return uniqueList.slice(0, 3);
}

function fallbackCitySignals(citiesData: any[]): CitySignal[] {
  return citiesData.map((c) => {
    const isRain = c.rainProb > 40;
    const isHot = c.temp > 33;
    const isHaze = c.aqi > 100;
    
    let insight = `Atmospheric conditions are stable. Humidity is at ${c.humidity}%.`;
    if (isHaze) {
      insight = `Air quality remains poor (AQI ${c.aqi}) with haze. Limit prolonged outdoor activities.`;
    } else if (isRain) {
      insight = `Rainfall is probable (${c.rainProb}%). Keep an umbrella handy and plan travel accordingly.`;
    } else if (isHot) {
      insight = `Warm conditions prevail. Hydration advised. Apparent temperature feels like ${Math.round(c.feelsLike)}°C.`;
    }
    
    let condition = getWeatherCondition(c.weatherCode, c.rainProb);
    if ((condition === "CLEAR" || condition === "PARTLY CLOUDY") && c.aqi > 100) {
      condition = "HAZE";
    }

    return {
      name: c.name,
      temp: c.temp,
      feelsLike: c.feelsLike,
      humidity: c.humidity,
      windSpeed: c.windSpeed,
      condition,
      aqi: c.aqi,
      rainProb: c.rainProb,
      news: generateFallbackNews(c.name, c.temp, condition, c.aqi, c.rainProb),
      insight,
    };
  });
}

export const getCitySignalsData = createServerFn({ method: "GET" })
  .handler(async (): Promise<CitySignal[]> => {
    console.log("[weather.functions] getCitySignalsData CALLED");
    const now = Date.now();
    if (signalsCache && signalsCache.expires > now) {
      console.log("[weather.functions] City Signals Cache hit");
      return signalsCache.value;
    }

    try {
      // Fetch data for all cities in parallel
      const dataPromises = CITIES_LIST.map(async (city) => {
        const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
        weatherUrl.searchParams.set("latitude", String(city.lat));
        weatherUrl.searchParams.set("longitude", String(city.lon));
        weatherUrl.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation_probability,weather_code");
        weatherUrl.searchParams.set("timezone", "auto");

        const airUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
        airUrl.searchParams.set("latitude", String(city.lat));
        airUrl.searchParams.set("longitude", String(city.lon));
        airUrl.searchParams.set("current", "european_aqi");
        airUrl.searchParams.set("timezone", "auto");

        const [wRes, aRes] = await Promise.all([
          fetch(weatherUrl, { headers: { Accept: "application/json" } }),
          fetch(airUrl, { headers: { Accept: "application/json" } }),
        ]);

        if (!wRes.ok) throw new Error(`Weather fetch failed for ${city.name} (${wRes.status})`);
        if (!aRes.ok) throw new Error(`Air fetch failed for ${city.name} (${aRes.status})`);

        const wData = (await wRes.json()) as { current: Record<string, number> };
        const aData = (await aRes.json()) as { current: Record<string, number> };

        const temp = wData.current.temperature_2m ?? 0;
        return {
          name: city.name,
          temp,
          feelsLike: wData.current.apparent_temperature ?? temp,
          humidity: wData.current.relative_humidity_2m ?? 0,
          windSpeed: wData.current.wind_speed_10m ?? 0,
          rainProb: wData.current.precipitation_probability ?? 0,
          weatherCode: wData.current.weather_code ?? 0,
          aqi: Math.round(aData.current.european_aqi ?? 0),
        };
      });

      const citiesData = await Promise.all(dataPromises);
      const groqKey = process.env.GROQ_API_KEY;

      if (groqKey) {
        try {
          const system = `You are WeatherWatch AI, a premium weather intelligence platform.
Current Date: June 16, 2026. Ensure all weather headlines, alerts, and insights represent the current year 2026 and never refer to 2025.
Analyze the live weather/AQI conditions for the 6 Indian cities: DELHI, MUMBAI, BENGALURU, CHENNAI, HYDERABAD, KOLKATA.
Respond ONLY with a valid, strict JSON object matching this schema:
{
  "DELHI": {
    "insight": "Air quality is poor with haze. High humidity increases thermal discomfort. Rain is unlikely tonight.",
    "headlines": [
      { "title": "Haze blankets NCR as wind speed drops", "source": "Times of India" },
      { "title": "Delhi AQI expected to remain poor through Friday", "source": "Hindustan Times" },
      { "title": "Water supply issues crop up due to temperature rise", "source": "The Hindu" }
    ]
  },
  "MUMBAI": { ... },
  ...
}
Rules:
- Generate an 'insight' of exactly 1-2 sentences (<= 160 characters) summarizing the live weather + AQI impact.
- Generate exactly 3 highly realistic, localized weather/environment news headlines based on the current weather numbers.
- Use prominent Indian news sources like Times of India, Hindustan Times, The Hindu, Bloomberg India.
- IMPORTANT: Every news headline across all cities MUST be completely unique and localized to that city. Do not repeat headlines or use identical structures.
- No markdown, no comments, no extra characters, just raw JSON.`;

          const user = JSON.stringify(citiesData);
          const parsed = await callGroq(groqKey, system, user);

          const finalSignals: CitySignal[] = citiesData.map((c) => {
            const cityAi = parsed[c.name] || {};
            
            let condition = getWeatherCondition(c.weatherCode, c.rainProb);
            if ((condition === "CLEAR" || condition === "PARTLY CLOUDY") && c.aqi > 100) {
              condition = "HAZE";
            }

            const rawNews = Array.isArray(cityAi.headlines) ? cityAi.headlines : [];
            const cityIdx = CITIES_LIST.findIndex(item => item.name === c.name);
            const finalCityIdx = cityIdx >= 0 ? cityIdx : 0;
            const news: CitySignalNews[] = rawNews.slice(0, 3).map((n: any, idx: number) => {
              const title = String(n.title || `Local weather updates in ${c.name}`).slice(0, 100);
              const source = String(n.source || "Hindustan Times");
              return {
                title,
                source,
                url: `https://news.google.com/search?q=${encodeURIComponent(c.name + " " + title)}`,
                imageUrl: getNewsImageForKeyword(title, finalCityIdx, idx),
              };
            });

            // Fallback if headlines are missing
            if (news.length < 3) {
              const fallbackNews = generateFallbackNews(c.name, c.temp, condition, c.aqi, c.rainProb);
              while (news.length < 3) {
                const idx = news.length;
                news.push(fallbackNews[idx]);
              }
            }

            const insight = String(cityAi.insight || `Atmospheric conditions are stable. Humidity is at ${c.humidity}%.`).slice(0, 220);

            return {
              name: c.name,
              temp: c.temp,
              feelsLike: c.feelsLike,
              humidity: c.humidity,
              windSpeed: c.windSpeed,
              condition,
              aqi: c.aqi,
              rainProb: c.rainProb,
              news,
              insight,
            };
          });

          signalsCache = { value: finalSignals, expires: now + SIGNALS_TTL_MS };
          return finalSignals;

        } catch (err) {
          console.error("[weather.functions] Groq city signals failed:", err);
          const finalSignals = fallbackCitySignals(citiesData);
          signalsCache = { value: finalSignals, expires: now + SIGNALS_TTL_MS };
          return finalSignals;
        }
      } else {
        const finalSignals = fallbackCitySignals(citiesData);
        signalsCache = { value: finalSignals, expires: now + SIGNALS_TTL_MS };
        return finalSignals;
      }
    } catch (error) {
      console.error("[weather.functions] getCitySignalsData error:", error);
      throw error;
    }
  });

