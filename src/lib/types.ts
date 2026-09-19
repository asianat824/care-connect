export type Capacity =
  | "I have capacity"
  | "I am feeling stretched"
  | "I am overwhelmed"
  | "I need support now";

export interface CheckIn {
  id: string;
  date: string;
  mood: string;
  energy: number;
  capacity: Capacity;
  forMyself: string;
  needToday: string;
  outsideCapacity: string;
  notes: string;
  shared: boolean;
}

export interface Person {
  id: string;
  name: string;
  preferredName: string;
  relationship: string;
  pronouns: string;
  photo?: string;
  whatMatters: string[];
  routines: string[];
  likes: string[];
  dislikes: string[];
  communication: string[];
  comfort: string[];
  updates: { id: string; date: string; text: string }[];
  coordination: string[];
  voiceInvited: boolean;
  voiceEntries: { id: string; date: string; label: string; text: string }[];
}

export type Permission =
  | "View basic care information"
  | "View important updates"
  | "Receive requests for help"
  | "Add care updates"
  | "Contribute to Care Moments";

export interface Member {
  id: string;
  name: string;
  role: string;
  contact: string;
  availability: string;
  helpsWith: string;
  permissions: Permission[];
}

export interface HelpRequest {
  id: string;
  type: string;
  detail: string;
  by: string;
  instructions: string;
  visibleTo: string[];
  status: "open" | "accepted" | "complete";
  acceptedBy?: string;
}

export interface Offer {
  id: string;
  from: string;
  text: string;
}

export interface CareUpdate {
  id: string;
  from: string;
  date: string;
  text: string;
}

export interface Handoff {
  id: string;
  personId: string;
  date: string;
  recent: string;
  attention: string;
  preferences: string;
  next: string;
  responsible: string;
}

export interface Moment {
  id: string;
  personId: string;
  kind: "Memory" | "Song" | "Photo" | "Story" | "Activity" | "Prompt answer";
  title: string;
  body: string;
  author: string;
  fromPerson?: boolean;
  date: string;
}

export interface AppState {
  onboarded: boolean;
  caregiverName: string;
  priorities: string[];
  people: Person[];
  members: Member[];
  checkIns: CheckIn[];
  requests: HelpRequest[];
  offers: Offer[];
  updates: CareUpdate[];
  handoffs: Handoff[];
  moments: Moment[];
}
