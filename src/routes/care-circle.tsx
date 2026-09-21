import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import type {
  HelpRequest,
  Member,
  MemberCategory,
  Permission,
  RecipientResponse,
  RecipientResponseStatus,
  RequestStatus,
} from "@/lib/types";
import {
  PeopleCareExperience,
  PROFILE_SECTIONS,
  type ProfileSection,
} from "@/components/PeopleCareExperience";

export const Route = createFileRoute("/care-circle")({
  validateSearch: (search: Record<string, unknown>) => {
    const tabs = ["People I Care For", "Care Circle", "Care Team", "Requests", "Care Updates"] as const;
    const tab = tabs.includes(search["tab"] as (typeof tabs)[number])
      ? (search["tab"] as (typeof tabs)[number])
      : "People I Care For";
    return {
      ...(search["tab"] ? { tab } : {}),
      ...(typeof search["person"] === "string" ? { person: search["person"] } : {}),
      ...(typeof search["detail"] === "string" ? { detail: search["detail"] } : {}),
      ...(PROFILE_SECTIONS.includes(search["section"] as ProfileSection)
        ? { section: search["section"] as ProfileSection }
        : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "My Care Circle — Connected Care" },
      {
        name: "description",
        content:
          "Invite trusted people, manage permissions, share requests and updates, and pass along warm handoffs.",
      },
      { property: "og:title", content: "My Care Circle — Connected Care" },
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
  "People I Care For",
  "Care Circle",
  "Care Team",
  "Requests",
  "Care Updates",
] as const;

const PROFESSIONAL_ROLE = /paid caregiver|home-care|home care|aide|nurse|physician|doctor|social worker|therapist|hospice|provider/i;

function categoryFor(member: Member): MemberCategory {
  return member.category ?? (PROFESSIONAL_ROLE.test(member.role) ? "Care Team" : "Care Circle");
}

const PERMISSIONS: Permission[] = [
  "View basic care information",
  "View important updates",
  "Receive requests for help",
  "Add care updates",
  "Contribute to Care Moments",
];

const RESPONSE_TONES: Record<RecipientResponseStatus, string> = {
  Accepted: "bg-secondary/50 text-secondary-foreground",
  Pending: "bg-muted text-foreground",
  Declined: "bg-accent/25 text-accent-foreground",
  "Question received": "bg-primary/15 text-foreground",
  "No response": "bg-muted text-muted-foreground",
  "Covered by another person": "bg-secondary/35 text-secondary-foreground",
};

function StatusPill({ status }: { status: RecipientResponseStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-sm font-medium ${RESPONSE_TONES[status]}`}>
      {status}
    </span>
  );
}

function defaultNote(status: RecipientResponseStatus) {
  if (status === "Pending") return "Awaiting response";
  if (status === "No response") return "No response yet";
  if (status === "Covered by another person") return "Someone else is covering this";
  return "";
}

/** The response rows for a request, derived from older demo data when needed. */
function recipientsFor(
  request: HelpRequest,
  members: { id: string; name: string; role: string }[],
): RecipientResponse[] {
  if (request.responses?.length) return request.responses;
  const declined = request.declinedBy ?? [];
  return request.visibleTo
    .map((id) => members.find((m) => m.id === id))
    .filter((m): m is { id: string; name: string; role: string } => Boolean(m))
    .map((m) => ({
      memberId: m.id,
      name: m.name,
      role: m.role,
      status: declined.includes(m.name)
        ? ("Declined" as const)
        : request.acceptedBy === m.name
          ? ("Accepted" as const)
          : ("Pending" as const),
    }));
}

function statusFromResponses(
  request: HelpRequest,
  responses: RecipientResponse[],
): RequestStatus {
  if (
    request.status === "Draft" ||
    request.status === "Cancelled" ||
    request.status === "Completed"
  )
    return request.status;
  if (!responses.length) return request.status;
  if (responses.some((x) => x.status === "Accepted")) return "Assigned";
  if (responses.some((x) => x.status === "Question received")) return "Needs clarification";
  if (responses.every((x) => x.status === "Declined" || x.status === "No response"))
    return "Unfilled";
  return "Sent";
}

function CareCirclePage() {
  const { state, setState } = useStore();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const tab = search.tab ?? "People I Care For";
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState({
    category: "" as MemberCategory | "",
    name: "",
    role: "",
    contact: "",
    availability: "",
    helpsWith: "",
  });
  const [perms, setPerms] = useState<Permission[]>(["View basic care information"]);
  const [updateText, setUpdateText] = useState("");
  const [updateSubject, setUpdateSubject] = useState<string>("p1");
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [deletingUpdateId, setDeletingUpdateId] = useState<string | null>(null);
  const [stuckOpen, setStuckOpen] = useState<string | null>(null);
  const [stuckAction, setStuckAction] = useState<string | null>(null);
  const [showDeclined, setShowDeclined] = useState(false);
  const [editDetail, setEditDetail] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [split, setSplit] = useState<string[]>(["", "", ""]);
  const [manageOpen, setManageOpen] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const recipients = (r: HelpRequest) => recipientsFor(r, state.members);
  const overallStatus = (r: HelpRequest) => statusFromResponses(r, recipients(r));
  const assignedTo = (r: HelpRequest) =>
    recipients(r).find((x) => x.status === "Accepted")?.name ?? "";

  /** Update one recipient's response and keep the request's overall status in step. */
  const patchResponse = (
    request: HelpRequest,
    memberId: string,
    patch: Partial<RecipientResponse>,
  ) =>
    setState((s) => ({
      ...s,
      requests: s.requests.map((r) => {
        if (r.id !== request.id) return r;
        const base = recipientsFor(r, s.members);
        let next = base.map((resp) =>
          resp.memberId === memberId ? { ...resp, ...patch } : resp,
        );
        if (patch.status === "Accepted" && !r.allowMultiple) {
          next = next.map((resp) =>
            resp.memberId === memberId || resp.status === "Declined"
              ? resp
              : {
                  ...resp,
                  status: "Covered by another person" as const,
                  note: "Someone else is covering this",
                },
          );
        }
        const accepted = next.find((resp) => resp.status === "Accepted");
        return {
          ...r,
          responses: next,
          status: statusFromResponses(r, next),
          ...(accepted ? { acceptedBy: accepted.name } : {}),
        };
      }),
    }));

  const togglePerm = (p: Permission) =>
    setPerms((v) => (v.includes(p) ? v.filter((x) => x !== p) : [...v, p]));

  const invite = () => {
    setState((s) => ({
      ...s,
      members: [
        ...s.members,
        {
          id: uid(),
          name: form.name,
          role: form.role,
          contact: form.contact,
          availability: form.availability,
          helpsWith: form.helpsWith,
          permissions: perms,
          category: form.category || "Care Circle",
        },
      ],
    }));
    setForm({ category: "", name: "", role: "", contact: "", availability: "", helpsWith: "" });
    setPerms(["View basic care information"]);
    setInviting(false);
  };

  const setRequest = (id: string, patch: Partial<(typeof state.requests)[number]>) =>
    setState((s) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));

  const setTab = (next: string) => {
    const safeTab: (typeof TABS)[number] = TABS.includes(next as (typeof TABS)[number])
      ? (next as (typeof TABS)[number])
      : "People I Care For";
    navigate({ to: "/care-circle", search: { tab: safeTab } });
  };

  const subjectName = (personId: string) => {
    const p = state.people.find((x) => x.id === personId);
    return p ? p.preferredName || p.name : "General Care Circle";
  };

  const markHandoffReviewed = (id: string) =>
    setState((s) => ({
      ...s,
      handoffNotes: s.handoffNotes.map((note) =>
        note.id === id ? { ...note, reviewed: true } : note,
      ),
    }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl">My care circle</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Everyone involved in care, connected in one place. Each person sees only what you allow.
        </p>
      </header>

      <Tabs tabs={[...TABS]} active={tab} onChange={setTab} />

      {tab === "People I Care For" && (
        <PeopleCareExperience
          {...(search.person ? { person: search.person } : {})}
          {...(search.detail ? { detail: search.detail } : {})}
          {...(search.section ? { section: search.section } : {})}
        />
      )}

      {(tab === "Care Circle" || tab === "Care Team") && (
        <div className="space-y-4">
          <SectionTitle
            title={tab}
            subtitle={
              tab === "Care Circle"
                ? "Family, friends, neighbors, and trusted people who help care happen."
                : "Paid and professional caregivers involved in this person’s care."
            }
          />
          {state.members.filter((member) => categoryFor(member) === tab).map((m) => (
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
                   {tab === "Care Team" ? (
                     <p className="mt-2 text-base font-medium text-secondary-foreground">Approved care access</p>
                   ) : null}
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
                <fieldset>
                  <legend className="text-base font-medium">Where should this person belong?</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Chip
                      selected={form.category === "Care Circle"}
                      onClick={() => setForm({ ...form, category: "Care Circle" })}
                      className="max-w-full whitespace-normal"
                    >
                      Care Circle — family, friend, neighbor, or community support
                    </Chip>
                    <Chip
                      selected={form.category === "Care Team"}
                      onClick={() => setForm({ ...form, category: "Care Team" })}
                      className="max-w-full whitespace-normal"
                    >
                      Care Team — paid caregiver or professional provider
                    </Chip>
                  </div>
                </fieldset>
              <Field label="Name">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Relationship or role">
                <Input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder={form.category === "Care Team" ? "Nurse, therapist, paid caregiver" : "Sister, friend, neighbor"}
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
                <Button disabled={!form.name.trim() || !form.category} onClick={invite}>
                  Send invitation
                </Button>
              </div>
            </Card>
          ) : (
            <Button
              onClick={() => {
                setForm((current) => ({ ...current, category: tab }));
                setInviting(true);
              }}
            >
              {tab === "Care Circle" ? "Add someone to my circle" : "Add care professional"}
            </Button>
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
              const stuck = overallStatus(r) === "Unfilled";
              const person = state.people.find((p) => p.id === r.personId);
              return (
                <Card key={r.id} className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag tone="warm">{r.type}</Tag>
                    <Tag>Status: {overallStatus(r)}</Tag>
                    {assignedTo(r) ? <Tag tone="sage">Assigned to {assignedTo(r)}</Tag> : null}
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

                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <p className="font-display text-xl">Responses</p>
                    <ul className="mt-3 space-y-2">
                      {recipients(r).map((resp) => (
                        <li
                          key={resp.memberId}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3"
                        >
                          <span>
                            <span className="block text-base font-medium">{resp.name}</span>
                            <span className="block text-sm text-muted-foreground">{resp.role}</span>
                          </span>
                          <span className="flex flex-wrap items-center gap-2">
                            <StatusPill status={resp.status} />
                            <span className="text-sm text-muted-foreground">
                              {resp.note ?? defaultNote(resp.status)}
                            </span>
                          </span>
                        </li>
                      ))}
                      {recipients(r).length === 0 ? (
                        <li className="text-base text-muted-foreground">No one has been asked yet.</li>
                      ) : null}
                    </ul>

                    {recipients(r)
                      .filter((resp) => resp.status === "Question received" && resp.question)
                      .map((resp) => (
                        <div key={`q-${resp.memberId}`} className="mt-3 rounded-2xl bg-card p-4">
                          <p className="text-base font-medium">Question from {resp.name}</p>
                          <p className="mt-1 text-base">{resp.question}</p>
                          {resp.reply ? (
                            <p className="mt-2 text-base text-muted-foreground">Your reply: {resp.reply}</p>
                          ) : null}
                          {replyingTo === `${r.id}:${resp.memberId}` ? (
                            <div className="mt-3 space-y-2">
                              <Textarea
                                aria-label={`Reply to ${resp.name}`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                              />
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  className="px-4 py-2 text-sm"
                                  disabled={!replyText.trim()}
                                  onClick={() => {
                                    patchResponse(r, resp.memberId, { reply: replyText.trim() });
                                    setReplyText("");
                                    setReplyingTo(null);
                                  }}
                                >
                                  Send reply
                                </Button>
                                <Button variant="ghost" className="px-4 py-2 text-sm" onClick={() => setReplyingTo(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="quiet"
                              className="mt-3 px-4 py-2 text-sm"
                              onClick={() => {
                                setReplyingTo(`${r.id}:${resp.memberId}`);
                                setReplyText(resp.reply ?? "");
                              }}
                            >
                              Reply
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {overallStatus(r) === "Assigned" ? (
                      <Button variant="quiet" className="px-4 py-2 text-sm" onClick={() => setRequest(r.id, { status: "Completed" })}>
                        Mark complete
                      </Button>
                    ) : null}
                    {r.status !== "Completed" && r.status !== "Cancelled" ? (
                      <Button variant="ghost" className="px-4 py-2 text-sm" onClick={() => setRequest(r.id, { status: "Cancelled" })}>
                        Cancel request
                      </Button>
                    ) : null}
                    {r.status !== "Completed" && r.status !== "Cancelled" ? (
                      <Button
                        variant="ghost"
                        className="px-3 py-2 text-sm"
                        aria-expanded={manageOpen === r.id}
                        onClick={() => setManageOpen(manageOpen === r.id ? null : r.id)}
                      >
                        Manage request
                      </Button>
                    ) : null}
                  </div>

                  {manageOpen === r.id ? (
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <p className="text-sm text-muted-foreground">
                        Quiet options for keeping this request tidy.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {recipients(r)
                          .filter((resp) => resp.status === "Pending")
                          .map((resp) => (
                            <Chip
                              key={`nr-${resp.memberId}`}
                              className="px-3 py-1.5 text-sm"
                              onClick={() =>
                                patchResponse(r, resp.memberId, {
                                  status: "No response",
                                  note: "No response yet",
                                })
                              }
                            >
                              Mark no response · {resp.name}
                            </Chip>
                          ))}
                        {recipients(r).every((resp) => resp.status !== "Pending") ? (
                          <p className="text-base text-muted-foreground">Everyone has responded.</p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

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

      {tab === "Care Updates" && (
        <div className="space-y-4">
          <Card className="space-y-3">
            <SectionTitle
              title={editingUpdateId ? "Edit this update" : "Share an update"}
              subtitle="Goes to members who can view updates."
            />
            <Field label="Who is this update about?">
              <select
                value={updateSubject}
                onChange={(e) => setUpdateSubject(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground"
              >
                {state.people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.preferredName || p.name}
                  </option>
                ))}
                <option value="general">General Care Circle update</option>
              </select>
            </Field>
            <p className="text-sm text-muted-foreground">
              Subject: {updateSubject === "general"
                ? "General Care Circle"
                : `About ${subjectName(updateSubject)}`}
            </p>
            <Textarea
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              aria-label="Update text"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  if (!updateText.trim()) return;
                  const personPatch =
                    updateSubject === "general" ? {} : { personId: updateSubject };
                  if (editingUpdateId) {
                    const id = editingUpdateId;
                    setState((s) => ({
                      ...s,
                      updates: s.updates.map((u) =>
                        u.id === id
                          ? { id: u.id, from: u.from, date: u.date, text: updateText.trim(), ...personPatch }
                          : u,
                      ),
                    }));
                    setEditingUpdateId(null);
                  } else {
                    setState((s) => ({
                      ...s,
                      updates: [
                        {
                          id: uid(),
                          from: s.caregiverName,
                          date: today(),
                          text: updateText.trim(),
                          ...personPatch,
                        },
                        ...s.updates,
                      ],
                    }));
                  }
                  setUpdateText("");
                }}
              >
                {editingUpdateId ? "Save changes" : "Post update"}
              </Button>
              {editingUpdateId ? (
                <Button
                  variant="quiet"
                  onClick={() => {
                    setEditingUpdateId(null);
                    setUpdateText("");
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </Card>
          {state.updates.map((u) => {
            const mine = u.from === state.caregiverName;
            return (
              <Card key={u.id} className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone="sage">
                    {u.personId ? `About ${subjectName(u.personId)}` : "General Care Circle"}
                  </Tag>
                  <span className="text-sm text-muted-foreground">
                    {u.from} · {u.date}
                  </span>
                </div>
                <p className="text-base">{u.text}</p>
                {mine ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      variant="quiet"
                      className="px-4 py-2 text-sm"
                      onClick={() => {
                        setEditingUpdateId(u.id);
                        setUpdateText(u.text);
                        setUpdateSubject(u.personId ?? "general");
                        setDeletingUpdateId(null);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="quiet"
                      className="px-4 py-2 text-sm"
                      onClick={() => setDeletingUpdateId(u.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ) : null}
                {deletingUpdateId === u.id ? (
                  <div className="rounded-2xl border border-border bg-muted/40 p-4">
                    <p className="text-base text-foreground">
                      Delete this care update? This action cannot be undone.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="quiet"
                        className="px-4 py-2 text-sm"
                        onClick={() => setDeletingUpdateId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="px-4 py-2 text-sm"
                        onClick={() => {
                          setState((s) => ({
                            ...s,
                            updates: s.updates.filter((x) => x.id !== u.id),
                          }));
                          setDeletingUpdateId(null);
                          if (editingUpdateId === u.id) {
                            setEditingUpdateId(null);
                            setUpdateText("");
                          }
                        }}
                      >
                        Delete update
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Card>
            );
          })}
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
          {state.handoffNotes.map((note) => (
            <Card key={note.id} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Tag tone="sage">Paid-caregiver handoff</Tag>
                <Tag>{note.personName}</Tag>
                <Tag tone="warm">Urgency: {note.urgency}</Tag>
                {note.reviewed ? <Tag>Reviewed</Tag> : null}
              </div>
              <p className="text-sm text-muted-foreground">
                Shared by {note.from}, {note.fromRole} · {note.submittedAt} · Shared with {note.sharedWith}
              </p>
              <p className="text-base"><strong>Care completed:</strong> {note.careCompleted.join(", ") || "—"}</p>
              <p className="text-base"><strong>What was observed:</strong> {note.noticed}</p>
              <p className="text-base"><strong>Follow-up:</strong> {note.followUp}</p>
              {note.preferenceChange !== "No change" ? (
                <p className="text-base"><strong>{note.preferenceChange}:</strong> {note.preferenceNote}</p>
              ) : null}
              {!note.reviewed ? (
                <Button variant="support" onClick={() => markHandoffReviewed(note.id)}>
                  Mark as reviewed
                </Button>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      {tab === "Care Updates" && (
        <div className="space-y-4">
          <SectionTitle title="Warm handoffs" subtitle="Prepared summaries for continuity of care." />
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
