import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Avatar, Button, Card, Chip, Empty, SectionTitle, Tag } from "@/components/ui";
import { useStore } from "@/lib/store";
import { CONNECTION_PROMPTS, today, uid } from "@/lib/demo-data";
import type { Capacity } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — [PROJECT NAME]" },
      {
        name: "description",
        content: "Your calm daily view: how you're holding up, who needs you, and what's next.",
      },
      { property: "og:title", content: "Home — [PROJECT NAME]" },
      {
        property: "og:description",
        content: "A calm daily view for caregivers: capacity, people, requests, and care moments.",
      },
    ],
  }),
  component: HomePage,
});

const CAPACITIES: Capacity[] = [
  "I have capacity",
  "I am feeling stretched",
  "I am overwhelmed",
  "I need support now",
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function HomePage() {
  const { state, setState } = useStore();
  const [quick, setQuick] = useState<Capacity | null>(null);
  const prompt = CONNECTION_PROMPTS[new Date().getDay() % CONNECTION_PROMPTS.length];
  const openRequests = state.requests.filter((r) => r.status !== "complete");

  const saveQuick = (c: Capacity) => {
    setQuick(c);
    setState((s) => ({
      ...s,
      checkIns: [
        {
          id: uid(),
          date: today(),
          mood: "",
          energy: 3,
          capacity: c,
          forMyself: "",
          needToday: "",
          outsideCapacity: "",
          notes: "Quick capacity check-in",
          shared: false,
        },
        ...s.checkIns,
      ],
    }));
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl leading-tight">
          {greeting()}, {state.caregiverName}. How are you holding up today?
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Nothing here is shared unless you choose to share it.
        </p>
      </header>

      <Card>
        <SectionTitle title="A quick capacity check-in" subtitle="Private. One tap." />
        <div className="flex flex-wrap gap-2">
          {CAPACITIES.map((c) => (
            <Chip key={c} selected={quick === c} onClick={() => saveQuick(c)}>
              {c}
            </Chip>
          ))}
        </div>
        {quick ? (
          <p className="mt-4 text-base text-secondary-foreground">
            Saved. Thank you for being honest with yourself.
          </p>
        ) : null}
        <Link to="/check-in" className="mt-5 block">
          <Button className="w-full sm:w-auto">Complete a full check-in</Button>
        </Link>
      </Card>

      <Card>
        <SectionTitle
          title="People I care for"
          action={
            <Link to="/people" className="text-base underline underline-offset-4">
              Open profiles
            </Link>
          }
        />
        <div className="flex flex-wrap gap-4">
          {state.people.map((p) => (
            <Link
              key={p.id}
              to="/people"
              search={{ person: p.id }}
              className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 hover:bg-muted"
            >
              <Avatar name={p.name} photo={p.photo} />
              <span>
                <span className="block text-base font-semibold">{p.preferredName || p.name}</span>
                <span className="block text-sm text-muted-foreground">{p.relationship}</span>
              </span>
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle
          title="Current requests for help"
          action={
            <Link to="/care-circle" className="text-base underline underline-offset-4">
              Care circle
            </Link>
          }
        />
        {openRequests.length === 0 ? (
          <Empty
            title="No open requests"
            body="When something falls outside your capacity, you can turn it into a request from your check-in."
          />
        ) : (
          <ul className="space-y-3">
            {openRequests.map((r) => (
              <li key={r.id} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone="warm">{r.type}</Tag>
                  <Tag>{r.status === "accepted" ? `Accepted by ${r.acceptedBy}` : "Waiting"}</Tag>
                </div>
                <p className="mt-2 text-base">{r.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <SectionTitle title="Recent care circle activity" />
        <ul className="space-y-3">
          {[...state.updates].slice(0, 2).map((u) => (
            <li key={u.id} className="rounded-2xl bg-muted/60 p-4">
              <p className="text-sm text-muted-foreground">
                {u.from} · {u.date}
              </p>
              <p className="mt-1 text-base">{u.text}</p>
            </li>
          ))}
          {state.offers.slice(0, 1).map((o) => (
            <li key={o.id} className="rounded-2xl bg-secondary/25 p-4">
              <p className="text-sm text-muted-foreground">{o.from} offered help</p>
              <p className="mt-1 text-base">{o.text}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="bg-accent/12">
        <SectionTitle title="A care moment" subtitle="Connection is care." />
        <p className="font-display text-2xl">{prompt}</p>
        <Link to="/moments" className="mt-5 block">
          <Button variant="connect">Answer this together</Button>
        </Link>
      </Card>
    </div>
  );
}
