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
    role: "family",
    workTeamRequests: [],
    careConnectPosts: [],
    joinedCareConnectIds: [],
    paidCheckIns: [],
    paidCheckInDraft: {
      mood: "Steady",
      energy: 3,
      capacity: "I have capacity",
      note: "",
    },
    handoffNotes: [
      {
        id: "h1",
        personId: "p1",
        personName: "Mama Ruth",
        from: "Alicia Boateng",
        fromRole: "paid caregiver",
        submittedAt: "Today at 5:42 PM",
        careCompleted: ["Meals", "Companionship", "Appointment support"],
        noticed: "Ruth seemed more tired than usual.",
        followUp: "Ask whether she wants tomorrow's appointment moved to the afternoon.",
        preferenceChange: "Confirm an existing preference",
        preferenceNote: "Ruth prefers to be asked before plans are changed.",
        urgency: "Review soon",
        sharedWith: "Jordan — Family caregiver",
        reviewed: false,
      },
    ],
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
          d("d1", "Being asked, not told.", "Direct guest response", "Current", 40),
          d("d2", "Sunday service on the radio matters to her week.", "Recorded conversation", "Current", 60),
          d("d3", "Her garden by the back door is hers to tend.", "Caregiver observation", "Current", 25),
        ],
        communication: [
          d("d4", "Prefers one question at a time.", "Completed together", "Current", 35),
          d("d5", "Becomes anxious when plans change without warning.", "Caregiver observation", "Current", 20),
          d("d6", "Repeat gently rather than louder.", "Care Circle member", "Current", 15, "Alicia Boateng"),
        ],
        comfort: [
          d("d7", "Gospel music helps her relax in the morning.", "Recorded conversation", "Current", 50),
          d("d8", "Lamp light, not overhead.", "Caregiver observation", "Current", 30),
          d("d9", "A hand on her shoulder before you begin.", "Completed together", "Temporary", 10),
        ],
        routines: [
          d("d10", "Prefers appointments after 11:00 a.m.", "Direct guest response", "Current", 92, undefined, today()),
          d("d11", "Wakes around 6:30 and likes the blinds opened slowly.", "Caregiver observation", "Current", 45),
          d("d12", "Rests between 1:00 and 3:00.", "Recorded conversation", "Current", 28),
        ],
        preferences: [
          d("d13", "Likes to know about changes in advance.", "Direct guest response", "Current", 33),
          d("d14", "Sweet tea, no ice, in the afternoon.", "Caregiver observation", "Current", 18),
          d("d15", "Loud television is too much for her right now.", "Needs confirmation", "Unsure", 12, undefined, addDays(4)),
        ],
        updates: [
          { id: "u1", date: today(), text: "Slept well two nights in a row. Appetite is better." },
        ],
        coordination: [
          d("d16", "Marcus drives on Tuesdays.", "Care Circle member", "Current", 22, "Marcus Ellis"),
          d("d17", "A new evening medication was mentioned at her last visit.", "Care Circle member", "Temporary", 95, "Marcus Ellis", addDays(-2)),
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
        status: "Sent",
        sentAt: today(),
        personId: "p1",
      },
    ],
    tasks: [
      {
        id: "t1",
        title: "Confirm Thursday's transportation",
        kind: "Caregiving",
        personId: "p1",
        bucket: "I can handle this",
        done: false,
        createdAt: today(),
      },
      {
        id: "t2",
        title: "Schedule my own appointment",
        kind: "Personal",
        bucket: "Not sorted yet",
        done: false,
        createdAt: today(),
      },
      {
        id: "t3",
        title: "Rest for thirty minutes",
        kind: "Personal",
        bucket: "I can handle this",
        done: false,
        createdAt: today(),
      },
    ],
    carePriorities: [
      {
        id: "cp0",
        personId: "p1",
        text: "Preserve Ruth’s evening routine and confirm tomorrow’s appointment time.",
        done: false,
        createdAt: today(),
        addedBy: "Jordan",
        addedByRole: "Family caregiver",
        visibleTo: "Jordan, Alicia Boateng, Marcus Ellis",
        status: "Active",
        reviewDate: addDays(1),
      },
      {
        id: "cp1",
        personId: "p1",
        text: "Transportation to Thursday's appointment",
        taskId: "t1",
        done: false,
        createdAt: today(),
        addedBy: "Jordan",
        addedByRole: "Family caregiver",
        visibleTo: "Jordan, Marcus Ellis",
        status: "Active",
      },
      {
        id: "cp2",
        personId: "p1",
        text: "Confirm whether morning appointments still work",
        reviewDate: addDays(7),
        done: false,
        createdAt: today(),
        addedBy: "Jordan",
        addedByRole: "Family caregiver",
        visibleTo: "Jordan, Alicia Boateng",
        status: "Active",
      },
      {
        id: "cp3",
        personId: "p1",
        text: "Refill request needs follow-up",
        done: false,
        createdAt: today(),
        addedBy: "Jordan",
        addedByRole: "Family caregiver",
        visibleTo: "Jordan",
        status: "Active",
      },
    ],
    conversations: [
      {
        id: "cv1",
        personId: "p1",
        type: "Preference",
        message: "Ruth prefers to be asked before appointment times are changed.",
        author: "Jordan",
        authorRole: "Family caregiver",
        createdAt: "Shared yesterday",
        visibleTo: "Jordan, Alicia Boateng",
        status: "Confirmed",
        replies: [],
      },
      {
        id: "cv2",
        personId: "p1",
        type: "Observation",
        message:
          "She mentioned today that afternoons feel easier because she has more energy after lunch. Should we update her appointment preference?",
        author: "Alicia Boateng",
        authorRole: "Paid caregiver",
        createdAt: "Shared today at 5:42 PM",
        relatedPriorityId: "cp2",
        visibleTo: "Jordan, Alicia Boateng",
        status: "Open",
        replies: [],
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
        personId: "p1",
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
        authorRole: "Family caregiver",
        visibleTo: "Ruth’s care team",
        date: today(),
      },
      {
        id: "mo2",
        personId: "p1",
        kind: "Memory",
        title: "The peach tree summer",
        body: "We picked more than we could carry and she made everyone take a bag home.",
        author: "Mama Ruth",
        authorRole: "Person receiving care",
        visibleTo: "Ruth’s care team",
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
        authorRole: "Family caregiver",
        visibleTo: "Ruth’s care team",
        date: today(),
      },
      {
        id: "mo4",
        personId: "p1",
        kind: "Story",
        title: "The Sunday hat story",
        body: "She told us how she saved for her favorite blue hat and wore it every Sunday that spring.",
        author: "Jordan",
        authorRole: "Family caregiver",
        visibleTo: "Ruth’s care team",
        date: today(),
      },
      {
        id: "mo5",
        personId: "p1",
        kind: "Activity",
        title: "Watering the herbs",
        body: "A quiet ten minutes together after breakfast.",
        author: "Jordan",
        authorRole: "Family caregiver",
        visibleTo: "Ruth’s care team",
        date: today(),
      },
    ],
  };
}
