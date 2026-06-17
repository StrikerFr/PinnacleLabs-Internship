// Server-only Groq client. NEVER import from client code.
import Groq from "groq-sdk";

let _client: Groq | null = null;
function client() {
  if (_client) return _client;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  _client = new Groq({ apiKey });
  return _client;
}

export const GROQ_REASONING = "llama-3.3-70b-versatile";
export const GROQ_FAST = "llama-3.1-8b-instant";

type Msg = { role: "system" | "user" | "assistant"; content: string };

export async function groqJSON<T = unknown>(opts: {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
}): Promise<T> {
  const res = await client().chat.completions.create({
    model: opts.model ?? GROQ_REASONING,
    temperature: opts.temperature ?? 0.6,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: opts.system + "\n\nReturn ONLY valid JSON. No markdown, no commentary.",
      },
      { role: "user", content: opts.user },
    ],
  });
  const raw = res.choices[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(raw) as T;
  } catch {
    // best-effort recovery
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]) as T;
    throw new Error("Groq returned non-JSON response");
  }
}

export async function groqText(
  messages: Msg[],
  opts?: { model?: string; temperature?: number },
): Promise<string> {
  const res = await client().chat.completions.create({
    model: opts?.model ?? GROQ_REASONING,
    temperature: opts?.temperature ?? 0.7,
    messages,
  });
  return res.choices[0]?.message?.content ?? "";
}

// Standard envelope every AI response should fit into.
export type AIEnvelope<T> = {
  analysis: string;
  actionItems: string[];
  timeline: string;
  priority: "low" | "medium" | "high";
  confidence: number; // 0-1
  data: T;
};

export const ENVELOPE_INSTRUCTION = `
Always structure your response as a JSON object with this exact shape:
{
  "analysis": "concise expert analysis, 2-3 sentences",
  "actionItems": ["actionable step", "..."],
  "timeline": "human-friendly timeline e.g. '4 weeks'",
  "priority": "low" | "medium" | "high",
  "confidence": number between 0 and 1,
  "data": { ...task-specific payload... }
}
`.trim();
