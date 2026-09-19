import type { AppState, Detail, DetailSource, DetailStatus } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 10);

export const today = () => new Date().toISOString().slice(0, 10);

const addDays = (n: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
};

/** Small helper for readable fictional profile details. */
function d(
  id: string,
  text: string,
  source: DetailSource,
  status: DetailStatus,
  addedDaysAgo: number,
  sourceName?: string,
  reviewDate?: string,
): Detail {
  return {
    id,
    text,
    source,
    status,
    dateAdded: addDays(-addedDaysAgo),
    lastConfirmed: addDays(-addedDaysAgo),
    confirmedBy: "Jordan",
    ...(sourceName ? { sourceName } : {}),
    ...(reviewDate ? { reviewDate } : {}),
  };
}

export const PRIORITIES = [
  "Keeping important information together",
  "Understanding my own needs",
  "Sharing responsibilities",
  "Communicating with other caregivers",
  "Staying connected to the person I care for",
];

export const CONNECTION_PROMPTS = [
  "What song reminds you of a happy memory together?",
  "What is something they taught you?",
  "What always makes them laugh?",
  "What activity helps both of you feel present?",
];

export const SUPPORT_TYPES = [
  "Groceries or errands",
  "A ride to an appointment",
  "Sitting with them for a few hours",
  "A meal",
  "Household help",
  "Someone to talk to",
];

export const COMMUNITY_TOPICS = [
  {
    id: "c1",
    title: "Caring for a parent who doesn't want help",
    replies: 24,
    snippet: "She says she's fine. I know she isn't. How do you hold both?",
  },
  {
    id: "c2",
    title: "Finding an hour that belongs to me",
    replies: 41,
    snippet: "Small things that gave people their mornings back.",
  },
  {
    id: "c3",
    title: "Talking to siblings about sharing the load",
    replies: 17,
    snippet: "Scripts and openings that didn't turn into an argument.",
  },
];

export const LOCAL_RESOURCES = [
  { id: "r1", name: "Riverside Adult Day Program", note: "Weekday respite, sliding scale" },
  { id: "r2", name: "Meals on Wheels — East Side", note: "Hot lunch delivery, no cost" },
  { id: "r3", name: "Family Caregiver Support Line", note: "Free counseling, evenings" },
];

export function seedState(): AppState {
  return {
    onboarded: false,
    caregiverName: "Jordan",
    priorities: [],
    people: [
      {
        id: "p1",
        name: "Ruth Ellis",
        preferredName: "Mama Ruth",
        relationship: "My mother",
        pronouns: "she/her",
        whatMatters: [
          d("d1", "Being asked, not told.", "They told me", "Current", 40),
          d("d2", "Sunday service on the radio matters to her week.", "They told me", "Current", 60),
          d("d3", "Her garden by the back door is hers to tend.", "I noticed", "Current", 25),
        ],
        communication: [
          d("d4", "Prefers one question at a time.", "They told me", "Current", 35),
          d("d5", "Becomes anxious when plans change without warning.", "I noticed", "Current", 20),
          d("d6", "Repeat gently rather than louder.", "Someone else shared this", "Current", 15, "Alicia Boateng"),
        ],
        comfort: [
          d("d7", "Gospel music helps her relax in the morning.", "They told me", "Current", 50),
          d("d8", "Lamp light, not overhead.", "I noticed", "Current", 30),
          d("d9", "A hand on her shoulder before you begin.", "They told me", "Temporary", 10),
        ],
        routines: [
          d("d10", "Prefers appointments after 11:00 a.m.", "They told me", "Current", 92, undefined, today()),
          d("d11", "Wakes around 6:30 and likes the blinds opened slowly.", "I noticed", "Current", 45),
          d("d12", "Rests between 1:00 and 3:00.", "They told me", "Current", 28),
        ],
        preferences: [
          d("d13", "Likes to know about changes in advance.", "They told me", "Current", 33),
          d("d14", "Sweet tea, no ice, in the afternoon.", "I noticed", "Current", 18),
          d("d15", "Loud television is too much for her right now.", "I should confirm", "Unsure", 12, undefined, addDays(4)),
        ],
        updates: [
          { id: "u1", date: today(), text: "Slept well two nights in a row. Appetite is better." },
        ],
        coordination: [
          d("d16", "Marcus drives on Tuesdays.", "Someone else shared this", "Current", 22, "Marcus Ellis"),
          d("d17", "A new evening medication was mentioned at her last visit.", "Someone else shared this", "Temporary", 95, "Marcus Ellis", addDays(-2)),
        ],
        voiceInvited: true,
        voiceEntries: [
          {
            id: "v1",
            date: today(),
            label: "How I'm feeling today",
            text: "Tired but glad. The music helped this morning.",
          },
        ],
      },
    ],
    members: [
      {
        id: "m1",
        name: "Marcus Ellis",
        role: "Brother",
        contact: "marcus@example.com",
        availability: "Tuesdays and weekends",
        helpsWith: "Driving, appointments",
        permissions: [
          "View basic care information",
          "View important updates",
          "Receive requests for help",
        ],
      },
      {
        id: "m2",
        name: "Denise Park",
        role: "Neighbor",
        contact: "(555) 014-2290",
        availability: "Weekday mornings",
        helpsWith: "Groceries, checking in",
        permissions: ["View basic care information", "Receive requests for help"],
      },
      {
        id: "m3",
        name: "Alicia Boateng",
        role: "Paid caregiver",
        contact: "alicia@example.com",
        availability: "Mon–Thu, 9am–2pm",
        helpsWith: "Daily care, meals",
        permissions: [
          "View basic care information",
          "View important updates",
          "Add care updates",
          "Contribute to Care Moments",
        ],
      },
    ],
    checkIns: [
      {
        id: "ci1",
        date: today(),
        mood: "Steady",
        energy: 3,
        capacity: "I am feeling stretched",
        forMyself: "Drank a coffee while it was still hot.",
        needToday: "An hour without being needed.",
        outsideCapacity: "",
        notes: "",
        shared: false,
      },
    ],
    requests: [
      {
        id: "q1",
        type: "Groceries or errands",
        detail: "I need someone to pick up groceries by Thursday.",
        by: "Thursday",
        instructions: "List is on the fridge. Her brand of tea matters to her.",
        visibleTo: ["m1", "m2"],
        status: "open",
      },
    ],
    offers: [
      { id: "o1", from: "Denise Park", text: "I can sit with her Friday afternoon if that helps." },
    ],
    updates: [
      {
        id: "cu1",
        from: "Alicia Boateng",
        date: today(),
        text: "Good morning today. She ate all of breakfast and asked about the garden.",
      },
    ],
    handoffs: [],
    moments: [
      {
        id: "mo1",
        personId: "p1",
        kind: "Song",
        title: "His Eye Is on the Sparrow",
        body: "She hums it while she waters the plants. Added to our shared playlist.",
        author: "Jordan",
        date: today(),
      },
      {
        id: "mo2",
        personId: "p1",
        kind: "Memory",
        title: "The peach tree summer",
        body: "We picked more than we could carry and she made everyone take a bag home.",
        author: "Mama Ruth",
        fromPerson: true,
        date: today(),
      },
      {
        id: "mo3",
        personId: "p1",
        kind: "Photo",
        title: "Garden tomatoes",
        body: "A sunny afternoon beside the garden she has tended for years.",
        author: "Jordan",
        date: today(),
      },
      {
        id: "mo4",
        personId: "p1",
        kind: "Story",
        title: "The Sunday hat story",
        body: "She told us how she saved for her favorite blue hat and wore it every Sunday that spring.",
        author: "Jordan",
        date: today(),
      },
      {
        id: "mo5",
        personId: "p1",
        kind: "Activity",
        title: "Watering the herbs",
        body: "A quiet ten minutes together after breakfast.",
        author: "Jordan",
        date: today(),
      },
    ],
  };
}
