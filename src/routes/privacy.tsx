import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/shared/PageShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — VedaGlows" },
      {
        name: "description",
        content: "How VedaGlows collects, uses, and protects your personal information.",
      },
      { property: "og:title", content: "Privacy Policy — VedaGlows" },
      { property: "og:description", content: "How VedaGlows handles your personal data." },
      { property: "og:url", content: "https://heart-hug-nest.lovable.app/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://heart-hug-nest.lovable.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PageShell eyebrow="Last Updated · June 2026" title="Privacy Policy">
      <p>
        VedaGlows ("we", "us", "our") respects your privacy. This policy explains what information
        we collect when you visit www.vedaglows.com or place an order with us, and how we use it.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        1. Information We Collect
      </h2>
      <p>
        When you place an order or subscribe, we collect your name, email address, phone number,
        shipping address, and payment-related details (processed securely via our payment partners).
        We may also collect non-personal usage data such as device type and pages visited.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        2. How We Use Your Information
      </h2>
      <p>
        We use your information to process orders, deliver products, provide customer support, send
        order updates, and (with your consent) share occasional product news and offers. You can
        unsubscribe from marketing emails at any time.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        3. Sharing
      </h2>
      <p>
        We share information only with trusted partners that help us run our business — shipping
        providers, payment processors, and analytics tools — and only as needed to fulfil your order
        or improve our service. We do not sell your personal information.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        4. Cookies
      </h2>
      <p>
        We use minimal cookies to remember your cart, keep you signed in, and measure website
        performance. You can disable cookies in your browser, but some site features may not work
        properly.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        5. Data Security
      </h2>
      <p>
        Your information is stored securely and accessed only by authorised team members. We use
        industry-standard safeguards, but no system is 100% secure.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        6. Your Rights
      </h2>
      <p>
        You may request access to, correction of, or deletion of your personal data at any time by
        emailing{" "}
        <a className="underline" href="mailto:vedaglows@gmail.com">
          vedaglows@gmail.com
        </a>
        .
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        7. Contact
      </h2>
      <p>VedaGlows · Mathura, Uttar Pradesh, India · vedaglows@gmail.com · +91 99999 99999</p>
    </PageShell>
  );
}
