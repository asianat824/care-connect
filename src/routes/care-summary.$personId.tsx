import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Tag } from "@/components/ui";
import { SECTION_LABELS, sourceLabel } from "@/lib/details";
import { useStore } from "@/lib/store";
import type { DetailKey } from "@/lib/types";

export const Route = createFileRoute("/care-summary/$personId")({
  head: () => ({ meta: [
    { title: "Printable Care Summary — [PROJECT NAME]" },
    { name: "description", content: "A concise, printable summary of selected current care details, preferences, routines, and confirmation dates." },
    { property: "og:title", content: "Printable Care Summary — [PROJECT NAME]" },
    { property: "og:description", content: "Selected current details that help someone feel understood." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: CareSummaryPage,
});

const KEYS: DetailKey[] = ["whatMatters", "communication", "comfort", "routines", "preferences", "coordination"];

function CareSummaryPage() {
  const { state } = useStore();
  const { personId } = Route.useParams();
  const person = state.people.find((item) => item.id === personId);
  if (!person) return <main className="mx-auto max-w-3xl px-5 py-12"><h1 className="font-display text-4xl">Care summary unavailable</h1><Link to="/people" className="mt-5 block underline">Return to People I Care For</Link></main>;
  const current = KEYS.flatMap((key) => person[key].filter((detail) => !detail.archived && detail.status === "Current").map((detail) => ({ key, detail })));
  const selectedIds = person.summaryDetailIds ?? current.map(({ detail }) => detail.id);

  return <main className="care-summary mx-auto min-h-screen max-w-4xl px-5 py-8 sm:py-12">
    <div className="print-controls mb-7 flex flex-wrap items-center justify-between gap-3"><Link to="/people" search={{ person: person.id }} className="underline underline-offset-4">← Back to {person.name}</Link><Button onClick={() => window.print()}>Print summary</Button></div>
    <article className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <header className="border-b border-border pb-5"><p className="text-sm font-semibold text-muted-foreground">CARE SUMMARY</p><h1 className="mt-1 font-display text-4xl">{person.preferredName || person.name}</h1><p className="mt-1 text-base text-muted-foreground">{person.name} · {person.relationship}{person.pronouns ? ` · ${person.pronouns}` : ""}</p><p className="mt-3 text-sm text-foreground">Selected current details to support respectful, familiar care. Confirm details directly when circumstances change.</p></header>
      <div className="summary-grid mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">{KEYS.map((key) => {
        const details = current.filter((item) => item.key === key && selectedIds.includes(item.detail.id));
        if (!details.length) return null;
        return <section key={key} className={key === "whatMatters" || key === "communication" ? "sm:col-span-2" : ""}><h2 className="font-display text-xl">{SECTION_LABELS[key]}</h2><ul className="mt-2 space-y-3">{details.map(({ detail }) => <li key={detail.id} className="border-l-2 border-secondary pl-3"><p className="text-base leading-snug">{detail.text}</p><div className="mt-1 flex flex-wrap items-center gap-2"><Tag tone={detail.source === "Needs confirmation" ? "warm" : "sage"}>{sourceLabel(detail, person, state.caregiverName)}</Tag><span className="text-xs text-muted-foreground">Confirmed {detail.lastConfirmed}</span></div></li>)}</ul></section>;
      })}</div>
      <footer className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground"><p>Prepared from [PROJECT NAME]. This is a care reminder, not a medical record. Last printed {new Date().toLocaleDateString()}.</p></footer>
    </article>
  </main>;
}