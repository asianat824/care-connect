import type { AppState } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 10);

export const today = () => new Date().toISOString().slice(0, 10);

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
          "Being asked, not told",
          "Sunday service on the radio",
          "Her garden by the back door",
        ],
        routines: [
          "Wakes around 6:30 and likes the blinds opened slowly",
          "Gospel music with breakfast",
          "Rests between 1:00 and 3:00",
        ],
        likes: ["Gospel music in the morning", "Sweet tea", "Photos of the grandkids"],
        dislikes: ["Loud television", "Being rushed", "Cold rooms"],
        communication: [
          "Prefers to receive one instruction at a time",
          "Becomes anxious when plans change without warning",
          "Repeat gently rather than louder",
        ],
        comfort: ["Blue quilt on her chair", "Lamp light, not overhead", "Hand on her shoulder first"],
        updates: [
          { id: "u1", date: today(), text: "Slept well two nights in a row. Appetite is better." },
        ],
        coordination: [
          "Prefers appointments after 11:00 a.m.",
          "Marcus drives on Tuesdays",
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
