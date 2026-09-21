import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Avatar, Button, Card, Chip, Empty, Field, Input, SectionTitle, Tabs, Tag, Textarea } from "@/components/ui";
import { HandoffForm } from "@/components/PaidHome";
import {
  PersonProfile,
  PROFILE_SECTIONS,
  type ProfileSection,
} from "@/components/PeopleCareExperience";
import { today, uid } from "@/lib/demo-data";
import { useStore } from "@/lib/store";

const TABS = ["People I Support", "Work Team", "Handoff Notes"] as const;
type TeamTab = (typeof TABS)[number];

const WORK_TEAM = [
  {
    id: "wt1",
    name: "Monique Harris",
    role: "Care supervisor",
    availability: "Weekdays, 8:00 AM–6:00 PM",
    helps: "Care concerns, schedule support, escalation",
    contact: "Work messaging or phone",
  },
  {
    id: "wt2",
    name: "Tasha Reed",
    role: "Weekend caregiver",
    availability: "Friday evening through Sunday",
    helps: "Shift coverage, handoff questions",
    contact: "Work messaging",
  },
  {
    id: "wt3",
    name: "David Chen",
    role: "Care coordinator",
    availability: "Weekdays, 9:00 AM–5:00 PM",
    helps: "Care-plan clarification, family communication",
    contact: "Work email or phone",
  },
] as const;

export const Route = createFileRoute("/care-team")({
  validateSearch: (search: Record<string, unknown>) => {
    const tab = TABS.includes(search["tab"] as TeamTab) ? (search["tab"] as TeamTab) : "People I Support";
    return {
      ...(search["tab"] ? { tab } : {}),
      ...(typeof search["person"] === "string" ? { person: search["person"] } : {}),
      ...(search["handoff"] === "new" ? { handoff: "new" as const } : {}),
      ...(PROFILE_SECTIONS.includes(search["section"] as ProfileSection)
        ? { section: search["section"] as ProfileSection }
        : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Care Team — Connected Care" },
      { name: "description", content: "People, workplace support, and handoffs for paid caregivers." },
      { property: "og:title", content: "Care Team — Connected Care" },
      { property: "og:description", content: "The people you support, your work team, and connected handoffs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CareTeamPage,
});

function CareTeamPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const tab = search.tab ?? "People I Support";
  const setTab = (next: TeamTab) =>
    navigate({ to: "/care-team", search: { tab: next }, replace: true });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl leading-tight">Care Team</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          The people you support, the people you work with, and the handoffs that keep care connected.
        </p>
      </header>
      <Tabs tabs={[...TABS]} active={tab} onChange={(value) => setTab(value as TeamTab)} />
      {tab === "People I Support" ? (
        <PeopleSupport
          {...(search.person ? { personId: search.person } : {})}
          {...(search.section ? { section: search.section } : {})}
        />
      ) : null}
      {tab === "Work Team" ? <WorkTeam /> : null}
      {tab === "Handoff Notes" ? <HandoffNotes startOpen={search.handoff === "new"} /> : null}
    </div>
  );
}

function PeopleSupport({ personId, section }: { personId?: string; section?: ProfileSection }) {
  const { state, setState } = useStore();
  const navigate = useNavigate();
  const person = state.people.find((item) => item.id === personId) ?? state.people[0];
  const [sentUpdate, setSentUpdate] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateText, setUpdateText] = useState("");
  const [contactVisible, setContactVisible] = useState(false);
  if (!person) return <Empty title="No one is assigned" body="People assigned to your care will appear here." />;

  const detailsOpen = Boolean(personId);

  if (detailsOpen) {
    const wantsConversation = section === "Shared Care Conversation";
    const initialSection: ProfileSection | undefined = wantsConversation ? "Care Circle" : section;
    return (
      <PersonProfile
        person={person}
        conversationInCareCircle
        {...(wantsConversation ? { conversationStartOpen: true } : {})}
        {...(initialSection ? { initialSection } : {})}
        backLink={
          <Button
            variant="ghost"
            className="px-0"
            onClick={() => navigate({ to: "/care-team", search: { tab: "People I Support" } })}
          >
            ← Back to People I Support
          </Button>
        }
        extraHeader={
          <p className="text-base text-muted-foreground">Today&rsquo;s shift · 9:00 AM–6:00 PM</p>
        }
        renderCareCircle={(openConversation, conversationOpen) => (
          <div className="space-y-5">
            <SectionTitle
              title="Ruth’s care circle"
              subtitle="Family, friends, neighbors, and trusted people helping support Ruth’s care."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">Jordan</p>
                  <Tag tone="sage">Designated care contact</Tag>
                </div>
                <p className="text-sm text-muted-foreground">Family caregiver</p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div><dt className="font-semibold">Role</dt><dd>Primary family contact</dd></div>
                  <div><dt className="font-semibold">Handoffs</dt><dd>Receives end-of-shift handoffs</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="quiet" className="px-4 py-2 text-sm" onClick={() => setContactVisible((value) => !value)}>
                    View approved contact information
                  </Button>
                  <Button variant="connect" className="px-4 py-2 text-sm" onClick={openConversation}>
                    {conversationOpen ? "Close Care Conversation" : "Care Conversation"}
                  </Button>
                  <Button variant="support" className="px-4 py-2 text-sm" onClick={() => setUpdateOpen(true)}>
                    Send care update
                  </Button>
                  <Button
                    variant="quiet"
                    className="px-4 py-2 text-sm"
                    onClick={() => navigate({ to: "/care-team", search: { tab: "Handoff Notes", handoff: "new" } })}
                  >
                    Complete handoff
                  </Button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Care updates go to everyone with approved access. A Care Conversation stays private between you and Jordan.
                </p>

                {contactVisible ? (
                  <p className="mt-3 text-sm text-foreground">Approved contact: jordan@example.com · (555) 014-1182</p>
                ) : null}
                {updateOpen ? (
                  <div className="mt-4 space-y-3">
                    <Field label={`Care update for ${person.preferredName || person.name}`}>
                      <Textarea value={updateText} onChange={(event) => setUpdateText(event.target.value)} placeholder="Share an approved care update" />
                    </Field>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="quiet" className="px-4 py-2 text-sm" onClick={() => setUpdateOpen(false)}>Cancel</Button>
                      <Button
                        className="px-4 py-2 text-sm"
                        disabled={!updateText.trim()}
                        onClick={() => {
                          setState((current) => ({
                            ...current,
                            updates: [
                              { id: uid(), from: "Alicia Boateng", date: today(), text: updateText.trim(), personId: person.id },
                              ...current.updates,
                            ],
                          }));
                          setUpdateText("");
                          setUpdateOpen(false);
                          setSentUpdate(true);
                        }}
                      >
                        Send update
                      </Button>
                    </div>
                  </div>
                ) : null}
                {sentUpdate ? <p className="mt-3 text-sm text-secondary-foreground">Care update sent to Jordan.</p> : null}
              </Card>
              {state.members
                .filter((member) => ["Marcus Ellis", "Denise Park"].includes(member.name))
                .map((member) => (
                  <Card key={member.id}>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div><dt className="font-semibold">Helps with</dt><dd>{member.helpsWith}</dd></div>
                      <div><dt className="font-semibold">Availability</dt><dd>{member.availability}</dd></div>
                    </dl>
                  </Card>
                ))}
            </div>
          </div>
        }
      />
    );
  }

  const priority = state.carePriorities.find(
    (item) => item.personId === person.id && !item.done && !item.archived && (item.visibleTo ?? "").includes("Alicia"),
  );

  return (
    <Card>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={person.name} photo={person.photo} />
          <div>
            <h2 className="font-display text-2xl">{person.preferredName || person.name}</h2>
            <p className="text-muted-foreground">Shift: 9:00 AM–6:00 PM</p>
          </div>
        </div>
        <Tag tone="sage">Approved care access</Tag>
      </div>
      <dl className="mt-5 space-y-3 text-base">
        <div>
          <dt className="font-semibold">Current priority</dt>
          <dd>{priority?.text ?? "Nothing shared right now."}</dd>
        </div>
        <div>
          <dt className="font-semibold">Primary family contact</dt>
          <dd>Jordan</dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={() => navigate({ to: "/care-team", search: { tab: "People I Support", person: person.id } })}>
          View care details
        </Button>
        <Button variant="support" onClick={() => navigate({ to: "/care-team", search: { tab: "Handoff Notes", handoff: "new" } })}>
          Complete handoff
        </Button>
      </div>
    </Card>
  );
}

function WorkTeam() {
  const { state, setState } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [supportType, setSupportType] = useState("Care concern");
  const [neededBy, setNeededBy] = useState("");
  const [personId, setPersonId] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const allSelected = WORK_TEAM.every((member) => selected.includes(member.id));
  const openRequest = (id?: string) => { setSelected(id ? [id] : []); setFormOpen(true); setSent(false); };
  const send = () => {
    if (!selected.length || !supportType.trim() || !neededBy) return;
    setState((current) => ({ ...current, workTeamRequests: [{ id: uid(), type: supportType, neededBy, ...(personId ? { personId } : {}), note, recipientIds: selected, sentAt: today() }, ...(current.workTeamRequests ?? [])] }));
    setFormOpen(false); setSent(true); setSelected([]); setNote("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-base text-muted-foreground">Professional support during and after a shift.</p><Button onClick={() => openRequest()}>Ask my Work Team</Button></div>
      {sent ? <p className="rounded-2xl bg-secondary/25 p-4 text-secondary-foreground">Work Team request sent. No private check-in information was shared.</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {WORK_TEAM.map((member) => (
          <Card key={member.id}>
            <div className="flex items-center gap-3"><Avatar name={member.name} /><div><h2 className="font-display text-xl">{member.name}</h2><p className="text-sm text-muted-foreground">{member.role}</p></div></div>
            <dl className="mt-4 space-y-2 text-sm"><div><dt className="font-semibold">Availability</dt><dd>{member.availability}</dd></div><div><dt className="font-semibold">Can help with</dt><dd>{member.helps}</dd></div><div><dt className="font-semibold">Approved contact method</dt><dd>{member.contact}</dd></div></dl>
            <Button variant="quiet" className="mt-4 px-4 py-2 text-sm" onClick={() => openRequest(member.id)}>Request support</Button>
          </Card>
        ))}
      </div>
      {formOpen ? (
        <Card className="space-y-5">
          <SectionTitle title="Ask my Work Team" subtitle="Share only the minimum approved care information needed." />
          <Field label="Type of support"><Input value={supportType} onChange={(event) => setSupportType(event.target.value)} /></Field>
          <Field label="When is support needed?"><Input type="date" value={neededBy} onChange={(event) => setNeededBy(event.target.value)} /></Field>
          <Field label="Is this connected to someone you support?"><select value={personId} onChange={(event) => setPersonId(event.target.value)} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base"><option value="">No</option>{state.people.map((person) => <option key={person.id} value={person.id}>{person.preferredName || person.name}</option>)}</select></Field>
          <Field label="Optional note"><Textarea value={note} onChange={(event) => setNote(event.target.value)} /></Field>
          <fieldset><legend className="text-base font-medium">Select recipient</legend><div className="mt-2 flex flex-wrap gap-2"><Chip selected={allSelected} onClick={() => setSelected(allSelected ? [] : WORK_TEAM.map((member) => member.id))}>Select everyone</Chip>{WORK_TEAM.map((member) => <Chip key={member.id} selected={selected.includes(member.id)} onClick={() => setSelected((current) => current.includes(member.id) ? current.filter((id) => id !== member.id) : [...current, member.id])}>{member.name}</Chip>)}</div></fieldset>
          <p className="rounded-2xl bg-muted p-4 text-sm text-foreground">Professional support requests are separate from your mood, energy, capacity, private notes, and check-in history.</p>
          <div className="flex flex-wrap gap-2"><Button variant="quiet" onClick={() => setFormOpen(false)}>Cancel</Button><Button disabled={!selected.length || !supportType.trim() || !neededBy} onClick={send}>Send request</Button></div>
        </Card>
      ) : null}
    </div>
  );
}

function HandoffNotes({ startOpen }: { startOpen: boolean }) {
  const { state, setState } = useStore();
  const navigate = useNavigate();
  const [discussed, setDiscussed] = useState<string | null>(null);

  /** Links a handoff to the ongoing conversation without changing the handoff itself. */
  const discuss = (noteId: string, personId: string, message: string) => {
    setState((current) => ({
      ...current,
      conversations: [
        {
          id: uid(),
          personId,
          type: "Follow-up" as const,
          message,
          author: "Alicia Boateng",
          authorRole: "Paid caregiver",
          createdAt: today(),
          visibleTo: "Jordan (Family caregiver), Alicia Boateng (Paid caregiver)",
          status: "Open" as const,
          replies: [],
          fromHandoffId: noteId,
        },
        ...(current.conversations ?? []),
      ],
    }));
    setDiscussed(noteId);
  };
  const [open, setOpen] = useState(startOpen);
  const [sent, setSent] = useState(false);
  const [showSent, setShowSent] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2"><Button onClick={() => setOpen(true)}>Complete end-of-shift handoff</Button><Button variant="quiet" onClick={() => setShowSent((value) => !value)}>View sent handoffs</Button></div>
      {open ? <Card><SectionTitle title="Complete end-of-shift handoff" subtitle="Share an observation, not a diagnosis." /><HandoffForm onDone={() => { setOpen(false); setSent(true); setShowSent(true); }} /></Card> : null}
      {sent ? <p className="rounded-2xl bg-secondary/25 p-4 text-secondary-foreground">Handoff sent to Jordan.</p> : null}
      {showSent ? <Card><SectionTitle title="Mama Ruth’s handoff history" />{state.handoffNotes.length === 0 ? <Empty title="No handoffs yet" body="Completed handoffs will appear here." /> : <ul className="space-y-4">{state.handoffNotes.map((note) => <li key={note.id} className="rounded-2xl border border-border p-4"><div className="flex flex-wrap gap-2"><Tag tone="sage">{note.personName}</Tag><Tag>{note.submittedAt}</Tag><Tag tone="warm">Urgency: {note.urgency}</Tag><Tag>{note.reviewed ? "Reviewed by Jordan" : `Recipient: ${note.sharedWith}`}</Tag></div><p className="mt-3"><span className="font-semibold">Care completed: </span>{note.careCompleted.join(", ") || "—"}</p><p className="mt-2"><span className="font-semibold">Observations: </span>{note.noticed}</p><p className="mt-2"><span className="font-semibold">Follow-up needs: </span>{note.followUp}</p>{note.preferenceChange !== "No change" ? <p className="mt-2"><span className="font-semibold">Confirmed preferences: </span>{note.preferenceNote}</p> : null}<div className="mt-3 flex flex-wrap gap-2"><Button variant="quiet" className="px-4 py-2 text-sm" onClick={() => discuss(note.id, note.personId, `From my handoff on ${note.submittedAt}: ${note.followUp || note.noticed}`)}>Discuss in Shared Care Conversation</Button>{discussed === note.id ? <Button variant="ghost" className="px-4 py-2 text-sm" onClick={() => navigate({ to: "/care-team", search: { tab: "People I Support", person: note.personId, section: "Shared Care Conversation" } })}>Open the conversation</Button> : null}</div>{discussed === note.id ? <p className="mt-2 text-sm text-secondary-foreground">Added to the Shared Care Conversation. The handoff note is unchanged.</p> : null}</li>)}</ul>}</Card> : null}
    </div>
  );
}