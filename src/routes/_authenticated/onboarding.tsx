import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getProfile, updateProfile } from "@/lib/data.functions";
import { careerAnalysis } from "@/lib/ai.functions";
import type { Profile } from "../../types";
import { Atmosphere } from "@/components/app/Atmosphere";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const load = useServerFn(getProfile);
  const save = useServerFn(updateProfile);
  const analyze = useServerFn(careerAnalysis);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    education: "",
    current_year: "",
    cgpa: "",
    skills: "",
    experience: "",
    projects: "",
    dream_role: "",
    dream_company: "",
    target_timeline: "6 months",
  });

  useEffect(() => {
    load().then((p: Profile | null) => {
      if (!p) return;
      if (p.onboarded) {
        navigate({ to: "/app" });
        return;
      }
      setForm((f) => ({
        ...f,
        full_name: p.full_name ?? "",
        education: p.education ?? "",
        current_year: p.current_year ?? "",
        cgpa: p.cgpa?.toString() ?? "",
        skills: (p.skills ?? []).join(", "),
        experience: p.experience ?? "",
        projects: (p.projects ?? []).join("; "),
        dream_role: p.dream_role ?? "",
        dream_company: p.dream_company ?? "",
        target_timeline: p.target_timeline ?? "6 months",
      }));
    });
  }, [load, navigate]);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const steps: { title: string; fields: string[] }[] = [
    { title: "Who are you?", fields: ["full_name", "education", "current_year", "cgpa"] },
    { title: "What can you do?", fields: ["skills", "experience", "projects"] },
    { title: "Where are you going?", fields: ["dream_role", "dream_company", "target_timeline"] },
  ];

  async function finish() {
    setLoading(true);
    try {
      await save({
        data: {
          full_name: form.full_name || undefined,
          education: form.education || undefined,
          current_year: form.current_year || undefined,
          cgpa: form.cgpa ? Number(form.cgpa) : undefined,
          skills: form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          experience: form.experience || undefined,
          projects: form.projects
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean),
          dream_role: form.dream_role || undefined,
          dream_company: form.dream_company || undefined,
          target_timeline: form.target_timeline || undefined,
          onboarded: true,
        },
      });
      toast.success("Profile saved. Generating your first analysis…");
      // fire-and-forget initial analysis
      analyze({ data: {} }).catch(() => {});
      navigate({ to: "/app" });
    } catch (e: unknown) {
      toast.error((e as Error).message || "Could not save profile");
    } finally {
      setLoading(false);
    }
  }

  const cur = steps[step];

  const InputClass =
    "bg-white/50 border-[color:color-mix(in_oklab,var(--ink)_5%,transparent)] text-ink placeholder:text-coffee/30 focus:border-violet/40 focus:ring-violet/10";

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <Atmosphere />
      <div className="w-full max-w-2xl ios-card rounded-2xl p-10 relative z-10">
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition ${i <= step ? "bg-gold" : "bg-ink/10"}`}
            />
          ))}
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-gold mb-2">
          Step {step + 1} of {steps.length}
        </p>
        <h1 className="font-serif text-4xl text-ink mb-8">{cur.title}</h1>

        <div className="space-y-5">
          {cur.fields.includes("full_name") && (
            <div>
              <Label className="text-ink/70 mb-1.5 block">Full name</Label>
              <Input
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                className={InputClass}
              />
            </div>
          )}
          {cur.fields.includes("education") && (
            <div>
              <Label className="text-ink/70 mb-1.5 block">Education (degree & institution)</Label>
              <Input
                value={form.education}
                onChange={(e) => set("education", e.target.value)}
                placeholder="B.Tech CSE, IIT Delhi"
                className={InputClass}
              />
            </div>
          )}
          {cur.fields.includes("current_year") && (
            <div>
              <Label className="text-ink/70 mb-1.5 block">Current year / status</Label>
              <Input
                value={form.current_year}
                onChange={(e) => set("current_year", e.target.value)}
                placeholder="3rd year"
                className={InputClass}
              />
            </div>
          )}
          {cur.fields.includes("cgpa") && (
            <div>
              <Label className="text-ink/70 mb-1.5 block">CGPA (optional)</Label>
              <Input
                type="number"
                step="0.01"
                max={10}
                value={form.cgpa}
                onChange={(e) => set("cgpa", e.target.value)}
                className={InputClass}
              />
            </div>
          )}
          {cur.fields.includes("skills") && (
            <div>
              <Label className="text-ink/70 mb-1.5 block">Skills (comma separated)</Label>
              <Textarea
                value={form.skills}
                onChange={(e) => set("skills", e.target.value)}
                placeholder="React, TypeScript, Python, SQL"
                className={InputClass}
              />
            </div>
          )}
          {cur.fields.includes("experience") && (
            <div>
              <Label className="text-ink/70 mb-1.5 block">Experience</Label>
              <Textarea
                value={form.experience}
                onChange={(e) => set("experience", e.target.value)}
                placeholder="Internships, jobs, freelance work…"
                className={InputClass}
              />
            </div>
          )}
          {cur.fields.includes("projects") && (
            <div>
              <Label className="text-ink/70 mb-1.5 block">Projects (separate with ;)</Label>
              <Textarea
                value={form.projects}
                onChange={(e) => set("projects", e.target.value)}
                placeholder="AI tutor app; Portfolio site; Trading bot"
                className={InputClass}
              />
            </div>
          )}
          {cur.fields.includes("dream_role") && (
            <div>
              <Label className="text-ink/70 mb-1.5 block">Dream role</Label>
              <Input
                value={form.dream_role}
                onChange={(e) => set("dream_role", e.target.value)}
                placeholder="Software Engineer"
                className={InputClass}
              />
            </div>
          )}
          {cur.fields.includes("dream_company") && (
            <div>
              <Label className="text-ink/70 mb-1.5 block">Dream company</Label>
              <Input
                value={form.dream_company}
                onChange={(e) => set("dream_company", e.target.value)}
                placeholder="Google"
                className={InputClass}
              />
            </div>
          )}
          {cur.fields.includes("target_timeline") && (
            <div>
              <Label className="text-ink/70 mb-1.5 block">Target timeline</Label>
              <Input
                value={form.target_timeline}
                onChange={(e) => set("target_timeline", e.target.value)}
                placeholder="6 months"
                className={InputClass}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-10">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="border-ink/10 bg-ink/5 text-ink hover:bg-ink/10"
            >
              Back
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="ml-auto tp-gradient-gold text-black hover:opacity-90 border-0"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={finish}
              disabled={loading}
              className="ml-auto tp-gradient-gold text-black hover:opacity-90 border-0"
            >
              {loading ? "Saving…" : "Enter TaskPilot"}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
