import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Accordion, Button, Card, Chip, Empty, Field, Input, SectionTitle, Tag, Textarea } from "@/components/ui";
import { useStore } from "@/lib/store";
import { SUPPORT_TYPES, today, uid } from "@/lib/demo-data";
import type { Capacity, CapacityBucket, Task, TaskKind } from "@/lib/types";

export const Route = createFileRoute("/check-in")({
  validateSearch: (search: Record<string, unknown>) => {
    const out: { section?: string; delegate?: string } = {};
    if (typeof search["section"] === "string") out.section = search["section"];
    if (typeof search["delegate"] === "string") out.delegate = search["delegate"];
    return out;
  },
  head: () => ({
    meta: [
      { title: "My Check-In — Connected Care" },
      {
        name: "description",
        content:
          "A private place to notice how you are doing, see what is on your plate, decide what is within your capacity, and delegate the rest.",
      },
      { property: "og:title", content: "My Check-In — Connected Care" },
      {
        property: "og:description",
        content: "Private check-ins for caregivers, with a practical next step for what is outside your capacity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
const BUCKETS: CapacityBucket[] = [
  "I can handle this",
  "I may need help",
  "This is outside my capacity",
];

type SectionId = "how" | "plate" | "capacity" | "delegate";

function CheckInPage() {
  const { state, setState } = useStore();
  const navigate = useNavigate();
  const search = Route.useSearch();

  const initialSection: SectionId =
    search.section === "plate" || search.section === "capacity" || search.section === "delegate"
      ? search.section
      : "how";
  const [open, setOpen] = useState<SectionId | null>(initialSection);
  const toggle = (id: SectionId) => setOpen((v) => (v === id ? null : id));

  /* ---------- Section 1 : how am I doing ---------- */
  const draft = state.checkInDraft ?? {
    mood: "Steady",
    energy: 3,
    capacity: "I am feeling stretched" as Capacity,
    note: "",
  };
  const setDraft = (patch: Partial<typeof draft>) =>
    setState((s) => ({ ...s, checkInDraft: { ...draft, ...patch } }));
  const [saved, setSaved] = useState(false);
  const [supportChoice, setSupportChoice] = useState<string | null>(null);

  const saveCheckIn = () => {
    setState((s) => ({
      ...s,
      checkIns: [
        {
          id: uid(),
          date: today(),
          mood: draft.mood,
          energy: draft.energy,
          capacity: draft.capacity,
          forMyself: "",
          needToday: "",
          outsideCapacity: "",
          notes: draft.note,
          shared: false,
        },
        ...s.checkIns,
      ],
    }));
    setSaved(true);
  };

  /* ---------- Section 2 : what is on my plate ---------- */
  const [taskForm, setTaskForm] = useState<{
    id?: string;
    title: string;
    kind: TaskKind;
    personId: string;
    due: string;
    notes: string;
  }>({ title: "", kind: "Caregiving", personId: "", due: "", notes: "" });
  const [showTaskForm, setShowTaskForm] = useState(false);

  const resetTaskForm = () => {
    setTaskForm({ title: "", kind: "Caregiving", personId: "", due: "", notes: "" });
    setShowTaskForm(false);
  };

  const saveTask = () => {
    if (!taskForm.title.trim()) return;
    const base: Task = {
      id: taskForm.id ?? uid(),
      title: taskForm.title.trim(),
      kind: taskForm.kind,
      bucket: "Not sorted yet",
      done: false,
      createdAt: today(),
      ...(taskForm.personId ? { personId: taskForm.personId } : {}),
      ...(taskForm.due ? { due: taskForm.due } : {}),
      ...(taskForm.notes.trim() ? { notes: taskForm.notes.trim() } : {}),
    };
    setState((s) => ({
      ...s,
      tasks: s.tasks.some((t) => t.id === base.id)
        ? s.tasks.map((t) => (t.id === base.id ? { ...base, bucket: t.bucket, done: t.done } : t))
        : [base, ...s.tasks],
    }));
    resetTaskForm();
  };

  const patchTask = (id: string, patch: Partial<Task>) =>
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));

  const removeTask = (id: string) =>
    setState((s) => ({
      ...s,
      tasks: s.tasks.filter((t) => t.id !== id),
      carePriorities: s.carePriorities.filter((p) => p.taskId !== id),
    }));

  /** Sorting a task into a help bucket surfaces it on that person's Current priorities. */
  const setBucket = (task: Task, bucket: CapacityBucket) =>
    setState((s) => {
      const needsHelp = bucket === "I may need help" || bucket === "This is outside my capacity";
      const hasPriority = s.carePriorities.some((p) => p.taskId === task.id);
      return {
        ...s,
        tasks: s.tasks.map((t) => (t.id === task.id ? { ...t, bucket } : t)),
        carePriorities:
          needsHelp && task.personId && !hasPriority
            ? [
                {
                  id: uid(),
                  personId: task.personId,
                  text: task.title,
                  taskId: task.id,
                  done: false,
                  createdAt: today(),
                },
                ...s.carePriorities,
              ]
            : s.carePriorities,
      };
    });

  const openTasks = state.tasks.filter((t) => !t.done);
  const delegatable = openTasks.filter(
    (t) => t.bucket === "I may need help" || t.bucket === "This is outside my capacity",
  );

  /* ---------- Section 4 : delegation ---------- */
  const [picked, setPicked] = useState<string[]>(search.delegate ? [search.delegate] : []);
  const [delegateAction, setDelegateAction] = useState<string | null>(search.delegate ? "circle" : null);
  const [type, setType] = useState(SUPPORT_TYPES[0] ?? "");
  const [by, setBy] = useState("");
  const [instructions, setInstructions] = useState("");
  const [visibleTo, setVisibleTo] = useState<string[]>([]);
  const [sentCount, setSentCount] = useState(0);
  const [keptPrivate, setKeptPrivate] = useState(false);

  const togglePicked = (id: string) =>
    setPicked((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  const toggleMember = (id: string) =>
    setVisibleTo((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  const sendRequests = () => {
    const tasks = state.tasks.filter((t) => picked.includes(t.id));
    setState((s) => ({
      ...s,
      requests: [
        ...tasks.map((t) => ({
          id: uid(),
          type,
          detail: t.title,
          by: by || t.due || "",
          instructions,
          visibleTo,
          status: "Sent" as const,
          sentAt: today(),
          taskId: t.id,
          ...(t.personId ? { personId: t.personId } : {}),
        })),
        ...s.requests,
      ],
    }));
    setSentCount(tasks.length);
    setPicked([]);
  };

  const personName = (id?: string) => {
    const p = state.people.find((x) => x.id === id);
    return p ? p.preferredName || p.name : "";
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">My check-in</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          This is yours. Nothing here is shared unless you choose to send a request.
        </p>
      </header>

      {/* ============ 1. How am I doing ============ */}
      <Accordion
        id="how"
        title="How am I doing?"
        subtitle="Private by default."
        open={open === "how"}
        onToggle={() => toggle("how")}
      >
        <div className="space-y-6">
          <div>
            <p className="text-base font-medium">Current mood</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <Chip key={m} selected={draft.mood === m} onClick={() => setDraft({ mood: m })}>
                  {m}
                </Chip>
              ))}
            </div>
          </div>

          <Field label={`Energy today: ${draft.energy} of 5`}>
            <input
              type="range"
              aria-label="Energy level"
              aria-valuetext={`${draft.energy} out of 5`}
              min={1}
              max={5}
              step={1}
              value={draft.energy}
              onChange={(e) => setDraft({ energy: Number(e.target.value) })}
              className="w-full accent-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            />
            <div className="mt-2 flex justify-between text-sm font-medium text-muted-foreground" aria-hidden="true">
              <span>Very low</span>
              <span>Full</span>
            </div>
          </Field>

          <div>
            <p className="text-base font-medium">Current capacity</p>
            <div className="mt-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
              {CAPACITIES.map((c) => (
                <Chip
                  key={c}
                  selected={draft.capacity === c}
                  onClick={() => setDraft({ capacity: c })}
                  className="max-w-full whitespace-normal"
                >
                  {c}
                </Chip>
              ))}
            </div>
          </div>

          <Field label="A private note" hint="Optional. Only you can see this.">
            <Textarea value={draft.note} onChange={(e) => setDraft({ note: e.target.value })} />
          </Field>

          <div className="flex flex-wrap gap-3">
            <Button onClick={saveCheckIn}>Save this check-in</Button>
          </div>
          {saved ? (
            <p className="text-base text-secondary-foreground">
              Check-in saved. Nothing is shared unless you choose to share it.
            </p>
          ) : null}

          {draft.capacity === "I need support now" ? (
            <div className="rounded-2xl border border-border bg-accent/12 p-5">
              <p className="font-display text-2xl">What kind of support would help right now?</p>
              <div className="mt-4 grid gap-2">
                {[
                  ["responsibility", "Help with a caregiving responsibility"],
                  ["talk", "Someone to talk to"],
                  ["resource", "A caregiver resource"],
                  ["urgent", "Urgent or emergency support"],
                ].map(([value, label]) => (
                  <Chip
                    key={value}
                    selected={supportChoice === value}
                    onClick={() => setSupportChoice(value as string)}
                    className="max-w-full whitespace-normal"
                  >
                    {label}
                  </Chip>
                ))}
              </div>

              {supportChoice === "responsibility" ? (
                <div className="mt-4 space-y-3">
                  <p className="text-base">
                    Let's move it off your plate. Sort the responsibility, then choose who can help.
                  </p>
                  <Button variant="support" onClick={() => setOpen("delegate")}>
                    Go to what I can delegate
                  </Button>
                </div>
              ) : null}

              {supportChoice === "talk" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to="/care-circle">
                    <Button variant="support">Contact someone in My Care Circle</Button>
                  </Link>
                  <Link to="/care-network" search={{ tab: "Peer Support" }}>
                    <Button variant="quiet">Visit Peer Support in Care Network</Button>
                  </Link>
                </div>
              ) : null}

              {supportChoice === "resource" ? (
                <div className="mt-4">
                  <Link to="/care-network" search={{ tab: "Caregiver Resources" }}>
                    <Button variant="support">Open caregiver resources</Button>
                  </Link>
                </div>
              ) : null}

              {supportChoice === "urgent" ? (
                <div className="mt-4 rounded-2xl border border-border bg-card p-4">
                  <p className="text-base font-semibold">
                    This platform does not provide emergency or medical care.
                  </p>
                  <p className="mt-2 text-base text-foreground">
                    If someone is in immediate danger, call your local emergency number right away. For
                    urgent health questions, contact a doctor, nurse line, or clinic. If you are in
                    crisis, reach a crisis or mental-health line in your area. This prototype cannot give
                    medical advice.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </Accordion>

      {/* ============ 2. What is on my plate ============ */}
      <Accordion
        id="plate"
        title="What is on my plate?"
        subtitle="Everything you are carrying right now, caregiving and personal."
        open={open === "plate"}
        onToggle={() => toggle("plate")}
      >
        <div className="space-y-4">
          {openTasks.length === 0 ? (
            <Empty title="Nothing added yet" body="Try “Pick up groceries for Ruth” or “Rest for thirty minutes.”" />
          ) : (
            <ul className="space-y-3">
              {openTasks.map((t) => (
                <li key={t.id} className="rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag tone={t.kind === "Personal" ? "sage" : "warm"}>{t.kind}</Tag>
                    {t.personId ? <Tag>For {personName(t.personId)}</Tag> : null}
                    {t.due ? <Tag>Due {t.due}</Tag> : null}
                  </div>
                  <p className="mt-2 text-lg">{t.title}</p>
                  {t.notes ? <p className="text-base text-muted-foreground">{t.notes}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      className="px-3 py-2 text-sm"
                      onClick={() => {
                        setTaskForm({
                          id: t.id,
                          title: t.title,
                          kind: t.kind,
                          personId: t.personId ?? "",
                          due: t.due ?? "",
                          notes: t.notes ?? "",
                        });
                        setShowTaskForm(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="ghost" className="px-3 py-2 text-sm" onClick={() => patchTask(t.id, { done: true })}>
                      Mark complete
                    </Button>
                    <Button variant="ghost" className="px-3 py-2 text-sm" onClick={() => removeTask(t.id)}>
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {showTaskForm ? (
            <Card className="space-y-4 bg-muted/30">
              <SectionTitle title={taskForm.id ? "Edit this item" : "Add to my plate"} />
              <Field label="Task or responsibility">
                <Input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Pick up groceries for Ruth"
                />
              </Field>
              <fieldset>
                <legend className="text-base font-medium">Is this personal or caregiving?</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["Caregiving", "Personal"] as TaskKind[]).map((k) => (
                    <Chip key={k} selected={taskForm.kind === k} onClick={() => setTaskForm({ ...taskForm, kind: k })}>
                      {k}
                    </Chip>
                  ))}
                </div>
              </fieldset>
              <Field label="Who is this connected to?" hint="Optional.">
                <select
                  value={taskForm.personId}
                  onChange={(e) => setTaskForm({ ...taskForm, personId: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground"
                >
                  <option value="">No one in particular</option>
                  {state.people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.preferredName || p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Due date" hint="Optional.">
                <Input type="date" value={taskForm.due} onChange={(e) => setTaskForm({ ...taskForm, due: e.target.value })} />
              </Field>
              <Field label="Notes" hint="Optional.">
                <Textarea value={taskForm.notes} onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })} />
              </Field>
              <div className="flex flex-wrap gap-3">
                <Button variant="quiet" onClick={resetTaskForm}>
                  Cancel
                </Button>
                <Button disabled={!taskForm.title.trim()} onClick={saveTask}>
                  Save item
                </Button>
              </div>
            </Card>
          ) : (
            <Button onClick={() => setShowTaskForm(true)}>Add an item</Button>
          )}
        </div>
      </Accordion>

      {/* ============ 3. Capacity sorting ============ */}
      <Accordion
        id="capacity"
        title="What is within my capacity?"
        subtitle="This is about today's circumstances, not how well you are caring for anyone."
        open={open === "capacity"}
        onToggle={() => toggle("capacity")}
      >
        {openTasks.length === 0 ? (
          <Empty title="Nothing to sort yet" body="Add something to your plate first." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {BUCKETS.map((b) => (
              <div key={b} className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="font-display text-xl">{b}</p>
                <ul className="mt-3 space-y-3">
                  {openTasks
                    .filter((t) => t.bucket === b)
                    .map((t) => (
                      <li key={t.id} className="rounded-2xl border border-border bg-card p-3">
                        <p className="text-base">{t.title}</p>
                        {t.personId ? (
                          <p className="text-sm text-muted-foreground">For {personName(t.personId)}</p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {BUCKETS.filter((x) => x !== b).map((x) => (
                            <Chip key={x} onClick={() => setBucket(t, x)} className="max-w-full whitespace-normal px-3 py-1.5 text-sm">
                              Move to “{x}”
                            </Chip>
                          ))}
                        </div>
                      </li>
                    ))}
                  {openTasks.filter((t) => t.bucket === b).length === 0 ? (
                    <li className="text-base text-muted-foreground">Nothing here.</li>
                  ) : null}
                </ul>
              </div>
            ))}
            <div className="rounded-2xl border border-dashed border-border p-4 lg:col-span-3">
              <p className="font-display text-xl">Not sorted yet</p>
              <ul className="mt-3 space-y-3">
                {openTasks
                  .filter((t) => t.bucket === "Not sorted yet")
                  .map((t) => (
                    <li key={t.id} className="rounded-2xl border border-border bg-card p-3">
                      <p className="text-base">{t.title}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {BUCKETS.map((x) => (
                          <Chip key={x} onClick={() => setBucket(t, x)} className="max-w-full whitespace-normal px-3 py-1.5 text-sm">
                            {x}
                          </Chip>
                        ))}
                      </div>
                    </li>
                  ))}
                {openTasks.filter((t) => t.bucket === "Not sorted yet").length === 0 ? (
                  <li className="text-base text-muted-foreground">Everything is sorted.</li>
                ) : null}
              </ul>
            </div>
          </div>
        )}
      </Accordion>

      {/* ============ 4. Delegation ============ */}
      <Accordion
        id="delegate"
        title="What can I delegate?"
        subtitle="Anything you may need help with, or that sits outside your capacity."
        open={open === "delegate"}
        onToggle={() => toggle("delegate")}
      >
        {delegatable.length === 0 ? (
          <Empty
            title="Nothing waiting to be shared"
            body="Sort an item into “I may need help” or “This is outside my capacity” to see it here."
          />
        ) : (
          <div className="space-y-5">
            <fieldset>
              <legend className="text-base font-medium">Choose what to pass on</legend>
              <div className="mt-2 space-y-2">
                {delegatable.map((t) => (
                  <label
                    key={t.id}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background p-3"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 size-5 accent-primary"
                      checked={picked.includes(t.id)}
                      onChange={() => togglePicked(t.id)}
                    />
                    <span>
                      <span className="block text-base">{t.title}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {t.bucket}
                        {t.personId ? ` · For ${personName(t.personId)}` : ""}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-wrap gap-2">
              <Button variant="support" disabled={!picked.length} onClick={() => setDelegateAction("circle")}>
                Ask My Care Circle
              </Button>
              <Link to="/care-network" search={{ tab: "Caregiver Resources" }}>
                <Button variant="quiet">Find outside support</Button>
              </Link>
              <Button
                variant="quiet"
                disabled={!picked.length}
                onClick={() => {
                  setKeptPrivate(true);
                  setDelegateAction(null);
                  setPicked([]);
                }}
              >
                Keep this private for now
              </Button>
            </div>
            {keptPrivate ? (
              <p className="text-base text-secondary-foreground">
                Kept private. It stays on your plate until you decide otherwise.
              </p>
            ) : null}

            {delegateAction === "circle" ? (
              <Card className="space-y-5 bg-muted/30">
                <SectionTitle
                  title="Send a request to your circle"
                  subtitle="Only the people you pick will see this."
                />
                <Field label="Type of support">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground"
                  >
                    {SUPPORT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Desired completion date">
                  <Input type="date" value={by} onChange={(e) => setBy(e.target.value)} />
                </Field>
                <Field label="Instructions">
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="List is on the fridge."
                  />
                </Field>
                <Field label="Who should receive it?">
                  <div className="flex flex-wrap gap-2">
                    {state.members.map((m) => (
                      <Chip
                        key={m.id}
                        selected={visibleTo.includes(m.id)}
                        onClick={() => toggleMember(m.id)}
                        className="max-w-full whitespace-normal"
                      >
                        {m.name} · {m.role}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <p className="rounded-2xl bg-card p-4 text-base text-foreground">
                  They will see the task, the person it involves, the date and your instructions. Your
                  mood, energy and private notes are never shared.
                </p>
                <Button variant="support" disabled={!picked.length || !visibleTo.length} onClick={sendRequests}>
                  Send request
                </Button>
              </Card>
            ) : null}

            {sentCount > 0 ? (
              <p className="text-base text-secondary-foreground">
                {sentCount === 1 ? "Request sent." : `${sentCount} requests sent.`}{" "}
                <button
                  type="button"
                  className="underline underline-offset-4"
                  onClick={() => navigate({ to: "/care-circle" })}
                >
                  Follow it in My Care Circle
                </button>
              </p>
            ) : null}
          </div>
        )}
      </Accordion>

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
