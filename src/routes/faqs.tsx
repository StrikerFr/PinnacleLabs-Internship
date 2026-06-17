import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { PageShell } from "@/components/shared/PageShell";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs — VedaGlows" },
      {
        name: "description",
        content:
          "Answers to common questions about VedaGlows products, ingredients, shipping, returns and skincare routines.",
      },
      { property: "og:title", content: "Frequently Asked Questions — VedaGlows" },
      {
        property: "og:description",
        content: "Everything you need to know about VedaGlows herbal skincare.",
      },
      { property: "og:url", content: "https://heart-hug-nest.lovable.app/faqs" },
    ],
    links: [{ rel: "canonical", href: "https://heart-hug-nest.lovable.app/faqs" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FAQPage,
});

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is VedaGlows?",
    a: "VedaGlows is a modern herbal skincare brand that combines traditional Ayurvedic wisdom with modern formulations. Our products are made from carefully selected herbal ingredients and are suitable for daily use.",
  },
  {
    q: "Are VedaGlows products suitable for all skin types?",
    a: "Yes. Our formulas are gentle and balanced, designed to work across oily, dry, combination and sensitive skin. We recommend a patch test if you have very sensitive skin.",
  },
  {
    q: "Do your products contain harsh chemicals?",
    a: "No. VedaGlows products are made without sulphates, parabens, and synthetic fragrances. We focus on herbal ingredients you can read and understand.",
  },
  {
    q: "Where are VedaGlows products made?",
    a: "All our products are formulated and made in India, using ingredients inspired by Ayurveda.",
  },
  {
    q: "How long until I see results?",
    a: "Most customers notice clearer, brighter skin within the first 28 days of consistent use — that's the duration of our Skin Reset Kit ritual.",
  },
  {
    q: "How should I use the 28-Day Skin Reset Kit?",
    a: "Use Daily Clean as your everyday cleanser, Glow Repair 2–3 times a week as a brightening mask, and Deep Detox once a week for a deeper reset. Full instructions are included with the kit.",
  },
  {
    q: "Do you offer Cash on Delivery (COD)?",
    a: "Yes, COD is available across India along with secure online payment options.",
  },
  {
    q: "What is your shipping time?",
    a: "Orders are dispatched within 24–48 hours and typically delivered within 3–7 business days, depending on your location.",
  },
  {
    q: "What is your return / refund policy?",
    a: "We offer a 7-day satisfaction promise. If you're not happy with your purchase, reach out to our support team and we'll help you out. See our Refund Policy for full details.",
  },
  {
    q: "How can I contact VedaGlows?",
    a: "You can email us at vedaglows@gmail.com, call +91 99999 99999, or DM us on Instagram @vedaglows. We reply within 24 hours, 7 days a week.",
  },
];

function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <PageShell eyebrow="Got Questions?" title="Frequently Asked Questions">
      <p>
        Everything you need to know about VedaGlows products, ingredients, shipping and your
        skincare routine. Can't find your answer?{" "}
        <a
          href="mailto:vedaglows@gmail.com"
          className="text-primary underline-offset-4 hover:underline"
        >
          Email us
        </a>
        .
      </p>

      <div className="not-prose mt-6 divide-y divide-[#143A2A]/12 border-y border-[#143A2A]/12">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left group"
              >
                <span className="text-[15px] md:text-[16px] font-medium text-foreground group-hover:text-primary transition-colors">
                  {f.q}
                </span>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
                  style={{ background: isOpen ? "rgba(20,58,42,0.12)" : "rgba(20,58,42,0.05)" }}
                >
                  {isOpen ? (
                    <Minus className="h-4 w-4 text-primary" />
                  ) : (
                    <Plus className="h-4 w-4 text-primary" />
                  )}
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: isOpen ? 400 : 0, opacity: isOpen ? 1 : 0 }}
              >
                <p className="pb-5 pr-12 text-[14.5px] leading-[1.7] text-foreground/70">{f.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
