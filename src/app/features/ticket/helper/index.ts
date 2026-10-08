import { TICKET_STATUS_CONFIG, TICKET_TEAM_COLOR, TicketStatus, TicketTeam } from "@constants/ticket";

/** Strip HTML tags to get plain text (safe for list previews) */
export const stripHtmlToPlainText = (html: string): string => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const getTeamColor = (team: string) =>
  TICKET_TEAM_COLOR[team as TicketTeam] ?? "bg-muted text-muted-foreground hover:bg-muted/80";

export const getStatusConfig = (status: string) =>
  TICKET_STATUS_CONFIG[status as TicketStatus] ?? {
    label: status,
  };

export const formatTimeAgo = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${past.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
};

/** Facebook-style short format: 13h, 2d, 1w */
export const formatTimeAgoShort = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  if (diffWeeks < 52) return `${diffWeeks}w`;
  return past.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};
