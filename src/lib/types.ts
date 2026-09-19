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

export type DetailSource =
  | "Direct guest response"
  | "Completed together"
  | "Recorded conversation"
  | "Caregiver observation"
  | "Care Circle member"
  | "Needs confirmation";

export type DetailStatus = "Current" | "Temporary" | "Unsure" | "No longer current";

export interface Detail {
  id: string;
  text: string;
  source: DetailSource;
  sourceName?: string;
  status: DetailStatus;
  dateAdded: string;
  lastConfirmed: string;
  confirmedBy: string;
  reviewDate?: string;
  archived?: boolean;
  history?: { date: string; text: string }[];
}

export type DetailKey =
  | "whatMatters"
  | "communication"
  | "comfort"
  | "routines"
  | "preferences"
  | "coordination";

export interface Person {
  id: string;
  name: string;
  preferredName: string;
  relationship: string;
  pronouns: string;
  photo?: string;
  whatMatters: Detail[];
  routines: Detail[];
  preferences: Detail[];
  communication: Detail[];
  comfort: Detail[];
  updates: { id: string; date: string; text: string }[];
  coordination: Detail[];
  voiceInvited: boolean;
  voiceRequest?: {
    method: "Text message" | "Email" | "Copy private link";
    recipient: string;
    status: "waiting" | "submitted" | "declined";
    sentAt: string;
  };
  voiceEntries: {
    id: string;
    date: string;
    label: string;
    text: string;
    source?: "Direct guest response" | "Completed together";
  }[];
  summaryDetailIds?: string[];
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

export type RequestStatus =
  | "Draft"
  | "Sent"
  | "Accepted"
  | "Declined"
  | "No response"
  | "Completed"
  | "Cancelled";

export interface HelpRequest {
  id: string;
  type: string;
  detail: string;
  by: string;
  instructions: string;
  visibleTo: string[];
  status: RequestStatus;
  acceptedBy?: string;
  declinedBy?: string[];
  sentAt?: string;
  personId?: string;
  taskId?: string;
  questions?: { id: string; from: string; text: string }[];
}

export type TaskKind = "Caregiving" | "Personal";

export type CapacityBucket =
  | "Not sorted yet"
  | "I can handle this"
  | "I may need help"
  | "This is outside my capacity";

export interface Task {
  id: string;
  title: string;
  kind: TaskKind;
  personId?: string;
  due?: string;
  notes?: string;
  bucket: CapacityBucket;
  done: boolean;
  createdAt: string;
}

export interface Priority {
  id: string;
  personId: string;
  text: string;
  taskId?: string;
  reviewDate?: string;
  done: boolean;
  createdAt: string;
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
  networkQuestions?: { id: string; date: string; text: string }[];
  savedResourceIds?: string[];
  localSupportZip?: string;
}
