import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { Roadmap, RoadmapPhase } from "../../types";
import { listRoadmaps, setPrimaryRoadmap } from "@/lib/data.functions";
import { generateRoadmap } from "@/lib/ai.functions";
import {
  Sparkles,
  ArrowRight,
  Star,
  Trophy,
  Flag,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Gauge,
} from "lucide-react";
import { toast } from "sonner";
import { PhaseCard } from "@/components/dashboard/PhaseCard";

export const Route = createFileRoute("/_authenticated/app/roadmaps")({ component: Roadmaps });

const EXAMPLES = [
  "Become a Product Designer at Apple",
  "Launch a SaaS in 90 Days",
  "Crack Google Interview",
  "Become a Full Stack Developer",
];

function Roadmaps() {
  const fnList = useServerFn(listRoadmaps);
  const fnGen = useServerFn(generateRoadmap);
  const fnPrim = useServerFn(setPrimaryRoadmap);

  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<Roadmap | null>(null);

  const refresh = useCallback(async () => {
    const r = await fnList();
    setRoadmaps(r);
    setActive((prev: Roadmap | null) =>
      prev
        ? (r.find((x: Roadmap) => x.id === prev.id) ?? r[0])
        : (r.find((x: Roadmap) => x.is_primary) ?? r[0]),
    );
  }, [fnList]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function generate() {
    if (!goal.trim()) return;
    setLoading(true);
    try {
      const { roadmap } = await fnGen({
        data: { goal: goal.trim(), savePrimary: roadmaps.length === 0 },
      });
      toast.success("Roadmap created");
      setGoal("");
      const list = await fnList();
      setRoadmaps(list);
      setActive(list.find((x: Roadmap) => x.id === roadmap.id) || null);
      setTimeout(
        () =>
          document
            .getElementById("journey")
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        200,
      );
    } catch (e: unknown) {
      toast.error((e as Error).message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function makePrimary(id: string) {
    await fnPrim({ data: { roadmapId: id } });
    toast.success("Set as primary roadmap");
    refresh();
  }

  const phases: RoadmapPhase[] = useMemo(() => active?.phases ?? [], [active]);

  // Derive a current phase index from progress
  const currentPhaseIdx = useMemo(() => {
    if (!phases.length) return -1;
    const progress = active?.progress ?? 0;
    if (progress >= 100) return phases.length;
    const ratio = progress / 100;
    return Math.min(phases.length - 1, Math.floor(ratio * phases.length));
  }, [phases, active]);

  const metrics = useMemo(() => {
    const projects = phases.reduce((s, p) => s + (p.projects?.length ?? 0), 0);
    const resources = phases.reduce((s, p) => s + (p.resources?.length ?? 0), 0);
    return {
      duration: active?.estimated_duration ?? "—",
      phases: phases.length,
      projects,
      resources,
      completion: Math.round(active?.progress ?? 0),
    };
  }, [phases, active]);

  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-12 pb-32 space-y-16">
        {/* =================== HERO + COMMAND BAR =================== */}
        <section>
          <p className="tp-eyebrow mb-5">YOUR JOURNEY</p>
          <h1 className="font-serif text-[56px] md:text-[80px] leading-[0.95] text-ink tracking-tight">
            Roadmaps<span className="text-coral">.</span>
          </h1>
          <p className="text-coffee mt-5 text-[18px] max-w-2xl leading-relaxed">
            Turn ambitious goals into structured execution plans powered by AI.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              generate();
            }}
            className="mt-10"
          >
            <div className="ios-card p-2.5 pl-6 flex items-center gap-3 max-w-3xl">
              <Sparkles className="w-5 h-5 text-violet shrink-0" />
              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What do you want to achieve?"
                className="flex-1 bg-transparent outline-none text-ink placeholder:text-coffee/50 text-[17px] py-3"
              />
              <button
                type="submit"
                disabled={loading || !goal.trim()}
                className="bg-ink text-white font-bold rounded-2xl px-6 h-12 inline-flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition"
              >
                {loading ? "BUILDING…" : "GENERATE ROADMAP"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-5 max-w-3xl">
              {EXAMPLES.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setGoal(e)}
                  className="ios-chip hover:bg-white"
                >
                  {e}
                </button>
              ))}
            </div>
          </form>
        </section>

        {/* =================== YOUR ROADMAPS PICKER =================== */}
        {roadmaps.length > 0 && (
          <section>
            <SectionHeader
              eyebrow="LIBRARY"
              title={`${roadmaps.length} roadmap${roadmaps.length === 1 ? "" : "s"}`}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {roadmaps.map((r) => {
                const isActive = active?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setActive(r)}
                    className={`text-left ios-card p-5 transition tp-phase-card ${isActive ? "ring-2 ring-[color:color-mix(in_oklab,var(--gold,#f59e0b)_60%,transparent)]" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-coffee font-bold">
                        {r.estimated_duration ?? "—"}
                      </span>
                      {r.is_primary && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-bold">
                          <Star className="w-3 h-3 fill-current" /> PRIMARY
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-[20px] text-ink leading-tight line-clamp-2">
                      {r.goal}
                    </h3>
                    <p className="text-[13px] text-coffee mt-3">
                      {r.phases?.length ?? 0} phases · {r.progress ?? 0}% complete
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {active ? (
          <>
            {/* =================== HEADLINE + MAKE PRIMARY =================== */}
            <section className="flex items-start justify-between gap-6 flex-wrap">
              <div className="max-w-3xl">
                <p className="tp-eyebrow mb-3">ACTIVE BLUEPRINT</p>
                <h2 className="font-serif text-[40px] md:text-[56px] leading-[1.02] text-ink">
                  {active.goal}
                </h2>
              </div>
              {!active.is_primary && (
                <button
                  onClick={() => makePrimary(active.id)}
                  className="ios-chip hover:bg-white inline-flex items-center gap-2"
                >
                  <Star className="w-3.5 h-3.5" /> MAKE PRIMARY
                </button>
              )}
            </section>

            {/* =================== METRICS =================== */}
            <section className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              <Metric label="Duration" value={metrics.duration} accent />
              <Metric label="Phases" value={metrics.phases} />
              <Metric label="Projects" value={metrics.projects} />
              <Metric label="Resources" value={metrics.resources} />
              <Metric label="Completion" value={`${metrics.completion}%`} />
            </section>

            {/* =================== JOURNEY + INSIGHTS =================== */}
            <section id="journey" className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
              {/* Journey */}
              <div className="relative">
                {/* Start marker */}
                <JourneyMarker label="START" icon={<Flag className="w-4 h-4" />} kind="start" />

                <div className="relative">
                  {/* spine line */}
                  <div
                    className="absolute left-[27px] top-0 bottom-0 w-[3px] tp-journey-line rounded-full"
                    aria-hidden
                  />

                  <div className="space-y-8 pl-16">
                    {phases.map((p: RoadmapPhase, i: number) => {
                      const state =
                        i < currentPhaseIdx ? "done" : i === currentPhaseIdx ? "current" : "future";
                      const phaseProgress =
                        state === "done"
                          ? 100
                          : state === "future"
                            ? 0
                            : Math.max(
                                8,
                                ((active.progress ?? 0) % (100 / Math.max(phases.length, 1))) *
                                  phases.length,
                              );

                      return (
                        <div key={i} className="relative">
                          {/* node dot */}
                          <span
                            className={`absolute -left-[60px] top-7 w-[18px] h-[18px] rounded-full border-[3px] border-ivory ${
                              state === "done"
                                ? "bg-emerald-500"
                                : state === "current"
                                  ? "bg-amber-500 tp-phase-pulse"
                                  : "bg-[color:color-mix(in_oklab,var(--coffee)_25%,transparent)]"
                            }`}
                            aria-hidden
                          />
                          <PhaseCard
                            index={i + 1}
                            title={p.title}
                            durationWeeks={p.durationWeeks}
                            progress={phaseProgress}
                            state={state}
                            objectives={p.objectives ?? []}
                            projects={p.projects ?? []}
                            resources={p.resources ?? []}
                            outcome={p.milestone}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Goal marker */}
                <JourneyMarker
                  label="GOAL ACHIEVED"
                  icon={<Trophy className="w-4 h-4" />}
                  kind="goal"
                />
              </div>

              {/* Insights panel */}
              <aside className="lg:sticky lg:top-24 self-start space-y-3">
                <p className="tp-eyebrow mb-2">AI INSIGHTS</p>
                <InsightCard
                  tone="positive"
                  icon={<TrendingUp className="w-4 h-4" />}
                  title="You are ahead of schedule"
                  body={`At ${metrics.completion}% with ${metrics.phases - currentPhaseIdx} phases remaining, you're tracking strong.`}
                />
                <InsightCard
                  tone="info"
                  icon={<Lightbulb className="w-4 h-4" />}
                  title="Focus the fundamentals"
                  body="Phase strength compounds. Don't skip past objectives that feel obvious."
                />
                <InsightCard
                  tone="warn"
                  icon={<AlertTriangle className="w-4 h-4" />}
                  title="Portfolio gap detected"
                  body="Most users underweight projects. Ship one this phase to widen the lead."
                />
                <InsightCard
                  tone="positive"
                  icon={<Gauge className="w-4 h-4" />}
                  title="+14% interview readiness"
                  body="Finishing the current phase lifts your readiness score by an estimated 14%."
                />
              </aside>
            </section>
          </>
        ) : (
          <section className="ios-card p-12 text-center">
            <Sparkles className="w-8 h-8 text-violet mx-auto mb-4" />
            <h2 className="font-serif text-3xl text-ink">Your blueprint awaits</h2>
            <p className="text-coffee mt-2">Type a goal above and we'll architect the full path.</p>
          </section>
        )}
      </div>
    </div>
  );
}

/* ============================================================ subcomponents */

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <p className="tp-eyebrow mb-2">{eyebrow}</p>
        <h2 className="font-serif text-3xl text-ink tracking-tight">{title}</h2>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="ios-card p-5">
      <p className="tp-eyebrow mb-2">{label}</p>
      <p
        className={`font-serif text-[36px] md:text-[44px] leading-none ${accent ? "tp-text-gradient-gold" : "text-ink"}`}
      >
        {value}
      </p>
    </div>
  );
}

function JourneyMarker({
  label,
  icon,
  kind,
}: {
  label: string;
  icon: React.ReactNode;
  kind: "start" | "goal";
}) {
  return (
    <div className={`flex items-center gap-3 ${kind === "start" ? "mb-6" : "mt-6"}`}>
      <span
        className={`w-[54px] h-[54px] rounded-full grid place-items-center text-white shadow-md ${
          kind === "start" ? "bg-ink" : "tp-gradient-gold text-black"
        }`}
      >
        {icon}
      </span>
      <p
        className={`font-serif text-[22px] tracking-tight ${kind === "goal" ? "tp-text-gradient-gold" : "text-ink"}`}
      >
        {label}
      </p>
    </div>
  );
}

function InsightCard({
  tone,
  icon,
  title,
  body,
}: {
  tone: "positive" | "warn" | "info";
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const accent =
    tone === "positive"
      ? "border-l-emerald-500 text-emerald-700"
      : tone === "warn"
        ? "border-l-amber-500 text-amber-700"
        : "border-l-[color:var(--violet)] text-violet";

  return (
    <div className={`ios-card p-4 border-l-4 ${accent}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-[13px] font-bold uppercase tracking-[0.12em]">{title}</p>
      </div>
      <p className="text-[13.5px] text-ink leading-snug">{body}</p>
    </div>
  );
}
