import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, Chip, Empty, Field, Tag, Textarea } from "@/components/ui";
import { useStore } from "@/lib/store";
import { today, uid } from "@/lib/demo-data";
import type { DetailKey } from "@/lib/types";

export const Route = createFileRoute("/my-voice")({
  validateSearch: (search: Record<string, unknown>) => ({
    ...(typeof search["person"] === "string" ? { person: search["person"] } : {}),
    ...(search["mode"] === "together" ? { mode: "together" as const } : {}),
  } as { person?: string; mode?: "together" }),
  head: () => ({
    meta: [
      { title: "My Voice — Connected Care" },
      {
        name: "description",
        content:
          "A simple, accessible space for the person receiving care to share preferences, feelings, and memories in their own words.",
      },
      { property: "og:title", content: "My Voice — Connected Care" },
      {
        property: "og:description",
        content: "In their own words: preferences, feelings, and memories.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyVoicePage,
});

const QUESTIONS: { label: string; key: DetailKey }[] = [
  { label: "What matters to you right now?", key: "whatMatters" },
  { label: "How do you want people to communicate with you?", key: "communication" },
  { label: "What helps you feel comfortable?", key: "comfort" },
  { label: "Is there something you want your caregivers to remember?", key: "preferences" },
  { label: "Has anything changed recently?", key: "coordination" },
  { label: "Is there something you would enjoy doing together?", key: "preferences" },
];

function MyVoicePage() {
  const { state, setState } = useStore();
  const { person } = Route.useSearch();
  const people = state.people.filter((p) => p.voiceInvited);
  const current = state.people.find((p) => p.id === person) ?? people[0];
  const [question, setQuestion] = useState(QUESTIONS[0]?.label ?? "");
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);

  if (!current) {
    return (
      <Empty
        title="My Voice isn't turned on yet"
        body="Open a person's profile and choose “Invite them to contribute” to turn this on."
        action={
          <Link to="/care-circle" search={{ tab: "People I Care For" }}>
            <Button>Go to profiles</Button>
          </Link>
        }
      />
    );
  }

  const save = () => {
    if (!answer.trim()) return;
    const selectedQuestion = QUESTIONS.find((q) => q.label === question);
    if (!selectedQuestion) return;
    setState((s) => ({
      ...s,
      people: s.people.map((p) =>
        p.id === current.id
          ? {
              ...p,
              [selectedQuestion.key]: [
                { id: uid(), text: answer.trim(), source: "Completed together" as const, status: "Current" as const, dateAdded: today(), lastConfirmed: today(), confirmedBy: s.caregiverName },
                ...p[selectedQuestion.key],
              ],
              voiceEntries: [
                { id: uid(), date: today(), label: question, text: answer.trim(), source: "Completed together" as const },
                ...p.voiceEntries,
              ],
            }
          : p,
      ),
    }));
    setAnswer("");
    setSaved(true);
  };

  return (
    <div className="space-y-8 text-lg">
      <header>
        <p className="mb-2 text-base font-semibold text-muted-foreground">My Voice preview</p>
        <h1 className="font-display text-5xl leading-tight">Your voice matters here.</h1>
        <p className="mt-3 text-xl text-muted-foreground">
          Share what helps you feel comfortable, respected, and connected.
        </p>
      </header>

      <Card className="space-y-6">
        <p className="text-xl font-semibold">What would you like to share?</p>
        <div className="flex flex-col gap-3">
          {QUESTIONS.map((q) => (
            <Chip
              key={q.label}
              selected={question === q.label}
              onClick={() => {
                setQuestion(q.label);
                setSaved(false);
              }}
            >
              <span className="text-lg">{q.label}</span>
            </Chip>
          ))}
        </div>
        <Field label={question}>
          <Textarea
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="text-xl"
            placeholder="Say it however you like."
          />
        </Field>
        <div className="rounded-2xl border border-border bg-muted/60 p-4">
          <p className="font-semibold text-foreground">Who can see this?</p>
          <p className="mt-1 text-base text-muted-foreground">
             Your caregiver will receive this response. It will be labeled as something you completed together.
          </p>
        </div>
        <Button className="w-full py-4 text-xl" onClick={save}>Share my words</Button>
        {saved ? <p className="text-lg text-secondary-foreground">Saved. Thank you.</p> : null}
      </Card>

      <Card>
        <p className="font-display text-2xl">What you have shared</p>
        <p className="mt-2 text-lg text-muted-foreground">
          Your care circle can read these words. They are always marked as coming from you.
        </p>
        {current.voiceEntries.length === 0 ? (
          <p className="mt-4 text-lg text-muted-foreground">You haven't added anything yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {current.voiceEntries.map((v) => (
              <li key={v.id} className="rounded-2xl bg-muted/60 p-4">
                  <Tag tone="sage">{v.source === "Direct guest response" ? `Shared directly by ${current.preferredName || current.name.split(" ")[0]}` : `Added together with ${current.preferredName || current.name.split(" ")[0]}`}</Tag>
                <p className="mt-2 text-base text-muted-foreground">
                  {v.label} · {v.date}
                </p>
                <p className="text-lg">{v.text}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Link to="/care-circle" search={{ tab: "People I Care For", person: current.id }} className="block text-lg underline underline-offset-4">
        ← Back to the caregiver view
      </Link>
    </div>
  );
}
