import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { readDB, writeDB, LOCAL_USER_ID, genId } from "./local-db.server";

/* ---------- Helpers ---------- */
function isoToday() {
  return new Date().toISOString().slice(0, 10);
}
function weekStart(d = new Date()) {
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // back to Monday
  const m = new Date(d);
  m.setDate(d.getDate() + diff);
  return m.toISOString().slice(0, 10);
}

/* ---------- Schedule blocks ---------- */
const DayArg = z.object({ day: z.string().optional() }).optional();

export const listSchedule = createServerFn({ method: "POST" })
  .validator((d: unknown) => DayArg.parse(d ?? {}))
  .handler(async ({ data }) => {
    const day = data?.day ?? isoToday();
    const db = await readDB();
    return db.schedule_blocks
      .filter((b) => b.user_id === LOCAL_USER_ID && b.day_date === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  });

const BlockInput = z.object({
  day: z.string().optional(),
  start_time: z.string().min(4).max(8),
  end_time: z.string().min(4).max(8).optional(),
  title: z.string().min(1).max(200),
  tag: z.string().min(1).max(40).default("Focus"),
  color: z.string().min(4).max(20).default("#ec4899"),
});

export const addBlock = createServerFn({ method: "POST" })
  .validator((d: unknown) => BlockInput.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    const row = {
      id: genId(),
      user_id: LOCAL_USER_ID,
      day_date: data.day ?? isoToday(),
      start_time: data.start_time,
      end_time: data.end_time ?? null,
      title: data.title,
      tag: data.tag,
      color: data.color,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.schedule_blocks.push(row);
    await writeDB(db);
    return row;
  });

const SetBlockStatus = z.object({ id: z.string(), status: z.enum(["pending", "done", "skipped"]) });
export const setBlockStatus = createServerFn({ method: "POST" })
  .validator((d: unknown) => SetBlockStatus.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    const block = db.schedule_blocks.find((b) => b.id === data.id && b.user_id === LOCAL_USER_ID);
    if (block) {
      block.status = data.status;
      block.updated_at = new Date().toISOString();
      await writeDB(db);
    }
    return { ok: true };
  });

const IdArg = z.object({ id: z.string() });
export const deleteBlock = createServerFn({ method: "POST" })
  .validator((d: unknown) => IdArg.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    db.schedule_blocks = db.schedule_blocks.filter(
      (b) => !(b.id === data.id && b.user_id === LOCAL_USER_ID),
    );
    await writeDB(db);
    return { ok: true };
  });

/* ---------- Weekly goals ---------- */
export const listWeeklyGoals = createServerFn({ method: "GET" }).handler(async () => {
  const db = await readDB();
  const ws = weekStart();
  return db.weekly_goals
    .filter((g) => g.user_id === LOCAL_USER_ID && g.week_start_date === ws)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
});

const GoalInput = z.object({
  title: z.string().min(1).max(200),
  target: z.number().int().min(1).max(99).default(5),
  color: z.string().min(4).max(20).default("#ec4899"),
});
export const addWeeklyGoal = createServerFn({ method: "POST" })
  .validator((d: unknown) => GoalInput.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    const row = {
      id: genId(),
      user_id: LOCAL_USER_ID,
      week_start_date: weekStart(),
      title: data.title,
      target: data.target,
      done: 0,
      color: data.color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.weekly_goals.push(row);
    await writeDB(db);
    return row;
  });

const BumpGoal = z.object({ id: z.string(), delta: z.number().int().min(-99).max(99) });
export const bumpGoal = createServerFn({ method: "POST" })
  .validator((d: unknown) => BumpGoal.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    const cur = db.weekly_goals.find((g) => g.id === data.id && g.user_id === LOCAL_USER_ID);
    if (!cur) return { ok: false };
    const next = Math.max(0, Math.min(cur.target, (cur.done ?? 0) + data.delta));
    cur.done = next;
    cur.updated_at = new Date().toISOString();
    await writeDB(db);
    return { ok: true, done: next };
  });

export const deleteGoal = createServerFn({ method: "POST" })
  .validator((d: unknown) => IdArg.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    db.weekly_goals = db.weekly_goals.filter(
      (g) => !(g.id === data.id && g.user_id === LOCAL_USER_ID),
    );
    await writeDB(db);
    return { ok: true };
  });

/* ---------- Deadlines ---------- */
export const listDeadlines = createServerFn({ method: "GET" }).handler(async () => {
  const db = await readDB();
  return db.deadlines
    .filter((d) => d.user_id === LOCAL_USER_ID && !d.done)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 10);
});

const DeadlineInput = z.object({
  title: z.string().min(1).max(200),
  due_date: z.string().min(8).max(10),
  urgent: z.boolean().default(false),
  color: z.string().min(4).max(20).default("#ec4899"),
});
export const addDeadline = createServerFn({ method: "POST" })
  .validator((d: unknown) => DeadlineInput.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    const row = {
      id: genId(),
      user_id: LOCAL_USER_ID,
      title: data.title,
      due_date: data.due_date,
      urgent: data.urgent,
      color: data.color,
      done: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.deadlines.push(row);
    await writeDB(db);
    return row;
  });

export const completeDeadline = createServerFn({ method: "POST" })
  .validator((d: unknown) => IdArg.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    const dline = db.deadlines.find((d) => d.id === data.id && d.user_id === LOCAL_USER_ID);
    if (dline) {
      dline.done = true;
      dline.updated_at = new Date().toISOString();
      await writeDB(db);
    }
    return { ok: true };
  });

/* ---------- Notes ---------- */
export const listNotes = createServerFn({ method: "GET" }).handler(async () => {
  const db = await readDB();
  return db.notes
    .filter((n) => n.user_id === LOCAL_USER_ID)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })
    .slice(0, 12);
});

const NoteInput = z.object({
  title: z.string().min(1).max(120),
  body: z.string().max(2000).default(""),
  color: z.string().min(4).max(20).default("#fed7aa"),
});
export const addNote = createServerFn({ method: "POST" })
  .validator((d: unknown) => NoteInput.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    const row = {
      id: genId(),
      user_id: LOCAL_USER_ID,
      title: data.title,
      body: data.body,
      color: data.color,
      pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.notes.push(row);
    await writeDB(db);
    return row;
  });

export const togglePinNote = createServerFn({ method: "POST" })
  .validator((d: unknown) => IdArg.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    const cur = db.notes.find((n) => n.id === data.id && n.user_id === LOCAL_USER_ID);
    if (!cur) return { ok: false };
    cur.pinned = !cur.pinned;
    cur.updated_at = new Date().toISOString();
    await writeDB(db);
    return { ok: true };
  });

export const deleteNote = createServerFn({ method: "POST" })
  .validator((d: unknown) => IdArg.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    db.notes = db.notes.filter((n) => !(n.id === data.id && n.user_id === LOCAL_USER_ID));
    await writeDB(db);
    return { ok: true };
  });

/* ---------- Mood ---------- */
export const getMoodToday = createServerFn({ method: "GET" }).handler(async () => {
  const db = await readDB();
  const today = isoToday();
  return db.mood_checkins.find((m) => m.user_id === LOCAL_USER_ID && m.day_date === today) || null;
});

const MoodInput = z.object({
  mood: z.string().min(1).max(20),
  energy: z.number().int().min(0).max(100).default(50),
  focus_score: z.number().min(0).max(10).optional(),
});
export const upsertMood = createServerFn({ method: "POST" })
  .validator((d: unknown) => MoodInput.parse(d))
  .handler(async ({ data }) => {
    const db = await readDB();
    const today = isoToday();
    let row = db.mood_checkins.find((m) => m.user_id === LOCAL_USER_ID && m.day_date === today);
    if (row) {
      row.mood = data.mood;
      row.energy = data.energy;
      row.focus_score = data.focus_score ?? 8.0;
      row.updated_at = new Date().toISOString();
    } else {
      row = {
        id: genId(),
        user_id: LOCAL_USER_ID,
        day_date: today,
        mood: data.mood,
        energy: data.energy,
        focus_score: data.focus_score ?? 8.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.mood_checkins.push(row);
    }
    await writeDB(db);
    return row;
  });
