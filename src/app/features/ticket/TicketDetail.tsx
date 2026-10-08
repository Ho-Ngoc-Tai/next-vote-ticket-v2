"use client";

import TipTapEditor from "@components/modules/TipTapEditor";
import AttachmentItem from "@components/ui/attachment-item";
import { Button } from "@components/ui/button";
import { Spinner } from "@components/ui/spinner";
import { LOADING_STATUS } from "@constants/status";
import { TICKET_STATUS_CONFIG, TicketStatus } from "@constants/ticket";
import { useAppDispatch, useAppSelector } from "@stores/index";
import { userInfoSelector } from "@stores/reducers/auth";
import { commentsSelector } from "@stores/reducers/comments";
import { getTicketDetailAction, ticketDetailSelector } from "@stores/reducers/tickets";
import { MessageSquare, Pencil, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import CommentList from "./components/Comment/List";
import { Tag } from "./components/TicketList/Tag";
import { formatTimeAgo, getTeamColor } from "./helper";

const getStatusConfig = (status: string) =>
  TICKET_STATUS_CONFIG[status as TicketStatus] ?? {
    label: status,
    dotColor: "bg-gray-400",
    borderColor: "border-gray-500/50",
  };

export default function TicketDetail({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const { data: userInfo } = useAppSelector(userInfoSelector);

  const { data, params, status, error } = useAppSelector(ticketDetailSelector);
  const commentInputRef = useRef<HTMLDivElement>(null);
  const comments = useAppSelector(commentsSelector);
  const statusConfig = getStatusConfig(data?.status ?? "");

  const isOwner = data?.customer?.userId === userInfo?.id;

  const tags = [
    data?.status && {
      label: statusConfig.label,
      className: "bg-muted/80 text-muted-foreground",
    },
    data?.assignedTeam && {
      label: data?.assignedTeam.replace(/_/g, " "),
      className: getTeamColor(data?.assignedTeam),
    },
    data?.code && { label: data?.code, className: "bg-muted text-muted-foreground" },
    data?.categoryTitle && { label: data?.categoryTitle, className: "bg-muted text-muted-foreground" },
    ...(data?.hashtags ?? []).map((h) => ({
      label: h.startsWith("#") ? h : `#${h}`,
      className: "bg-muted text-muted-foreground",
    })),
  ].filter(Boolean) as { label: string; className: string }[];

  useEffect(() => {
    if (!id || id === "undefined") {
      return;
    }
    if (params?.id === id && (status === LOADING_STATUS.LOADING || status === LOADING_STATUS.SUCCESS)) {
      return;
    }
    dispatch(getTicketDetailAction({ id }));
  }, [id, params?.id, status]);

  const renderEmpty = () => {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No data</p>
      </div>
    );
  };

  const renderError = () => {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load ticket detail</p>
        <div className="mt-4">
          <Button onClick={() => dispatch(getTicketDetailAction({ id }))}>Retry</Button>
        </div>
        {error ? (
          <pre className="mt-4 text-left text-xs opacity-70 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
        ) : null}
      </div>
    );
  };

  const renderLoading = () => {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  };

  const renderTicketDetail = () => {
    return (
      <>
        <div className="mx-auto">
          <div className="">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ticket Header */}
              <div className="flex justify-between border-b border-border pb-4">
                <div className="flex flex-col justify-start gap-3">
                  <h1 className="text-2xl font-semibold text-foreground dark:text-white">
                    {data?.subject || "No Subject"}
                  </h1>
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                      Asked <span className="text-primary">{formatTimeAgo(data?.createdAt ?? "")}</span>
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                      Modified <span className="text-primary">{formatTimeAgo(data?.updatedAt ?? "")}</span>
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                      Views <span className="text-primary">{0} times</span>
                    </span>
                  </div>
                </div>
                {isOwner ? (
                  <div className="flex sm:items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/tickets/${id}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-900/50 text-red-400 dark:text-red-400 hover:bg-red-900/20 border dark:border-red-900/50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Close Ticket
                    </Button>
                  </div>
                ) : null}
              </div>

              {/* <div className="flex items-center gap-4 text-sm">
                <span>{data?.customer?.name ?? "Unknown"} reported</span>
                <span>•</span>
                <span>
                  {new Date(data?.createdAt ?? "").toLocaleDateString()} • ID: TK-{data?.id}
                </span>
              </div> */}

              {/* Ticket Description - TipTap content in view-only mode */}
              <div className="text-sm leading-6">
                <TipTapEditor content={data?.description ?? "<p></p>"} isView compact minHeight={80} />
              </div>

              {/* Attachments */}
              {data?.attachments && data?.attachments.length > 0 && (
                <div className="space-y-3">
                  {data?.attachments.map((a: string, i: number) => (
                    <AttachmentItem key={i} attachment={a} index={i} />
                  ))}
                </div>
              )}

              <ul className="flex flex-wrap gap-1.5 " role="list">
                {tags.map((tag) => (
                  <li key={tag.label}>
                    <Tag className={tag.className}>{tag.label}</Tag>
                  </li>
                ))}
              </ul>

              {/* Comments Section */}
              <div ref={commentInputRef}>
                <h3 className="text-lg font-medium text-foreground dark:text-white my-6">
                  <MessageSquare className="inline-block mr-2" />
                  Answers ({comments?.total || 0})
                </h3>
                <CommentList ticketId={id} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderContent = () => {
    if (status === LOADING_STATUS.LOADING) {
      return renderLoading();
    }
    if (status === LOADING_STATUS.ERROR) {
      return renderError();
    }
    if (!data) {
      return renderEmpty();
    }
    return renderTicketDetail();
  };

  return <div className="w-full h-full space-y-6">{renderContent()}</div>;
}
