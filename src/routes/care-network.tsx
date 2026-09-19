import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button, Card, Chip, Field, Input, SectionTitle, Tabs, Tag, Textarea } from "@/components/ui";
import { today, uid } from "@/lib/demo-data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/care-network")({
  validateSearch: (search: Record<string, unknown>) => {
    const out: { tab?: string; ask?: string } = {};
    if (typeof search["tab"] === "string") out.tab = search["tab"];
    if (typeof search["ask"] === "string") out.ask = search["ask"];
    return out;
  },
  head: () => ({ meta: [
    { title: "Care Network — [PROJECT NAME]" },
    { name: "description", content: "Peer caregiver support, practical resources, and local programs beyond your immediate care circle." },
    { property: "og:title", content: "Care Network — [PROJECT NAME]" },
    { property: "og:description", content: "Find support from people and resources beyond your immediate care circle." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CareNetworkPage,
});

const CONVERSATIONS = [
  { id: "n1", topic: "Caring for a parent", category: "Family caregivers", preview: "How do you offer help while still honoring a parent's choices?", responses: 24, detail: "Caregivers share ways they ask permission, offer two clear choices, and leave room for a parent to say no." },
  { id: "n2", topic: "Young caregivers", category: "Young adult caregivers", preview: "Finding people who understand when care and school overlap.", responses: 18, detail: "A gentle conversation about teachers, trusted adults, and making room for ordinary young-adult life." },
  { id: "n3", topic: "Balancing caregiving and work", category: "Working caregivers", preview: "What helped when every calendar felt full?", responses: 41, detail: "People discuss boundaries, flexible schedules, and asking family to own specific responsibilities." },
  { id: "n4", topic: "Grief and changing relationships", category: "Family and friend caregivers", preview: "Making space for love and loss at the same time.", responses: 29, detail: "Caregivers reflect on changing roles without trying to solve or minimize difficult feelings." },
  { id: "n5", topic: "Asking family for help", category: "Family caregivers", preview: "Specific requests that made it easier for others to say yes.", responses: 33, detail: "Examples include naming one task, one date, and what a helpful result would look like." },
  { id: "n6", topic: "Caregiver stress", category: "All caregivers", preview: "Small ways people notice they need support before reaching a breaking point.", responses: 52, detail: "A lived-experience discussion about rest, support, and asking someone trusted to step in." },
  { id: "n7", topic: "Navigating a new diagnosis", category: "New caregivers", preview: "What helped you take the next step without learning everything at once?", responses: 21, detail: "Caregivers share question lists and ways to keep the person receiving care involved." },
];

const RESOURCES = [
  { id: "r1", name: "Rest & Reset Respite Directory", description: "A demonstration directory for short breaks and in-home respite options.", type: "Respite care", location: "Available online" },
  { id: "r2", name: "Care Skills Learning Room", description: "Fictional self-paced classes on communication, planning, and caregiver wellbeing.", type: "Caregiver education", location: "Available online" },
  { id: "r3", name: "Family Benefits Navigator", description: "Demonstration guidance for finding public benefits and financial-support programs.", type: "Benefits and financial support", location: "Available online" },
  { id: "r4", name: "Community Ride Connection", description: "Fictional door-to-door rides for appointments and community activities.", type: "Transportation", location: "Wayne County, MI" },
  { id: "r5", name: "Caregiver Listening Line", description: "Demonstration peer listening and mental-health referral information.", type: "Mental-health support", location: "Available online" },
  { id: "r6", name: "Planning Together Clinic", description: "Fictional plain-language legal and advance-planning information sessions.", type: "Legal and advance-planning information", location: "Detroit, MI" },
  { id: "r7", name: "Access & Independence Hub", description: "Demonstration disability resources and accessibility guidance.", type: "Disability resources", location: "Available online" },
  { id: "r8", name: "Neighborhood Aging Services", description: "Fictional information and referrals for older adults and caregivers.", type: "Aging services", location: "Detroit, MI" },
];

const LOCAL = [
  { id: "l1", name: "Thursday Caregiver Circle", kind: "Support group", tags: ["In person", "Free", "Evening"] },
  { id: "l2", name: "Care From Home Workshop", kind: "Caregiver workshop", tags: ["Online", "Free", "Weekend"] },
  { id: "l3", name: "Community Garden Morning", kind: "Community event", tags: ["In person", "Free", "Weekend"] },
  { id: "l4", name: "A Restful Afternoon", kind: "Respite program", tags: ["In person"] },
  { id: "l5", name: "Aging & Disability Answers", kind: "Local organization", tags: ["Online", "In person", "Free", "Evening"] },
];
const FILTERS = ["Online", "In person", "Free", "Evening", "Weekend"];

function CareNetworkPage() {
  const { state, setState } = useStore();
  const [tab, setTab] = useState("Peer Support");
  const [openConversation, setOpenConversation] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [question, setQuestion] = useState("");
  const [search, setSearch] = useState("");
  const [resourceDetail, setResourceDetail] = useState<string | null>(null);
  const [zip, setZip] = useState(state.localSupportZip ?? "");
  const [filters, setFilters] = useState<string[]>([]);
  const filteredResources = useMemo(() => RESOURCES.filter((r) => `${r.name} ${r.description} ${r.type} ${r.location}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const filteredLocal = LOCAL.filter((item) => filters.every((f) => item.tags.includes(f)));
  const saved = state.savedResourceIds ?? [];

  return <div className="space-y-8">
    <header><h1 className="font-display text-4xl">Care Network</h1><p className="mt-2 text-lg text-muted-foreground">Find support from people and resources beyond your immediate care circle.</p></header>
    <Card className="border-secondary bg-secondary/20"><p className="font-semibold">Your Care Network activity is separate from your private care space.</p><p className="mt-1 text-base text-foreground">Nothing from your check-ins, personal notes, or Care Circle is shared unless you choose to share it.</p></Card>
    <Tabs tabs={["Peer Support", "Caregiver Resources", "Local Support"]} active={tab} onChange={setTab} />

    {tab === "Peer Support" ? <section className="space-y-5">
      <SectionTitle title="Peer support" subtitle="Lived-experience conversations with caregivers beyond your immediate circle." action={<Button onClick={() => setAsking(true)}>Ask the Care Network</Button>} />
      {asking ? <Card className="space-y-4"><SectionTitle title="Ask the Care Network" /><p className="rounded-2xl bg-accent/15 p-4 text-base">Do not include names, addresses, medical-record details, or other information that could identify the person you care for.</p><Field label="What would you like to ask?"><Textarea value={question} onChange={(e) => setQuestion(e.target.value)} /></Field><div className="flex flex-wrap gap-2"><Button variant="quiet" onClick={() => setAsking(false)}>Cancel</Button><Button disabled={!question.trim()} onClick={() => { setState((s) => ({ ...s, networkQuestions: [{ id: uid(), date: today(), text: question.trim() }, ...(s.networkQuestions ?? [])] })); setQuestion(""); setAsking(false); }}>Post question</Button></div></Card> : null}
      {(state.networkQuestions ?? []).map((q) => <Card key={q.id}><Tag tone="sage">Your demonstration question</Tag><p className="mt-3 text-lg">{q.text}</p><p className="mt-1 text-sm text-muted-foreground">{q.date} · 0 responses</p></Card>)}
      <div className="grid gap-4 sm:grid-cols-2">{CONVERSATIONS.map((c) => <Card key={c.id}><Tag>{c.category}</Tag><h2 className="mt-3 font-display text-xl">{c.topic}</h2><p className="mt-1 text-base text-muted-foreground">{c.preview}</p><p className="mt-3 text-sm text-muted-foreground">{c.responses} responses</p><Button variant="support" className="mt-4" onClick={() => setOpenConversation(openConversation === c.id ? null : c.id)}>{openConversation === c.id ? "Close Conversation" : "Join Conversation"}</Button>{openConversation === c.id ? <div className="mt-4 border-t border-border pt-4"><p className="text-base">{c.detail}</p><p className="mt-3 text-sm text-muted-foreground">Demonstration conversation · No private care-space information is shown.</p></div> : null}</Card>)}</div>
    </section> : null}

    {tab === "Caregiver Resources" ? <section className="space-y-5"><SectionTitle title="Caregiver resources" subtitle="Fictional demonstration content for exploring the prototype." /><Field label="Search resources"><Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Try respite, transportation, or legal" /></Field><div className="grid gap-4 sm:grid-cols-2">{filteredResources.map((r) => <Card key={r.id}><Tag tone="warm">Demonstration content</Tag><h2 className="mt-3 font-display text-xl">{r.name}</h2><p className="mt-1 text-base text-muted-foreground">{r.description}</p><p className="mt-3 text-sm font-semibold">{r.type} · {r.location}</p><div className="mt-4 flex flex-wrap gap-2"><Button variant={saved.includes(r.id) ? "quiet" : "support"} onClick={() => setState((s) => ({ ...s, savedResourceIds: saved.includes(r.id) ? saved.filter((id) => id !== r.id) : [...saved, r.id] }))}>{saved.includes(r.id) ? "Saved" : "Save Resource"}</Button><Button variant="quiet" onClick={() => setResourceDetail(resourceDetail === r.id ? null : r.id)}>View Details</Button></div>{resourceDetail === r.id ? <p className="mt-4 border-t border-border pt-4 text-base">This fictional listing shows where eligibility, hours, contact information, and accessibility details could appear.</p> : null}</Card>)}</div></section> : null}

    {tab === "Local Support" ? <section className="space-y-5"><SectionTitle title="Local support" subtitle="Explore fictional examples near you." /><Card className="space-y-4"><Field label="ZIP code"><Input inputMode="numeric" maxLength={5} value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))} placeholder="48201" /></Field><Button disabled={zip.length !== 5} onClick={() => setState((s) => ({ ...s, localSupportZip: zip }))}>View local examples</Button></Card>{state.localSupportZip ? <><div className="flex flex-wrap gap-2" aria-label="Filter local support">{FILTERS.map((f) => <Chip key={f} selected={filters.includes(f)} onClick={() => setFilters((v) => v.includes(f) ? v.filter((x) => x !== f) : [...v, f])}>{f}</Chip>)}</div><p className="text-sm text-muted-foreground">Fictional demonstration results near {state.localSupportZip}.</p><div className="grid gap-4 sm:grid-cols-2">{filteredLocal.map((item) => <Card key={item.id}><Tag tone="warm">Demonstration content</Tag><h2 className="mt-3 font-display text-xl">{item.name}</h2><p className="mt-1 text-base text-muted-foreground">{item.kind}</p><div className="mt-3 flex flex-wrap gap-2">{item.tags.map((tag) => <Tag key={tag} tone="sage">{tag}</Tag>)}</div></Card>)}</div>{filteredLocal.length === 0 ? <p className="text-base text-muted-foreground">No fictional examples match every selected filter.</p> : null}</> : null}</section> : null}
  </div>;
}