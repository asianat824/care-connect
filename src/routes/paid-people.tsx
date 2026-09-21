import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/paid-people")({
  beforeLoad: () => {
    throw redirect({ to: "/care-team", search: { tab: "People I Support" } });
  },
});
