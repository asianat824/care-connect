import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, Chip, Empty, Field, Input, SectionTitle, Tag, Textarea } from "@/components/ui";
import { useStore } from "@/lib/store";
import { SUPPORT_TYPES, today, uid } from "@/lib/demo-data";
import type { Capacity } from "@/lib/types";

export const Route = createFileRoute("/check-in")({
  head: () => ({
    meta: [
      { title: "My Check-In — [PROJECT NAME]" },
      {
        name: "description",
        content:
          "A private place to notice your mood, energy, and capacity, and to ask for help when you need it.",
      },
      { property: "og:title", content: "My Check-In — [PROJECT NAME]" },
      {
        property: "og:description",
        content: "Private check-ins for caregivers, with an easy way to turn a need into a request.",
      },
    ],
  }),
  component: CheckInPage,
});

const MOODS = ["Steady", "Tender", "Tired", "Frustrated", "Grateful", "Numb", "Hopeful"];
const CAPACITIES: Capacity[] = [
  "I have capacity",
  "I am feeling stretched",
  "I am overwhelmed",
  "I need support now",
];

function CheckInPage() {
  const { state, setState } = useStore();
  const [mood, setMood] = useState("Steady");
  const [energy, setEnergy] = useState(3);
  const [capacity, setCapacity] = useState<Capacity>("I am feeling stretched");
  const [forMyself, setForMyself] = useState("");
  const [needToday, setNeedToday] = useState("");
  const [outside, setOutside] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const [showRequest, setShowRequest] = useState(false);
  const [type, setType] = useState(SUPPORT_TYPES[0] ?? "");
  const [detail, setDetail] = useState("");
  const [by, setBy] = useState("");
  const [instructions, setInstructions] = useState("");
  const [visibleTo, setVisibleTo] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  const saveCheckIn = (shared: boolean) => {
    setState((s) => ({
      ...s,
      checkIns: [
        {
          id: uid(),
          date: today(),
          mood,
          energy,
          capacity,
          forMyself,
          needToday,
          outsideCapacity: outside,
          notes,
          shared,
        },
        ...s.checkIns,
      ],
    }));
    setSaved(true);
  };

  const sendRequest = () => {
    setState((s) => ({
      ...s,
      requests: [
        {
          id: uid(),
          type,
          detail: detail || outside,
          by,
          instructions,
          visibleTo,
          status: "open",
        },
        ...s.requests,
      ],
    }));
    setSent(true);
  };

  const toggleMember = (id: string) =>
    setVisibleTo((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl">My check-in</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          This is yours. Check-ins are private by default — nothing leaves this page unless you send
          a request for help.
        </p>
      </header>

      <Card className="space-y-6">
        <div>
          <p className="text-base font-medium">How are you feeling right now?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <Chip key={m} selected={mood === m} onClick={() => setMood(m)}>
                {m}
              </Chip>
            ))}
          </div>
        </div>

        <Field label={`Energy today: ${energy} of 5`}>
          <input
            type="range"
            min={1}
            max={5}
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="w-full accent-[var(--color-accent)]"
          />
        </Field>

        <div>
          <p className="text-base font-medium">What is your capacity today?</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {CAPACITIES.map((c) => (
              <Chip key={c} selected={capacity === c} onClick={() => setCapacity(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>

        <Field label="What have you done for yourself today?">
          <Textarea value={forMyself} onChange={(e) => setForMyself(e.target.value)} />
        </Field>
        <Field label="What do you need today?">
          <Textarea value={needToday} onChange={(e) => setNeedToday(e.target.value)} />
        </Field>
        <Field
          label="What feels outside of your capacity?"
          hint="You can keep this private or turn it into a request."
        >
          <Textarea
            value={outside}
            onChange={(e) => setOutside(e.target.value)}
            placeholder="Getting groceries before Thursday"
          />
        </Field>
        <Field label="Anything else on your mind">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => saveCheckIn(false)}>Keep this private</Button>
          {outside.trim() ? (
            <Button
              variant="support"
              onClick={() => {
                saveCheckIn(false);
                setDetail(outside);
                setShowRequest(true);
              }}
            >
              Turn this into a request for help
            </Button>
          ) : null}
        </div>
        {saved ? <p className="text-base text-secondary-foreground">Check-in saved privately.</p> : null}
      </Card>

      {showRequest ? (
        <Card>
          <SectionTitle
            title="Ask for help"
            subtitle="Only the people you pick below will see this request."
          />
          <div className="space-y-5">
            <Field label="Type of support">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base"
              >
                {SUPPORT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="What do you need?">
              <Textarea value={detail} onChange={(e) => setDetail(e.target.value)} />
            </Field>
            <Field label="Preferred date">
              <Input type="date" value={by} onChange={(e) => setBy(e.target.value)} />
            </Field>
            <Field label="Any instructions">
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="List is on the fridge."
              />
            </Field>
            <Field label="Who can see this request?">
              <div className="flex flex-wrap gap-2">
                {state.members.map((m) => (
                  <Chip
                    key={m.id}
                    selected={visibleTo.includes(m.id)}
                    onClick={() => toggleMember(m.id)}
                  >
                    {m.name} · {m.role}
                  </Chip>
                ))}
              </div>
            </Field>
            <p className="rounded-2xl bg-muted p-4 text-base text-muted-foreground">
              They will see the request and instructions only. Your mood, energy, and notes stay
              private.
            </p>
            <Button variant="support" disabled={!visibleTo.length || sent} onClick={sendRequest}>
              {sent ? "Request sent" : "Send request"}
            </Button>
          </div>
        </Card>
      ) : null}

      <Card>
        <SectionTitle title="Your check-in history" subtitle="Gentle patterns, not diagnoses." />
        {state.checkIns.length === 0 ? (
          <Empty title="No check-ins yet" body="Your first check-in will appear here." />
        ) : (
          <ul className="space-y-3">
            {state.checkIns.slice(0, 8).map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-2 rounded-2xl border border-border p-4">
                <span className="text-sm text-muted-foreground">{c.date}</span>
                {c.mood ? <Tag>{c.mood}</Tag> : null}
                <Tag tone="sage">Energy {c.energy}/5</Tag>
                <Tag tone="warm">{c.capacity}</Tag>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
