import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, Field, Textarea } from "@/components/ui";
import { today, uid } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import type { DetailKey } from "@/lib/types";

export const Route = createFileRoute("/voice-guest/$personId")({
  head: () => ({ meta: [
    { title: "Share Your Voice — [PROJECT NAME]" },
    { name: "description", content: "A private, limited invitation to share what helps you feel comfortable, respected, and understood." },
    { property: "og:title", content: "Your voice matters here — [PROJECT NAME]" },
    { property: "og:description", content: "A private response shared only with the caregiver who invited you." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: GuestVoicePage,
});

const QUESTIONS: { label: string; key: DetailKey }[] = [
  { label: "What matters to you right now?", key: "whatMatters" },
  { label: "How do you want people to communicate with you?", key: "communication" },
  { label: "What helps you feel comfortable?", key: "comfort" },
  { label: "Is there something you want your caregivers to remember?", key: "preferences" },
  { label: "Has anything changed recently?", key: "coordination" },
  { label: "Is there something you would enjoy doing together?", key: "preferences" },
];

function GuestVoicePage() {
  const { state, setState } = useStore();
  const { personId } = Route.useParams();
  const person = state.people.find((p) => p.id === personId);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState<"submitted" | "declined" | null>(person?.voiceRequest?.status === "submitted" ? "submitted" : null);
  if (!person) return <main className="mx-auto max-w-2xl px-5 py-16"><Card><h1 className="font-display text-3xl">This invitation is not available</h1><p className="mt-2 text-lg text-muted-foreground">Ask the caregiver who invited you for a new private link.</p></Card></main>;

  const finish = (status: "submitted" | "declined") => {
    setState((s) => ({ ...s, people: s.people.map((p) => {
      if (p.id !== person.id) return p;
      if (status === "declined") return { ...p, voiceRequest: p.voiceRequest ? { ...p.voiceRequest, status } : undefined };
      const completed = QUESTIONS.filter((q) => answers[q.label]?.trim());
      let next = { ...p };
      for (const q of completed) {
        const text = answers[q.label]?.trim() ?? "";
        next = { ...next, [q.key]: [{ id: uid(), text, source: "Direct guest response" as const, status: "Current" as const, dateAdded: today(), lastConfirmed: today(), confirmedBy: person.preferredName || person.name }, ...next[q.key]] };
      }
      return { ...next, voiceInvited: true, voiceRequest: p.voiceRequest ? { ...p.voiceRequest, status } : undefined, voiceEntries: [...completed.map((q) => ({ id: uid(), date: today(), label: q.label, text: answers[q.label]?.trim() ?? "", source: "Direct guest response" as const })), ...p.voiceEntries] };
    }) }));
    setDone(status);
  };

  if (done) return <main className="mx-auto flex min-h-screen max-w-2xl items-center px-5 py-16"><Card className="w-full text-center"><h1 className="font-display text-4xl">{done === "submitted" ? "Thank you for sharing" : "Invitation declined"}</h1><p className="mx-auto mt-3 max-w-lg text-lg text-muted-foreground">{done === "submitted" ? `Your response was sent only to ${state.caregiverName}. You can close this page now.` : `Nothing was shared with ${state.caregiverName}. You can close this page now.`}</p></Card></main>;

  return <main className="mx-auto max-w-2xl px-5 py-10 sm:py-16"><header><p className="text-base font-semibold text-muted-foreground">Private invitation from {state.caregiverName}</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">Your voice matters here</h1><p className="mt-3 text-xl text-muted-foreground">{state.caregiverName} invited you to share what helps you feel comfortable, respected, and understood. You choose what you want to answer.</p></header><Card className="mt-8 border-secondary bg-secondary/15"><p className="text-lg font-semibold">Only {state.caregiverName} will receive your response.</p><p className="mt-1 text-base">This private link does not provide access to {state.caregiverName}’s account, notes, check-ins, or care conversations.</p></Card><div className="mt-8 space-y-5">{QUESTIONS.map((q) => <Field key={q.label} label={q.label} hint="Optional"><Textarea rows={3} className="text-lg" value={answers[q.label] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [q.label]: e.target.value }))} /></Field>)}</div><div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><Button variant="quiet" onClick={() => finish("declined")}>Decline invitation</Button><Button className="px-7 py-4 text-lg" disabled={!Object.values(answers).some((a) => a.trim())} onClick={() => finish("submitted")}>Submit My Response</Button></div></main>;
}