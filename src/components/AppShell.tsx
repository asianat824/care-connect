import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Heart,
  Home,
  Users,
  Sparkles,
  RotateCcw,
  Network,
  MessagesSquare,
  UserRound,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Onboarding } from "./Onboarding";
import type { CareRole } from "@/lib/types";

const familyNav = [
  { to: "/", label: "Home", icon: Home, short: "Home" },
  { to: "/check-in", label: "My Check-In", icon: Heart, short: "Check-In" },
  { to: "/care-circle", label: "My Care Circle", icon: Users, short: "Circle" },
  { to: "/care-network", label: "Care Network", icon: Network, short: "Network" },
  { to: "/moments", label: "Care Moments", icon: Sparkles, short: "Moments" },
] as const;

const paidNav = [
  { to: "/", label: "Home", icon: Home, short: "Home" },
  { to: "/check-in", label: "My Check-In", icon: Heart, short: "Check-In" },
  { to: "/care-team", label: "Care Team", icon: Users, short: "Team" },
  { to: "/care-connect", label: "Care Connect", icon: MessagesSquare, short: "Connect" },
  { to: "/moments", label: "Care Moments", icon: Sparkles, short: "Moments" },
] as const;

export const ROLE_PROFILE: Record<CareRole, { initials: string; name: string; role: string }> = {
  family: { initials: "JT", name: "Jordan", role: "Family caregiver" },
  paid: { initials: "AB", name: "Alicia Boateng", role: "Paid caregiver" },
};

function ProfileCard() {
  const { state, setState } = useStore();
  const navigate = useNavigate();
  const profile = ROLE_PROFILE[state.role] ?? ROLE_PROFILE.family;

  return (
    <div className="mt-4 rounded-2xl border border-border bg-background/70 p-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/25 font-display text-accent-foreground">
          {profile.initials}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-base font-semibold text-foreground">
            {profile.name}
          </span>
          <span className="block truncate text-sm text-muted-foreground">{profile.role}</span>
        </span>
      </div>
      <label className="mt-3 block">
        <span className="text-sm font-medium text-foreground">Switch care role</span>
        <select
          value={state.role}
          onChange={(e) => {
            setState((s) => ({ ...s, role: e.target.value as CareRole }));
            navigate({ to: "/" });
          }}
          className="mt-1 w-full rounded-full border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <option value="family">Family caregiver</option>
          <option value="paid">Paid caregiver</option>
        </select>
      </label>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { state, reset, ready } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!ready) return null;
  if (pathname.startsWith("/voice-guest/")) return <>{children}</>;
  if (!state.onboarded) return <Onboarding />;

  const nav = state.role === "paid" ? paidNav : familyNav;

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card/70 px-5 py-8 md:flex">
        <p className="font-display text-xl text-foreground">Connected Care</p>
        <p className="mt-1 text-sm text-muted-foreground">Connection is care.</p>
        <ProfileCard />
        <nav className="mt-6 flex flex-col gap-1">
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
        <header className="border-b border-border bg-card/70 px-5 py-4 md:hidden">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg">Connected Care</p>
            <button onClick={reset} className="text-sm text-muted-foreground">
              Reset demo
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/25 font-display text-sm text-accent-foreground">
              {(ROLE_PROFILE[state.role] ?? ROLE_PROFILE.family).initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">
                {(ROLE_PROFILE[state.role] ?? ROLE_PROFILE.family).name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {(ROLE_PROFILE[state.role] ?? ROLE_PROFILE.family).role}
              </span>
            </span>
            <MobileRoleSelect />
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl px-5 py-8 md:py-12">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-card/95 backdrop-blur md:hidden">
        {nav.map(({ to, label, icon: Icon, short }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            activeProps={{ className: "text-accent-foreground" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            aria-label={label}
            className="min-w-0 flex flex-col items-center gap-1 px-0.5 py-3 text-[10px] leading-tight"
          >
            <Icon size={20} />
            <span className="text-center">{short}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function MobileRoleSelect() {
  const { state, setState } = useStore();
  const navigate = useNavigate();
  return (
    <label className="flex items-center gap-1">
      <UserRound size={16} aria-hidden="true" className="text-muted-foreground" />
      <span className="sr-only">Switch care role</span>
      <select
        aria-label="Switch care role"
        value={state.role}
        onChange={(e) => {
          setState((s) => ({ ...s, role: e.target.value as CareRole }));
          navigate({ to: "/" });
        }}
        className="rounded-full border border-border bg-card px-2 py-1 text-xs text-foreground"
      >
        <option value="family">Family caregiver</option>
        <option value="paid">Paid caregiver</option>
      </select>
    </label>
  );
}
