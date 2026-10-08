"use client";

import AttachmentItem from "@components/ui/attachment-item";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { renderMedia } from "@commons/utils/renderMedia";
import { LOADING_STATUS } from "@constants/status";
import { formatTimeAgoShort, stripHtmlToPlainText } from "@features/ticket/helper";
import { Comment } from "@interfaces/tickets/index";
import { useAppDispatch, useAppSelector } from "@stores/index";
import { commentRepliesSelector, getCommentRepliesAction } from "@stores/reducers/comments";
import { useState } from "react";
import CommentInput from "./Input";

interface CommentItemProps {
  comment: Comment;
  depth?: number;
}

export default function CommentItem({ comment, depth = 0 }: CommentItemProps) {
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);
  const [shouldFocusReply, setShouldFocusReply] = useState(false);
  const repliesState = useAppSelector(commentRepliesSelector(comment.id));

  const avatarInitial = (comment.author?.name?.charAt(0) ?? "U").toUpperCase();
  const avatarSrc = renderMedia(comment?.author?.avatar);

  const replyCount = Number(comment.replyCount ?? 0);
  const loadedReplyCount = repliesState?.items?.length ?? 0;
  const displayReplyCount = replyCount > 0 ? replyCount : loadedReplyCount;
  const hasReplies = displayReplyCount > 0;

  const handleToggleReplies = () => {
    const next = !expanded;
    setExpanded(next);
    setShouldFocusReply(false);

    if (next && depth === 0) {
      const notLoadedYet = !repliesState || repliesState.items.length === 0;
      if (notLoadedYet && repliesState?.status !== LOADING_STATUS.LOADING) {
        dispatch(getCommentRepliesAction({ commentId: comment.id, page: 1, limit: 10 }));
      }
    }
  };

  const handleReply = () => {
    setExpanded(true);
    setShouldFocusReply(true);
    if (depth === 0) {
      const notLoadedYet = !repliesState || repliesState.items.length === 0;
      if (notLoadedYet && repliesState?.status !== LOADING_STATUS.LOADING) {
        dispatch(getCommentRepliesAction({ commentId: comment.id, page: 1, limit: 10 }));
      }
    }
  };

  const contentText = stripHtmlToPlainText(comment.content);

  return (
    <div>
      <div className={`relative ${depth === 0 ? "overflow-hidden" : ""} pb-2`}>
        {(hasReplies || expanded) && (
          <div
            className={`absolute left-4 z-2 ${expanded ? "top-[42px]" : "top-[45px]"} bottom-4 ${depth > 0 ? "h-[60%]" : "h-full"} border-l-2 border-gray-200 dark:border-gray-900`}
          />
        )}
        {/* Flex row: avatar left, comment body right */}
        <div className="flex flex-row gap-2 relative">
          {depth > 0 && (
            <div
              style={{ height: 12, left: -28, top: 10, width: 20 }}
              className="absolute z-1 border-b-2 border-l-2 rounded-bl-lg border-gray-200 dark:border-gray-900"
            />
          )}
          {/* Avatar: 40x40, rounded-full */}
          <Avatar className="h-9 w-9 shrink-0 rounded-full">
            <AvatarImage src={avatarSrc} alt={comment?.author?.name} />
            <AvatarFallback
              className={`
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
              }`}
            >
              {avatarInitial}
            </AvatarFallback>
          </Avatar>

          {/* Comment body */}
          <div className="flex-1 min-w-0">
            {/* Comment bubble: theme-aware, rounded-2xl, px-3 py-2, fit-content */}
            <div className="inline-block w-fit max-w-full rounded-2xl bg-muted/80 px-3 py-2 dark:bg-muted/20">
              <span className="block text-sm font-semibold text-foreground">{comment.author?.name}</span>
              <p className="text-sm leading-snug whitespace-pre-wrap break-words text-foreground">
                {contentText || "—"}
              </p>
            </div>

            {comment.attachments?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {comment.attachments.map((attachment: string, index: number) => (
                  <AttachmentItem key={index} attachment={attachment} index={index} />
                ))}
              </div>
            )}

            {/* Footer row: "13h · Thích · Trả lời" + right side reaction */}
            <div className="flex items-center mt-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>{formatTimeAgoShort(comment.createdAt)}</span>
              {!comment?.parentId && (
                <button
                  type="button"
                  onClick={handleReply}
                  className="hover:underline hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Reply
                </button>
              )}
            </div>

            {expanded && depth === 0 && (
              <div className="mt-3 space-y-1">
                {repliesState?.status === LOADING_STATUS.LOADING &&
                  (!repliesState.items || repliesState.items.length === 0) && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">Đang tải...</div>
                  )}

                {repliesState?.status === LOADING_STATUS.ERROR && (
                  <div className="text-xs text-red-500 dark:text-red-400">Không tải được phản hồi</div>
                )}

                {repliesState?.items?.map((reply: Comment) => (
                  <div key={reply.id}>
                    <CommentItem comment={reply} depth={depth + 1} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {hasReplies && depth === 0 && (
        <div className="relative pl-12">
          <div className="absolute left-4 h-[60%] top-0 w-4 border-b-2 border-l-2 rounded-bl-lg border-gray-200 dark:border-gray-900" />
          {hasReplies && (
            <button
              type="button"
              onClick={handleToggleReplies}
              disabled={repliesState?.status === LOADING_STATUS.LOADING}
              className="mt-2 text-xs font-semibold text-gray-500 hover:underline dark:text-gray-400 dark:hover:text-gray-200"
            >
              {expanded ? "Ẩn phản hồi" : `Xem tất cả ${displayReplyCount} phản hồi`}
            </button>
          )}
        </div>
      )}
      {expanded && (
        <div className={`relative pl-12 ${depth > 0 ? "overflow-hidden" : ""}`}>
          <div
            className={`absolute left-4 ${depth === 0 ? "h-[120%] -top-[60%]" : "h-[50%] top-0"} w-4 border-b-2 border-l-2 rounded-bl-lg border-gray-200 dark:border-gray-900`}
          />
          <CommentInput
            ticketId={comment?.ticketId}
            parentId={comment?.id}
            replyToUserName={comment?.author?.name}
            autoFocus={shouldFocusReply}
          />
        </div>
      )}
    </div>
  );
}
