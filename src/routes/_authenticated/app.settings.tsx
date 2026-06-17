import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getProfile, updateProfile } from "@/lib/data.functions";
import { toast } from "sonner";
import type { Profile } from "../../types";
import {
  Sparkles,
  UserCircle,
  GraduationCap,
  Target,
  Briefcase,
  Code2,
  Compass,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/settings")({ component: Settings });

function Settings() {
  const fnGet = useServerFn(getProfile);
  const fnSet = useServerFn(updateProfile);
  const [p, setP] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fnGet().then((res) => {
      setP(res || {});
      setLoading(false);
    });
  }, [fnGet]);

  if (loading)
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-coffee/60 animate-pulse">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-coffee/30 animate-spin mb-4" />
        <p className="text-[12px] font-bold tracking-[0.2em] uppercase">Loading Identity</p>
      </div>
    );

  async function save() {
    setSaving(true);
    try {
      await fnSet({
        data: {
          full_name: p.full_name,
          education: p.education,
          current_year: p.current_year,
          cgpa: p.cgpa ? Number(p.cgpa) : undefined,
          skills: p.skills ?? [],
          experience: p.experience,
          projects: p.projects ?? [],
          dream_role: p.dream_role,
          dream_company: p.dream_company,
          target_timeline: p.target_timeline,
          onboarded: true,
        },
      });
      toast.success("Identity synchronized successfully", { icon: "✨" });
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const nameInitial = p.full_name ? p.full_name.charAt(0).toUpperCase() : "?";
  const skillsList = Array.isArray(p.skills)
    ? p.skills
    : typeof p.skills === "string"
      ? p.skills
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];
  const projectsList = Array.isArray(p.projects)
    ? p.projects
    : typeof p.projects === "string"
      ? p.projects
          .split(";")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];

  const InputClass =
    "w-full bg-white/50 border border-[color:color-mix(in_oklab,var(--ink)_5%,transparent)] focus:border-violet/40 focus:bg-white/90 focus:ring-4 focus:ring-violet/10 outline-none text-ink text-[15px] px-4 py-3 rounded-xl transition-all duration-300 placeholder:text-coffee/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]";
  const LabelClass =
    "flex items-center gap-2 text-[11.5px] font-bold tracking-[0.15em] text-ink/70 mb-2 uppercase ml-1";

  return (
    <div className="px-6 md:px-10 py-12 max-w-4xl mx-auto pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Immersive Header */}
      <header className="mb-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full tp-gradient-gold grid place-items-center text-white text-4xl font-serif shadow-lg ios-soft-shadow z-10 relative">
              {nameInitial}
            </div>
            <div className="absolute inset-0 rounded-full tp-gradient-gold blur-xl opacity-40 animate-pulse" />
          </div>
          <div>
            <p className="tp-eyebrow mb-1 text-violet">PILOT DOSSIER</p>
            <h1 className="font-serif text-5xl md:text-6xl text-ink tracking-tight mb-2">
              {p.full_name ? p.full_name.split(" ")[0] : "Your Profile"}
              <span className="text-gold">.</span>
            </h1>
            <p className="text-[15px] text-coffee max-w-sm leading-relaxed">
              Define your coordinates. TaskPilot AI uses this data to calibrate your daily focus and
              long-term trajectory.
            </p>
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="bg-ink text-white font-bold rounded-2xl px-8 h-12 inline-flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02] hover:shadow-xl hover:shadow-ink/20 transition-all duration-300 shrink-0"
        >
          {saving ? (
            "SYNCING…"
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-gold" /> SAVE CHANGES
            </>
          )}
        </button>
      </header>

      <div className="space-y-8">
        {/* Section 1: Identity */}
        <div className="ios-card p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
            <UserCircle className="w-32 h-32" />
          </div>
          <h2 className="font-serif text-2xl text-ink mb-6 flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-gold" /> Personal Coordinates
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className={LabelClass}>Full name</label>
              <input
                value={p.full_name ?? ""}
                onChange={(e) => setP({ ...p, full_name: e.target.value })}
                placeholder="John Doe"
                className={InputClass}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academics & Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="ios-card p-8 relative overflow-hidden group flex flex-col">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
              <GraduationCap className="w-32 h-32" />
            </div>
            <h2 className="font-serif text-2xl text-ink mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-violet" /> Academics
            </h2>
            <div className="space-y-5 flex-1">
              <div>
                <label className={LabelClass}>Institution & Degree</label>
                <input
                  value={p.education ?? ""}
                  onChange={(e) => setP({ ...p, education: e.target.value })}
                  placeholder="B.Tech Computer Science, MIT"
                  className={InputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LabelClass}>Year / Status</label>
                  <input
                    value={p.current_year ?? ""}
                    onChange={(e) => setP({ ...p, current_year: e.target.value })}
                    placeholder="Junior Year"
                    className={InputClass}
                  />
                </div>
                <div>
                  <label className={LabelClass}>CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={p.cgpa ?? ""}
                    onChange={(e) => setP({ ...p, cgpa: e.target.value })}
                    placeholder="3.8"
                    className={InputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="ios-card p-8 relative overflow-hidden group flex flex-col">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
              <Code2 className="w-32 h-32" />
            </div>
            <h2 className="font-serif text-2xl text-ink mb-6 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-coral" /> Capabilities
            </h2>
            <div className="space-y-5 flex-1">
              <div>
                <label className={LabelClass}>Technical Skills (Comma separated)</label>
                <textarea
                  value={Array.isArray(p.skills) ? p.skills.join(", ") : (p.skills ?? "")}
                  onChange={(e) =>
                    setP({
                      ...p,
                      skills: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  rows={2}
                  placeholder="React, Python, Machine Learning..."
                  className={`${InputClass} resize-none`}
                />
                <div className="mt-3 flex flex-wrap gap-1.5 min-h-[24px]">
                  {skillsList.map((s: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-ink/5 text-ink text-[11px] font-bold tracking-wider uppercase border border-ink/10 animate-in zoom-in duration-300"
                    >
                      {s}
                    </span>
                  ))}
                  {skillsList.length === 0 && (
                    <span className="text-[11px] text-coffee/50 italic">No skills added yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Deep Dives */}
        <div className="ios-card p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
            <Briefcase className="w-32 h-32" />
          </div>
          <h2 className="font-serif text-2xl text-ink mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-sage" /> Portfolio & Experience
          </h2>
          <div className="space-y-6">
            <div>
              <label className={LabelClass}>Work Experience</label>
              <textarea
                value={p.experience ?? ""}
                onChange={(e) => setP({ ...p, experience: e.target.value })}
                rows={3}
                placeholder="Summer Intern at Acme Corp (2025), Built a scalable microservice..."
                className={`${InputClass} resize-none`}
              />
            </div>
            <div>
              <label className={LabelClass}>Key Projects (Semicolon ';' separated)</label>
              <textarea
                value={Array.isArray(p.projects) ? p.projects.join("; ") : (p.projects ?? "")}
                onChange={(e) =>
                  setP({
                    ...p,
                    projects: e.target.value
                      .split(";")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                rows={2}
                placeholder="TaskPilot Web App; Automated Trading Script..."
                className={`${InputClass} resize-none`}
              />
              <div className="mt-3 space-y-2">
                {projectsList.map((proj: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/60 border border-[color:color-mix(in_oklab,var(--ink)_4%,transparent)] animate-in slide-in-from-left-2 duration-300"
                  >
                    <div className="w-6 h-6 rounded-md bg-sage/20 text-sage grid place-items-center shrink-0">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span className="text-[13px] font-medium text-ink">{proj}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Future Ambitions */}
        <div className="ios-card p-8 relative overflow-hidden group bg-gradient-to-br from-white/80 to-[color:color-mix(in_oklab,var(--gold)_5%,white)]">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
            <Compass className="w-32 h-32" />
          </div>
          <h2 className="font-serif text-2xl text-ink mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-coral" /> Flight Path
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={LabelClass}>Dream Role</label>
              <input
                value={p.dream_role ?? ""}
                onChange={(e) => setP({ ...p, dream_role: e.target.value })}
                placeholder="Product Engineer"
                className={InputClass}
              />
            </div>
            <div>
              <label className={LabelClass}>Dream Company</label>
              <input
                value={p.dream_company ?? ""}
                onChange={(e) => setP({ ...p, dream_company: e.target.value })}
                placeholder="OpenAI"
                className={InputClass}
              />
            </div>
            <div>
              <label className={LabelClass}>Target Timeline</label>
              <input
                value={p.target_timeline ?? ""}
                onChange={(e) => setP({ ...p, target_timeline: e.target.value })}
                placeholder="Next 6 Months"
                className={InputClass}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
