"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { renderMedia } from "@commons/utils/renderMedia";
import { formatTimeAgo, getStatusConfig, getTeamColor, stripHtmlToPlainText } from "@features/ticket/helper";
import { Ticket } from "@interfaces/tickets";
import { StatsColumn } from "./StatsColumn";
import { Tag } from "./Tag";
export interface TicketItemProps {
  ticket: Ticket;
  showAuthor?: boolean;
  reputation?: number;
  onTicketClick?: (ticket: Ticket) => void;
  className?: string;
}

export function TicketItem({ ticket, showAuthor = true, reputation, onTicketClick, className }: TicketItemProps) {
  const statusConfig = getStatusConfig(ticket.status);

  const hashtagTags = (ticket.hashtags ?? []).map((h) => ({
    label: h.startsWith("#") ? h : `#${h}`,
    className: "bg-muted text-muted-foreground",
  }));

  const tags = [
    ticket.status && {
      label: statusConfig.label,
      className: "bg-muted/80 text-muted-foreground",
    },
    ticket.assignedTeam && {
      label: ticket.assignedTeam.replace(/_/g, " "),
      className: getTeamColor(ticket.assignedTeam),
    },
    ticket.code && { label: ticket.code, className: "bg-muted text-muted-foreground" },
    ticket.categoryTitle && { label: ticket.categoryTitle, className: "bg-muted text-muted-foreground" },
    ...hashtagTags,
  ].filter(Boolean) as { label: string; className: string }[];

  const authorInitials =
    ticket?.author?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const authorAvatarSrc = renderMedia(ticket?.author?.avatar);

  return (
    <article
      className={cn(
        "flex flex-col sm:flex-row gap-3 sm:gap-4 py-4 px-4 sm:px-6 border-b border-border transition-colors hover:bg-muted/50",
        className
      )}
      aria-labelledby={`ticket-title-${ticket.id}`}
    >
      {/* Left: Stats */}
      <aside className="flex sm:flex-col sm:w-20 shrink-0">
        <StatsColumn answers={ticket?.commentCount ?? 0} />
      </aside>

      {/* Center: Title, description, tags */}
      <div className="flex-1 min-w-0">
        <h3 id={`ticket-title-${ticket.id}`} className="mb-1">
          {onTicketClick ? (
            <button
              type="button"
              onClick={() => onTicketClick(ticket)}
              className="text-base font-medium text-primary hover:text-primary/80 hover:underline text-left"
            >
              {ticket.subject}
            </button>
          ) : (
            <span className="text-base font-medium">{ticket.subject}</span>
          )}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {stripHtmlToPlainText(ticket.description || "") || <span className="italic opacity-50">No description</span>}
        </p>
        <div className="flex items-center justify-between gap-2">
          <ul className="flex flex-wrap gap-1.5 " role="list">
            {tags.map((tag) => (
              <li key={tag.label}>
                <Tag className={tag.className}>{tag.label}</Tag>
              </li>
            ))}
          </ul>
          {showAuthor && (
            <div className="flex items-center gap-2 shrink-0 sm:self-start">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
                <AvatarImage src={authorAvatarSrc} alt={ticket?.author?.name} />
                <AvatarFallback className="text-[10px] sm:text-xs">{authorInitials}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <span className="text-xs font-medium text-primary truncate">{ticket?.author?.name || "Unknown"}</span>
                {reputation != null && <span className="text-xs text-foreground tabular-nums">{reputation}</span>}
                <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                  Asked {formatTimeAgo(ticket.createdAt)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
