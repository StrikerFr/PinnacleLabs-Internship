import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/shared/Navbar";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Lock,
  Truck,
  ShieldCheck,
  Star,
  Sparkles,
  Leaf,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }).parse,
  head: () => ({
    meta: [
      { title: "Sign in — VedaGlows" },
      {
        name: "description",
        content: "Sign in to your VedaGlows account to track orders and continue your skin reset.",
      },
    ],
  }),
  component: AuthPage,
});

function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
  maxLength,
  minLength,
  autoComplete,
  rightSlot,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  autoComplete?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={maxLength}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder=" "
        className="peer w-full rounded-2xl border border-foreground/12 bg-white/90 px-4 pt-5 pb-2 text-[15px] text-foreground outline-none focus:border-[#143A2A] focus:ring-4 focus:ring-[#143A2A]/8 transition-all"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-foreground/45 transition-all peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10.5px] peer-focus:tracking-[0.2em] peer-focus:uppercase peer-focus:text-[#143A2A] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10.5px] peer-[:not(:placeholder-shown)]:tracking-[0.2em] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:text-foreground/55"
      >
        {label}
      </label>
      {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>}
    </div>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("demo@vedaglows.com");
  const [password, setPassword] = useState("123456");
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState("Demo User");
  const [phone, setPhone] = useState("+91 99999 99999");
  const [loading, setLoading] = useState(false);

  const goNext = () => {
    const dest = search.redirect && search.redirect.startsWith("/") ? search.redirect : "/account";
    navigate({ to: dest as any });
  };

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const finalEmail = email.trim() || "demo@vedaglows.com";
    const finalPassword = password || "123456";
    const finalName = name.trim() || "Demo User";
    const finalPhone = phone.trim() || "+91 99999 99999";

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: finalEmail,
          password: finalPassword,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: finalName, phone: finalPhone },
          },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in!");
        goNext();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: finalEmail,
          password: finalPassword,
        });
        if (error) throw error;
        toast.success("Welcome back");
        goNext();
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        toast.error(error.message ?? "Google sign-in failed");
        return;
      }
    } catch (err: any) {
      toast.error(err.message ?? "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot() {
    if (!email) return toast.error("Enter your email above first");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent. Check your email.");
  }

  const isSignIn = mode === "signin";

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 600px at 85% -10%, rgba(201,168,106,0.18), transparent 60%), radial-gradient(900px 500px at -10% 110%, rgba(20,58,42,0.10), transparent 60%), linear-gradient(180deg, #FBF7EF 0%, #F5EEDF 100%)",
      }}
    >
      <Navbar />

      {/* Soft texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply"
        style={{
          backgroundImage: "radial-gradient(rgba(20,58,42,0.06) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-24 lg:pt-28 pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* LEFT BRAND PANEL */}
          <section className="hidden lg:flex flex-col relative">
            <div
              className="relative rounded-[2rem] overflow-hidden p-10 xl:p-14"
              style={{
                background: "linear-gradient(160deg, #143A2A 0%, #1d4f3a 55%, #0e2c20 100%)",
                boxShadow: "0 40px 80px -30px rgba(20,58,42,0.55)",
              }}
            >
              {/* glow blobs */}
              <div
                className="absolute -top-24 -right-24 w-80 h-80 rounded-full"
                style={{
                  background: "radial-gradient(closest-side, rgba(232,201,138,0.35), transparent)",
                }}
              />
              <div
                className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full"
                style={{
                  background: "radial-gradient(closest-side, rgba(255,255,255,0.06), transparent)",
                }}
              />

              {/* floating ingredients */}
              <div className="absolute top-10 right-10 flex flex-col gap-3">
                {["Neem", "Turmeric", "Manjistha"].map((herb, i) => (
                  <span
                    key={herb}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] tracking-[0.22em] uppercase text-[#E8C98A] backdrop-blur"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(232,201,138,0.25)",
                      animation: `float 6s ease-in-out ${i * 0.8}s infinite`,
                    }}
                  >
                    <Leaf className="h-3 w-3" /> {herb}
                  </span>
                ))}
              </div>

              <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.32em] uppercase text-[#E8C98A]">
                <Sparkles className="h-3 w-3" /> 28-Day Skin Reset
              </span>

              <h2
                className="mt-6 font-serif text-white text-[44px] xl:text-[54px] leading-[1.05]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Begin Your
                <br />
                <em className="italic" style={{ color: "#E8C98A" }}>
                  28-Day Skin Reset
                </em>
              </h2>

              <p className="mt-5 text-[15px] leading-relaxed text-white/75 max-w-md">
                Join thousands of customers building healthier skin with VedaGlows's Ayurveda-rooted
                ritual.
              </p>

              <ul className="mt-8 space-y-3.5">
                {[
                  "7,200+ Happy Customers",
                  "4.8 / 5 Customer Rating",
                  "Made For Indian Skin",
                  "Secure & Encrypted Checkout",
                ].map((line) => (
                  <li key={line} className="flex items-center gap-3 text-white/90 text-[14.5px]">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[#143A2A]"
                      style={{ background: "linear-gradient(135deg,#E8C98A,#C9A86A)" }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {line}
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex items-center gap-4 pt-6 border-t border-white/10">
                <div className="flex -space-x-2">
                  {[
                    "https://i.pravatar.cc/80?img=47",
                    "https://i.pravatar.cc/80?img=32",
                    "https://i.pravatar.cc/80?img=12",
                    "https://i.pravatar.cc/80?img=45",
                  ].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="Happy customer"
                      loading="lazy"
                      decoding="async"
                      className="h-9 w-9 rounded-full border-2 border-[#143A2A] object-cover"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[#E8C98A]">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                    <span className="ml-1 text-xs text-white/80">4.8 / 5</span>
                  </div>
                  <p className="text-[11px] text-white/60 tracking-wide">
                    Loved by 7,200+ customers
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT AUTH CARD */}
          <section className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <div
              className="relative rounded-[2rem] p-7 sm:p-9"
              style={{
                background: "rgba(255,253,248,0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(20,58,42,0.08)",
                boxShadow:
                  "0 30px 70px -25px rgba(20,58,42,0.25), 0 8px 20px -10px rgba(20,58,42,0.08)",
              }}
            >
              <div className="text-center">
                <span className="inline-block text-[10px] tracking-[0.34em] uppercase text-foreground/55">
                  {isSignIn ? "Welcome Back" : "Join VedaGlows"}
                </span>
                <h1
                  className="mt-2 font-serif italic text-[34px] sm:text-[38px] text-foreground leading-tight"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {isSignIn ? "Welcome Back" : "Begin Your Reset"}
                </h1>
                <p className="mt-2 text-[13.5px] text-foreground/60">
                  {isSignIn
                    ? "Continue your skin reset journey."
                    : "Create your account in seconds."}
                </p>
              </div>

              <button
                onClick={handleGoogle}
                disabled={loading}
                className="mt-7 group w-full flex items-center justify-center gap-3 rounded-2xl border border-foreground/12 bg-white py-3.5 text-[14px] font-medium text-foreground hover:border-foreground/25 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="my-6 flex items-center gap-3 text-[10px] tracking-[0.32em] uppercase text-foreground/40">
                <div className="flex-1 h-px bg-foreground/10" /> or{" "}
                <div className="flex-1 h-px bg-foreground/10" />
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                {!isSignIn && (
                  <>
                    <FloatingInput
                      id="name"
                      label="Full Name"
                      value={name}
                      onChange={setName}
                      required
                      maxLength={120}
                      autoComplete="name"
                    />
                    <FloatingInput
                      id="phone"
                      label="Phone Number"
                      type="tel"
                      value={phone}
                      onChange={setPhone}
                      required
                      maxLength={20}
                      autoComplete="tel"
                    />
                  </>
                )}
                <FloatingInput
                  id="email"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  required
                  maxLength={255}
                  autoComplete="email"
                />
                <FloatingInput
                  id="password"
                  label="Password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  required
                  minLength={6}
                  maxLength={72}
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="p-2 text-foreground/45 hover:text-foreground/70 transition"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />

                {isSignIn && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleForgot}
                      className="text-[12px] text-foreground/60 hover:text-[#143A2A] underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl py-4 text-[12px] font-semibold tracking-[0.28em] uppercase text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #1d4f3a 0%, #143A2A 50%, #0e2c20 100%)",
                    boxShadow: "0 18px 36px -14px rgba(20,58,42,0.55)",
                  }}
                >
                  {loading ? "Please wait…" : isSignIn ? "Sign In" : "Create Account"}
                </button>
              </form>

              {/* Signup / signin secondary CTA */}
              <button
                type="button"
                onClick={() => setMode(isSignIn ? "signup" : "signin")}
                className="mt-5 w-full group flex items-center justify-between rounded-2xl border border-dashed border-foreground/15 px-5 py-3.5 hover:border-[#143A2A]/40 hover:bg-white transition-all"
              >
                <span className="flex flex-col items-start">
                  <span className="text-[10px] tracking-[0.28em] uppercase text-foreground/50">
                    {isSignIn ? "New to VedaGlows?" : "Already a member?"}
                  </span>
                  <span className="text-[14px] font-semibold text-foreground">
                    {isSignIn ? "Create Account" : "Sign In Instead"}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-[#143A2A] group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Social proof */}
              <div className="mt-6 flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-[#C9A86A]">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                  <span className="ml-1.5 text-[12px] font-medium text-foreground/75">4.8 / 5</span>
                </div>
                <p className="text-[11px] text-foreground/55 tracking-wide">
                  Trusted by 7,200+ customers
                </p>
              </div>

              {/* Micro trust row */}
              <div className="mt-5 grid grid-cols-3 gap-2 pt-5 border-t border-foreground/8">
                {[
                  { Icon: Lock, label: "Secure Login" },
                  { Icon: Truck, label: "Fast Delivery" },
                  { Icon: ShieldCheck, label: "Safe Payments" },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                    <Icon className="h-3.5 w-3.5 text-[#143A2A]" strokeWidth={1.8} />
                    <span className="text-[10px] tracking-[0.18em] uppercase text-foreground/55">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-5 text-center text-[11px] text-foreground/45 tracking-wide">
              By continuing you agree to our{" "}
              <Link to="/terms" className="underline hover:text-foreground/70">
                Terms
              </Link>{" "}
              &{" "}
              <Link to="/privacy" className="underline hover:text-foreground/70">
                Privacy
              </Link>
              .
            </p>
          </section>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0) }
          50% { transform: translateY(-6px) }
        }
      `}</style>
    </main>
  );
}
