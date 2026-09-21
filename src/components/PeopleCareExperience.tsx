import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
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
import { SharedCareConversation, currentAuthor } from "@/components/SharedCareConversation";
import { CareMomentsSection } from "@/components/CareMomentsSection";
import { useStore } from "@/lib/store";
import { today, uid } from "@/lib/demo-data";
import {
  addDays,
  CHECK_BACK_EXPLANATION,
  REVIEW_CHOICES,
  SECTION_LABELS,
  SOURCES,
  STATUSES,
  lastConfirmedPhrase,
  reviewDateFor,
  sourceLabel,
  type ReviewChoice,
} from "@/lib/details";
import type {
  ConversationEntry,
  Detail,
  DetailKey,
  DetailSource,
  DetailStatus,
  Person,
} from "@/lib/types";

const DETAIL_SECTIONS: DetailKey[] = [
  "whatMatters",
  "communication",
  "comfort",
  "routines",
  "preferences",
  "coordination",
];

const SECTION_HINTS: Record<DetailKey, string> = {
  whatMatters: "The things that make them feel like themselves.",
  communication: "How they most like to be spoken with.",
  comfort: "What helps them settle and feel supported.",
  routines: "The shape of an ordinary day.",
  preferences: "Small things worth remembering.",
  coordination: "Practical notes, not clinical ones.",
};

const SECTION_PLACEHOLDER: Record<DetailKey, string> = {
  whatMatters: "Being asked, not told.",
  communication: "Prefers one question at a time.",
  comfort: "Gospel music helps her relax in the morning.",
  routines: "Prefers appointments after 11:00 a.m.",
  preferences: "Likes to know about changes in advance.",
  coordination: "Marcus drives on Tuesdays.",
};

const isHealthRelated = (text: string) =>
  /medicat|medicine|prescrib|prescription|pill|dose|dosage|pharmac/i.test(text);

type VoiceChoice = "request" | "together" | "conversation" | "observation";

export function PeopleCareExperience({ person: personParam, detail: detailParam, section: sectionParam }: { person?: string; detail?: string; section?: ProfileSection }) {
  const { state, setState } = useStore();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");

  const selected = state.people.find((p) => p.id === personParam);
  if (selected) {
    return <PersonProfile person={selected} {...(detailParam ? { detailParam } : {})} {...(sectionParam ? { initialSection: sectionParam } : {})} />;
  }

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
          preferences: [],
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
    navigate({ to: "/care-circle", search: { tab: "People I Care For", person: id } });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl">People I care for</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Care means continuing to ask, not assuming yesterday's answer still applies today.
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
          {state.people.map((p) => {
            const first = p.whatMatters.find((x) => !x.archived);
            return (
              <Link key={p.id} to="/care-circle" search={{ tab: "People I Care For", person: p.id }}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <Avatar name={p.name} photo={p.photo} size={56} />
                    <div>
                      <p className="font-display text-xl">{p.name}</p>
                      <p className="text-base text-muted-foreground">{p.relationship}</p>
                    </div>
                  </div>
                  {first ? (
                    <div className="mt-4 border-t border-border pt-4">
                      <p className="text-sm font-semibold text-foreground">
                        What matters to {p.name.split(" ")[0]}
                      </p>
                      <p className="mt-1 text-base text-foreground">“{first.text}”</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {sourceLabel(first, p, state.caregiverName)}
                      </p>
                    </div>
                  ) : null}
                  <p className="mt-4 text-base font-semibold text-primary">
                    View care profile and priorities
                  </p>
                </Card>
              </Link>
            );
          })}
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
          <div className="flex flex-wrap gap-3">
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

function DetailForm({
  person,
  initial,
  onCancel,
  onSave,
}: {
  person: Person;
  initial?: Detail;
  onCancel: () => void;
  onSave: (d: Detail) => void;
}) {
  const { state } = useStore();
  const [text, setText] = useState(initial?.text ?? "");
  const [source, setSource] = useState<DetailSource>(initial?.source ?? "Recorded conversation");
  const [sourceName, setSourceName] = useState(initial?.sourceName ?? "");
  const [status, setStatus] = useState<DetailStatus>(initial?.status ?? "Current");
  const [review, setReview] = useState<ReviewChoice>(
    initial?.reviewDate ? "Custom date" : "No reminder",
  );
  const [custom, setCustom] = useState(initial?.reviewDate ?? "");

  const who = person.preferredName || person.name.split(" ")[0] || person.name;

  const save = () => {
    if (!text.trim()) return;
    const reviewDate = reviewDateFor(review, custom);
    const base: Detail = {
      id: initial?.id ?? uid(),
      text: text.trim(),
      source,
      status,
      dateAdded: initial?.dateAdded ?? today(),
      lastConfirmed: today(),
      confirmedBy: state.caregiverName,
      ...(source === "Care Circle member" && sourceName.trim()
        ? { sourceName: sourceName.trim() }
        : {}),
      ...(reviewDate ? { reviewDate } : {}),
      ...(initial && initial.text !== text.trim()
        ? { history: [{ date: today(), text: initial.text }, ...(initial.history ?? [])] }
        : initial?.history
          ? { history: initial.history }
          : {}),
    };
    onSave(base);
  };

  return (
    <div className="mt-4 space-y-5 rounded-2xl border border-border bg-muted/30 p-4 sm:p-5">
      <Field label="What would you like to remember?">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Being asked, not told." />
      </Field>

      <fieldset>
        <legend className="text-base font-medium text-foreground">How do you know this?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SOURCES.map((s) => (
            <Chip key={s} selected={source === s} onClick={() => setSource(s)} className="max-w-full whitespace-normal">
              {s === "Recorded conversation"
                ? `${state.caregiverName} recorded this from a conversation with ${who}`
                : s === "Caregiver observation"
                  ? `Observed by ${state.caregiverName}`
                  : s === "Care Circle member"
                    ? "Shared by another Care Circle member"
                    : "Needs confirmation"}
            </Chip>
          ))}
        </div>
        {source === "Care Circle member" ? (
          <div className="mt-3">
            <Field label="Who shared it?">
              <Input value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder="Marcus" />
            </Field>
          </div>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className="text-base font-medium text-foreground">Is this still the case?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Chip key={s} selected={status === s} onClick={() => setStatus(s)} className="max-w-full whitespace-normal">
              {s}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-base font-medium text-foreground">Check back</legend>
        <p className="mt-1 text-sm text-muted-foreground">{CHECK_BACK_EXPLANATION}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {REVIEW_CHOICES.map((c) => (
            <Chip key={c} selected={review === c} onClick={() => setReview(c)} className="max-w-full whitespace-normal">
              {c}
            </Chip>
          ))}
        </div>
        {review === "Custom date" ? (
          <div className="mt-3">
            <Field label="Choose a date">
              <Input type="date" value={custom} onChange={(e) => setCustom(e.target.value)} />
            </Field>
          </div>
        ) : null}
      </fieldset>

      {isHealthRelated(text) ? (
        <p className="rounded-2xl bg-secondary/25 px-4 py-3 text-sm text-foreground">
          Check with the person or an appropriate care provider to make sure this is still current. This
          space is for remembering, not for managing medication.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button variant="quiet" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={!text.trim()} onClick={save}>
          Save detail
        </Button>
      </div>
    </div>
  );
}

function DetailCard({
  detail,
  person,
  caregiverName,
  onEdit,
  onConfirm,
  onArchive,
}: {
  detail: Detail;
  person: Person;
  caregiverName: string;
  onEdit: () => void;
  onConfirm: () => void;
  onArchive: () => void;
}) {
  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <p className="text-base text-foreground">{detail.text}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Tag tone={detail.source === "Needs confirmation" ? "warm" : "sage"}>
          {sourceLabel(detail, person, caregiverName)}
        </Tag>
        <Tag>{detail.status}</Tag>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {lastConfirmedPhrase(detail)}
        {detail.reviewDate ? ` · Check back on ${detail.reviewDate}` : " · No reminder set"}
        {detail.confirmedBy ? ` · Confirmed by ${detail.confirmedBy}` : ""}
      </p>
      {isHealthRelated(detail.text) ? (
        <p className="mt-2 rounded-2xl bg-secondary/25 px-3 py-2 text-sm text-foreground">
          {lastConfirmedPhrase(detail)}. Check with the person or an appropriate care provider to make
          sure it is still current.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="ghost" className="px-3 py-2 text-sm" onClick={onConfirm}>
          Still accurate
        </Button>
        <Button variant="ghost" className="px-3 py-2 text-sm" onClick={onEdit}>
          Update this
        </Button>
        <Button variant="ghost" className="px-3 py-2 text-sm" onClick={onArchive}>
          Archive it
        </Button>
      </div>
    </li>
  );
}

export const PROFILE_SECTIONS = [
  "Current priorities",
  "What matters",
  "Care Circle",
  "Shared Care Conversation",
  "Care Moments",
] as const;

export type ProfileSection = (typeof PROFILE_SECTIONS)[number];

export function PersonProfile({
  person,
  detailParam,
  initialSection,
  backLink,
  extraHeader,
  careCircleContent,
  renderCareCircle,
  conversationInCareCircle,
  conversationStartOpen,
}: {
  person: Person;
  detailParam?: string;
  initialSection?: ProfileSection;
  backLink?: ReactNode;
  extraHeader?: ReactNode;
  careCircleContent?: ReactNode;
  /** Lets the host render the Care Circle with a control that opens the private care conversation. */
  renderCareCircle?: (openConversation: () => void, conversationOpen: boolean) => ReactNode;
  /** When true, the conversation lives inside Care Circle instead of its own tab. */
  conversationInCareCircle?: boolean;
  conversationStartOpen?: boolean;
}) {
  const { state, setState } = useStore();
  const navigate = useNavigate();
  const hasCareCircle = Boolean(careCircleContent || renderCareCircle);
  const [conversationOpen, setConversationOpen] = useState(Boolean(conversationStartOpen));
  const [section, setSection] = useState<ProfileSection>(
    initialSection === "Care Circle" && !hasCareCircle ? "Current priorities" : initialSection ?? "Current priorities",
  );

  const [openForm, setOpenForm] = useState<DetailKey | null>(null);
  const [editing, setEditing] = useState<string | null>(detailParam ?? null);
  const [draft, setDraft] = useState("");
  const [handoff, setHandoff] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [voiceDialog, setVoiceDialog] = useState(false);
  const [voiceChoice, setVoiceChoice] = useState<VoiceChoice | null>(null);
  const [requestMethod, setRequestMethod] = useState<"Text message" | "Email" | "Copy private link">("Text message");
  const [recipient, setRecipient] = useState("");
  const [voiceText, setVoiceText] = useState("");
  const [voiceSection, setVoiceSection] = useState<DetailKey>("whatMatters");
  const [summaryDialog, setSummaryDialog] = useState(false);

  const isFamily = state.role === "family";
  const me = currentAuthor(state.role, state.caregiverName);

  const update = (fn: (p: Person) => Person) =>
    setState((s) => ({ ...s, people: s.people.map((p) => (p.id === person.id ? fn(p) : p)) }));

  const saveDetail = (key: DetailKey, d: Detail) => {
    update((p) => ({
      ...p,
      [key]: p[key].some((x) => x.id === d.id)
        ? p[key].map((x) => (x.id === d.id ? d : x))
        : [d, ...p[key]],
    }));
    setOpenForm(null);
    setEditing(null);
  };

  const patchDetail = (key: DetailKey, id: string, patch: Partial<Detail>) =>
    update((p) => ({ ...p, [key]: p[key].map((x) => (x.id === id ? { ...x, ...patch } : x)) }));

  const archived = DETAIL_SECTIONS.flatMap((k) =>
    person[k].filter((d) => d.archived).map((d) => ({ key: k, detail: d })),
  );

  const createHandoff = () => {
    const prefs = [...person.communication, ...person.comfort]
      .filter((d) => !d.archived)
      .slice(0, 3)
      .map((d) => d.text)
      .join("; ");
    const nextAction = person.coordination.find((d) => !d.archived)?.text;
    const text = [
      `Warm handoff for ${person.preferredName || person.name} · ${today()}`,
      "",
      `What happened recently: ${person.updates[0]?.text ?? "No new updates this week."}`,
      `What needs attention: ${state.requests.find((r) => r.status !== "Completed" && r.status !== "Cancelled")?.detail ?? "Nothing urgent right now."}`,
      `Current preferences: ${prefs || "Ask her before starting anything new."}`,
      `Next planned action: ${nextAction ?? "Check in tomorrow morning."}`,
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
            s.requests.find((r) => r.status !== "Completed" && r.status !== "Cancelled")?.detail ?? "Nothing urgent right now.",
          preferences: prefs || "Ask her before starting anything new.",
          next: nextAction ?? "Check in tomorrow morning.",
          responsible: s.members[0]?.name ?? s.caregiverName,
        },
        ...s.handoffs,
      ],
    }));
  };

  const firstName = person.name.split(" ")[0] || person.preferredName || person.name;
  const summaryCandidates = DETAIL_SECTIONS.flatMap((key) =>
    person[key]
      .filter((detail) => !detail.archived && detail.status === "Current")
      .map((detail) => ({ key, detail })),
  );
  const selectedSummaryIds = person.summaryDetailIds ?? summaryCandidates.map(({ detail }) => detail.id);
  const toggleSummaryDetail = (id: string) => update((p) => ({
    ...p,
    summaryDetailIds: selectedSummaryIds.includes(id)
      ? selectedSummaryIds.filter((detailId) => detailId !== id)
      : [...selectedSummaryIds, id],
  }));
  const sendVoiceRequest = () => {
    update((p) => ({
      ...p,
      voiceInvited: true,
      voiceRequest: { method: requestMethod, recipient: recipient.trim() || "Private link copied", status: "waiting", sentAt: today() },
    }));
  };
  const cancelVoiceRequest = () => update((p) => {
    const { voiceRequest: _removed, ...rest } = p;
    return { ...rest, voiceInvited: false };
  });
  const saveCaregiverVoiceDetail = () => {
    if (!voiceText.trim()) return;
    const source: DetailSource = voiceChoice === "observation" ? "Caregiver observation" : "Recorded conversation";
    const detail: Detail = {
      id: uid(), text: voiceText.trim(), source,
      status: voiceChoice === "observation" ? "Unsure" : "Current",
      dateAdded: today(), lastConfirmed: today(), confirmedBy: state.caregiverName,
    };
    saveDetail(voiceSection, detail);
    setVoiceText(""); setVoiceChoice(null); setVoiceDialog(false);
  };

  /** Turns a confirmed conversation entry into profile information, keeping its history. */
  const addEntryToProfile = (entry: ConversationEntry) => {
    const detail: Detail = {
      id: uid(),
      text: entry.message,
      source: "Care Circle member",
      sourceName: entry.author,
      status: "Current",
      dateAdded: today(),
      lastConfirmed: today(),
      confirmedBy: me.author,
      history: [
        { date: entry.createdAt, text: `Shared in the Shared Care Conversation by ${entry.author} (${entry.authorRole})` },
        ...entry.replies.map((reply) => ({ date: reply.createdAt, text: `${reply.author}: ${reply.text}` })),
      ],
    };
    saveDetail("whatMatters", detail);
    setSection("What matters");
  };

  const availableSections = PROFILE_SECTIONS.filter((value) =>
    value === "Care Circle"
      ? hasCareCircle
      : value === "Shared Care Conversation"
        ? !conversationInCareCircle
        : true,
  );

  const labelForSection = (value: ProfileSection) =>
    value === "Current priorities"
      ? "Current Priorities"
      : value === "What matters"
        ? `What Matters to ${firstName}`
        : value;
  const tabLabels = availableSections.map(labelForSection);

  return (
    <div className="space-y-8">
      {backLink ?? (
        <Link to="/care-circle" search={{ tab: "People I Care For" }} className="text-base underline underline-offset-4">
          ← Back to My Care Circle
        </Link>
      )}

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

      <p className="text-base text-muted-foreground">
        {isFamily
          ? `A shared place to remember what helps ${firstName} feel understood — and to notice when something may have changed.`
          : `You only see information the family caregiver has chosen to share for this person’s care.`}
      </p>

      {extraHeader}

      <Tabs
        tabs={tabLabels}
        active={labelForSection(section)}
        onChange={(value) => {
          const index = tabLabels.indexOf(value);
          const next = availableSections[index];
          if (next) setSection(next);
        }}
      />

      {section === "Current priorities" ? <CurrentPriorities person={person} /> : null}

      {section === "Care Circle" ? (
        <div className="space-y-8">
          {renderCareCircle
            ? renderCareCircle(() => setConversationOpen((value) => !value), conversationOpen)
            : careCircleContent}
          {conversationInCareCircle && conversationOpen ? (
            <div className="space-y-3">
              <p className="text-base text-muted-foreground">
                Message Jordan directly about {firstName}&rsquo;s care. This conversation is only visible to you and the
                designated care contact.
              </p>
              <SharedCareConversation person={person} onAddToProfile={addEntryToProfile} />
            </div>
          ) : null}
        </div>
      ) : null}

      {section === "Shared Care Conversation" && !conversationInCareCircle ? (
        <SharedCareConversation person={person} onAddToProfile={addEntryToProfile} />
      ) : null}


      {section === "Care Moments" ? <CareMomentsSection person={person} /> : null}

      {section === "What matters" ? (
        <div className="space-y-8">
          <p className="text-base text-muted-foreground">
            The preferences, routines, and details that help {firstName} feel like herself.
          </p>

          {isFamily ? (
            <div className="flex flex-wrap gap-3">
              <Button variant="connect" onClick={createHandoff}>
                Create warm handoff
              </Button>
              <Button variant="support" onClick={() => { setVoiceDialog(true); setVoiceChoice(null); }}>
                Add {firstName}’s voice
              </Button>
              <Button variant="quiet" onClick={() => setSummaryDialog(true)}>
                Print care summary
              </Button>
            </div>
          ) : (
            <PaidSuggestion person={person} />
          )}

          {handoff ? (
            <Card className="bg-accent/12">
              <SectionTitle title="Warm handoff summary" subtitle="Saved to your care circle." />
              <pre className="whitespace-pre-wrap font-sans text-base">{handoff}</pre>
            </Card>
          ) : null}

          {DETAIL_SECTIONS.map((key) => {
            const items = person[key].filter(
              (d) => !d.archived && (isFamily || d.status !== "No longer current"),
            );
            const title =
              key === "whatMatters" ? `What matters to ${firstName}` : SECTION_LABELS[key];
            return (
              <Card key={key}>
                <SectionTitle
                  title={title}
                  subtitle={SECTION_HINTS[key]}
                  action={
                    isFamily ? (
                      <Button variant="support" onClick={() => setOpenForm(openForm === key ? null : key)}>
                        Add detail
                      </Button>
                    ) : undefined
                  }
                />
                {items.length === 0 ? (
                  <p className="text-base text-muted-foreground">
                    {isFamily ? `Nothing here yet. Try “${SECTION_PLACEHOLDER[key]}”` : "Nothing shared here yet."}
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {items.map((d) =>
                      editing === d.id && isFamily ? (
                        <li key={d.id}>
                          <DetailForm
                            person={person}
                            initial={d}
                            onCancel={() => setEditing(null)}
                            onSave={(nd) => saveDetail(key, nd)}
                          />
                        </li>
                      ) : isFamily ? (
                        <DetailCard
                          key={d.id}
                          detail={d}
                          person={person}
                          caregiverName={state.caregiverName}
                          onEdit={() => setEditing(d.id)}
                          onConfirm={() =>
                            patchDetail(key, d.id, {
                              lastConfirmed: today(),
                              confirmedBy: state.caregiverName,
                              status: "Current",
                            })
                          }
                          onArchive={() => patchDetail(key, d.id, { archived: true })}
                        />
                      ) : (
                        <ReadOnlyDetail key={d.id} detail={d} person={person} caregiverName={state.caregiverName} />
                      ),
                    )}
                  </ul>
                )}
                {openForm === key && isFamily ? (
                  <DetailForm
                    person={person}
                    onCancel={() => setOpenForm(null)}
                    onSave={(d) => saveDetail(key, d)}
                  />
                ) : null}
              </Card>
            );
          })}

          {person.voiceEntries.length ? (
            <Card>
              <SectionTitle title={`${firstName}’s own words`} subtitle={`Shared directly by ${person.preferredName || firstName}.`} />
              <ul className="space-y-3">
                {person.voiceEntries.map((entry) => (
                  <li key={entry.id} className="rounded-2xl border border-border bg-secondary/15 p-4">
                    <Tag tone="sage">Shared directly by {person.preferredName || firstName}</Tag>
                    <p className="mt-2 text-sm text-muted-foreground">{entry.label} · {entry.date}</p>
                    <p className="mt-1 text-base">{entry.text}</p>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card>
            <SectionTitle title="Important updates" subtitle="What has changed lately." />
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
            {isFamily ? (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Slept well two nights in a row."
                  aria-label="Add an important update"
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
            ) : null}
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-base font-medium text-foreground">
                Care Circle updates about {person.preferredName || person.name}
              </p>
              {state.updates.filter((u) => u.personId === person.id).length === 0 ? (
                <p className="mt-2 text-base text-muted-foreground">
                  No Care Circle updates about them yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {state.updates
                    .filter((u) => u.personId === person.id)
                    .map((u) => (
                      <li key={u.id} className="rounded-2xl bg-muted/60 px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Tag tone="sage">About {person.preferredName || person.name}</Tag>
                          <span className="text-sm text-muted-foreground">
                            {u.from} · {u.date}
                          </span>
                        </div>
                        <p className="mt-1 text-base">{u.text}</p>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </Card>

          {isFamily ? (
            <Card>
              <SectionTitle
                title="Archived details"
                subtitle="Kept quietly, out of the active profile."
                action={
                  <Button variant="quiet" onClick={() => setShowArchived((v) => !v)}>
                    {showArchived ? "Hide" : `Show (${archived.length})`}
                  </Button>
                }
              />
              {showArchived ? (
                archived.length === 0 ? (
                  <p className="text-base text-muted-foreground">Nothing archived yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {archived.map(({ key, detail }) => (
                      <li key={detail.id} className="rounded-2xl border border-border bg-muted/40 p-4">
                        <p className="text-sm text-muted-foreground">{SECTION_LABELS[key]}</p>
                        <p className="mt-1 text-base">{detail.text}</p>
                        <Button
                          variant="ghost"
                          className="mt-2 px-3 py-2 text-sm"
                          onClick={() =>
                            patchDetail(key, detail.id, {
                              archived: false,
                              lastConfirmed: today(),
                              confirmedBy: state.caregiverName,
                            })
                          }
                        >
                          Bring this back
                        </Button>
                      </li>
                    ))}
                  </ul>
                )
              ) : null}
            </Card>
          ) : null}
        </div>
      ) : null}

      {summaryDialog ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-primary/35 p-0 sm:items-center sm:p-5" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSummaryDialog(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="summary-dialog-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-border bg-card p-5 shadow-xl sm:rounded-3xl sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><h2 id="summary-dialog-title" className="font-display text-3xl">Choose details for {firstName}’s care summary</h2><p className="mt-2 text-base text-muted-foreground">Only selected current details will appear. Private check-ins and personal notes are never included.</p></div><Button variant="ghost" className="shrink-0 px-3" aria-label="Close" onClick={() => setSummaryDialog(false)}>×</Button></div>
            <div className="mt-6 space-y-5">{DETAIL_SECTIONS.map((key) => {
              const options = summaryCandidates.filter((item) => item.key === key);
              if (!options.length) return null;
              return <fieldset key={key}><legend className="font-display text-xl">{SECTION_LABELS[key]}</legend><div className="mt-2 space-y-2">{options.map(({ detail }) => <label key={detail.id} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background p-3"><input type="checkbox" className="mt-1 size-5 accent-primary" checked={selectedSummaryIds.includes(detail.id)} onChange={() => toggleSummaryDetail(detail.id)} /><span><span className="block text-base">{detail.text}</span><span className="mt-1 block text-sm text-muted-foreground">{sourceLabel(detail, person, state.caregiverName)} · Confirmed {detail.lastConfirmed}</span></span></label>)}</div></fieldset>;
            })}</div>
            <div className="mt-6 flex flex-wrap gap-3"><Button variant="quiet" onClick={() => setSummaryDialog(false)}>Cancel</Button><Link to="/care-summary/$personId" params={{ personId: person.id }}><Button disabled={selectedSummaryIds.length === 0}>Open printable summary</Button></Link></div>
          </div>
        </div>
      ) : null}

      {voiceDialog ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-primary/35 p-0 sm:items-center sm:p-5" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setVoiceDialog(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="voice-dialog-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-border bg-card p-5 shadow-xl sm:rounded-3xl sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><h2 id="voice-dialog-title" className="font-display text-3xl">How would you like to add {firstName}’s voice?</h2><p className="mt-2 text-base text-muted-foreground">The caregiver owns the private space. {firstName} can still contribute an authentic voice.</p></div><Button variant="ghost" className="shrink-0 px-3" aria-label="Close" onClick={() => setVoiceDialog(false)}>×</Button></div>
            {!voiceChoice ? <div className="mt-6 grid gap-3">
              {[
                ["request", `Send ${firstName} a private request`, `Send ${firstName} a limited link where she can share what matters to her. She will not see your private notes or check-ins.`],
                ["together", "Complete this together", `Let ${firstName} answer on this device while you are together.`],
                ["conversation", `Record what ${firstName} told me`, `Add something ${firstName} shared during a conversation.`],
                ["observation", "Add my own observation", "Record something you noticed that may help you provide care."],
              ].map(([value, title, description]) => <Button key={value} variant="quiet" onClick={() => setVoiceChoice(value as VoiceChoice)} className="h-auto w-full flex-col items-start rounded-2xl p-4 text-left"><span className="block text-lg font-semibold">{title}</span><span className="mt-1 block whitespace-normal text-base font-normal text-muted-foreground">{description}</span></Button>)}
            </div> : null}

            {voiceChoice === "request" ? <div className="mt-6 space-y-5">
              {person.voiceRequest ? <Card className="bg-secondary/20"><Tag tone="sage">{person.voiceRequest.status === "waiting" ? `Waiting for ${firstName}’s response` : person.voiceRequest.status === "submitted" ? "Response received" : "Invitation declined"}</Tag><p className="mt-3 text-base text-muted-foreground">Sent by {person.voiceRequest.method} to {person.voiceRequest.recipient}.</p><div className="mt-4 flex flex-wrap gap-2"><Button variant="support" onClick={sendVoiceRequest}>Resend request</Button><Button variant="quiet" onClick={cancelVoiceRequest}>Cancel request</Button><Link to="/voice-guest/$personId" params={{ personId: person.id }}><Button variant="quiet">Open prototype link</Button></Link></div></Card> : <><fieldset><legend className="text-base font-medium">How should the request be sent?</legend><div className="mt-2 flex flex-wrap gap-2">{(["Text message", "Email", "Copy private link"] as const).map((m) => <Chip key={m} selected={requestMethod === m} onClick={() => setRequestMethod(m)}>{m}</Chip>)}</div></fieldset><Field label={requestMethod === "Text message" ? "Phone number" : requestMethod === "Email" ? "Email address" : "Private link recipient"}><Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder={requestMethod === "Text message" ? "(555) 014-0198" : requestMethod === "Email" ? "ruth@example.com" : firstName} /></Field><Button disabled={!recipient.trim()} onClick={sendVoiceRequest}>Send Request</Button></>}
            </div> : null}
            {voiceChoice === "together" ? <div className="mt-6"><p className="mb-4 text-base text-muted-foreground">Answers completed here will be labeled “Added together with {firstName}.”</p><Button onClick={() => navigate({ to: "/my-voice", search: { person: person.id, mode: "together" } })}>Start together</Button></div> : null}
            {voiceChoice === "conversation" || voiceChoice === "observation" ? <div className="mt-6 space-y-4"><p className="rounded-2xl bg-muted/60 p-4 text-base">{voiceChoice === "conversation" ? `This will be labeled “Recorded by ${state.caregiverName} from a conversation with ${firstName}.”` : `This will be labeled “Observed by ${state.caregiverName}” and marked Unsure until confirmed by ${firstName}.`}</p><Field label="Where does this belong?"><select className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base" value={voiceSection} onChange={(e) => setVoiceSection(e.target.value as DetailKey)}>{DETAIL_SECTIONS.map((k) => <option key={k} value={k}>{SECTION_LABELS[k]}</option>)}</select></Field><Field label="What would you like to remember?"><Textarea value={voiceText} onChange={(e) => setVoiceText(e.target.value)} /></Field><Button disabled={!voiceText.trim()} onClick={saveCaregiverVoiceDetail}>Save detail</Button></div> : null}
            {voiceChoice ? <Button variant="ghost" className="mt-5 px-0" onClick={() => setVoiceChoice(null)}>← Back to choices</Button> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReadOnlyDetail({
  detail,
  person,
  caregiverName,
}: {
  detail: Detail;
  person: Person;
  caregiverName: string;
}) {
  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <p className="text-base text-foreground">{detail.text}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Tag tone={detail.source === "Direct guest response" || detail.source === "Completed together" ? "sage" : "muted"}>
          {sourceLabel(detail, person, caregiverName)}
        </Tag>
        <Tag>{detail.status}</Tag>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Added {detail.dateAdded} · {lastConfirmedPhrase(detail)}
        {detail.confirmedBy ? ` · Confirmed by ${detail.confirmedBy}` : ""}
      </p>
    </li>
  );
}

/** Lets a paid caregiver add an observation or suggest a change without overwriting the profile. */
function PaidSuggestion({ person }: { person: Person }) {
  const { state, setState } = useStore();
  const [open, setOpen] = useState<"Observation" | "Possible change to confirm" | null>(null);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const firstName = person.name.split(" ")[0] || person.preferredName || person.name;
  const me = currentAuthor(state.role, state.caregiverName);

  const send = () => {
    if (!open || !text.trim()) return;
    setState((s) => ({
      ...s,
      conversations: [
        {
          id: uid(),
          personId: person.id,
          type: open,
          message: text.trim(),
          author: me.author,
          authorRole: me.authorRole,
          createdAt: today(),
          visibleTo: "Jordan (Family caregiver), Alicia Boateng (Paid caregiver)",
          status: "Open" as const,
          replies: [],
        },
        ...(s.conversations ?? []),
      ],
    }));
    setText("");
    setOpen(null);
    setSent(true);
  };

  return (
    <Card className="bg-muted/40">
      <p className="text-base">
        You can share what you notice without changing a confirmed preference. Jordan reviews and
        confirms every change.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="support" className="px-4 py-2 text-sm" onClick={() => { setOpen("Observation"); setSent(false); }}>
          Add an observation
        </Button>
        <Button variant="quiet" className="px-4 py-2 text-sm" onClick={() => { setOpen("Possible change to confirm"); setSent(false); }}>
          Suggest an update
        </Button>
      </div>
      {open ? (
        <div className="mt-4 space-y-3">
          <Field label={open === "Observation" ? `What did you notice about ${firstName}?` : "What would you suggest updating?"}>
            <Textarea value={text} onChange={(event) => setText(event.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button variant="quiet" className="px-4 py-2 text-sm" onClick={() => setOpen(null)}>Cancel</Button>
            <Button className="px-4 py-2 text-sm" disabled={!text.trim()} onClick={send}>Send to the Shared Care Conversation</Button>
          </div>
        </div>
      ) : null}
      {sent ? (
        <p className="mt-3 text-sm text-secondary-foreground">
          Shared in the Shared Care Conversation for Jordan to review.
        </p>
      ) : null}
    </Card>
  );
}

function CurrentPriorities({ person }: { person: Person }) {
  const { state, setState } = useStore();
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteType, setNoteType] = useState<"Observation" | "Possible change to confirm">("Observation");
  const [noteText, setNoteText] = useState("");
  const firstName = person.preferredName || person.name.split(" ")[0] || person.name;
  const isFamily = state.role === "family";
  const me = currentAuthor(state.role, state.caregiverName);

  const active = state.carePriorities.filter(
    (p) =>
      p.personId === person.id &&
      !p.done &&
      !p.archived &&
      (isFamily || (p.visibleTo ?? "").includes("Alicia")),
  );
  const openTasks = state.tasks.filter((t) => t.personId === person.id && !t.done);

  const patch = (id: string, p: Partial<(typeof state.carePriorities)[number]>) =>
    setState((s) => ({
      ...s,
      carePriorities: s.carePriorities.map((x) => (x.id === id ? { ...x, ...p } : x)),
    }));

  const addPriority = () => {
    if (!text.trim()) return;
    setState((s) => ({
      ...s,
      carePriorities: [
        {
          id: uid(),
          personId: person.id,
          text: text.trim(),
          done: false,
          createdAt: today(),
          addedBy: s.caregiverName,
          addedByRole: "Family caregiver",
          visibleTo: "Jordan, Alicia Boateng",
          status: "Active" as const,
        },
        ...s.carePriorities,
      ],
    }));
    setText("");
    setAdding(false);
  };

  const sendNote = (priorityId: string) => {
    if (!noteText.trim()) return;
    setState((s) => ({
      ...s,
      conversations: [
        {
          id: uid(),
          personId: person.id,
          type: noteType,
          message: noteText.trim(),
          author: me.author,
          authorRole: me.authorRole,
          createdAt: today(),
          relatedPriorityId: priorityId,
          visibleTo: "Jordan (Family caregiver), Alicia Boateng (Paid caregiver)",
          status: "Open" as const,
          replies: [],
        },
        ...(s.conversations ?? []),
      ],
    }));
    setNoteText("");
    setNoteFor(null);
  };

  /** Creates a task on the caregiver's plate from a priority, then links the two. */
  const makeTask = (priorityId: string, title: string) => {
    const taskId = uid();
    setState((s) => ({
      ...s,
      tasks: [
        {
          id: taskId,
          title,
          kind: "Caregiving" as const,
          personId: person.id,
          bucket: "Not sorted yet" as const,
          done: false,
          createdAt: today(),
        },
        ...s.tasks,
      ],
      carePriorities: s.carePriorities.map((x) => (x.id === priorityId ? { ...x, taskId } : x)),
    }));
  };

  return (
    <Card>
      <SectionTitle
        title="Current priorities"
        subtitle="What the care team is focusing on right now."
      />
      {active.length === 0 ? (
        <Empty title="Nothing pressing right now" body={`Add a priority when something needs attention for ${firstName}.`} />
      ) : (
        <ul className="space-y-3">
          {active.map((p) => {
            const task = state.tasks.find((t) => t.id === p.taskId);
            return (
              <li key={p.id} className="rounded-2xl border border-border p-4">
                {editingId === p.id && isFamily ? (
                  <div className="space-y-3">
                    <Input value={editText} onChange={(e) => setEditText(e.target.value)} aria-label="Edit priority" />
                    <div className="flex flex-wrap gap-2">
                      <Button variant="quiet" className="px-4 py-2 text-sm" onClick={() => setEditingId(null)}>Cancel</Button>
                      <Button
                        className="px-4 py-2 text-sm"
                        disabled={!editText.trim()}
                        onClick={() => {
                          patch(p.id, { text: editText.trim() });
                          setEditingId(null);
                        }}
                      >
                        Save priority
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg">{p.text}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Tag tone="sage">{p.status ?? "Active"}</Tag>
                  {task ? <Tag>On my plate · {task.bucket}</Tag> : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Added by {p.addedBy ?? state.caregiverName}
                  {p.addedByRole ? ` · ${p.addedByRole}` : ""} · {p.createdAt}
                </p>
                <p className="text-sm text-muted-foreground">
                  Visible to {p.visibleTo ?? "Jordan"}
                  {p.reviewDate ? ` · Follow up on ${p.reviewDate}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="support" className="px-4 py-2 text-sm" onClick={() => patch(p.id, { done: true, status: "Complete" })}>
                    Mark complete
                  </Button>
                  {isFamily ? (
                    <>
                      <Button
                        variant="quiet"
                        className="px-4 py-2 text-sm"
                        onClick={() => {
                          setEditingId(p.id);
                          setEditText(p.text);
                        }}
                      >
                        Edit priority
                      </Button>
                      <Button variant="ghost" className="px-4 py-2 text-sm" onClick={() => patch(p.id, { archived: true, status: "Archived" })}>
                        Archive
                      </Button>
                      <Button
                        variant="ghost"
                        className="px-4 py-2 text-sm"
                        onClick={() => patch(p.id, { reviewDate: addDays(7) })}
                      >
                        Set a follow-up date
                      </Button>
                      {task ? (
                        <Link to="/check-in" search={{ section: "capacity" }}>
                          <Button variant="quiet" className="px-4 py-2 text-sm">Open in My Check-In</Button>
                        </Link>
                      ) : (
                        <Button variant="quiet" className="px-4 py-2 text-sm" onClick={() => makeTask(p.id, p.text)}>
                          Create a task from this
                        </Button>
                      )}
                      {task ? (
                        <Link to="/check-in" search={{ section: "delegate", delegate: task.id }}>
                          <Button variant="quiet" className="px-4 py-2 text-sm">Turn into a Care Circle request</Button>
                        </Link>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <Button
                        variant="quiet"
                        className="px-4 py-2 text-sm"
                        onClick={() => { setNoteFor(p.id); setNoteType("Observation"); setNoteText(""); }}
                      >
                        Add an observation
                      </Button>
                      <Button
                        variant="ghost"
                        className="px-4 py-2 text-sm"
                        onClick={() => { setNoteFor(p.id); setNoteType("Possible change to confirm"); setNoteText(""); }}
                      >
                        Suggest an update
                      </Button>
                    </>
                  )}
                </div>
                {noteFor === p.id ? (
                  <div className="mt-3 space-y-3 rounded-2xl bg-muted/40 p-4">
                    <p className="text-sm text-muted-foreground">
                      This is shared with Jordan for review. It does not change her confirmed priority.
                    </p>
                    <Field label={noteType === "Observation" ? "What did you notice?" : "What would you suggest?"}>
                      <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                    </Field>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="quiet" className="px-4 py-2 text-sm" onClick={() => setNoteFor(null)}>Cancel</Button>
                      <Button className="px-4 py-2 text-sm" disabled={!noteText.trim()} onClick={() => sendNote(p.id)}>
                        Share with the care team
                      </Button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {openTasks.length && isFamily ? (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-base font-medium">Open tasks connected to {firstName}</p>
          <ul className="mt-2 space-y-1">
            {openTasks.map((t) => (
              <li key={t.id} className="text-base text-muted-foreground">
                {t.title} · {t.bucket}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {isFamily ? (
        adding ? (
          <div className="mt-5 space-y-3">
            <Field label="What needs attention?">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Groceries before the weekend" />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button variant="quiet" onClick={() => setAdding(false)}>Cancel</Button>
              <Button disabled={!text.trim()} onClick={addPriority}>Save priority</Button>
            </div>
          </div>
        ) : (
          <Button className="mt-5" onClick={() => setAdding(true)}>Add a priority</Button>
        )
      ) : null}
    </Card>
  );
}
