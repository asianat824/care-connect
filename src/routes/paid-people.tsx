import { createFileRoute } from "@tanstack/react-router";
import { Avatar, Card, SectionTitle, Tag } from "@/components/ui";
import { useStore } from "@/lib/store";
import { sourceLabel } from "@/lib/details";

export const Route = createFileRoute("/paid-people")({
  head: () => ({
    meta: [
      { title: "People I Support — Connection Is Care" },
      {
        name: "description",
        content: "The care preferences a family caregiver has chosen to share with you.",
      },
      { property: "og:title", content: "People I Support — Connection Is Care" },
      {
        property: "og:description",
        content: "Shared preferences and communication needs for the people you support.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaidPeoplePage,
});

function PaidPeoplePage() {
  const { state } = useStore();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl leading-tight">People I support</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          You see only what the family caregiver has shared — never their private check-ins, private
          notes, or Care Network activity.
        </p>
      </header>

      {state.people.map((person) => {
        const shared = [...person.whatMatters, ...person.communication, ...person.comfort].filter(
          (d) => !d.archived && d.status !== "No longer current",
        );
        return (
          <Card key={person.id}>
            <div className="flex items-center gap-3">
              <Avatar name={person.name} photo={person.photo} />
              <div>
                <p className="font-display text-2xl">{person.preferredName || person.name}</p>
                <p className="text-base text-muted-foreground">{person.pronouns}</p>
              </div>
            </div>
            <div className="mt-5">
              <SectionTitle
                title="What matters and how to communicate"
                subtitle="Preferences, not diagnoses."
              />
              <ul className="space-y-3">
                {shared.map((d) => (
                  <li key={d.id} className="rounded-2xl border border-border p-4">
                    <p className="text-base">{d.text}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Tag>{sourceLabel(d, person, state.caregiverName)}</Tag>
                      <Tag tone="sage">{d.status}</Tag>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
