import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import type {
  Profile,
  Roadmap,
  RoadmapTask,
  ScheduleBlock,
  WeeklyGoal,
  Deadline,
  Note,
  MoodCheckin,
  AIEnvelope,
  DailyPlanGenerationData,
} from "../../types";
import {
  getProfile,
  getPrimaryRoadmap,
  listTasks,
  setTaskStatus,
  addTask,
} from "@/lib/data.functions";
import { generateDailyPlan, generateRoadmap } from "@/lib/ai.functions";
import {
  listSchedule,
  addBlock,
  setBlockStatus,
  deleteBlock,
  listWeeklyGoals,
  addWeeklyGoal,
  bumpGoal,
  listDeadlines,
  addDeadline,
  completeDeadline,
  listNotes,
  addNote,
  deleteNote,
  getMoodToday,
  upsertMood,
} from "@/lib/planner.functions";
import {
  Sparkles,
  ArrowRight,
  Sun,
  Plus,
  Flame,
  Zap,
  Clock,
  Check,
  Trophy,
  Rocket,
  Target,
  Brain,
  TrendingUp,
  Calendar,
  Heart,
  Code2,
  Layers,
  X,
  Timer,
  BellRing,
  CalendarDays,
  ListChecks,
  NotebookPen,
  Trash2,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { EmbeddedCoach } from "@/components/dashboard/EmbeddedCoach";

export const Route = createFileRoute("/_authenticated/app/")({
  component: Today,
});

/* ============================================================ helpers */
function greet() {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
}
function isoToday() {
  return new Date().toISOString().slice(0, 10);
}
function fmtTime(t?: string | null) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hh = parseInt(h, 10);
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${m} ${ampm}`;
}
function minsBetween(a: string, b?: string | null) {
  if (!b) return 60;
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  return Math.max(0, bh * 60 + bm - (ah * 60 + am));
}
function dayLabel(dateIso: string) {
  const d = new Date(dateIso + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return `${Math.abs(diff)}d ago`;
  return `In ${diff} days`;
}

const TAG_PALETTE = [
  { tag: "Focus", color: "#ec4899" },
  { tag: "Build", color: "#a855f7" },
  { tag: "Learn", color: "#06b6d4" },
  { tag: "Body", color: "#22c55e" },
  { tag: "Recharge", color: "#f59e0b" },
  { tag: "Reflect", color: "#6366f1" },
];

const NOTE_COLORS = ["#fed7aa", "#fbcfe8", "#ddd6fe", "#bbf7d0", "#bae6fd", "#fef08a"];

/* ============================================================ confetti */
function Confetti({ x, y }: { x: number; y: number }) {
  const colors = ["#ec4899", "#a855f7", "#6366f1", "#06b6d4", "#22c55e", "#f59e0b", "#ff6b6b"];
  return (
    <div className="pointer-events-none fixed z-50" style={{ left: x, top: y }}>
      {Array.from({ length: 18 }).map((_, i) => {
        const tx = (Math.random() - 0.5) * 220;
        const ty = -80 - Math.random() * 140;
        return (
          <span
            key={i}
            className="tp-confetti-piece absolute block rounded-sm"
            style={{
              width: 8,
              height: 12,
              background: colors[i % colors.length],
              ...({ "--tx": `${tx}px`, "--ty": `${ty}px` } as React.CSSProperties),
            }}
          />
        );
      })}
    </div>
  );
}

/* ============================================================ MAIN */
function Today() {
  const navigate = useNavigate();
  const fnProfile = useServerFn(getProfile);
  const fnPrimary = useServerFn(getPrimaryRoadmap);
  const fnTasks = useServerFn(listTasks);
  const fnPlan = useServerFn(generateDailyPlan);
  const fnRoadmap = useServerFn(generateRoadmap);
  const fnToggleTask = useServerFn(setTaskStatus);
  const fnAddTask = useServerFn(addTask);

  const fnSched = useServerFn(listSchedule);
  const fnAddBlock = useServerFn(addBlock);
  const fnBlockStatus = useServerFn(setBlockStatus);
  const fnDelBlock = useServerFn(deleteBlock);

  const fnGoals = useServerFn(listWeeklyGoals);
  const fnAddGoal = useServerFn(addWeeklyGoal);
  const fnBumpGoal = useServerFn(bumpGoal);

  const fnDeadlines = useServerFn(listDeadlines);
  const fnAddDeadline = useServerFn(addDeadline);
  const fnCompleteDeadline = useServerFn(completeDeadline);

  const fnNotes = useServerFn(listNotes);
  const fnAddNote = useServerFn(addNote);
  const fnDelNote = useServerFn(deleteNote);

  const fnGetMood = useServerFn(getMoodToday);
  const fnSetMood = useServerFn(upsertMood);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [primary, setPrimary] = useState<Roadmap | null>(null);
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [mood, setMood] = useState<MoodCheckin | null>(null);

  const [plan, setPlan] = useState<
    AIEnvelope<DailyPlanGenerationData> | { data: { recommendations: string[] } }
  >({
    data: {
      recommendations: [
        "Focus on system design fundamentals today; your upcoming Stripe interview emphasizes architecture.",
        "Your energy is high this morning. It's the perfect time to tackle the hardest LeetCode problem on your list.",
        "You've been studying for 3 hours straight. Schedule a short walk to recharge your cognitive battery.",
      ],
    },
  });
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [genGoal, setGenGoal] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; y: number; k: number } | null>(null);

  const refresh = useCallback(async () => {
    const [p, pr, ts, sc, gs, dl, no, mo] = await Promise.all([
      fnProfile(),
      fnPrimary(),
      fnTasks(),
      fnSched({ data: {} }),
      fnGoals(),
      fnDeadlines(),
      fnNotes(),
      fnGetMood(),
    ]);
    setProfile(p);
    setPrimary(pr);
    setTasks(ts);
    setSchedule(sc);
    setGoals(gs);
    setDeadlines(dl);
    setNotes(no);
    setMood(mo);
    if (p && !p.onboarded) navigate({ to: "/onboarding" });
  }, [fnProfile, fnPrimary, fnTasks, fnSched, fnGoals, fnDeadlines, fnNotes, fnGetMood, navigate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /* derived */
  const name = profile?.full_name?.split(" ")[0] ?? "there";
  const doneTasks = tasks.filter((t) => t.status === "completed");
  const openTasks = tasks.filter((t) => t.status !== "completed");
  const totalTasks = tasks.length || 1;
  const tasksPct = Math.round((doneTasks.length / totalTasks) * 100);

  const focusMins = useMemo(
    () =>
      schedule
        .filter((b: ScheduleBlock) => ["Focus", "Build", "Learn"].includes(b.tag))
        .reduce((s: number, b: ScheduleBlock) => s + minsBetween(b.start_time, b.end_time), 0),
    [schedule],
  );
  const moveMins = useMemo(
    () =>
      schedule
        .filter((b: ScheduleBlock) => ["Body", "Recharge"].includes(b.tag))
        .reduce((s: number, b: ScheduleBlock) => s + minsBetween(b.start_time, b.end_time), 0),
    [schedule],
  );
  const reflectMins = useMemo(
    () =>
      schedule
        .filter((b: ScheduleBlock) => ["Reflect"].includes(b.tag))
        .reduce((s: number, b: ScheduleBlock) => s + minsBetween(b.start_time, b.end_time), 0),
    [schedule],
  );

  const FOCUS_TARGET = 240,
    MOVE_TARGET = 90,
    REFLECT_TARGET = 30;

  const nowMin = (() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  })();
  const currentBlockId = useMemo(() => {
    for (const b of schedule) {
      const [h, m] = b.start_time.split(":").map(Number);
      const start = h * 60 + m;
      const end = b.end_time
        ? (() => {
            const [h2, m2] = b.end_time.split(":").map(Number);
            return h2 * 60 + m2;
          })()
        : start + 60;
      if (nowMin >= start && nowMin < end) return b.id;
    }
    return null;
  }, [schedule, nowMin]);

  /* actions */
  async function generatePlan() {
    setLoadingPlan(true);
    try {
      setPlan(await fnPlan());
      toast.success("Day re-planned");
    } catch (e: unknown) {
      toast.error((e as Error).message || "Could not generate plan");
    } finally {
      setLoadingPlan(false);
    }
  }

  async function toggleBlock(b: ScheduleBlock, evt?: React.MouseEvent) {
    const next = b.status === "done" ? "pending" : "done";
    await fnBlockStatus({ data: { id: b.id, status: next as "pending" | "done" | "skipped" } });
    if (next === "done" && evt) {
      const r = (evt.currentTarget as HTMLElement).getBoundingClientRect();
      setConfetti({ x: r.left + r.width / 2, y: r.top, k: Date.now() });
      setTimeout(() => setConfetti(null), 1000);
    }
    refresh();
  }

  async function makeRoadmap(g: string) {
    if (!g.trim()) return;
    setGenGoal(true);
    try {
      await fnRoadmap({ data: { goal: g.trim() } });
      toast.success("Roadmap created");
      navigate({ to: "/app/roadmaps" });
    } catch (e: unknown) {
      toast.error((e as Error).message || "Could not generate roadmap");
    } finally {
      setGenGoal(false);
    }
  }

  return (
    <div className="min-h-screen">
      {confetti && <Confetti key={confetti.k} x={confetti.x} y={confetti.y} />}

      <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-10 pb-32 space-y-14">
        {/* ====================================================== HERO + RINGS */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 items-end">
          <div>
            <p className="tp-eyebrow mb-4">
              {new Date()
                .toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
                .toUpperCase()}
            </p>
            <h1 className="font-serif text-[60px] md:text-[84px] leading-[0.95] text-ink tracking-tight">
              {greet()},<br />
              <span className="tp-text-gradient-rainbow">{name}</span>
              <span className="text-coral">.</span>
            </h1>
            <p className="text-coffee mt-5 text-[17px] max-w-xl">
              {openTasks.length > 0
                ? `${openTasks.length} task${openTasks.length === 1 ? "" : "s"} ahead. Move with intention.`
                : "Slate's clear. Build the day you want."}
            </p>
          </div>

          <div className="ios-card p-7">
            <div className="flex items-center justify-between mb-5">
              <p className="tp-eyebrow">Today's Activity</p>
              <span className="ios-chip">{Math.round((focusMins / FOCUS_TARGET) * 100)}%</span>
            </div>
            <div className="flex items-center gap-6">
              <ActivityRings
                rings={[
                  { color: "#ec4899", pct: Math.min(100, (focusMins / FOCUS_TARGET) * 100) },
                  { color: "#a3e635", pct: Math.min(100, (moveMins / MOVE_TARGET) * 100) },
                  { color: "#67e8f9", pct: Math.min(100, (reflectMins / REFLECT_TARGET) * 100) },
                ]}
              />
              <div className="flex-1 space-y-3">
                <RingRow
                  label="FOCUS"
                  color="#ec4899"
                  value={focusMins}
                  target={FOCUS_TARGET}
                  suffix="m"
                />
                <RingRow
                  label="MOVE"
                  color="#a3e635"
                  value={moveMins}
                  target={MOVE_TARGET}
                  suffix="m"
                />
                <RingRow
                  label="REFLECT"
                  color="#67e8f9"
                  value={reflectMins}
                  target={REFLECT_TARGET}
                  suffix="m"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================== WEEK STRIP */}
        <section>
          <SectionHeader eyebrow="THIS WEEK" title="At a glance" />
          <WeekStrip schedule={schedule} />
        </section>

        {/* ====================================================== HOURLY SCHEDULE */}
        <section>
          <SectionHeader
            eyebrow="TODAY'S PLAN"
            title="Schedule"
            right={
              <button
                onClick={generatePlan}
                disabled={loadingPlan}
                className="ios-chip hover:bg-white disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" />
                {loadingPlan ? "THINKING…" : "AI RE-PLAN"}
              </button>
            }
          />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            <ScheduleList
              schedule={schedule}
              currentId={currentBlockId}
              onToggle={toggleBlock}
              onDelete={async (id) => {
                await fnDelBlock({ data: { id } });
                refresh();
              }}
              onAdd={async (b) => {
                await fnAddBlock({ data: { ...b } });
                refresh();
              }}
            />
            <div className="space-y-4">
              <FocusTimer />
              <DayStatsCard
                focusMins={focusMins}
                moveMins={moveMins}
                doneCount={schedule.filter((b: ScheduleBlock) => b.status === "done").length}
                totalCount={schedule.length}
              />
            </div>
          </div>
        </section>

        {/* ====================================================== AI COMMAND */}
        <section>
          <div className="text-center mb-7">
            <p className="tp-eyebrow mb-3">AI COMMAND</p>
            <h2 className="font-serif text-4xl md:text-5xl text-ink tracking-tight">
              What's your <span className="tp-text-gradient-gold">next goal</span>?
            </h2>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              makeRoadmap(goalInput);
            }}
            className="max-w-3xl mx-auto"
          >
            <div className="ios-card p-2.5 pl-6 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-violet shrink-0" />
              <input
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="Type a goal, I'll build the path…"
                className="flex-1 bg-transparent outline-none text-ink placeholder:text-coffee/50 text-[17px] py-3"
              />
              <button
                type="submit"
                disabled={genGoal || !goalInput.trim()}
                className="bg-ink text-white font-bold rounded-2xl px-6 h-12 inline-flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition"
              >
                {genGoal ? "BUILDING…" : "GENERATE"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {[
                "Learn React in 30 days",
                "Get internship in 60 days",
                "Launch SaaS in 90 days",
                "Crack Google interview",
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setGoalInput(c)}
                  className="ios-chip hover:bg-white"
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>
          </form>
        </section>

        {/* ====================================================== WEEKLY GOALS + DEADLINES */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
          <WeeklyGoalsCard
            goals={goals}
            onAdd={async (title) => {
              const palette = ["#ec4899", "#a855f7", "#06b6d4", "#22c55e", "#f59e0b"];
              await fnAddGoal({
                data: { title, target: 5, color: palette[goals.length % palette.length] },
              });
              refresh();
            }}
            onBump={async (id, delta) => {
              await fnBumpGoal({ data: { id, delta } });
              refresh();
            }}
          />
          <DeadlinesCard
            deadlines={deadlines}
            onAdd={async (title, due_date, urgent) => {
              await fnAddDeadline({
                data: { title, due_date, urgent, color: urgent ? "#ec4899" : "#a855f7" },
              });
              refresh();
            }}
            onDone={async (id) => {
              await fnCompleteDeadline({ data: { id } });
              refresh();
            }}
          />
        </section>

        {/* ====================================================== NOTES + MOOD */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          <NotesBoard
            notes={notes}
            onAdd={async (title, body, color) => {
              await fnAddNote({ data: { title, body, color } });
              refresh();
            }}
            onDelete={async (id) => {
              await fnDelNote({ data: { id } });
              refresh();
            }}
          />
          <MoodCard
            mood={mood}
            onSet={async (m, energy) => {
              await fnSetMood({ data: { mood: m, energy } });
              refresh();
            }}
          />
        </section>

        {/* ====================================================== ROADMAP */}
        {primary && (
          <section>
            <SectionHeader
              eyebrow="YOUR PATH"
              title={primary.goal ?? "Your Roadmap"}
              right={
                <Link to="/app/roadmaps" className="ios-chip hover:bg-white">
                  OPEN ROADMAP →
                </Link>
              }
            />
            <div className="ios-card p-7">
              <div className="flex items-end justify-between mb-4">
                <p className="font-serif text-2xl text-ink">{primary.progress ?? 0}% complete</p>
                <p className="tp-eyebrow">{primary.estimated_duration ?? ""}</p>
              </div>
              <div className="h-3 rounded-full bg-[color:color-mix(in_oklab,var(--coffee)_10%,transparent)] overflow-hidden">
                <div
                  className="h-full tp-gradient-rainbow transition-all duration-700"
                  style={{ width: `${primary.progress ?? 0}%` }}
                />
              </div>
            </div>
          </section>
        )}

        {/* ====================================================== AI COACH (embedded) */}
        <section>
          <SectionHeader
            eyebrow="AI MENTOR"
            title="Talk to your coach"
            right={
              plan?.data?.recommendations?.length ? (
                <span className="ios-chip">{plan.data.recommendations.length} new insights</span>
              ) : null
            }
          />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
            <EmbeddedCoach profile={profile} primary={primary} />
            <div className="ios-card p-7 space-y-4">
              <p className="tp-eyebrow">LIVE INSIGHTS</p>
              {plan?.data?.recommendations?.length ? (
                <ul className="space-y-3">
                  {(plan.data.recommendations as string[]).map((r, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full tp-gradient-dusty grid place-items-center text-[11px] text-white font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-[14.5px] text-ink leading-relaxed">{r}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[14px] text-coffee leading-relaxed">
                  Tap <span className="font-bold text-ink">AI RE-PLAN</span> above to generate
                  today's insights, or just ask your mentor anything on the left.
                </p>
              )}
              {primary?.goal && (
                <div className="pt-3 mt-3 border-t border-[color:color-mix(in_oklab,var(--coffee)_10%,transparent)] space-y-1.5">
                  <p className="tp-eyebrow">AI MEMORY</p>
                  <p className="text-[14px] text-ink">
                    <span className="text-coffee">Goal · </span>
                    {primary.goal}
                  </p>
                  <p className="text-[14px] text-ink">
                    <span className="text-coffee">Progress · </span>
                    {primary.progress ?? 0}%
                  </p>
                  <p className="text-[14px] text-ink">
                    <span className="text-coffee">Duration · </span>
                    {primary.estimated_duration ?? "—"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="text-center text-[12px] text-coffee/60">
          Pinnacle Labs Internship Project 1
        </footer>
      </div>
    </div>
  );
}

/* ============================================================ subcomponents */

function SectionHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <p className="tp-eyebrow mb-2">{eyebrow}</p>
        <h2 className="font-serif text-[34px] md:text-[40px] leading-none text-ink tracking-tight">
          {title}
        </h2>
      </div>
      {right}
    </div>
  );
}

function ActivityRings({ rings }: { rings: { color: string; pct: number }[] }) {
  const size = 140;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((r, i) => {
          const radius = 60 - i * 14;
          const c = 2 * Math.PI * radius;
          const off = c - (r.pct / 100) * c;
          return (
            <g key={i} transform={`rotate(-90 ${size / 2} ${size / 2})`}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={`color-mix(in oklab, ${r.color} 18%, transparent)`}
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={r.color}
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={c}
                strokeDashoffset={off}
                style={{ transition: "stroke-dashoffset .8s ease" }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function RingRow({
  label,
  color,
  value,
  target,
  suffix,
}: {
  label: string;
  color: string;
  value: number;
  target: number;
  suffix: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-[10.5px] font-bold tracking-[0.18em] text-ink">{label}</p>
        <p className="text-[12px] text-coffee tp-display">
          {value}
          <span className="text-coffee/50">
            /{target}
            {suffix}
          </span>
        </p>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-[color:color-mix(in_oklab,var(--coffee)_10%,transparent)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, (value / target) * 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}

/* ----- Week strip ----- */
function WeekStrip({ schedule }: { schedule: ScheduleBlock[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay();
  const monOffset = day === 0 ? -6 : 1 - day;
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + monOffset + i);
    return d;
  });
  const todayIso = isoToday();
  // count today's load; for others we render placeholder slots
  const todayLoad = schedule.length;
  return (
    <div className="ios-card p-5">
      <div className="grid grid-cols-7 gap-2 md:gap-3">
        {days.map((d) => {
          const iso = d.toISOString().slice(0, 10);
          const isToday = iso === todayIso;
          const isPast = d < today;
          const tasks = isToday ? todayLoad : 0;
          return (
            <div
              key={iso}
              className={`relative rounded-2xl p-3 text-left transition border ${
                isToday
                  ? "tp-gradient-coral text-white border-transparent ios-soft-shadow"
                  : "bg-white/55 border-white/60 text-ink hover:bg-white/85 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
              }`}
            >
              <p
                className={`text-[10px] font-bold tracking-[0.18em] ${isToday ? "text-white/90" : "text-coffee/70"}`}
              >
                {d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase()}
              </p>
              <p
                className={`font-serif text-3xl leading-none mt-1 tp-display ${isToday ? "text-white" : "text-ink"}`}
              >
                {d.getDate()}
              </p>
              <div
                className={`mt-3 h-1 w-full rounded-full ${isToday ? "bg-white/30" : "bg-coffee/10"}`}
              >
                <div
                  className={`h-full rounded-full ${isToday ? "bg-white" : "bg-violet/40"}`}
                  style={{
                    width: isToday ? `${Math.min(100, tasks * 12)}%` : isPast ? "0%" : "0%",
                  }}
                />
              </div>
              <p
                className={`text-[10.5px] font-bold mt-2 tracking-wide ${isToday ? "text-white/85" : "text-coffee/60"}`}
              >
                {isToday ? `${tasks} BLOCKS` : isPast ? "—" : "OPEN"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----- Schedule list ----- */
function ScheduleList({
  schedule,
  currentId,
  onToggle,
  onDelete,
  onAdd,
}: {
  schedule: ScheduleBlock[];
  currentId: string | null;
  onToggle: (b: ScheduleBlock, e?: React.MouseEvent) => void;
  onDelete: (id: string) => void;
  onAdd: (b: {
    start_time: string;
    end_time?: string;
    title: string;
    tag: string;
    color: string;
  }) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [title, setTitle] = useState("");
  const [tagIdx, setTagIdx] = useState(0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const t = TAG_PALETTE[tagIdx];
    onAdd({ start_time: start, end_time: end, title: title.trim(), tag: t.tag, color: t.color });
    setTitle("");
    setShowForm(false);
  }

  return (
    <div className="ios-card p-5">
      {schedule.length === 0 && !showForm && (
        <div className="text-center py-10">
          <div className="inline-flex w-14 h-14 rounded-3xl tp-gradient-coral items-center justify-center mb-4 ios-soft-shadow">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <p className="font-serif text-2xl text-ink mb-1">Your day, your way</p>
          <p className="text-coffee text-[14px] mb-5">
            Block time for what matters. Drag-free planning.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="ios-pill inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> ADD FIRST BLOCK
          </button>
        </div>
      )}

      <div className="space-y-2">
        {schedule.map((b: ScheduleBlock) => {
          const isCurrent = b.id === currentId;
          const done = b.status === "done";
          const mins = minsBetween(b.start_time, b.end_time);
          return (
            <div
              key={b.id}
              className={`group flex items-stretch gap-3 rounded-2xl p-3 transition border ${
                isCurrent
                  ? "border-coral/40 bg-[color:color-mix(in_oklab,#ec4899_5%,white)] dark:bg-[color:color-mix(in_oklab,#ec4899_15%,transparent)] ios-soft-shadow"
                  : "border-transparent hover:border-[color:color-mix(in_oklab,var(--ink)_8%,transparent)] hover:bg-white/60 dark:hover:bg-white/5 dark:hover:border-white/10"
              }`}
            >
              <div className="w-16 text-right shrink-0 pt-1">
                <p className="text-[11.5px] font-bold text-ink tp-display leading-none">
                  {fmtTime(b.start_time)}
                </p>
                <p className="text-[10px] text-coffee/60 mt-1 font-bold tracking-wider">{mins}M</p>
              </div>
              <div className="w-1 rounded-full shrink-0" style={{ background: b.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-[9.5px] font-bold tracking-[0.2em] uppercase"
                    style={{ color: b.color }}
                  >
                    {b.tag}
                  </span>
                  {isCurrent && (
                    <span className="text-[9.5px] font-bold tracking-[0.2em] uppercase text-coral inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
                      NOW
                    </span>
                  )}
                </div>
                <p
                  className={`text-[15px] font-semibold leading-snug ${done ? "line-through text-coffee/50" : "text-ink"}`}
                >
                  {b.title}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 opacity-70 group-hover:opacity-100 transition">
                <button
                  onClick={(e) => onToggle(b, e)}
                  className={`w-8 h-8 rounded-xl grid place-items-center border transition ${
                    done
                      ? "bg-sage border-sage text-white"
                      : "bg-white border-[color:color-mix(in_oklab,var(--ink)_8%,transparent)] text-coffee hover:text-sage hover:border-sage"
                  }`}
                  aria-label="Toggle done"
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
                <button
                  onClick={() => onDelete(b.id)}
                  className="w-8 h-8 rounded-xl bg-white border border-[color:color-mix(in_oklab,var(--ink)_8%,transparent)] grid place-items-center text-coffee hover:text-coral hover:border-coral"
                  aria-label="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm ? (
        <form
          onSubmit={submit}
          className="mt-3 p-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-[color:color-mix(in_oklab,var(--ink)_8%,transparent)] space-y-3"
        >
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you blocking time for?"
            className="w-full bg-transparent outline-none text-ink placeholder:text-coffee/50 text-[15px]"
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-[color:color-mix(in_oklab,var(--ink)_8%,transparent)] text-[13px]"
            />
            <span className="text-coffee text-[12px]">→</span>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-[color:color-mix(in_oklab,var(--ink)_8%,transparent)] text-[13px]"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              {TAG_PALETTE.map((t, i) => (
                <button
                  key={t.tag}
                  type="button"
                  onClick={() => setTagIdx(i)}
                  className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-wider transition ${
                    tagIdx === i
                      ? "text-white"
                      : "text-coffee bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10"
                  }`}
                  style={tagIdx === i ? { background: t.color } : {}}
                >
                  {t.tag.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-coffee text-[12px] font-bold tracking-wider"
            >
              CANCEL
            </button>
            <button type="submit" className="ios-pill">
              ADD BLOCK
            </button>
          </div>
        </form>
      ) : schedule.length > 0 ? (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 w-full p-3 rounded-2xl border border-dashed border-[color:color-mix(in_oklab,var(--ink)_15%,transparent)] text-coffee hover:text-violet hover:border-violet/40 inline-flex items-center justify-center gap-2 text-[12.5px] font-bold tracking-wider"
        >
          <Plus className="w-4 h-4" /> BLOCK NEW TIME
        </button>
      ) : null}
    </div>
  );
}

/* ----- Pomodoro / Focus timer ----- */
function FocusTimer() {
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const total = 25 * 60;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecs((s) => (s <= 1 ? (setRunning(false), 0) : s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const pct = ((total - secs) / total) * 100;
  return (
    <div className="rounded-[28px] p-5 tp-gradient-coral text-white relative overflow-hidden ios-soft-shadow">
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Timer className="w-4 h-4" />
          <p className="text-[10.5px] font-bold tracking-[0.22em]">FOCUS MODE</p>
        </div>
        <p className="font-serif text-[52px] leading-none tp-display">
          {mm}:{ss}
        </p>
        <p className="text-[12px] mt-1 text-white/85 font-bold tracking-wide">POMODORO · 25 MIN</p>
        <div className="mt-4 h-1.5 rounded-full bg-white/25 overflow-hidden">
          <div className="h-full bg-white transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setRunning((r) => !r)}
            className="flex-1 h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[12px] font-bold tracking-[0.18em] inline-flex items-center justify-center gap-1.5"
          >
            {running ? (
              "PAUSE"
            ) : (
              <>
                <Play className="w-3.5 h-3.5" fill="currentColor" /> START
              </>
            )}
          </button>
          <button
            onClick={() => {
              setSecs(25 * 60);
              setRunning(false);
            }}
            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 grid place-items-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DayStatsCard({
  focusMins,
  moveMins,
  doneCount,
  totalCount,
}: {
  focusMins: number;
  moveMins: number;
  doneCount: number;
  totalCount: number;
}) {
  const rows = [
    {
      label: "FOCUS TIME",
      value: `${Math.floor(focusMins / 60)}h ${focusMins % 60}m`,
      color: "#ec4899",
    },
    { label: "MOVEMENT", value: `${moveMins}m`, color: "#a3e635" },
    { label: "BLOCKS DONE", value: `${doneCount}/${totalCount || 0}`, color: "#a855f7" },
  ];
  return (
    <div className="ios-card p-5">
      <p className="tp-eyebrow mb-3">DAY AT A GLANCE</p>
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex items-center justify-between py-2.5 border-b ios-divider last:border-0"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
            <span className="text-[11.5px] font-bold tracking-[0.14em] text-ink">{r.label}</span>
          </div>
          <span className="text-[14px] font-bold text-ink tp-display">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ----- Weekly goals ----- */
function WeeklyGoalsCard({
  goals,
  onAdd,
  onBump,
}: {
  goals: WeeklyGoal[];
  onAdd: (title: string) => void;
  onBump: (id: string, delta: number) => void;
}) {
  const [input, setInput] = useState("");
  return (
    <div className="ios-card p-7">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="tp-eyebrow mb-2">WEEKLY GOALS</p>
          <h3 className="font-serif text-[28px] text-ink tracking-tight">Big rocks this week</h3>
        </div>
        <ListChecks className="w-5 h-5 text-violet" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          onAdd(input.trim());
          setInput("");
        }}
        className="flex items-center gap-2 mb-4 p-2 rounded-2xl bg-white/70 dark:bg-white/5 border border-[color:color-mix(in_oklab,var(--ink)_8%,transparent)]"
      >
        <Plus className="w-4 h-4 text-violet ml-2" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a weekly goal…"
          className="flex-1 bg-transparent outline-none text-ink placeholder:text-coffee/50 text-[14px] py-1.5"
        />
        {input && <button className="ios-pill">ADD</button>}
      </form>

      {goals.length === 0 ? (
        <p className="text-coffee text-[14px] text-center py-6">
          No goals yet. Aim high, 3 is enough.
        </p>
      ) : (
        <div className="space-y-3">
          {goals.map((g: WeeklyGoal) => {
            const pct = Math.round(((g.done ?? 0) / Math.max(1, g.target)) * 100);
            return (
              <div
                key={g.id}
                className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-[color:color-mix(in_oklab,var(--ink)_6%,transparent)]"
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div
                    className="w-9 h-9 rounded-xl grid place-items-center shrink-0 text-white ios-soft-shadow"
                    style={{
                      background: `linear-gradient(135deg, ${g.color}, color-mix(in oklab, ${g.color} 55%, var(--cream)))`,
                    }}
                  >
                    <Trophy className="w-4 h-4" strokeWidth={2.3} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14.5px] font-bold text-ink leading-tight">{g.title}</p>
                    <p className="text-[11px] text-coffee mt-0.5 tp-display tracking-wide">
                      {g.done ?? 0}/{g.target} · {pct}%
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onBump(g.id, -1)}
                      className="w-7 h-7 rounded-full bg-white dark:bg-white/10 border border-[color:color-mix(in_oklab,var(--ink)_8%,transparent)] text-coffee hover:text-ink grid place-items-center text-sm font-bold"
                    >
                      −
                    </button>
                    <button
                      onClick={() => onBump(g.id, 1)}
                      className="w-7 h-7 rounded-full bg-ink text-ivory grid place-items-center text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[color:color-mix(in_oklab,var(--coffee)_10%,transparent)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${g.color}, color-mix(in oklab, ${g.color} 50%, var(--cream)))`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ----- Deadlines ----- */
function DeadlinesCard({
  deadlines,
  onAdd,
  onDone,
}: {
  deadlines: Deadline[];
  onAdd: (title: string, due: string, urgent: boolean) => void;
  onDone: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [urgent, setUrgent] = useState(false);

  return (
    <div className="ios-card p-7">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="tp-eyebrow mb-2">DEADLINES</p>
          <h3 className="font-serif text-[28px] text-ink tracking-tight">What's coming</h3>
        </div>
        <BellRing className="w-5 h-5 text-coral" />
      </div>

      {deadlines.length === 0 ? (
        <p className="text-coffee text-[14px] text-center py-4 mb-4">
          Nothing on the horizon. Add one.
        </p>
      ) : (
        <div className="space-y-2 mb-4">
          {deadlines.map((d: Deadline) => {
            const date = new Date(d.due_date + "T00:00:00");
            return (
              <div
                key={d.id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/70 dark:hover:bg-white/10 transition"
              >
                <div
                  className="w-12 h-12 rounded-xl grid place-items-center shrink-0 text-white ios-soft-shadow"
                  style={{
                    background: `linear-gradient(135deg, ${d.color}, color-mix(in oklab, ${d.color} 60%, var(--cream)))`,
                  }}
                >
                  <div className="text-center leading-none">
                    <p className="text-[9px] font-bold tracking-wider opacity-90">
                      {date.toLocaleDateString(undefined, { month: "short" }).toUpperCase()}
                    </p>
                    <p className="text-[16px] font-black mt-0.5 tp-display">{date.getDate()}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-bold text-ink leading-tight">{d.title}</p>
                  <p
                    className={`text-[10.5px] mt-0.5 font-bold tracking-wider ${d.urgent ? "text-coral" : "text-coffee"}`}
                  >
                    {dayLabel(d.due_date).toUpperCase()}
                    {d.urgent ? " · URGENT" : ""}
                  </p>
                </div>
                <button
                  onClick={() => onDone(d.id)}
                  className="w-7 h-7 rounded-full bg-white dark:bg-white/10 border border-[color:color-mix(in_oklab,var(--ink)_8%,transparent)] grid place-items-center text-coffee hover:text-sage hover:border-sage"
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || !due) return;
          onAdd(title.trim(), due, urgent);
          setTitle("");
          setDue("");
          setUrgent(false);
        }}
        className="p-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-[color:color-mix(in_oklab,var(--ink)_8%,transparent)] space-y-2"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's due?"
          className="w-full bg-transparent outline-none text-ink placeholder:text-coffee/50 text-[14px]"
        />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-[color:color-mix(in_oklab,var(--ink)_8%,transparent)] text-[12.5px] flex-1"
          />
          <button
            type="button"
            onClick={() => setUrgent((u) => !u)}
            className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold tracking-wider transition ${
              urgent
                ? "bg-coral text-white"
                : "bg-white dark:bg-white/10 border border-[color:color-mix(in_oklab,var(--ink)_8%,transparent)] text-coffee"
            }`}
          >
            <Flame className="w-3 h-3 inline mr-1" />
            URGENT
          </button>
          {title.trim() && due && <button className="ios-pill">ADD</button>}
        </div>
      </form>
    </div>
  );
}

/* ----- Notes ----- */
function NotesBoard({
  notes,
  onAdd,
  onDelete,
}: {
  notes: Note[];
  onAdd: (title: string, body: string, color: string) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [color, setColor] = useState(NOTE_COLORS[0]);
  const [open, setOpen] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), body.trim(), color);
    setTitle("");
    setBody("");
    setOpen(false);
  }

  return (
    <div className="ios-card p-7">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="tp-eyebrow mb-2">QUICK NOTES</p>
          <h3 className="font-serif text-[28px] text-ink tracking-tight">Brain dump</h3>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="ios-pill inline-flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> {open ? "CLOSE" : "NEW"}
        </button>
      </div>

      {open && (
        <form
          onSubmit={submit}
          className="mb-5 p-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-[color:color-mix(in_oklab,var(--ink)_8%,transparent)] space-y-2"
        >
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title…"
            className="w-full bg-transparent outline-none text-ink placeholder:text-coffee/50 text-[15px] font-bold"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a body (optional)…"
            rows={2}
            className="w-full bg-transparent outline-none text-ink placeholder:text-coffee/50 text-[13px] resize-none"
          />
          <div className="flex items-center gap-2">
            {NOTE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition ${color === c ? "border-ink scale-110" : "border-white dark:border-white/10"}`}
                style={{ background: c }}
              />
            ))}
            <div className="flex-1" />
            <button className="ios-pill">SAVE NOTE</button>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <p className="text-coffee text-[14px] text-center py-8">
          No notes yet. Capture an idea before it escapes.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {notes.map((n: Note) => (
            <div
              key={n.id}
              className="group relative p-4 rounded-2xl border border-[color:color-mix(in_oklab,var(--ink)_6%,transparent)] hover:scale-[1.02] transition"
              style={{ background: `color-mix(in oklab, ${n.color} 25%, var(--cream))` }}
            >
              <button
                onClick={() => onDelete(n.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/70 dark:bg-white/10 grid place-items-center opacity-0 group-hover:opacity-100 transition text-coffee hover:text-coral"
              >
                <X className="w-3 h-3" />
              </button>
              <p className="text-[13.5px] font-bold text-ink leading-tight pr-6">{n.title}</p>
              {n.body && <p className="text-[12px] text-coffee mt-1.5 leading-snug">{n.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----- Mood ----- */
function MoodCard({
  mood,
  onSet,
}: {
  mood: MoodCheckin | null;
  onSet: (mood: string, energy: number) => void;
}) {
  const moods = [
    { e: "😔", l: "LOW", c: "#94a3b8" },
    { e: "😐", l: "MEH", c: "#a3a3a3" },
    { e: "🙂", l: "OK", c: "#fbbf24" },
    { e: "😄", l: "GREAT", c: "#22c55e" },
    { e: "🔥", l: "ON FIRE", c: "#ec4899" },
  ];
  const [energy, setEnergy] = useState<number>(mood?.energy ?? 70);
  useEffect(() => {
    if (mood?.energy != null) setEnergy(mood.energy);
  }, [mood?.energy]);
  const active = mood?.mood;

  return (
    <div className="ios-card p-7">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="tp-eyebrow mb-2">CHECK-IN</p>
          <h3 className="font-serif text-[28px] text-ink tracking-tight">How you feel</h3>
        </div>
        <Heart className="w-5 h-5 text-coral" />
      </div>
      <div className="grid grid-cols-5 gap-2 mb-5">
        {moods.map((m) => {
          const isActive = active === m.l;
          return (
            <button
              key={m.l}
              onClick={() => onSet(m.l, energy)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 border transition ${
                isActive
                  ? "ios-soft-shadow text-white border-transparent"
                  : "bg-white dark:bg-white/5 border-[color:color-mix(in_oklab,var(--ink)_8%,transparent)] hover:scale-105"
              }`}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${m.c}, color-mix(in oklab, ${m.c} 55%, var(--cream)))`,
                    }
                  : {}
              }
            >
              <span className="text-2xl">{m.e}</span>
              <span
                className={`text-[9px] font-bold tracking-wider ${isActive ? "text-white/90" : "text-coffee"}`}
              >
                {m.l}
              </span>
            </button>
          );
        })}
      </div>

      <p className="tp-eyebrow mb-2">ENERGY · {energy}%</p>
      <input
        type="range"
        min={0}
        max={100}
        value={energy}
        onChange={(e) => setEnergy(parseInt(e.target.value))}
        onMouseUp={() => active && onSet(active, energy)}
        onTouchEnd={() => active && onSet(active, energy)}
        className="w-full accent-coral"
      />
      <div className="flex justify-between text-[10.5px] font-bold tracking-wider text-coffee/70 mt-1">
        <span>DRAINED</span>
        <span>CHARGED</span>
      </div>
      {mood && (
        <p className="mt-4 text-[11.5px] text-coffee text-center">
          Last logged at{" "}
          {new Date(mood.updated_at ?? mood.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
