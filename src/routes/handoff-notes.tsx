import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/handoff-notes")({
  beforeLoad: () => {
    throw redirect({ to: "/care-team", search: { tab: "Handoff Notes" } });
  },
});
