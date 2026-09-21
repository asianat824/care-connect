import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button, Card, Field, Input, SectionTitle, Tabs, Tag, Textarea } from "@/components/ui";
import { today, uid } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import type { CareConnectPost } from "@/lib/types";
import { deidentifyCareConnectPost, type DeidentifyResult } from "@/lib/care-connect.functions";

const TABS = ["Workplace Community", "Caregiver Community"] as const;
type ConnectTab = (typeof TABS)[number];

const WORKPLACE = [
  { id: "w1", topic: "End-of-shift decompression", body: "What helps you mentally transition after a difficult shift?", responses: 18 },
  { id: "w2", topic: "Supporting one another", body: "How do you ask for help before you become overwhelmed?", responses: 12 },
  { id: "w3", topic: "Learning from the team", body: "What is one communication strategy that has helped you build trust?", responses: 27 },
];

const COMMUNITY = [
  { id: "c1", topic: "New professional caregivers", body: "What helped you feel grounded during your first months in care work?", responses: 36 },
  { id: "c2", topic: "Caregiver burnout and boundaries", body: "Small boundaries that protect your energy without losing connection.", responses: 54 },
  { id: "c3", topic: "Communicating with families", body: "How do you keep updates clear, respectful, and focused?", responses: 21 },
  { id: "c4", topic: "Preserving personhood in care", body: "Ways you keep a person’s identity and choices present in everyday care.", responses: 43 },
  { id: "c5", topic: "End-of-shift reflection", body: "What helps you leave work with a settled mind?", responses: 19 },
  { id: "c6", topic: "Working in home care", body: "How do you build trust while respecting the home you are entering?", responses: 31 },
  { id: "c7", topic: "Hospice and comfort-centered care", body: "How caregivers support comfort, dignity, and presence.", responses: 28 },
];

export const Route = createFileRoute("/care-connect")({
  validateSearch: (search: Record<string, unknown>) => {
    const tab = TABS.includes(search["tab"] as ConnectTab) ? (search["tab"] as ConnectTab) : "Workplace Community";
    return search["tab"] ? { tab } : {};
  },
  head: () => ({ meta: [
    { title: "Care Connect — Connected Care" },
    { name: "description", content: "Private peer connection for paid caregivers inside and beyond the workplace." },
    { property: "og:title", content: "Care Connect — Connected Care" },
    { property: "og:description", content: "Connect with people who understand paid caregiving work." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CareConnectPage,
});

function CareConnectPage() {
  const { state, setState } = useStore();
  const search = Route.useSearch();
  const [tab, setTab] = useState<ConnectTab>(search.tab ?? "Workplace Community");
  const [starting, setStarting] = useState(false);
  const [topic, setTopic] = useState("");
  const [body, setBody] = useState("");
  const [joined, setJoined] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [review, setReview] = useState<DeidentifyResult | null>(null);
  const runDeidentify = useServerFn(deidentifyCareConnectPost);

  const checkDraft = async () => {
    if (!topic.trim() || !body.trim()) return;
    setChecking(true);
    setReview(null);
    try {
      const result = await runDeidentify({ data: { topic: topic.trim(), body: body.trim() } });
      setReview(result);
    } catch {
      setReview({ topic: topic.trim(), body: body.trim(), changes: [], error: "The review could not be completed." });
    } finally {
      setChecking(false);
    }
  };
  const examples = tab === "Workplace Community" ? WORKPLACE : COMMUNITY;
  const localPosts = (state.careConnectPosts ?? []).filter((post) => post.community === tab);

  const save = (useReviewed: boolean) => {
    const finalTopic = useReviewed && review ? review.topic : topic.trim();
    const finalBody = useReviewed && review ? review.body : body.trim();
    if (!finalTopic || !finalBody) return;
    const post: CareConnectPost = { id: uid(), community: tab, topic: finalTopic, body: finalBody, responses: 0, author: "Alicia", date: today() };
    setState((current) => ({ ...current, careConnectPosts: [post, ...(current.careConnectPosts ?? [])] }));
    setTopic(""); setBody(""); setReview(null); setStarting(false);
  };
  const join = (id: string) => {
    setJoined(id);
    setState((current) => ({ ...current, joinedCareConnectIds: Array.from(new Set([...(current.joinedCareConnectIds ?? []), id])) }));
  };

  return (
    <div className="space-y-8">
      <header><h1 className="font-display text-4xl">Care Connect</h1><p className="mt-2 text-lg text-muted-foreground">Connect with people who understand the work—inside and beyond your workplace.</p></header>
      <Tabs tabs={[...TABS]} active={tab} onChange={(value) => setTab(value as ConnectTab)} />
      <div className="rounded-2xl border border-border bg-accent/12 p-5">
        <p className="font-semibold">Protect the people you support</p>
        <p className="mt-1 text-base">Care Connect is for caregiver support. Do not share names, addresses, diagnoses, photos, schedules, or other identifying information about anyone receiving care.</p>
      </div>
      <section>
        <SectionTitle
          title={tab}
          subtitle={tab === "Workplace Community" ? "Connect with coworkers who understand your workplace, schedule, and day-to-day experience." : "Connect with caregivers beyond your workplace through shared experience."}
          action={<Button onClick={() => setStarting(true)}>Start a conversation</Button>}
        />
        {tab === "Workplace Community" ? <p className="mb-4 text-sm text-muted-foreground">Peer reflection here does not replace the formal Work Team support-request system.</p> : <p className="mb-4 text-sm text-muted-foreground">Peer conversations are not therapy, crisis counseling, or medical advice.</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {[...localPosts, ...examples].map((discussion) => (
            <Card key={discussion.id}>
              <Tag tone={tab === "Workplace Community" ? "sage" : "warm"}>{tab === "Workplace Community" ? "Verified workplace community" : "Paid caregiver community"}</Tag>
              <h2 className="mt-3 font-display text-2xl">{discussion.topic}</h2>
              <p className="mt-2 text-base text-muted-foreground">{discussion.body}</p>
              <p className="mt-4 text-sm text-muted-foreground">{discussion.responses} responses</p>
              <Button variant="quiet" className="mt-3 px-4 py-2 text-sm" onClick={() => join(discussion.id)}>{joined === discussion.id || (state.joinedCareConnectIds ?? []).includes(discussion.id) ? "Conversation joined" : "Join conversation"}</Button>
            </Card>
          ))}
        </div>
      </section>
      {starting ? (
        <div role="dialog" aria-modal="true" aria-label="Start a conversation" className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-4 sm:items-center">
          <Card className="max-h-[85vh] w-full max-w-xl overflow-y-auto">
            <SectionTitle title="Start a conversation" subtitle={`Post to ${tab}.`} />
            <div className="space-y-4">
              <Field label="Topic"><Input value={topic} onChange={(event) => { setTopic(event.target.value); setReview(null); }} /></Field>
              <Field label="What would you like to ask or share?"><Textarea value={body} onChange={(event) => { setBody(event.target.value); setReview(null); }} /></Field>
              <p className="rounded-2xl bg-accent/12 p-4 text-sm">Do not include identifying care-recipient information or details from handoffs, support requests, or private check-ins.</p>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-base font-semibold">Check before you post</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  A privacy check reads your draft and rewrites anything that could identify the person you support.
                </p>
                <Button variant="support" className="mt-3 px-4 py-2 text-sm" disabled={!topic.trim() || !body.trim() || checking} onClick={() => void checkDraft()}>
                  {checking ? "Checking your draft…" : "Remove identifying details"}
                </Button>
                {review ? (
                  review.error ? (
                    <p className="mt-3 text-sm text-foreground">{review.error} You can still edit and post your own words.</p>
                  ) : (
                    <div className="mt-4 space-y-3 rounded-2xl bg-muted/50 p-4">
                      <p className="text-sm font-semibold">Suggested safe version</p>
                      <p className="text-base font-medium">{review.topic}</p>
                      <p className="text-base">{review.body}</p>
                      {review.changes.length ? (
                        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          {review.changes.map((change) => <li key={change}>{change}</li>)}
                        </ul>
                      ) : <p className="text-sm text-muted-foreground">Nothing identifying was found.</p>}
                      <Button className="px-4 py-2 text-sm" onClick={() => save(true)}>Post the safe version</Button>
                    </div>
                  )
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="quiet" onClick={() => { setStarting(false); setReview(null); }}>Cancel</Button>
                <Button variant="quiet" disabled={!topic.trim() || !body.trim()} onClick={() => save(false)}>Post my own wording</Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}