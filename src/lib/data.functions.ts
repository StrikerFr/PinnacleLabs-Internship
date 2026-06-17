import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { readDB, writeDB, LOCAL_USER_ID, genId } from "./local-db.server";

export const getProfile = createServerFn({ method: "GET" }).handler(async () => {
  const db = await readDB();
  return db.profiles[LOCAL_USER_ID] || null;
});

const ProfileUpdate = z.object({
  full_name: z.string().min(1).max(120).optional(),
  education: z.string().max(200).optional(),
  current_year: z.string().max(60).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  skills: z.array(z.string().min(1).max(60)).max(50).optional(),
  experience: z.string().max(2000).optional(),
  projects: z.array(z.string().min(1).max(200)).max(20).optional(),
  dream_role: z.string().max(120).optional(),
  dream_company: z.string().max(120).optional(),
  target_timeline: z.string().max(60).optional(),
  onboarded: z.boolean().optional(),
});

export const updateProfile = createServerFn({ method: "POST" })
  .validator((d: unknown) => ProfileUpdate.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    const existing = db.profiles[LOCAL_USER_ID] || {
      id: LOCAL_USER_ID,
      created_at: new Date().toISOString(),
    };
    const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
    db.profiles[LOCAL_USER_ID] = updated;
    await writeDB(db);
    return updated;
  });

export const listRoadmaps = createServerFn({ method: "GET" }).handler(async () => {
  const db = await readDB();
  return db.roadmaps
    .filter((r) => r.user_id === LOCAL_USER_ID)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
});

export const getPrimaryRoadmap = createServerFn({ method: "GET" }).handler(async () => {
  const db = await readDB();
  return db.roadmaps.find((r) => r.user_id === LOCAL_USER_ID && r.is_primary) || null;
});

const SetPrimary = z.object({ roadmapId: z.string() });
export const setPrimaryRoadmap = createServerFn({ method: "POST" })
  .validator((d: unknown) => SetPrimary.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    db.roadmaps = db.roadmaps.map((r) => {
      if (r.user_id === LOCAL_USER_ID) {
        return { ...r, is_primary: r.id === data.roadmapId };
      }
      return r;
    });
    await writeDB(db);
    return { ok: true };
  });

export const latestCareerReport = createServerFn({ method: "GET" }).handler(async () => {
  const db = await readDB();
  const reports = db.career_reports
    .filter((r) => r.user_id === LOCAL_USER_ID)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return reports[0] || null;
});

export const listSkillMarket = createServerFn({ method: "GET" }).handler(async () => {
  // Mock data for skill market
  return [
    {
      id: "1",
      name: "AI Agents",
      category: "AI/ML",
      demand_score: 95,
      growth_pct: 142,
      trend: "up",
      difficulty: "high",
      outlook: "Explosive demand across product & infra teams",
      companies: ["OpenAI", "Anthropic", "Google", "Microsoft"],
      sparkline: [40, 52, 61, 70, 78, 85, 92, 95],
    },
    {
      id: "2",
      name: "TypeScript",
      category: "Languages",
      demand_score: 93,
      growth_pct: 12,
      trend: "up",
      difficulty: "low",
      outlook: "Default frontend & full-stack language",
      companies: ["Stripe", "Linear", "Vercel", "Shopify"],
      sparkline: [85, 87, 88, 89, 90, 91, 92, 93],
    },
    {
      id: "3",
      name: "System Design",
      category: "Engineering",
      demand_score: 92,
      growth_pct: 18,
      trend: "up",
      difficulty: "high",
      outlook: "Required for senior IC tracks at top companies",
      companies: ["Google", "Meta", "Amazon", "Stripe"],
      sparkline: [80, 82, 84, 85, 87, 89, 91, 92],
    },
  ];
});

export const listConversations = createServerFn({ method: "GET" }).handler(async () => {
  const db = await readDB();
  return db.coach_conversations
    .filter((c) => c.user_id === LOCAL_USER_ID)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
});

const ConvId = z.object({ conversationId: z.string() });
export const getMessages = createServerFn({ method: "POST" })
  .validator((d: unknown) => ConvId.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    return db.coach_messages
      .filter((m) => m.conversation_id === data.conversationId && m.user_id === LOCAL_USER_ID)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  });

export const progressSummary = createServerFn({ method: "GET" }).handler(async () => {
  const db = await readDB();
  const tasks = db.roadmap_tasks.filter((t) => t.user_id === LOCAL_USER_ID);
  const events = db.progress_events
    .filter((e) => e.user_id === LOCAL_USER_ID)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 200);
  const roadmaps = db.roadmaps.filter((r) => r.user_id === LOCAL_USER_ID);

  const completed = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length;
  const hours = events.reduce((s, e) => s + Number(e.hours || 0), 0);
  return {
    tasksCompleted: completed,
    tasksTotal: total,
    learningHours: Math.round(hours * 10) / 10,
    roadmaps: roadmaps,
    events: events,
  };
});

const TaskInput = z.object({
  roadmapId: z.string().optional(),
  title: z.string().min(1).max(200),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  phaseIndex: z.number().int().min(0).optional(),
});
export const addTask = createServerFn({ method: "POST" })
  .validator((d: unknown) => TaskInput.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    const t = {
      id: genId(),
      user_id: LOCAL_USER_ID,
      roadmap_id: data.roadmapId ?? null,
      title: data.title,
      priority: data.priority,
      phase_index: data.phaseIndex ?? null,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.roadmap_tasks.push(t);
    await writeDB(db);
    return t;
  });

const ToggleTask = z.object({ id: z.string(), status: z.enum(["pending", "completed"]) });
export const setTaskStatus = createServerFn({ method: "POST" })
  .validator((d: unknown) => ToggleTask.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    const task = db.roadmap_tasks.find((t) => t.id === data.id && t.user_id === LOCAL_USER_ID);
    if (task) {
      task.status = data.status;
      task.completed_at = data.status === "completed" ? new Date().toISOString() : null;
      task.updated_at = new Date().toISOString();
      if (data.status === "completed") {
        db.progress_events.push({
          id: genId(),
          user_id: LOCAL_USER_ID,
          event_type: "task_completed",
          hours: 1,
          created_at: new Date().toISOString(),
        });
      }
      await writeDB(db);
    }
    return { ok: true };
  });

export const listTasks = createServerFn({ method: "GET" }).handler(async () => {
  const db = await readDB();
  return db.roadmap_tasks
    .filter((t) => t.user_id === LOCAL_USER_ID)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 100);
});
