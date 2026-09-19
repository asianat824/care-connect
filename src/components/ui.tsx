import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border bg-card p-6 shadow-[0_1px_0_0_var(--color-border)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-2xl text-foreground">{title}</h2>
        {subtitle ? <p className="mt-1 text-base text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

type Variant = "primary" | "support" | "connect" | "quiet" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  support: "bg-secondary text-secondary-foreground hover:bg-secondary/85",
  connect: "bg-accent text-accent-foreground hover:bg-accent/85",
  quiet: "border border-border bg-card text-foreground hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-medium transition-colors disabled:opacity-50",
        variants[variant],
        className,
      )}
    />
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-base font-medium text-foreground">{label}</span>
      {hint ? <span className="mt-0.5 block text-sm text-muted-foreground">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

const fieldBase =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldBase, props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={cn(fieldBase, props.className)} />;
}

export function Chip({
  selected,
  children,
  onClick,
  className,
}: {
  selected?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "min-h-11 rounded-full border px-4 py-2 text-left text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        selected
          ? "border-transparent bg-secondary text-secondary-foreground"
          : "border-border bg-card text-foreground hover:bg-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Tag({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "warm" | "sage" }) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    warm: "bg-accent/20 text-accent-foreground",
    sage: "bg-secondary/40 text-secondary-foreground",
  };
  return (
    <span className={cn("rounded-full px-3 py-1 text-sm font-medium", tones[tone])}>{children}</span>
  );
}

export function Avatar({ name, photo, size = 48 }: { name: string; photo?: string | undefined; size?: number | undefined }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  return photo ? (
    <img
      src={photo}
      alt={name}
      style={{ width: size, height: size }}
      className="rounded-full object-cover"
    />
  ) : (
    <span
      style={{ width: size, height: size, fontSize: size / 2.8 }}
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-accent/25 font-display text-accent-foreground"
    >
      {initials}
    </span>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-8 text-center">
      <p className="font-display text-xl text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-base text-muted-foreground">{body}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div className="-mx-1 flex flex-wrap gap-2 px-1 pb-1" role="tablist">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={active === t}
          onClick={() => onChange(t)}
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-2 text-base transition-colors",
            active === t
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-foreground hover:bg-muted",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
