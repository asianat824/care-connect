import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Chip,
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
import type { Permission } from "@/lib/types";

export const Route = createFileRoute("/care-circle")({
  head: () => ({
    meta: [
      { title: "My Care Circle — [PROJECT NAME]" },
      {
        name: "description",
        content:
          "Invite trusted people, manage permissions, share requests and updates, and pass along warm handoffs.",
      },
      { property: "og:title", content: "My Care Circle — [PROJECT NAME]" },
      {
        property: "og:description",
        content: "A trusted circle for requests, offers, updates, and warm handoffs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CareCirclePage,
});

const TABS = [
  "Members",
  "Requests",
  "Updates",
  "Handoffs",
];

const PERMISSIONS: Permission[] = [
  "View basic care information",
  "View important updates",
  "Receive requests for help",
  "Add care updates",
  "Contribute to Care Moments",
];

function CareCirclePage() {
  const { state, setState } = useStore();
  const [tab, setTab] = useState(TABS[0] ?? "");
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "",
    contact: "",
    availability: "",
    helpsWith: "",
  });
  const [perms, setPerms] = useState<Permission[]>(["View basic care information"]);
  const [updateText, setUpdateText] = useState("");

  const togglePerm = (p: Permission) =>
    setPerms((v) => (v.includes(p) ? v.filter((x) => x !== p) : [...v, p]));

  const invite = () => {
    setState((s) => ({
      ...s,
      members: [...s.members, { id: uid(), ...form, permissions: perms }],
    }));
    setForm({ name: "", role: "", contact: "", availability: "", helpsWith: "" });
    setPerms(["View basic care information"]);
    setInviting(false);
  };

  const setRequest = (id: string, patch: Partial<(typeof state.requests)[number]>) =>
    setState((s) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl">My care circle</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          The people who show up. Everyone sees only what you allow.
        </p>
      </header>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "Members" && (
        <div className="space-y-4">
          {state.members.map((m) => (
            <Card key={m.id}>
              <div className="flex items-start gap-4">
                <Avatar name={m.name} />
                <div className="flex-1">
                  <p className="font-display text-xl">{m.name}</p>
                  <p className="text-base text-muted-foreground">
                    {m.role} · {m.contact}
                  </p>
                  <p className="mt-2 text-base">Available: {m.availability}</p>
                  <p className="text-base">Can help with: {m.helpsWith}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.permissions.map((p) => (
                      <Tag key={p} tone="sage">
                        {p}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {inviting ? (
            <Card className="space-y-4">
              <SectionTitle title="Invite someone you trust" />
              <Field label="Name">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Relationship or role">
                <Input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="Sister, neighbor, paid caregiver"
                />
              </Field>
              <Field label="Contact">
                <Input
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                />
              </Field>
              <Field label="Availability">
                <Input
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                />
              </Field>
              <Field label="What they can help with">
                <Input
                  value={form.helpsWith}
                  onChange={(e) => setForm({ ...form, helpsWith: e.target.value })}
                />
              </Field>
              <Field label="Permission level" hint="Nobody gets everything by default.">
                <div className="flex flex-col gap-2">
                  {PERMISSIONS.map((p) => (
                    <Chip key={p} selected={perms.includes(p)} onClick={() => togglePerm(p)}>
                      {p}
                    </Chip>
                  ))}
                </div>
              </Field>
              <div className="flex gap-3">
                <Button variant="quiet" onClick={() => setInviting(false)}>
                  Cancel
                </Button>
                <Button disabled={!form.name.trim()} onClick={invite}>
                  Send invitation
                </Button>
              </div>
            </Card>
          ) : (
            <Button onClick={() => setInviting(true)}>Invite someone</Button>
          )}
        </div>
      )}

      {tab === "Requests" && (
        <div className="space-y-4">
          <SectionTitle title="Requests for help" />
          {state.requests.length === 0 ? (
            <Empty
              title="No requests yet"
              body="Requests start in your check-in, when something feels outside your capacity."
            />
          ) : (
            state.requests.map((r) => {
              const declined = r.declinedBy ?? [];
              const stuck = r.status === "Declined" || r.status === "No response";
              const person = state.people.find((p) => p.id === r.personId);
              return (
                <Card key={r.id} className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag tone="warm">{r.type}</Tag>
                    <Tag>Status: {r.status}</Tag>
                    {r.status === "Accepted" && r.acceptedBy ? <Tag tone="sage">Accepted by {r.acceptedBy}</Tag> : null}
                    {person ? <Tag>For {person.preferredName || person.name}</Tag> : null}
                  </div>
                  <p className="text-lg">{r.detail}</p>
                  {r.by ? <p className="text-base text-muted-foreground">Needed by {r.by}</p> : null}
                  {r.instructions ? (
                    <p className="text-base text-muted-foreground">{r.instructions}</p>
                  ) : null}
                  <p className="text-sm text-muted-foreground">
                    Sent to{" "}
                    {r.visibleTo
                      .map((id) => state.members.find((m) => m.id === id)?.name)
                      .filter(Boolean)
                      .join(", ") || "no one yet"}
                    {r.sentAt ? ` on ${r.sentAt}` : ""}
                  </p>
                  {declined.length ? (
                    <p className="text-sm text-muted-foreground">Declined by {declined.join(", ")}.</p>
                  ) : null}
                  {(r.questions ?? []).map((q) => (
                    <p key={q.id} className="rounded-2xl bg-muted p-3 text-base">
                      <strong>{q.from} asked:</strong> {q.text}
                    </p>
                  ))}

                  <div className="flex flex-wrap gap-2">
                    {(r.status === "Sent" || r.status === "Draft") &&
                      r.visibleTo.map((id) => {
                        const m = state.members.find((x) => x.id === id);
                        if (!m || declined.includes(m.name)) return null;
                        return (
                          <div key={id} className="flex flex-wrap gap-2">
                            <Button
                              variant="support"
                              className="px-4 py-2 text-sm"
                              onClick={() => setRequest(r.id, { status: "Accepted", acceptedBy: m.name })}
                            >
                              Accept as {m.name}
                            </Button>
                            <Button
                              variant="quiet"
                              className="px-4 py-2 text-sm"
                              onClick={() => {
                                const rest = r.visibleTo.filter((x) => x !== id);
                                setRequest(r.id, {
                                  declinedBy: [...declined, m.name],
                                  status: rest.length ? "Sent" : "Declined",
                                });
                              }}
                            >
                              Decline as {m.name}
                            </Button>
                            <Button
                              variant="quiet"
                              className="px-4 py-2 text-sm"
                              onClick={() =>
                                setRequest(r.id, {
                                  questions: [
                                    ...(r.questions ?? []),
                                    { id: uid(), from: m.name, text: "What time works best?" },
                                  ],
                                })
                              }
                            >
                              Ask a question as {m.name}
                            </Button>
                          </div>
                        );
                      })}
                    {r.status === "Sent" ? (
                      <Button
                        variant="ghost"
                        className="px-4 py-2 text-sm"
                        onClick={() => setRequest(r.id, { status: "No response" })}
                      >
                        Mark as no response
                      </Button>
                    ) : null}
                    {r.status === "Accepted" ? (
                      <Button variant="quiet" className="px-4 py-2 text-sm" onClick={() => setRequest(r.id, { status: "Completed" })}>
                        Mark complete
                      </Button>
                    ) : null}
                    {r.status !== "Completed" && r.status !== "Cancelled" ? (
                      <Button variant="ghost" className="px-4 py-2 text-sm" onClick={() => setRequest(r.id, { status: "Cancelled" })}>
                        Cancel request
                      </Button>
                    ) : null}
                  </div>

                  {stuck ? (
                    <div className="rounded-2xl border border-border bg-muted/50 p-4">
                      <p className="font-display text-xl">No one has taken this yet.</p>
                      <Button className="mt-3" onClick={() => setStuckOpen(stuckOpen === r.id ? null : r.id)}>
                        I still need help
                      </Button>
                      {stuckOpen === r.id ? (
                        <div className="mt-4 space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Ask another Care Circle member",
                              "Change the request",
                              "Divide it into smaller tasks",
                            ].map((label) => (
                              <Chip
                                key={label}
                                selected={stuckAction === label}
                                onClick={() => setStuckAction(stuckAction === label ? null : label)}
                                className="max-w-full whitespace-normal"
                              >
                                {label}
                              </Chip>
                            ))}
                            <Link to="/care-network" search={{ tab: "Caregiver Resources" }}>
                              <Chip>Find outside support</Chip>
                            </Link>
                            <Link to="/care-network" search={{ tab: "Peer Support", ask: r.detail }}>
                              <Chip>Ask the Care Network</Chip>
                            </Link>
                          </div>

                          {stuckAction === "Ask another Care Circle member" ? (
                            <div className="space-y-2">
                              <p className="text-base">
                                People who declined are hidden. You can still choose them if you want to ask again.
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {state.members
                                  .filter((m) => showDeclined || !declined.includes(m.name))
                                  .map((m) => (
                                    <Chip
                                      key={m.id}
                                      onClick={() =>
                                        setRequest(r.id, {
                                          visibleTo: [m.id],
                                          status: "Sent",
                                          sentAt: today(),
                                        })
                                      }
                                      className="max-w-full whitespace-normal"
                                    >
                                      Send to {m.name}
                                    </Chip>
                                  ))}
                              </div>
                              <Button variant="ghost" className="px-3 py-2 text-sm" onClick={() => setShowDeclined(!showDeclined)}>
                                {showDeclined ? "Hide people who declined" : "Show people who declined"}
                              </Button>
                            </div>
                          ) : null}

                          {stuckAction === "Change the request" ? (
                            <div className="space-y-3">
                              <Field label="What do you need?">
                                <Textarea
                                  value={editDetail || r.detail}
                                  onChange={(e) => setEditDetail(e.target.value)}
                                />
                              </Field>
                              <Field label="Instructions or timing">
                                <Textarea
                                  value={editInstructions || r.instructions}
                                  onChange={(e) => setEditInstructions(e.target.value)}
                                />
                              </Field>
                              <Button
                                onClick={() => {
                                  setRequest(r.id, {
                                    detail: editDetail || r.detail,
                                    instructions: editInstructions || r.instructions,
                                    status: "Sent",
                                    sentAt: today(),
                                  });
                                  setEditDetail("");
                                  setEditInstructions("");
                                  setStuckAction(null);
                                }}
                              >
                                Save and send again
                              </Button>
                            </div>
                          ) : null}

                          {stuckAction === "Divide it into smaller tasks" ? (
                            <div className="space-y-3">
                              {[0, 1, 2].map((i) => (
                                <Field key={i} label={`Smaller request ${i + 1}`}>
                                  <Input
                                    value={split[i] ?? ""}
                                    onChange={(e) => {
                                      const next = [...split];
                                      next[i] = e.target.value;
                                      setSplit(next);
                                    }}
                                    placeholder={
                                      ["Confirm transportation", "Attend the appointment", "Pick up medication afterward"][i]
                                    }
                                  />
                                </Field>
                              ))}
                              <Button
                                disabled={!split.some((x) => x?.trim())}
                                onClick={() => {
                                  const parts = split.filter((x) => x?.trim());
                                  setState((s) => ({
                                    ...s,
                                    requests: [
                                      ...parts.map((text) => ({
                                        id: uid(),
                                        type: r.type,
                                        detail: text.trim(),
                                        by: r.by,
                                        instructions: r.instructions,
                                        visibleTo: [],
                                        status: "Draft" as const,
                                        ...(r.personId ? { personId: r.personId } : {}),
                                      })),
                                      ...s.requests.map((x) =>
                                        x.id === r.id ? { ...x, status: "Cancelled" as const } : x,
                                      ),
                                    ],
                                  }));
                                  setSplit(["", "", ""]);
                                  setStuckAction(null);
                                }}
                              >
                                Create smaller requests
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </Card>
              );
            })
          )}
          <div className="pt-4">
            <SectionTitle title="Offers to help" subtitle="Support your circle has offered without being asked." />
            {state.offers.length === 0 ? (
              <Empty title="No offers right now" body="Offers from your circle will show up here." />
            ) : (
              <div className="space-y-4">
                {state.offers.map((o) => (
                  <Card key={o.id}>
                    <p className="text-sm text-muted-foreground">{o.from}</p>
                    <p className="mt-1 text-lg">{o.text}</p>
                    <Button variant="support" className="mt-4">Say yes, thank you</Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "Updates" && (
        <div className="space-y-4">
          <Card className="space-y-3">
            <SectionTitle title="Share an update" subtitle="Goes to members who can view updates." />
            <Textarea value={updateText} onChange={(e) => setUpdateText(e.target.value)} />
            <Button
              onClick={() => {
                if (!updateText.trim()) return;
                setState((s) => ({
                  ...s,
                  updates: [
                    { id: uid(), from: s.caregiverName, date: today(), text: updateText.trim() },
                    ...s.updates,
                  ],
                }));
                setUpdateText("");
              }}
            >
              Post update
            </Button>
          </Card>
          {state.updates.map((u) => (
            <Card key={u.id}>
              <p className="text-sm text-muted-foreground">
                {u.from} · {u.date}
              </p>
              <p className="mt-1 text-base">{u.text}</p>
            </Card>
          ))}
          {state.people.flatMap((p) =>
            p.voiceEntries.map((entry) => (
              <Card key={`${p.id}-${entry.id}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone="sage">{entry.source === "Direct guest response" ? `Shared directly by ${p.preferredName || p.name.split(" ")[0]}` : `Added together with ${p.preferredName || p.name.split(" ")[0]}`}</Tag>
                  <span className="text-sm text-muted-foreground">{entry.date}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">{entry.label}</p>
                <p className="mt-1 text-base">{entry.text}</p>
              </Card>
            )),
          )}
        </div>
      )}

      {tab === "Handoffs" && (
        <div className="space-y-4">
          {state.handoffs.length === 0 ? (
            <Empty
              title="No handoffs yet"
              body="Open a person's profile and choose “Create warm handoff” to prepare one."
            />
          ) : (
            state.handoffs.map((h) => {
              const p = state.people.find((x) => x.id === h.personId);
              return (
                <Card key={h.id} className="space-y-2">
                  <SectionTitle
                    title={`Handoff for ${p?.preferredName ?? "someone"}`}
                    subtitle={h.date}
                  />
                  <p className="text-base">
                    <strong>What happened recently:</strong> {h.recent}
                  </p>
                  <p className="text-base">
                    <strong>What needs attention:</strong> {h.attention}
                  </p>
                  <p className="text-base">
                    <strong>Current preferences:</strong> {h.preferences}
                  </p>
                  <p className="text-base">
                    <strong>Next planned action:</strong> {h.next}
                  </p>
                  <p className="text-base">
                    <strong>Who is responsible:</strong> {h.responsible}
                  </p>
                </Card>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
