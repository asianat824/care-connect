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

export type MemberCategory = "Care Circle" | "Care Team";

export interface Member {
  id: string;
  name: string;
  role: string;
  contact: string;
  availability: string;
  helpsWith: string;
  permissions: Permission[];
  /** Personal/unpaid support or formal/professional care. Optional for older saved prototypes. */
  category?: MemberCategory;
}

export type RequestStatus =
  | "Draft"
  | "Sent"
  | "Assigned"
  | "Needs clarification"
  | "Unfilled"
  | "Accepted"
  | "Declined"
  | "No response"
  | "Completed"
  | "Cancelled";

export type RecipientResponseStatus =
  | "Pending"
  | "Accepted"
  | "Declined"
  | "Question received"
  | "No response"
  | "Covered by another person";

export interface RecipientResponse {
  memberId: string;
  name: string;
  role: string;
  status: RecipientResponseStatus;
  /** Plain-language note, e.g. "Accepted today at 3:18 PM" or "Awaiting response". */
  note?: string;
  question?: string;
  reply?: string;
}

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
  responses?: RecipientResponse[];
  /** When true, more than one person may accept. */
  allowMultiple?: boolean;
}

export type TaskKind = "Caregiving" | "Personal";

export type TaskStatus = "To do" | "In progress" | "Delegated" | "Complete";

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
  status?: TaskStatus;
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
  /** Who added the priority, e.g. "Jordan". */
  addedBy?: string;
  /** The role of the person who added it, e.g. "Family caregiver". */
  addedByRole?: string;
  /** Plain-language description of who can see this priority. */
  visibleTo?: string;
  status?: "Active" | "In progress" | "Complete" | "Archived";
  archived?: boolean;
}

export type ConversationEntryType =
  | "Preference"
  | "Routine"
  | "Observation"
  | "Question"
  | "Follow-up"
  | "Possible change to confirm";

export type ConversationStatus =
  | "Open"
  | "Confirmed"
  | "Needs more information"
  | "Ask the person"
  | "No longer current";

export interface ConversationReply {
  id: string;
  author: string;
  authorRole: string;
  text: string;
  createdAt: string;
}

export interface ConversationEntry {
  id: string;
  personId: string;
  type: ConversationEntryType;
  message: string;
  author: string;
  authorRole: string;
  createdAt: string;
  relatedPriorityId?: string;
  visibleTo: string;
  status: ConversationStatus;
  replies: ConversationReply[];
  /** Set once this entry has been added to the person's profile. */
  addedToProfile?: { date: string; by: string };
  /** Set when the entry was created from a handoff note. */
  fromHandoffId?: string;
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
  /** Subject of the update: a person id, or undefined for a general Care Circle update. */
  personId?: string;
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
  authorRole?: string;
  visibleTo?: string;
  fromPerson?: boolean;
  date: string;
}

export type CareRole = "family" | "paid";

export type HandoffUrgency = "Routine" | "Review soon" | "Urgent";

export interface HandoffNote {
  id: string;
  personId: string;
  personName: string;
  from: string;
  fromRole: string;
  submittedAt: string;
  careCompleted: string[];
  noticed: string;
  followUp: string;
  preferenceChange: string;
  preferenceNote: string;
  urgency: HandoffUrgency;
  sharedWith: string;
  reviewed: boolean;
}

export interface WorkTeamRequest {
  id: string;
  type: string;
  neededBy: string;
  personId?: string;
  note: string;
  recipientIds: string[];
  sentAt: string;
}

export interface CareConnectPost {
  id: string;
  community: "Workplace Community" | "Caregiver Community";
  topic: string;
  body: string;
  responses: number;
  author: string;
  date: string;
}

export interface AppState {
  role: CareRole;
  handoffNotes: HandoffNote[];
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
  tasks: Task[];
  carePriorities: Priority[];
  conversations?: ConversationEntry[];
  checkInDraft?: {
    mood: string;
    energy: number;
    capacity: Capacity;
    note: string;
  };
  workTeamRequests?: WorkTeamRequest[];
  careConnectPosts?: CareConnectPost[];
  joinedCareConnectIds?: string[];
  paidCheckIns?: CheckIn[];
  paidCheckInDraft?: {
    mood: string;
    energy: number;
    capacity: Capacity;
    note: string;
  };
}
