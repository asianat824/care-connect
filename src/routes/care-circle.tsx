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
import { COMMUNITY_TOPICS, LOCAL_RESOURCES, today, uid } from "@/lib/demo-data";
import type { Permission } from "@/lib/types";

export const Route = createFileRoute("/care-circle")({
  head: () => ({
    meta: [
      { title: "My Care Circle — [PROJECT NAME]" },
      {
        name: "description",
        content:
          "Invite trusted people, share responsibilities, pass along warm handoffs, and find local support.",
      },
      { property: "og:title", content: "My Care Circle — [PROJECT NAME]" },
      {
        property: "og:description",
        content: "A trusted circle for requests, offers, updates, and warm handoffs.",
      },
    ],
  }),
  component: CareCirclePage,
});

const TABS = [
  "Members",
  "Requests for Help",
  "Offers to Help",
  "Care Updates",
  "Warm Handoffs",
  "Local Resources",
  "Community Support",
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
  const [tab, setTab] = useState(TABS[0]);
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

      {tab === "Requests for Help" && (
        <div className="space-y-4">
          {state.requests.length === 0 ? (
            <Empty
              title="No requests yet"
              body="Requests start in your check-in, when something feels outside your capacity."
            />
          ) : (
            state.requests.map((r) => (
              <Card key={r.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone="warm">{r.type}</Tag>
                  <Tag>
                    {r.status === "complete"
                      ? "Complete"
                      : r.status === "accepted"
                        ? `Accepted by ${r.acceptedBy}`
                        : "Waiting for someone"}
                  </Tag>
                </div>
                <p className="mt-3 text-lg">{r.detail}</p>
                {r.by ? <p className="text-base text-muted-foreground">Needed by {r.by}</p> : null}
                {r.instructions ? (
                  <p className="mt-2 text-base text-muted-foreground">{r.instructions}</p>
                ) : null}
                <p className="mt-2 text-sm text-muted-foreground">
                  Visible to:{" "}
                  {r.visibleTo
                    .map((id) => state.members.find((m) => m.id === id)?.name)
                    .filter(Boolean)
                    .join(", ") || "no one yet"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.status === "open" &&
                    r.visibleTo.map((id) => {
                      const m = state.members.find((x) => x.id === id);
                      if (!m) return null;
                      return (
                        <Button
                          key={id}
                          variant="support"
                          onClick={() => setRequest(r.id, { status: "accepted", acceptedBy: m.name })}
                        >
                          Accept as {m.name}
                        </Button>
                      );
                    })}
                  {r.status === "accepted" ? (
                    <Button variant="quiet" onClick={() => setRequest(r.id, { status: "complete" })}>
                      Mark complete
                    </Button>
                  ) : null}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "Offers to Help" && (
        <div className="space-y-4">
          {state.offers.length === 0 ? (
            <Empty title="No offers right now" body="Offers from your circle will show up here." />
          ) : (
            state.offers.map((o) => (
              <Card key={o.id}>
                <p className="text-sm text-muted-foreground">{o.from}</p>
                <p className="mt-1 text-lg">{o.text}</p>
                <Button variant="support" className="mt-4">
                  Say yes, thank you
                </Button>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "Care Updates" && (
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
        </div>
      )}

      {tab === "Warm Handoffs" && (
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

      {tab === "Local Resources" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {LOCAL_RESOURCES.map((r) => (
            <Card key={r.id}>
              <p className="font-display text-xl">{r.name}</p>
              <p className="mt-1 text-base text-muted-foreground">{r.note}</p>
            </Card>
          ))}
        </div>
      )}

      {tab === "Community Support" && (
        <div className="space-y-4">
          <p className="text-base text-muted-foreground">
            Sample conversations from other caregivers. Full community features come later.
          </p>
          {COMMUNITY_TOPICS.map((t) => (
            <Card key={t.id}>
              <p className="font-display text-xl">{t.title}</p>
              <p className="mt-1 text-base text-muted-foreground">{t.snippet}</p>
              <p className="mt-3 text-sm text-muted-foreground">{t.replies} replies</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
