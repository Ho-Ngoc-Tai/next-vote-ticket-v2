export const TICKET_STATUS = {
  NEW: "NEW",
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const TICKET_STATUS_CONFIG: Record<TicketStatus, { label: string; dotColor: string; borderColor: string }> = {
  [TICKET_STATUS.NEW]: {
    label: "New",
    dotColor: "bg-cyan-400",
    borderColor: "border-cyan-500/50",
  },
  [TICKET_STATUS.OPEN]: {
    label: "Open",
    dotColor: "bg-yellow-400",
    borderColor: "border-yellow-500/50",
  },
  [TICKET_STATUS.IN_PROGRESS]: {
    label: "In Progress",
    dotColor: "bg-purple-400",
    borderColor: "border-purple-500/50",
  },
  [TICKET_STATUS.RESOLVED]: {
    label: "Resolved",
    dotColor: "bg-green-400",
    borderColor: "border-green-500/50",
  },
  [TICKET_STATUS.CLOSED]: {
    label: "Closed",
    dotColor: "bg-gray-400",
    borderColor: "border-gray-500/50",
  },
};

export const TICKET_TEAM = {
  SALES_TEAM: "SALES_TEAM",
  DEV_TEAM: "DEV_TEAM",
  SUPPORT_TEAM: "SUPPORT_TEAM",
} as const;

export type TicketTeam = (typeof TICKET_TEAM)[keyof typeof TICKET_TEAM];

export const TICKET_TEAM_COLOR: Record<TicketTeam, string> = {
  [TICKET_TEAM.SALES_TEAM]: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  [TICKET_TEAM.DEV_TEAM]: "bg-cyan-100 text-cyan-800 border-cyan-500/50 hover:bg-cyan-200",
  [TICKET_TEAM.SUPPORT_TEAM]: "bg-green-100 text-green-800 hover:bg-green-200",
};

export const TICKET_TYPES = {
  ALL: "ALL",
  NEW: "NEW",
  OPEN: "OPEN",
  IN_PROGRESS: "PENDING",
  AWAITING_REPLY: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export type TicketTypes = (typeof TICKET_TYPES)[keyof typeof TICKET_TYPES];

export const TICKET_CATEGORIES = [
  { value: "Technical", label: "Technical" },
  { value: "Billing", label: "Billing" },
  { value: "Account", label: "Account" },
  { value: "Feature", label: "Feature Request" },
  { value: "Bug", label: "Bug Report" },
  { value: "Other", label: "Other" },
] as const;
