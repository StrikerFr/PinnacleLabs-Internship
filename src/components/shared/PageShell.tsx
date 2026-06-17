import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function PageShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[color:var(--ivory)]">
      <Navbar />
      <section className="px-4 sm:px-6 md:px-10 pt-24 md:pt-32 pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase text-foreground/60 hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back Home
          </Link>
          {eyebrow && (
            <div className="text-[10px] tracking-[0.4em] uppercase text-primary mb-4">
              {eyebrow}
            </div>
          )}
          <h1
            className="font-serif font-light leading-[1.05] tracking-tight text-foreground"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
            }}
          >
            {title}
          </h1>
          <div className="mt-8 md:mt-10 prose-content text-[15px] leading-[1.75] text-foreground/80 space-y-5">
            {children}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
