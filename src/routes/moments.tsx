import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/moments")({
  head: () => ({
    meta: [
      { title: "Care Moments — Connected Care" },
      {
        name: "description",
        content: "Care Moments now live inside each person's shared care profile.",
      },
      { property: "og:title", content: "Care Moments — Connected Care" },
      { property: "og:description", content: "Connection is care. Songs, stories, and memories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MomentsRedirect,
});

/** Care Moments moved inside the shared person profile; send people to the right place. */
function MomentsRedirect() {
  const { state, ready } = useStore();
  const navigate = useNavigate();
  const personId = state.people[0]?.id ?? "";

  useEffect(() => {
    if (!ready) return;
    if (state.role === "paid") {
      navigate({
        to: "/care-team",
        search: { tab: "People I Support", person: personId, section: "Care Moments" },
        replace: true,
      });
    } else {
      navigate({
        to: "/care-circle",
        search: { tab: "People I Care For", person: personId, section: "Care Moments" },
        replace: true,
      });
    }
  }, [ready, state.role, personId, navigate]);

  return <p className="text-base text-muted-foreground">Opening Care Moments…</p>;
}
