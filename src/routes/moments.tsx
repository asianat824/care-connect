import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, Chip, Empty, Field, Input, SectionTitle, Tag, Textarea } from "@/components/ui";
import { useStore } from "@/lib/store";
import { CONNECTION_PROMPTS, today, uid } from "@/lib/demo-data";
import type { Moment } from "@/lib/types";

export const Route = createFileRoute("/moments")({
  head: () => ({
    meta: [
      { title: "Care Moments — [PROJECT NAME]" },
      {
        name: "description",
        content:
          "A digital memory box for songs, stories, photos, and the moments that keep the relationship alive.",
      },
      { property: "og:title", content: "Care Moments — [PROJECT NAME]" },
      { property: "og:description", content: "Connection is care. Songs, stories, and memories." },
    ],
  }),
  component: MomentsPage,
});

const KINDS: Moment["kind"][] = ["Memory", "Song", "Photo", "Story", "Activity", "Prompt answer"];

function MomentsPage() {
  const { state, setState } = useStore();
  const [kind, setKind] = useState<Moment["kind"]>("Memory");
  const [personId, setPersonId] = useState(state.people[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [filterPersonId, setFilterPersonId] = useState(state.people[0]?.id ?? "");
  const prompt = CONNECTION_PROMPTS[new Date().getDate() % CONNECTION_PROMPTS.length] ?? "";

  const add = () => {
    if (!title.trim()) return;
    setState((s) => ({
      ...s,
      moments: [
        {
          id: uid(),
          personId,
          kind,
          title: title.trim(),
          body: body.trim(),
          author: s.caregiverName,
          date: today(),
        },
        ...s.moments,
      ],
    }));
    setTitle("");
    setBody("");
  };

  const nameFor = (id: string) =>
    state.people.find((p) => p.id === id)?.preferredName ?? "Someone";
  const sharedNameFor = (id: string) =>
    state.people.find((p) => p.id === id)?.name.split(" ")[0] ?? "them";
  const visibleMoments = state.people.length > 1
    ? state.moments.filter((m) => m.personId === filterPersonId)
    : state.moments;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl">Care moments</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Connection is care. A memory box for the parts of caregiving that aren't tasks.
        </p>
      </header>

      {state.people.length > 1 ? (
        <Field label="Whose care moments would you like to see?">
          <select
            value={filterPersonId}
            onChange={(e) => {
              setFilterPersonId(e.target.value);
              setPersonId(e.target.value);
            }}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground"
          >
            {state.people.map((p) => (
              <option key={p.id} value={p.id}>{p.preferredName || p.name}</option>
            ))}
          </select>
        </Field>
      ) : null}

      <Card className="bg-accent/12">
        <SectionTitle title="This week's connection prompt" />
        <p className="font-display text-2xl">{prompt}</p>
        <Button
          variant="connect"
          className="mt-4"
          onClick={() => {
            setKind("Prompt answer");
            setTitle(prompt);
          }}
        >
          Save a response
        </Button>
      </Card>

      <Card className="space-y-5">
        <SectionTitle title="Add a moment" subtitle="Photos and media use local placeholders." />
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <Chip key={k} selected={kind === k} onClick={() => setKind(k)}>
              {k}
            </Chip>
          ))}
        </div>
        {state.people.length > 1 ? (
          <Field label="Who is this about?">
            <select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base"
            >
              {state.people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        <Field label="Title">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="The peach tree summer"
          />
        </Field>
        <Field label="Tell it in your own words">
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} />
        </Field>
        {kind === "Photo" ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-base text-muted-foreground">
            Photo placeholder — uploads are not enabled in this prototype.
          </div>
        ) : null}
        <Button onClick={add}>Save this moment</Button>
      </Card>

      {visibleMoments.length === 0 ? (
        <Empty title="The memory box is empty" body="Start with a song you both know by heart." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleMoments.map((m) => (
            <Card key={m.id}>
              <div className="flex flex-wrap items-center gap-2">
                <Tag tone="warm">{m.kind}</Tag>
                <Tag>{nameFor(m.personId)}</Tag>
                {m.fromPerson ? <Tag tone="sage">Shared by {sharedNameFor(m.personId)}</Tag> : null}
              </div>
              <p className="mt-3 font-display text-xl">{m.title}</p>
              {m.body ? <p className="mt-1 text-base text-muted-foreground">{m.body}</p> : null}
              <p className="mt-3 text-sm text-muted-foreground">
                Added by {m.author} · {m.date}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
