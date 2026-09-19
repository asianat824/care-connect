import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Heart, Home, HeartHandshake, Users, Sparkles, RotateCcw } from "lucide-react";
import { useStore } from "@/lib/store";
import { Onboarding } from "./Onboarding";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/check-in", label: "My Check-In", icon: Heart },
  { to: "/people", label: "People I Care For", icon: HeartHandshake },
  { to: "/care-circle", label: "My Care Circle", icon: Users },
  { to: "/moments", label: "Care Moments", icon: Sparkles },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { state, reset, ready } = useStore();

  if (!ready) return null;
  if (!state.onboarded) return <Onboarding />;

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card/70 px-5 py-8 md:flex">
        <p className="font-display text-xl text-foreground">[PROJECT NAME]</p>
        <p className="mt-1 text-sm text-muted-foreground">Connection is care.</p>
        <nav className="mt-8 flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              inactiveProps={{ className: "text-foreground hover:bg-muted" }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-base transition-colors"
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>
        <button
          onClick={reset}
          className="mt-auto flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-muted-foreground hover:bg-muted"
        >
          <RotateCcw size={16} /> Reset demo
        </button>
      </aside>

      <div className="flex-1 pb-28 md:pb-0">
        <header className="flex items-center justify-between border-b border-border bg-card/70 px-5 py-4 md:hidden">
          <p className="font-display text-lg">[PROJECT NAME]</p>
          <button onClick={reset} className="text-sm text-muted-foreground">
            Reset demo
          </button>
        </header>
        <main className="mx-auto w-full max-w-4xl px-5 py-8 md:py-12">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-card/95 backdropolor backdrop-blur md:hidden">
        {nav.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            activeProps={{ className: "text-accent-foreground" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            className="flex flex-col items-center gap-1 px-1 py-3 text-[11px] leading-tight"
          >
            <Icon size={20} />
            <span className="text-center">{label.replace("People I Care For", "People")}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
