import { Check, ChevronRight, Lock, Sparkles, BookOpen, Folder, Target } from "lucide-react";
import { ProgressRing } from "./ProgressRing";

type PhaseState = "done" | "current" | "future";

interface PhaseCardProps {
  index: number;
  title: string;
  durationWeeks?: number | string;
  progress: number;
  state: PhaseState;
  objectives?: string[];
  projects?: { title: string; description?: string }[];
  resources?: { title: string; type?: string; url?: string }[];
  outcome?: string;
}

const STATE_CHIP: Record<PhaseState, { label: string; cls: string }> = {
  done: { label: "Completed", cls: "bg-emerald-500/15 text-emerald-700" },
  current: {
    label: "In progress",
    cls: "bg-[color:color-mix(in_oklab,var(--gold,#f59e0b)_18%,transparent)] text-amber-700",
  },
  future: {
    label: "Upcoming",
    cls: "bg-[color:color-mix(in_oklab,var(--coffee)_10%,transparent)] text-coffee",
  },
};

export function PhaseCard({
  index,
  title,
  durationWeeks,
  progress,
  state,
  objectives = [],
  projects = [],
  resources = [],
  outcome,
}: PhaseCardProps) {
  const stateCls =
    state === "current"
      ? "tp-phase-current"
      : state === "done"
        ? "tp-phase-done"
        : "tp-phase-future";

  const ringColor =
    state === "done"
      ? "#22c55e"
      : state === "current"
        ? "#f59e0b"
        : "color-mix(in oklab, var(--coffee) 35%, transparent)";

  return (
    <article className={`ios-card tp-phase-card p-7 md:p-9 ${stateCls}`}>
      <header className="flex items-start gap-5 mb-6">
        <PhaseBadge index={index} state={state} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`text-[11px] uppercase tracking-[0.18em] font-bold px-2 py-1 rounded-full ${STATE_CHIP[state].cls}`}
            >
              {STATE_CHIP[state].label}
            </span>
            {durationWeeks != null && (
              <span className="text-[12px] uppercase tracking-[0.15em] text-coffee font-semibold">
                {typeof durationWeeks === "number" ? `${durationWeeks} weeks` : durationWeeks}
              </span>
            )}
          </div>
          <h3 className="font-serif text-[28px] md:text-[34px] leading-tight text-ink">{title}</h3>
        </div>
        <ProgressRing value={progress} color={ringColor} />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Column icon={<Target className="w-3.5 h-3.5" />} label="Objectives" items={objectives} />
        <Column
          icon={<Folder className="w-3.5 h-3.5" />}
          label="Projects"
          items={projects.map((p) => p.title).filter(Boolean)}
        />
        <Column
          icon={<BookOpen className="w-3.5 h-3.5" />}
          label="Resources"
          items={resources.map((r) => r.title).filter(Boolean)}
        />
      </div>

      {outcome && (
        <div className="mt-6 pt-5 border-t border-[color:color-mix(in_oklab,var(--coffee)_10%,transparent)] flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-violet mt-0.5 shrink-0" />
          <div>
            <p className="tp-eyebrow mb-1">Milestone outcome</p>
            <p className="text-[15px] text-ink leading-relaxed">{outcome}</p>
          </div>
        </div>
      )}
    </article>
  );
}

function PhaseBadge({ index, state }: { index: number; state: PhaseState }) {
  if (state === "done")
    return (
      <span className="w-12 h-12 rounded-2xl bg-emerald-500 grid place-items-center text-white shadow-md shrink-0">
        <Check className="w-5 h-5" strokeWidth={2.6} />
      </span>
    );
  if (state === "future")
    return (
      <span className="w-12 h-12 rounded-2xl bg-[color:color-mix(in_oklab,var(--coffee)_10%,transparent)] grid place-items-center text-coffee shrink-0">
        <Lock className="w-4 h-4" strokeWidth={2} />
      </span>
    );
  return (
    <span className="relative w-12 h-12 rounded-2xl tp-gradient-gold grid place-items-center text-black font-bold shrink-0 tp-phase-pulse">
      {index}
    </span>
  );
}

function Column({ icon, label, items }: { icon: React.ReactNode; label: string; items: string[] }) {
  if (!items.length) {
    return (
      <div>
        <div className="flex items-center gap-1.5 mb-2 text-coffee">
          {icon}
          <p className="tp-eyebrow">{label}</p>
        </div>
        <p className="text-[13px] text-coffee/70 italic">None yet.</p>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2 text-coffee">
        {icon}
        <p className="tp-eyebrow">{label}</p>
      </div>
      <ul className="space-y-1.5">
        {items.slice(0, 5).map((it, i) => (
          <li key={i} className="text-[14px] text-ink flex items-start gap-1.5 leading-snug">
            <ChevronRight className="w-3.5 h-3.5 mt-1 text-gold shrink-0" />
            <span>{it}</span>
          </li>
        ))}
        {items.length > 5 && <li className="text-[12px] text-coffee">+{items.length - 5} more</li>}
      </ul>
    </div>
  );
}
