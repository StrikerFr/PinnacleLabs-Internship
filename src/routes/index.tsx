import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/sections/hero/Hero";
import { RoadmapSection } from "@/components/sections/roadmap/RoadmapSection";
import { IntelligenceSection } from "@/components/sections/intelligence/IntelligenceSection";
import { FinalSection } from "@/components/sections/final/FinalSection";
import { ThreeBackground } from "@/components/sections/hero/ThreeBackground";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TaskPilot AI | Turn any goal into a daily action plan" },
      {
        name: "description",
        content:
          "Generate personalized roadmaps, break down ambitious goals, and stay productive with AI-powered planning that adapts to you.",
      },
      { property: "og:title", content: "TaskPilot AI | AI-powered goal planning" },
      {
        property: "og:description",
        content:
          "Turn any goal into a daily action plan. Personalized AI roadmaps that adapt to you.",
      },
    ],
  }),
  component: Index,
});

import { Navbar } from "@/components/sections/hero/Navbar";

function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: "#000000" }}>
      {/* Page-wide animated background — unifies every section */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <ThreeBackground />
        {/* soft global vignette so content stays readable */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 40%, transparent 0%, rgba(0,0,0,0.55) 80%)",
          }}
        />
      </div>

      <div className="relative z-10">
        <Hero />
        <SectionDivider />
        <RoadmapSection />
        <SectionDivider />
        <IntelligenceSection />
        <SectionDivider />
        <FinalSection />
      </div>

      {/* Global Navbar */}
      <div className="relative z-[999]">
        <Navbar />
      </div>
    </main>
  );
}

function SectionDivider() {
  return (
    <div aria-hidden className="relative h-px w-full">
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(125,211,252,0.25) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}
