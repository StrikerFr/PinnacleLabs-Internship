import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/shared/Navbar";
import { Hero } from "@/components/sections/Hero";
import { StoryProblem, StoryRitual } from "@/components/sections/Story";
import { Results } from "@/components/sections/Results";

import { StarterKit } from "@/components/sections/StarterKit";
import { Formula } from "@/components/sections/Formula";
import { Trust } from "@/components/sections/Trust";
import { Reset } from "@/components/sections/Reset";
import { Footer } from "@/components/shared/Footer";

const SITE = "https://heart-hug-nest.lovable.app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VedaGlows | 28-Day Ayurvedic Skin Reset Kit" },
      {
        name: "description",
        content:
          "A simple 28-day Ayurvedic ritual to reduce breakouts, balance oil and restore your natural glow. Made for Indian skin.",
      },
      { property: "og:title", content: "VedaGlows | 28-Day Ayurvedic Skin Reset Kit" },
      {
        property: "og:description",
        content:
          "Clear skin without the guesswork. A premium 28-day Ayurvedic ritual made for Indian skin.",
      },
      { property: "og:url", content: `${SITE}/` },
      { property: "og:image", content: `${SITE}${"/assets/kit-hero-new.png"}` },
      { name: "twitter:title", content: "VedaGlows | 28-Day Ayurvedic Skin Reset Kit" },
      {
        name: "twitter:description",
        content:
          "Clear skin without the guesswork. A premium 28-day Ayurvedic ritual made for Indian skin.",
      },
      { name: "twitter:image", content: `${SITE}${"/assets/kit-hero-new.png"}` },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap",
      },
      { rel: "canonical", href: `${SITE}/` },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "VedaGlows 28-Day Skin Reset Kit",
          image: [`${SITE}${"/assets/kit-hero-new.png"}`],
          description:
            "A 3-step Ayurvedic ritual — Daily Clean, Glow Repair, Deep Detox — made for Indian skin.",
          brand: { "@type": "Brand", name: "VedaGlows" },
          offers: {
            "@type": "Offer",
            url: `${SITE}/`,
            priceCurrency: "INR",
            price: "499",
            availability: "https://schema.org/InStock",
          },
          aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "7200" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "VedaGlows",
          url: SITE,
          logo: `${SITE}/favicon.png`,
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-[color:var(--ivory)]">
      <Navbar />
      <Hero />
      <StoryProblem />
      <div className="cv-auto">
        <Results />
      </div>
      <div className="cv-auto">
        <Formula />
      </div>
      <div className="cv-auto">
        <StarterKit />
      </div>
      <div className="cv-auto">
        <Trust />
      </div>
      <div className="cv-auto">
        <StoryRitual />
      </div>
      <div className="cv-auto">
        <Reset />
      </div>
      <div className="cv-auto">
        <Footer />
      </div>
    </main>
  );
}
