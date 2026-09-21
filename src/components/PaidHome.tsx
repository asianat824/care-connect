import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, Chip, Field, Input, SectionTitle, Tag, Textarea } from "@/components/ui";
import { useStore } from "@/lib/store";
import { uid } from "@/lib/demo-data";
import type { HandoffNote, HandoffUrgency } from "@/lib/types";

export const CARE_OPTIONS = [
  "Meals",
  "Personal care",
  "Medication reminder",
  "Transportation",
  "Appointment support",
  "Household support",
  "Companionship",
  "Other",
];

const PREFERENCE_OPTIONS = [
  "No change",
  "Confirm an existing preference",
  "Add a possible change to review",
];

const URGENCIES: HandoffUrgency[] = ["Routine", "Review soon", "Urgent"];

export function timeStamp() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function HandoffForm({ onDone }: { onDone: () => void }) {
  const { state, setState } = useStore();
  const person = state.people[0];
  const [completed, setCompleted] = useState<string[]>([
    "Meals",
    "Companionship",
    "Appointment support",
  ]);
  const [noticed, setNoticed] = useState(
    "Ruth seemed more tired than usual, but she enjoyed listening to music during dinner.",
  );
  const [followUp, setFollowUp] = useState(
    "Confirm whether she wants tomorrow's appointment moved to the afternoon.",
  );
  const [preference, setPreference] = useState("Confirm an existing preference");
  const [preferenceNote, setPreferenceNote] = useState(
    "Ruth prefers to be asked before plans are changed.",
  );
  const [urgency, setUrgency] = useState<HandoffUrgency>("Review soon");

  const toggle = (opt: string) =>
    setCompleted((c) => (c.includes(opt) ? c.filter((x) => x !== opt) : [...c, opt]));

  const send = () => {
    const note: HandoffNote = {
      id: uid(),
      personId: person?.id ?? "p1",
      personName: person?.preferredName || person?.name || "Mama Ruth",
      from: "Alicia Boateng",
      fromRole: "paid caregiver",
      submittedAt: `Today at ${timeStamp()}`,
      careCompleted: completed,
      noticed,
      followUp,
      preferenceChange: preference,
      preferenceNote,
      urgency,
      sharedWith: "Jordan — Family caregiver",
      reviewed: false,
    };
    setState((s) => ({ ...s, handoffNotes: [note, ...s.handoffNotes] }));
    onDone();
  };

  return (
    <div className="space-y-5">
      <Field label="Person supported">
        <Input value={person?.preferredName || "Mama Ruth"} readOnly />
      </Field>

      <div>
        <p className="text-base font-medium">Care completed today</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CARE_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              selected={completed.includes(opt)}
              onClick={() => toggle(opt)}
              className="max-w-full whitespace-normal"
            >
              {opt}
            </Chip>
          ))}
        </div>
      </div>

      <Field label="What did you notice today?" hint="Share an observation, not a diagnosis.">
        <Textarea value={noticed} onChange={(e) => setNoticed(e.target.value)} />
      </Field>

      <Field label="Is there anything the next caregiver should follow up on?">
        <Textarea value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
      </Field>

      <div>
        <p className="text-base font-medium">Did a preference or communication need change?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PREFERENCE_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              selected={preference === opt}
              onClick={() => setPreference(opt)}
              className="max-w-full whitespace-normal"
            >
              {opt}
            </Chip>
          ))}
        </div>
        {preference !== "No change" ? (
          <div className="mt-3">
            <Field label="Preference in their words">
              <Input
                value={preferenceNote}
                onChange={(e) => setPreferenceNote(e.target.value)}
              />
            </Field>
          </div>
        ) : null}
      </div>

      <div>
        <p className="text-base font-medium">Urgency</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {URGENCIES.map((u) => (
            <Chip key={u} selected={urgency === u} onClick={() => setUrgency(u)}>
              {u}
            </Chip>
          ))}
        </div>
      </div>

      <Field label="Share with">
        <Input value="Jordan — Family caregiver" readOnly />
      </Field>

      <p className="rounded-2xl bg-secondary/25 px-4 py-3 text-base text-foreground">
        Only information you intentionally include in this handoff will be shared. Alicia cannot view
        Jordan's private check-ins, private notes, or Care Network activity.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button onClick={send}>Send handoff to Jordan</Button>
        <Button variant="quiet" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function PaidHome() {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl leading-tight">
          Good evening, Alicia. Let's close the loop before your shift ends.
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          You only see what the family caregiver has chosen to share for this person's care.
        </p>
      </header>

      <Card>
        <SectionTitle title="Today's shift" subtitle="Mama Ruth" />
        <ul className="space-y-2 text-base">
          <li>
            <span className="text-muted-foreground">Shift:</span> 9:00 AM–6:00 PM
          </li>
          <li>
            <span className="text-muted-foreground">Family contact:</span> Jordan
          </li>
          <li>
            <span className="text-muted-foreground">Current priority:</span> Preserve Ruth's evening
            routine and confirm tomorrow's appointment time.
          </li>
        </ul>
        <div className="mt-5">
          {open ? null : (
            <Button
              onClick={() => {
                setOpen(true);
                setSent(false);
              }}
            >
              Complete end-of-shift handoff
            </Button>
          )}
        </div>
        {sent ? (
          <p className="mt-4 rounded-2xl bg-secondary/30 px-4 py-3 text-base text-secondary-foreground">
            Handoff sent to Jordan.{" "}
            <Link to="/care-team" search={{ tab: "Handoff Notes" }} className="underline underline-offset-4">
              View in Care Team
            </Link>
          </p>
        ) : null}
      </Card>

      {open ? (
        <Card>
          <SectionTitle
            title="End-of-shift handoff"
            subtitle="Observations, preferences, and follow-up needs — not a medical record."
          />
          <HandoffForm
            onDone={() => {
              setOpen(false);
              setSent(true);
            }}
          />
        </Card>
      ) : null}

      <Card>
        <SectionTitle
          title="Recent handoffs you've sent"
          action={
            <Link to="/care-team" search={{ tab: "Handoff Notes" }} className="text-base underline underline-offset-4">
              All notes
            </Link>
          }
        />
        {state.handoffNotes.length === 0 ? (
          <p className="text-base text-muted-foreground">
            No handoffs yet today. Your first one will appear here.
          </p>
        ) : (
          <ul className="space-y-3">
            {state.handoffNotes.slice(0, 2).map((n) => (
              <li key={n.id} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone="sage">{n.personName}</Tag>
                  <Tag>{n.submittedAt}</Tag>
                  <Tag tone="warm">Urgency: {n.urgency}</Tag>
                </div>
                <p className="mt-2 text-base">{n.noticed}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
