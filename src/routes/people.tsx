import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Empty,
  Field,
  Input,
  SectionTitle,
  Tabs,
  Tag,
  Textarea,
} from "@/components/ui";
import { useStore } from "@/lib/store";
import { today, uid } from "@/lib/demo-data";
import type { Person } from "@/lib/types";

export const Route = createFileRoute("/people")({
  validateSearch: (search: Record<string, unknown>) => ((typeof search["person"] === "string" ? { person: search["person"] as string } : {}) as { person?: string }),
  head: () => ({
    meta: [
      { title: "People I Care For — [PROJECT NAME]" },
      {
        name: "description",
        content:
          "Remember the whole person: what matters to them, routines, preferences, and how they like to be spoken with.",
      },
      { property: "og:title", content: "People I Care For — [PROJECT NAME]" },
      {
        property: "og:description",
        content: "Personhood first: preferences, routines, and warm handoffs.",
      },
    ],
  }),
  component: PeoplePage,
});

const SECTIONS = [
  "About Them",
  "Routine",
  "Preferences",
  "Communication",
  "Important Updates",
  "Care Coordination",
  "Care Moments",
];

function PeoplePage() {
  const { state, setState } = useStore();
  const { person } = Route.useSearch();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");

  const selected = state.people.find((p) => p.id === person);
  if (selected) return <PersonDetail person={selected} />;

  const addPerson = () => {
    const id = uid();
    setState((s) => ({
      ...s,
      people: [
        ...s.people,
        {
          id,
          name,
          preferredName: name.split(" ")[0] ?? name,
          relationship,
          pronouns: "",
          whatMatters: [],
          routines: [],
          likes: [],
          dislikes: [],
          communication: [],
          comfort: [],
          updates: [],
          coordination: [],
          voiceInvited: false,
          voiceEntries: [],
        },
      ],
    }));
    setName("");
    setRelationship("");
    setAdding(false);
    navigate({ to: "/people", search: { person: id } });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl">People I care for</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          The details that make care feel personal, not procedural.
        </p>
      </header>

      {state.people.length === 0 ? (
        <Empty
          title="No one added yet"
          body="Add the person you care for so their preferences and routines live in one place."
          action={<Button onClick={() => setAdding(true)}>Add a person</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {state.people.map((p) => (
            <Link key={p.id} to="/people" search={{ person: p.id }}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <Avatar name={p.name} photo={p.photo} size={56} />
                  <div>
                    <p className="font-display text-xl">{p.name}</p>
                    <p className="text-base text-muted-foreground">{p.relationship}</p>
                  </div>
                </div>
                {p.whatMatters[0] ? (
                  <p className="mt-4 text-base text-muted-foreground">“{p.whatMatters[0]}”</p>
                ) : null}
              </Card>
            </Link>
          ))}
        </div>
      )}

      {adding ? (
        <Card className="space-y-4">
          <SectionTitle title="Add someone" />
          <Field label="Their name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Your relationship to them">
            <Input value={relationship} onChange={(e) => setRelationship(e.target.value)} />
          </Field>
          <div className="flex gap-3">
            <Button variant="quiet" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button disabled={!name.trim()} onClick={addPerson}>
              Save
            </Button>
          </div>
        </Card>
      ) : state.people.length ? (
        <Button variant="quiet" onClick={() => setAdding(true)}>
          Add another person
        </Button>
      ) : null}
    </div>
  );
}

function PersonDetail({ person }: { person: Person }) {
  const { state, setState } = useStore();
  const [tab, setTab] = useState(SECTIONS[0] ?? "");
  const [draft, setDraft] = useState("");
  const [handoff, setHandoff] = useState<string | null>(null);

  const update = (fn: (p: Person) => Person) =>
    setState((s) => ({ ...s, people: s.people.map((p) => (p.id === person.id ? fn(p) : p)) }));

  const addTo = (key: "whatMatters" | "routines" | "likes" | "dislikes" | "communication" | "comfort" | "coordination") => {
    if (!draft.trim()) return;
    update((p) => ({ ...p, [key]: [...p[key], draft.trim()] }));
    setDraft("");
  };

  const moments = state.moments.filter((m) => m.personId === person.id);

  const createHandoff = () => {
    const text = [
      `Warm handoff for ${person.preferredName || person.name} · ${today()}`,
      "",
      `What happened recently: ${person.updates[0]?.text ?? "No new updates this week."}`,
      `What needs attention: ${state.requests.find((r) => r.status !== "complete")?.detail ?? "Nothing urgent right now."}`,
      `Current preferences: ${[...person.communication, ...person.comfort].slice(0, 3).join("; ") || "Ask her before starting anything new."}`,
      `Next planned action: ${person.coordination[0] ?? "Check in tomorrow morning."}`,
      `Who is responsible: ${state.members[0]?.name ?? state.caregiverName}`,
    ].join("\n");
    setHandoff(text);
    setState((s) => ({
      ...s,
      handoffs: [
        {
          id: uid(),
          personId: person.id,
          date: today(),
          recent: person.updates[0]?.text ?? "No new updates this week.",
          attention:
            s.requests.find((r) => r.status !== "complete")?.detail ?? "Nothing urgent right now.",
          preferences:
            [...person.communication, ...person.comfort].slice(0, 3).join("; ") ||
            "Ask her before starting anything new.",
          next: person.coordination[0] ?? "Check in tomorrow morning.",
          responsible: s.members[0]?.name ?? s.caregiverName,
        },
        ...s.handoffs,
      ],
    }));
  };

  const list = (items: string[], key: Parameters<typeof addTo>[0], placeholder: string) => (
    <div>
      {items.length === 0 ? (
        <p className="text-base text-muted-foreground">Nothing here yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((i, idx) => (
            <li key={idx} className="rounded-2xl bg-muted/60 px-4 py-3 text-base">
              {i}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} />
        <Button variant="support" onClick={() => addTo(key)}>
          Add
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <Link to="/people" className="text-base underline underline-offset-4">
        ← All people
      </Link>

      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={person.name} photo={person.photo} size={72} />
        <div>
          <h1 className="font-display text-4xl">{person.preferredName || person.name}</h1>
          <p className="text-lg text-muted-foreground">
            {person.relationship}
            {person.pronouns ? ` · ${person.pronouns}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="connect" onClick={createHandoff}>
          Create warm handoff
        </Button>
        {person.voiceInvited ? (
          <Link to="/my-voice" search={{ person: person.id }}>
            <Button variant="support">Open My Voice</Button>
          </Link>
        ) : (
          <Button
            variant="quiet"
            onClick={() => update((p) => ({ ...p, voiceInvited: true }))}
          >
            Invite them to contribute
          </Button>
        )}
      </div>

      {handoff ? (
        <Card className="bg-accent/12">
          <SectionTitle title="Warm handoff summary" subtitle="Saved to your care circle." />
          <pre className="whitespace-pre-wrap font-sans text-base">{handoff}</pre>
        </Card>
      ) : null}

      <Tabs tabs={SECTIONS} active={tab} onChange={setTab} />

      <Card>
        {tab === "About Them" && (
          <>
            <SectionTitle title="What matters to them" />
            {list(person.whatMatters, "whatMatters", "Being asked, not told")}
          </>
        )}
        {tab === "Routine" && (
          <>
            <SectionTitle title="Daily routines" />
            {list(person.routines, "routines", "Rests between 1:00 and 3:00")}
          </>
        )}
        {tab === "Preferences" && (
          <div className="space-y-8">
            <div>
              <SectionTitle title="Likes" />
              {list(person.likes, "likes", "Likes gospel music in the morning")}
            </div>
            <div>
              <SectionTitle title="Dislikes" />
              {list(person.dislikes, "dislikes", "Being rushed")}
            </div>
            <div>
              <SectionTitle title="Comfort" />
              {list(person.comfort, "comfort", "Lamp light, not overhead")}
            </div>
          </div>
        )}
        {tab === "Communication" && (
          <>
            <SectionTitle
              title="Communication style"
              subtitle="How they most like to be spoken with."
            />
            {list(person.communication, "communication", "Prefers one instruction at a time")}
          </>
        )}
        {tab === "Important Updates" && (
          <>
            <SectionTitle title="Important updates" />
            {person.updates.length === 0 ? (
              <p className="text-base text-muted-foreground">No updates yet.</p>
            ) : (
              <ul className="space-y-2">
                {person.updates.map((u) => (
                  <li key={u.id} className="rounded-2xl bg-muted/60 px-4 py-3">
                    <p className="text-sm text-muted-foreground">{u.date}</p>
                    <p className="text-base">{u.text}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Slept well two nights in a row."
              />
              <Button
                variant="support"
                onClick={() => {
                  if (!draft.trim()) return;
                  update((p) => ({
                    ...p,
                    updates: [{ id: uid(), date: today(), text: draft.trim() }, ...p.updates],
                  }));
                  setDraft("");
                }}
              >
                Add
              </Button>
            </div>
          </>
        )}
        {tab === "Care Coordination" && (
          <>
            <SectionTitle title="Care coordination notes" subtitle="Practical, not clinical." />
            {list(person.coordination, "coordination", "Prefers appointments after 11:00 a.m.")}
          </>
        )}
        {tab === "Care Moments" && (
          <>
            <SectionTitle title="Care moments" subtitle="Connection is care." />
            {moments.length === 0 ? (
              <Empty
                title="No moments yet"
                body="Add a song, a story, or a memory you share with them."
                action={
                  <Link to="/moments">
                    <Button variant="connect">Go to Care Moments</Button>
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-3">
                {moments.map((m) => (
                  <li key={m.id} className="rounded-2xl border border-border p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag tone="warm">{m.kind}</Tag>
                      {m.fromPerson ? <Tag tone="sage">In their own words</Tag> : null}
                    </div>
                    <p className="mt-2 font-display text-xl">{m.title}</p>
                    <p className="text-base text-muted-foreground">{m.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
