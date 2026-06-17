import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { AuroraBg } from "./AuroraBg";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const NAV: { to: "/app" | "/app/roadmaps" | "/app/settings"; label: string; exact?: boolean }[] = [
  { to: "/app", label: "Today", exact: true },
  { to: "/app/roadmaps", label: "Roadmaps" },
  { to: "/app/settings", label: "Profile" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    // Default to light theme unless explicitly stored as dark
    if (stored === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      if (!stored) {
        localStorage.setItem("theme", "light");
      }
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className="relative min-h-screen bg-ivory transition-colors duration-500">
      <AuroraBg />

      {/* Floating top nav */}
      <div className="sticky top-4 z-40 px-4 flex justify-center">
        <nav className="tp-floatnav flex items-center gap-1 px-2 py-2 rounded-full transition-colors duration-500">
          <Link
            to="/"
            className="flex items-center gap-2.5 pl-4 pr-5 py-1.5 rounded-full transition-opacity hover:opacity-80"
            aria-label="Go to Home Page"
          >
            <span className="flex items-center gap-1.5 font-bold tracking-tight text-[16px] text-ink">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #7dd3fc 0%, #c4b5fd 100%)",
                  boxShadow: "0 2px 8px -2px rgba(125,211,252,0.6)",
                }}
              />
              TaskPilot
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-0.5 border-l border-[color:color-mix(in_oklab,var(--ink)_10%,transparent)] pl-2 ml-1">
            {NAV.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-3.5 py-2 rounded-full text-[13.5px] font-medium transition ${
                    active
                      ? "bg-ink text-ivory"
                      : "text-coffee hover:text-ink hover:bg-[color:color-mix(in_oklab,var(--ink)_6%,transparent)]"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </div>

          {/* Theme Switcher */}
          <div className="flex items-center pl-2 border-l border-[color:color-mix(in_oklab,var(--ink)_10%,transparent)] ml-2 mr-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-coffee hover:text-ink hover:bg-[color:color-mix(in_oklab,var(--ink)_6%,transparent)] transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </nav>
      </div>

      <main className="relative z-10 transition-colors duration-500">{children}</main>
    </div>
  );
}
