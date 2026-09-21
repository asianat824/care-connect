import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/people")({
  validateSearch: (search: Record<string, unknown>) => ({
    ...(typeof search["person"] === "string" ? { person: search["person"] } : {}),
    ...(typeof search["detail"] === "string" ? { detail: search["detail"] } : {}),
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/care-circle",
      search: {
        tab: "People I Care For",
        ...(search.person ? { person: search.person } : {}),
        ...(search.detail ? { detail: search.detail } : {}),
      },
    });
  },
});