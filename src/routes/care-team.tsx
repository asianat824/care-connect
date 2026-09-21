import { createFileRoute } from "@tanstack/react-router";
import { Avatar, Card, SectionTitle, Tag } from "@/components/ui";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/care-team")({
  head: () => ({
    meta: [
      { title: "Care Team — Connected Care" },
      {
        name: "description",
        content: "The people coordinating care alongside you, and how to reach them.",
      },
      { property: "og:title", content: "Care Team — Connected Care" },
      {
        property: "og:description",
        content: "Who to contact and what each person handles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CareTeamPage,
});

function CareTeamPage() {
  const { state } = useStore();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl leading-tight">Care team</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Who to reach out to during or after your shift.
        </p>
      </header>

      <Card>
        <SectionTitle title="Family contact" />
        <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
          <Avatar name="Jordan Taylor" />
          <div>
            <p className="text-base font-semibold">Jordan</p>
            <p className="text-sm text-muted-foreground">
              Family caregiver · receives your end-of-shift handoffs
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Others supporting this person" />
        <ul className="space-y-3">
          {state.members
            .filter((m) => m.name !== "Alicia Boateng")
            .map((m) => (
              <li key={m.id} className="rounded-2xl border border-border p-4">
                <p className="text-base font-semibold">{m.name}</p>
                <p className="text-sm text-muted-foreground">{m.role}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Tag tone="sage">{m.helpsWith}</Tag>
                  <Tag>{m.availability}</Tag>
                </div>
              </li>
            ))}
        </ul>
      </Card>
    </div>
  );
}
