import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Instagram, Globe } from "lucide-react";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.554-5.338 11.89-11.893 11.89a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
  </svg>
);
import { PageShell } from "@/components/shared/PageShell";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Customer Support — VedaGlows" },
      {
        name: "description",
        content: "Get in touch with VedaGlows customer support. Email, phone and Instagram.",
      },
      { property: "og:title", content: "Customer Support — VedaGlows" },
      {
        property: "og:description",
        content: "We're here to help. Reach the VedaGlows team anytime.",
      },
      { property: "og:url", content: "https://heart-hug-nest.lovable.app/support" },
    ],
    links: [{ rel: "canonical", href: "https://heart-hug-nest.lovable.app/support" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "VedaGlows",
          url: "https://heart-hug-nest.lovable.app",
          email: "vedaglows@gmail.com",
          telephone: "+91 99999 99999",
          image: "https://heart-hug-nest.lovable.app/favicon.png",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Mathura",
            addressRegion: "Uttar Pradesh",
            addressCountry: "IN",
          },
          sameAs: ["https://instagram.com/vedaglows"],
        }),
      },
    ],
  }),
  component: SupportPage,
});

const CONTACTS = [
  { Icon: Mail, label: "Email", value: "vedaglows@gmail.com", href: "mailto:vedaglows@gmail.com" },
  { Icon: Phone, label: "Phone", value: "+91 99999 99999", href: "tel:+919999999999" },
  { Icon: Phone, label: "Phone (Alt)", value: "+91 88888 88888", href: "tel:+918888888888" },
  {
    Icon: Instagram,
    label: "Instagram",
    value: "@vedaglows",
    href: "https://instagram.com/vedaglows",
  },
  { Icon: Globe, label: "Website", value: "www.vedaglows.com", href: "https://www.vedaglows.com" },
  { Icon: MapPin, label: "Location", value: "Mathura, Uttar Pradesh, India" },
];

function SupportPage() {
  return (
    <PageShell eyebrow="We're Here To Help" title="Customer Support">
      <p>
        Have a question about your order, a product, or your skincare routine? Our small team is
        happy to help. We typically reply within 24 hours, Monday–Saturday.
      </p>

      <div className="not-prose grid sm:grid-cols-2 gap-3 pt-4">
        {CONTACTS.map(({ Icon, label, value, href }) => {
          const content = (
            <>
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: "rgba(20,58,42,0.08)",
                  border: "1px solid rgba(20,58,42,0.15)",
                }}
              >
                <Icon className="h-4 w-4 text-primary" strokeWidth={1.8} />
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-[9.5px] tracking-[0.3em] uppercase text-foreground/55">
                  {label}
                </span>
                <span className="text-[14.5px] font-medium text-foreground truncate">{value}</span>
              </span>
            </>
          );
          const className =
            "flex items-center gap-3 rounded-2xl px-4 py-3.5 bg-white/60 backdrop-blur border border-foreground/10 hover:border-primary/40 hover:-translate-y-0.5 transition-all";
          return href ? (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className={className}
            >
              {content}
            </a>
          ) : (
            <div key={label} className={className}>
              {content}
            </div>
          );
        })}
      </div>

      <div className="not-prose mt-6">
        <a
          href="https://wa.me/919999999999"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-4 rounded-full text-[11.5px] font-semibold tracking-[0.28em] uppercase"
          style={{
            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
            color: "#ffffff",
            boxShadow: "0 20px 40px -16px rgba(37,211,102,0.55)",
          }}
        >
          <WhatsAppIcon className="h-4 w-4" />
          Contact Support on WhatsApp
        </a>
      </div>

      <h2
        className="text-xl font-serif mt-10"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Frequently Asked
      </h2>
      <p>
        <strong>Shipping:</strong> Orders ship within 1–2 business days from Mathura, India.
        Delivery typically takes 3–6 business days across India.
      </p>
      <p>
        <strong>Returns:</strong> 7-day satisfaction promise on unopened kits. Reach out via email
        and we'll guide you through it.
      </p>
      <p>
        <strong>Order help:</strong> Please include your order ID and registered phone/email so we
        can locate your order quickly.
      </p>
    </PageShell>
  );
}
