import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/shared/PageShell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — VedaGlows" },
      {
        name: "description",
        content: "The terms that govern your use of the VedaGlows website and products.",
      },
      { property: "og:title", content: "Terms & Conditions — VedaGlows" },
      { property: "og:description", content: "Terms and conditions for using VedaGlows." },
      { property: "og:url", content: "https://heart-hug-nest.lovable.app/terms" },
    ],
    links: [{ rel: "canonical", href: "https://heart-hug-nest.lovable.app/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PageShell eyebrow="Last Updated · June 2026" title="Terms & Conditions">
      <p>
        By accessing www.vedaglows.com or purchasing from VedaGlows, you agree to the following
        terms. Please read them carefully.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        1. Use Of The Site
      </h2>
      <p>
        You agree to use this site for lawful purposes only. You will not attempt to disrupt the
        service, scrape content, or misuse any account.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        2. Products & Pricing
      </h2>
      <p>
        We strive to display products and prices accurately. In the rare case of a pricing or stock
        error, we reserve the right to cancel or refund the affected order before shipment.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        3. Orders & Payment
      </h2>
      <p>
        All orders are subject to acceptance and availability. Payment must be completed through the
        supported methods (UPI, cards, COD where available) before dispatch.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        4. Skin & Patch Test
      </h2>
      <p>
        Our products are made from natural Ayurvedic ingredients. Individual results may vary. We
        recommend a patch test before first use and consulting a dermatologist if you have a known
        allergy or skin condition.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        5. Intellectual Property
      </h2>
      <p>
        All content on this site — including text, images, logos, and packaging — is the property of
        VedaGlows and may not be reused without written permission.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        6. Limitation Of Liability
      </h2>
      <p>
        To the maximum extent permitted by law, VedaGlows is not liable for indirect or
        consequential losses arising from the use of our website or products.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        7. Governing Law
      </h2>
      <p>
        These terms are governed by the laws of India. Any disputes are subject to the exclusive
        jurisdiction of the courts of Mathura, Uttar Pradesh.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        8. Contact
      </h2>
      <p>VedaGlows · Mathura, Uttar Pradesh, India · vedaglows@gmail.com</p>
    </PageShell>
  );
}
