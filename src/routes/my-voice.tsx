import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, Chip, Empty, Field, Tag, Textarea } from "@/components/ui";
import { useStore } from "@/lib/store";
import { today, uid } from "@/lib/demo-data";

export const Route = createFileRoute("/my-voice")({
  validateSearch: (search: Record<string, unknown>) => ({
    person: typeof search.person === "string" ? search.person : undefined,
  }),
  head: () => ({
    meta: [
      { title: "My Voice — [PROJECT NAME]" },
      {
        name: "description",
        content:
          "A simple, accessible space for the person receiving care to share preferences, feelings, and memories in their own words.",
      },
      { property: "og:title", content: "My Voice — [PROJECT NAME]" },
      {
        property: "og:description",
        content: "In their own words: preferences, feelings, and memories.",
      },
    ],
  }),
  component: MyVoicePage,
});

const QUESTIONS = [
  "How I am feeling today",
  "How I would like people to talk with me",
  "What I want help with",
  "What I would enjoy doing",
  "Something I want to remember",
];

function MyVoicePage() {
  const { state, setState } = useStore();
  const { person } = Route.useSearch();
  const people = state.people.filter((p) => p.voiceInvited);
  const current = state.people.find((p) => p.id === person) ?? people[0];
  const [question, setQuestion] = useState(QUESTIONS[0]);
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);

  if (!current) {
    return (
      <Empty
        title="My Voice isn't turned on yet"
        body="Open a person's profile and choose “Invite them to contribute” to turn this on."
        action={
          <Link to="/people">
            <Button>Go to profiles</Button>
          </Link>
        }
      />
    );
  }

  const save = () => {
    if (!answer.trim()) return;
    setState((s) => ({
      ...s,
      people: s.people.map((p) =>
        p.id === current.id
          ? {
              ...p,
              voiceEntries: [
                { id: uid(), date: today(), label: question, text: answer.trim() },
                ...p.voiceEntries,
              ],
            }
          : p,
      ),
      moments:
        question === "Something I want to remember"
          ? [
              {
                id: uid(),
                personId: current.id,
                kind: "Memory",
                title: answer.trim().slice(0, 60),
                body: answer.trim(),
                author: current.preferredName || current.name,
                fromPerson: true,
                date: today(),
              },
              ...s.moments,
            ]
          : s.moments,
    }));
    setAnswer("");
    setSaved(true);
  };

  return (
    <div className="space-y-8 text-lg">
      <header>
        <h1 className="font-display text-5xl leading-tight">My Voice</h1>
        <p className="mt-3 text-xl text-muted-foreground">
          This is {current.preferredName || current.name}'s space. Only they can add words here.
        </p>
      </header>

      <Card className="space-y-6">
        <p className="text-xl font-semibold">What would you like to say today?</p>
        <div className="flex flex-col gap-3">
          {QUESTIONS.map((q) => (
            <Chip
              key={q}
              selected={question === q}
              onClick={() => {
                setQuestion(q);
                setSaved(false);
              }}
            >
              <span className="text-lg">{q}</span>
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
        <Button className="w-full py-4 text-xl" onClick={save}>
          Save my words
        </Button>
        {saved ? <p className="text-lg text-secondary-foreground">Saved. Thank you.</p> : null}
      </Card>

      <Card>
        <p className="font-display text-2xl">What will be shared</p>
        <p className="mt-2 text-lg text-muted-foreground">
          Your care circle can read these words. They are always marked as coming from you.
        </p>
        {current.voiceEntries.length === 0 ? (
          <p className="mt-4 text-lg text-muted-foreground">You haven't added anything yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {current.voiceEntries.map((v) => (
              <li key={v.id} className="rounded-2xl bg-muted/60 p-4">
                <Tag tone="sage">In their own words</Tag>
                <p className="mt-2 text-base text-muted-foreground">
                  {v.label} · {v.date}
                </p>
                <p className="text-lg">{v.text}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Link to="/people" className="block text-lg underline underline-offset-4">
        ← Back to the caregiver view
      </Link>
    </div>
  );
}
