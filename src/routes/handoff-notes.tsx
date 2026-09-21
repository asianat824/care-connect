import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, Empty, SectionTitle, Tag } from "@/components/ui";
import { useStore } from "@/lib/store";
import { HandoffForm } from "@/components/PaidHome";

export const Route = createFileRoute("/handoff-notes")({
  head: () => ({
    meta: [
      { title: "Handoff Notes — Connection Is Care" },
      {
        name: "description",
        content: "End-of-shift handoffs a paid caregiver has shared with the family caregiver.",
      },
      { property: "og:title", content: "Handoff Notes — Connection Is Care" },
      {
        property: "og:description",
        content: "Respectful end-of-shift handoffs shared with consent.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HandoffNotesPage,
});

function HandoffNotesPage() {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl leading-tight">Handoff notes</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          What you chose to share at the end of each shift.
        </p>
      </header>

      <Card>
        <SectionTitle title="New handoff" subtitle="Share an observation, not a diagnosis." />
        {open ? (
          <HandoffForm
            onDone={() => {
              setOpen(false);
              setSent(true);
            }}
          />
        ) : (
          <>
            {sent ? (
              <p className="mb-4 rounded-2xl bg-secondary/30 px-4 py-3 text-base text-secondary-foreground">
                Handoff sent to Jordan.
              </p>
            ) : null}
            <Button onClick={() => setOpen(true)}>Complete end-of-shift handoff</Button>
          </>
        )}
      </Card>

      <Card>
        <SectionTitle title="Sent notes" />
        {state.handoffNotes.length === 0 ? (
          <Empty
            title="No handoffs yet"
            body="When you finish a shift, your handoff note will be saved here and sent to the family caregiver."
          />
        ) : (
          <ul className="space-y-4">
            {state.handoffNotes.map((n) => (
              <li key={n.id} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone="sage">{n.personName}</Tag>
                  <Tag>{n.submittedAt}</Tag>
                  <Tag tone="warm">Urgency: {n.urgency}</Tag>
                  <Tag>{n.reviewed ? "Reviewed by Jordan" : "Sent to Jordan"}</Tag>
                </div>
                <p className="mt-3 text-base">
                  <span className="text-muted-foreground">Care completed: </span>
                  {n.careCompleted.join(", ") || "—"}
                </p>
                <p className="mt-1 text-base">
                  <span className="text-muted-foreground">What I noticed: </span>
                  {n.noticed}
                </p>
                <p className="mt-1 text-base">
                  <span className="text-muted-foreground">Follow-up: </span>
                  {n.followUp}
                </p>
                {n.preferenceChange !== "No change" ? (
                  <p className="mt-1 text-base">
                    <span className="text-muted-foreground">{n.preferenceChange}: </span>
                    {n.preferenceNote}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
