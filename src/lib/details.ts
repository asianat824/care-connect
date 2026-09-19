import type { Detail, DetailKey, DetailSource, DetailStatus, Person } from "./types";
import { today, uid } from "./demo-data";

export const SOURCES: DetailSource[] = [
  "Recorded conversation",
  "Caregiver observation",
  "Care Circle member",
  "Needs confirmation",
];

export const STATUSES: DetailStatus[] = ["Current", "Temporary", "Unsure", "No longer current"];

export const REVIEW_CHOICES = [
  "In one week",
  "In one month",
  "In three months",
  "In six months",
  "Custom date",
  "No reminder",
] as const;

export type ReviewChoice = (typeof REVIEW_CHOICES)[number];

export const CHECK_BACK_EXPLANATION =
  "People's needs and preferences can change. Set a time to check whether this is still true.";

export const SECTION_LABELS: Record<DetailKey, string> = {
  whatMatters: "What Matters to Them",
  communication: "Communication Style",
  comfort: "Comfort and Support",
  routines: "Routines",
  preferences: "Preferences",
  coordination: "Care Coordination",
};

export function addDays(days: number, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function reviewDateFor(choice: ReviewChoice, custom: string): string | undefined {
  switch (choice) {
    case "In one week":
      return addDays(7);
    case "In one month":
      return addDays(30);
    case "In three months":
      return addDays(90);
    case "In six months":
      return addDays(180);
    case "Custom date":
      return custom || undefined;
    default:
      return undefined;
  }
}

export function sourceLabel(detail: Detail, person: Person, caregiverName: string): string {
  const who = person.preferredName || person.name.split(" ")[0] || person.name;
  switch (detail.source) {
    case "Direct guest response":
      return `Shared directly by ${who}`;
    case "Completed together":
      return `Added together with ${who}`;
    case "Recorded conversation":
      return `Recorded by ${caregiverName} from a conversation with ${who}`;
    case "Caregiver observation":
      return `Observed by ${caregiverName}`;
    case "Care Circle member":
      return detail.sourceName
        ? `Shared by ${detail.sourceName}, a Care Circle member`
        : "Shared by another Care Circle member";
    default:
      return "Needs confirmation";
  }
}

export function makeDetail(partial: Partial<Detail> & { text: string; confirmedBy: string }): Detail {
  return {
    id: uid(),
    source: "Recorded conversation",
    status: "Current",
    dateAdded: today(),
    lastConfirmed: today(),
    ...partial,
  };
}

/** Details at or approaching their review date (within the next 7 days). */
export function dueForReview(detail: Detail): boolean {
  if (detail.archived || !detail.reviewDate) return false;
  return detail.reviewDate <= addDays(7);
}

export function monthsSince(date: string): number {
  const then = new Date(date).getTime();
  const days = (Date.now() - then) / 86400000;
  return Math.max(0, Math.round(days / 30));
}

export function lastConfirmedPhrase(detail: Detail): string {
  const m = monthsSince(detail.lastConfirmed);
  if (m === 0) return "Confirmed this month";
  if (m === 1) return "Last confirmed a month ago";
  return `Last confirmed ${m} months ago`;
}
