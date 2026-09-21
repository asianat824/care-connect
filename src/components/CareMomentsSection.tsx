import { useState } from "react";
import { Button, Card, Chip, Empty, Field, Input, SectionTitle, Tag, Textarea } from "@/components/ui";
import { useStore } from "@/lib/store";
import { CONNECTION_PROMPTS, today, uid } from "@/lib/demo-data";
import type { Moment, Person } from "@/lib/types";

const KINDS: Moment["kind"][] = ["Memory", "Song", "Photo", "Story", "Activity", "Prompt answer"];

export function CareMomentsSection({ person }: { person: Person }) {
  const { state, setState } = useStore();
  const firstName = person.name.split(" ")[0] || person.preferredName || person.name;
  const [kind, setKind] = useState<Moment["kind"]>("Memory");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [open, setOpen] = useState(false);

  const prompt = CONNECTION_PROMPTS[new Date().getDate() % CONNECTION_PROMPTS.length] ?? "";
  const paidMember = state.members.find((member) => member.name === "Alicia Boateng");
  const canPaidContribute = paidMember?.permissions.includes("Contribute to Care Moments") ?? false;
  const canContribute = state.role === "family" || canPaidContribute;
  const moments = state.moments.filter((moment) => moment.personId === person.id);

  const add = () => {
    if (!title.trim()) return;
    setState((s) => ({
      ...s,
      moments: [
        {
          id: uid(),
          personId: person.id,
          kind,
          title: title.trim(),
          body: body.trim(),
          author: s.role === "paid" ? "Alicia Boateng" : s.caregiverName,
          authorRole: s.role === "paid" ? "Paid caregiver" : "Family caregiver",
          visibleTo: `${person.preferredName || person.name}’s care team`,
          date: today(),
        },
        ...s.moments,
      ],
    }));
    setTitle("");
    setBody("");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          title="Care Moments"
          subtitle={`Memories, music, stories, and activities that help ${firstName} remain connected to herself and the people around her.`}
          action={
            canContribute ? <Button onClick={() => setOpen(true)}>Add a Care Moment</Button> : undefined
          }
        />
        {state.role === "paid" ? (
          <p className="rounded-2xl bg-secondary/25 p-4 text-base text-foreground">
            {canContribute
              ? "The family caregiver has given you permission to contribute Care Moments for this person."
              : "You may contribute Care Moments only when the family caregiver has given permission."}
          </p>
        ) : null}
        <div className="mt-4 rounded-2xl bg-accent/12 p-4">
          <p className="text-sm font-semibold text-foreground">This week’s connection prompt</p>
          <p className="mt-1 font-display text-2xl">{prompt}</p>
          <Button
            variant="connect"
            className="mt-4"
            disabled={!canContribute}
            onClick={() => {
              setKind("Prompt answer");
              setTitle(prompt);
              setOpen(true);
            }}
          >
            Save a response
          </Button>
        </div>

        {open && canContribute ? (
          <div className="mt-5 space-y-5 rounded-2xl border border-border bg-muted/30 p-4 sm:p-5">
            <div className="flex flex-wrap gap-2">
              {KINDS.map((value) => (
                <Chip key={value} selected={kind === value} onClick={() => setKind(value)}>
                  {value}
                </Chip>
              ))}
            </div>
            <Field label="Title">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="The peach tree summer"
              />
            </Field>
            <Field label="Tell it in your own words">
              <Textarea value={body} onChange={(event) => setBody(event.target.value)} />
            </Field>
            {kind === "Photo" ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-base text-muted-foreground">
                Photo placeholder — uploads are not enabled in this prototype.
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button variant="quiet" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button disabled={!title.trim()} onClick={add}>
                Save this moment
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <section>
        <SectionTitle
          title={`${firstName}’s memory collection`}
          subtitle="Memories, songs, photos, stories, and activities gathered over time."
        />
        {moments.length === 0 ? (
          <Empty title="The memory box is empty" body="Start with a song you both know by heart." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2" aria-live="polite">
            {moments.map((moment) => (
              <Card key={moment.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone="warm">{moment.kind}</Tag>
                  {moment.fromPerson ? <Tag tone="sage">Shared directly by {person.preferredName || firstName}</Tag> : null}
                </div>
                <p className="mt-3 font-display text-xl">{moment.title}</p>
                {moment.body ? <p className="mt-1 text-base text-muted-foreground">{moment.body}</p> : null}
                <p className="mt-3 text-sm text-muted-foreground">
                  Added by {moment.author}
                  {moment.authorRole ? ` · ${moment.authorRole}` : ""} · {moment.date}
                </p>
                <p className="text-sm text-muted-foreground">
                  Visible to {moment.visibleTo ?? `${person.preferredName || person.name}’s care team`}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
