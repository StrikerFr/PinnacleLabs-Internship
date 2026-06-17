import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/shared/PageShell";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — VedaGlows" },
      {
        name: "description",
        content: "VedaGlows's 7-day satisfaction promise, returns and refund process.",
      },
      { property: "og:title", content: "Refund Policy — VedaGlows" },
      { property: "og:description", content: "How returns and refunds work at VedaGlows." },
      { property: "og:url", content: "https://heart-hug-nest.lovable.app/refund" },
    ],
    links: [{ rel: "canonical", href: "https://heart-hug-nest.lovable.app/refund" }],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <PageShell eyebrow="7-Day Satisfaction Promise" title="Refund Policy">
      <p>
        We want you to love your VedaGlows ritual. If something isn't right, here's how returns and
        refunds work.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        1. Eligibility
      </h2>
      <p>
        You may request a return within <strong>7 days</strong> of receiving your order. Products
        must be unopened, unused, and in their original packaging.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        2. Damaged Or Wrong Items
      </h2>
      <p>
        If you receive a damaged, defective, or incorrect item, email us within 48 hours of delivery
        with photos of the product and packaging. We'll arrange a free replacement or full refund.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        3. How To Request A Return
      </h2>
      <ol className="list-decimal pl-5 space-y-1">
        <li>
          Email{" "}
          <a className="underline" href="mailto:vedaglows@gmail.com">
            vedaglows@gmail.com
          </a>{" "}
          with your order ID and reason.
        </li>
        <li>Our team will share return shipping instructions within 24–48 hours.</li>
        <li>Once we receive and inspect the item, we'll process your refund.</li>
      </ol>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        4. Refund Timeline
      </h2>
      <p>
        Approved refunds are issued to the original payment method within{" "}
        <strong>5–7 business days</strong>. COD orders are refunded via UPI or bank transfer.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        5. Non-Returnable
      </h2>
      <p>
        For hygiene and safety reasons, opened or partially used skincare items cannot be returned
        unless they arrived defective.
      </p>

      <h2
        className="font-serif text-2xl pt-4"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        6. Contact
      </h2>
      <p>VedaGlows · Mathura, Uttar Pradesh, India · vedaglows@gmail.com · +91 99999 99999</p>
    </PageShell>
  );
}
