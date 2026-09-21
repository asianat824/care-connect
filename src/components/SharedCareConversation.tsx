import { useState } from "react";
import { Button, Card, Chip, Empty, Field, SectionTitle, Tag, Textarea } from "@/components/ui";
import { useStore } from "@/lib/store";
import { today, uid } from "@/lib/demo-data";
import type {
  ConversationEntry,
  ConversationEntryType,
  ConversationStatus,
  Person,
} from "@/lib/types";

export const ENTRY_TYPES: ConversationEntryType[] = [
  "Preference",
  "Routine",
  "Observation",
  "Question",
  "Follow-up",
  "Possible change to confirm",
];

export function currentAuthor(role: "family" | "paid", caregiverName: string) {
  return role === "paid"
    ? { author: "Alicia Boateng", authorRole: "Paid caregiver" }
    : { author: caregiverName, authorRole: "Family caregiver" };
}

function stamp() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `Shared today at ${time}`;
}

export function SharedCareConversation({
  person,
  onAddToProfile,
}: {
  person: Person;
  onAddToProfile: (entry: ConversationEntry) => void;
}) {
  const { state, setState } = useStore();
  const firstName = person.name.split(" ")[0] || person.preferredName || person.name;
  const me = currentAuthor(state.role, state.caregiverName);
  const isFamily = state.role === "family";

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ConversationEntryType>("Observation");
  const [message, setMessage] = useState("");
  const [relatedPriorityId, setRelatedPriorityId] = useState("");
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const entries = (state.conversations ?? []).filter((entry) => entry.personId === person.id);
  const priorities = state.carePriorities.filter(
    (priority) => priority.personId === person.id && !priority.done && !priority.archived,
  );
  const visibility = `Jordan (Family caregiver), Alicia Boateng (Paid caregiver)`;

  const patch = (id: string, changes: Partial<ConversationEntry>) =>
    setState((s) => ({
      ...s,
      conversations: (s.conversations ?? []).map((entry) =>
        entry.id === id ? { ...entry, ...changes } : entry,
      ),
    }));

  const save = () => {
    if (!message.trim()) return;
    const entry: ConversationEntry = {
      id: uid(),
      personId: person.id,
      type,
      message: message.trim(),
      author: me.author,
      authorRole: me.authorRole,
      createdAt: stamp(),
      visibleTo: visibility,
      status: "Open",
      replies: [],
      ...(relatedPriorityId ? { relatedPriorityId } : {}),
    };
    setState((s) => ({ ...s, conversations: [entry, ...(s.conversations ?? [])] }));
    setMessage("");
    setRelatedPriorityId("");
    setOpen(false);
  };

  const addReply = (id: string) => {
    if (!replyText.trim()) return;
    setState((s) => ({
      ...s,
      conversations: (s.conversations ?? []).map((entry) =>
        entry.id === id
          ? {
              ...entry,
              replies: [
                ...entry.replies,
                {
                  id: uid(),
                  author: me.author,
                  authorRole: me.authorRole,
                  text: replyText.trim(),
                  createdAt: stamp(),
                },
              ],
            }
          : entry,
      ),
    }));
    setReplyText("");
    setReplyOpen(null);
  };

  const statusActions: { label: string; value: ConversationStatus }[] = [
    { label: "Confirmed", value: "Confirmed" },
    { label: "Needs more information", value: "Needs more information" },
    { label: `Ask ${firstName}`, value: "Ask the person" },
    { label: "No longer current", value: "No longer current" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          title="Shared Care Conversation"
          subtitle={`A shared, person-specific conversation between the people supporting ${firstName}.`}
          action={<Button onClick={() => setOpen(true)}>Add a note or question</Button>}
        />
        <p className="rounded-2xl bg-secondary/25 p-4 text-base text-foreground">
          This conversation is connected to {firstName}’s care profile. Only authorized members of her
          care team can view it.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Handoff Notes answer “What happened during this particular shift?” This conversation asks
          “What are we learning about {firstName} over time?” It is not a medical record or an
          emergency channel.
        </p>

        {open ? (
          <div className="mt-5 space-y-5 rounded-2xl border border-border bg-muted/30 p-4 sm:p-5">
            <fieldset>
              <legend className="text-base font-medium text-foreground">Type of entry</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {ENTRY_TYPES.map((value) => (
                  <Chip key={value} selected={type === value} onClick={() => setType(value)}>
                    {value}
                  </Chip>
                ))}
              </div>
            </fieldset>
            <Field label="Message">
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={`Something you noticed or want to ask about ${firstName}'s care`}
              />
            </Field>
            <Field label="Related priority (optional)">
              <select
                value={relatedPriorityId}
                onChange={(event) => setRelatedPriorityId(event.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base"
              >
                <option value="">Not connected to a priority</option>
                {priorities.map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {priority.text}
                  </option>
                ))}
              </select>
            </Field>
            <div className="rounded-2xl bg-card p-4 text-sm text-foreground">
              <p className="font-semibold">Who can view this</p>
              <p className="mt-1 text-muted-foreground">{visibility}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="quiet" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button disabled={!message.trim()} onClick={save}>
                Share with the care team
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      {entries.length === 0 ? (
        <Empty
          title="No shared notes yet"
          body={`Start the conversation with something you are learning about ${firstName}.`}
        />
      ) : (
        <ul className="space-y-4">
          {entries.map((entry) => {
            const mine = entry.author === me.author;
            const related = state.carePriorities.find((p) => p.id === entry.relatedPriorityId);
            return (
              <li key={entry.id}>
                <Card>
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag tone="warm">{entry.type}</Tag>
                    <Tag tone={entry.status === "Confirmed" ? "sage" : "muted"}>
                      {entry.status === "Ask the person" ? `Ask ${firstName}` : entry.status}
                    </Tag>
                    {entry.fromHandoffId ? <Tag>From a handoff note</Tag> : null}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {entry.author} · {entry.authorRole} · {entry.createdAt}
                  </p>
                  {editingId === entry.id ? (
                    <div className="mt-3 space-y-3">
                      <Textarea value={editText} onChange={(event) => setEditText(event.target.value)} />
                      <div className="flex flex-wrap gap-2">
                        <Button variant="quiet" className="px-4 py-2 text-sm" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                        <Button
                          className="px-4 py-2 text-sm"
                          disabled={!editText.trim()}
                          onClick={() => {
                            patch(entry.id, { message: editText.trim() });
                            setEditingId(null);
                          }}
                        >
                          Save changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-lg text-foreground">{entry.message}</p>
                  )}
                  {related ? (
                    <p className="mt-2 text-sm text-muted-foreground">Related priority: {related.text}</p>
                  ) : null}
                  <p className="mt-2 text-sm text-muted-foreground">Visible to {entry.visibleTo}</p>

                  {entry.replies.length ? (
                    <ul className="mt-4 space-y-2 border-l-2 border-border pl-4">
                      {entry.replies.map((reply) => (
                        <li key={reply.id}>
                          <p className="text-sm text-muted-foreground">
                            {reply.author} · {reply.authorRole} · {reply.createdAt}
                          </p>
                          <p className="text-base">{reply.text}</p>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {replyOpen === entry.id ? (
                    <div className="mt-4 space-y-3">
                      <Field label="Your reply">
                        <Textarea value={replyText} onChange={(event) => setReplyText(event.target.value)} />
                      </Field>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="quiet" className="px-4 py-2 text-sm" onClick={() => setReplyOpen(null)}>
                          Cancel
                        </Button>
                        <Button className="px-4 py-2 text-sm" disabled={!replyText.trim()} onClick={() => addReply(entry.id)}>
                          Send reply
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="quiet"
                      className="px-4 py-2 text-sm"
                      onClick={() => {
                        setReplyOpen(entry.id);
                        setReplyText("");
                      }}
                    >
                      Reply
                    </Button>
                    {mine ? (
                      <>
                        <Button
                          variant="ghost"
                          className="px-4 py-2 text-sm"
                          onClick={() => {
                            setEditingId(entry.id);
                            setEditText(entry.message);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="px-4 py-2 text-sm"
                          onClick={() => setConfirmDelete(entry.id)}
                        >
                          Delete
                        </Button>
                      </>
                    ) : null}
                  </div>

                  {confirmDelete === entry.id ? (
                    <div className="mt-3 rounded-2xl border border-border bg-muted/40 p-4">
                      <p className="text-base">Delete your entry? This cannot be undone.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button variant="quiet" className="px-4 py-2 text-sm" onClick={() => setConfirmDelete(null)}>
                          Keep it
                        </Button>
                        <Button
                          className="px-4 py-2 text-sm"
                          onClick={() => {
                            setState((s) => ({
                              ...s,
                              conversations: (s.conversations ?? []).filter((x) => x.id !== entry.id),
                            }));
                            setConfirmDelete(null);
                          }}
                        >
                          Delete entry
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {isFamily ? (
                    <div className="mt-4 border-t border-border pt-4">
                      <p className="text-sm font-semibold text-foreground">Status</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {statusActions.map((action) => (
                          <Chip
                            key={action.value}
                            selected={entry.status === action.value}
                            onClick={() => patch(entry.id, { status: action.value })}
                            className="px-3 py-1.5 text-sm"
                          >
                            {action.label}
                          </Chip>
                        ))}
                      </div>
                      {entry.addedToProfile ? (
                        <p className="mt-3 text-sm text-secondary-foreground">
                          Added to what matters to {firstName} on {entry.addedToProfile.date} by{" "}
                          {entry.addedToProfile.by}. Originally shared by {entry.author}.
                        </p>
                      ) : (
                        <Button
                          variant="support"
                          className="mt-3 px-4 py-2 text-sm"
                          onClick={() => {
                            onAddToProfile(entry);
                            patch(entry.id, {
                              status: "Confirmed",
                              addedToProfile: { date: today(), by: me.author },
                            });
                          }}
                        >
                          Add to What Matters to {firstName}
                        </Button>
                      )}
                    </div>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
