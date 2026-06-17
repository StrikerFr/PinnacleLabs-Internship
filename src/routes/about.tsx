import { createFileRoute } from "@tanstack/react-router";
import { Leaf, ShieldCheck, MapPin, Droplets, Sparkles } from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About VedaGlows — Modern Herbal Skincare" },
      {
        name: "description",
        content:
          "VedaGlows combines Ayurvedic wisdom with modern skincare to create simple, natural, and effective herbal products made in India.",
      },
      { property: "og:title", content: "About VedaGlows — Modern Herbal Skincare" },
      {
        property: "og:description",
        content:
          "Traditional Ayurveda, modern skincare. Herbal formulations made in India, suitable for all skin types.",
      },
      { property: "og:url", content: "https://heart-hug-nest.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://heart-hug-nest.lovable.app/about" }],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    Icon: Leaf,
    title: "Herbal Formulations",
    text: "Carefully selected herbs, blended for real efficacy — not marketing.",
  },
  {
    Icon: ShieldCheck,
    title: "No Harsh Chemicals",
    text: "Free from sulphates, parabens and synthetic fragrance.",
  },
  {
    Icon: MapPin,
    title: "Made in India",
    text: "Formulated and produced locally, with traceable ingredients.",
  },
  {
    Icon: Droplets,
    title: "All Skin Types",
    text: "Gentle, balanced formulas designed to work across skin types.",
  },
  {
    Icon: Sparkles,
    title: "Inspired by Ayurveda",
    text: "Time-tested rituals translated into a simple, modern routine.",
  },
];

function AboutPage() {
  return (
    <PageShell eyebrow="Modern Herbal Skincare" title="About VedaGlows">
      <p
        className="text-[17px] italic text-foreground/70"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Traditional wisdom. Modern skincare. Real results.
      </p>

      <h2
        className="font-serif text-2xl mt-8 text-foreground"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Our Mission
      </h2>
      <p>
        VedaGlows combines traditional Ayurvedic wisdom with modern skincare practices to create
        effective herbal skincare solutions. Our goal is to provide simple, natural, and affordable
        skincare products made from carefully selected herbal ingredients — so a great routine isn't
        a luxury, it's an everyday ritual.
      </p>

      <h2
        className="font-serif text-2xl mt-10 text-foreground"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        What We Stand For
      </h2>

      <div className="not-prose grid sm:grid-cols-2 gap-3 pt-2">
        {VALUES.map(({ Icon, title, text }) => (
          <div
            key={title}
            className="flex gap-3 p-4 rounded-2xl bg-white/60 border border-[#143A2A]/10 hover:border-[#143A2A]/25 transition-colors"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgba(20,58,42,0.08)", border: "1px solid rgba(20,58,42,0.15)" }}
            >
              <Icon className="h-4 w-4 text-primary" strokeWidth={1.8} />
            </span>
            <div>
              <div className="text-[14px] font-semibold text-foreground">{title}</div>
              <div className="text-[13px] text-foreground/65 mt-0.5 leading-snug">{text}</div>
            </div>
          </div>
        ))}
      </div>

      <h2
        className="font-serif text-2xl mt-10 text-foreground"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Made in India
      </h2>
      <p>
        Every VedaGlows formula is made in India, drawing on herbs and traditions that have shaped
        Indian skincare for generations. We keep our range small, our ingredient lists short, and
        our prices accessible — because real skincare should feel honest from the first jar to the
        last.
      </p>
    </PageShell>
  );
}
