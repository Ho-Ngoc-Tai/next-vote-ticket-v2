import { Skeleton } from "@components/ui/skeleton";
import { LOADING_STATUS } from "@constants/status";
import { Comment } from "@interfaces/tickets/index";
import { useAppDispatch, useAppSelector } from "@stores/index";
import { commentsSelector, getCommentsAction, resetCommentsState } from "@stores/reducers/comments";
import { useEffect, useMemo, useRef } from "react";
import CommentInput from "./Input";
import CommentItem from "./Item";

interface CommentListProps {
  ticketId: string;
}

export default function CommentList({ ticketId }: CommentListProps) {
  const dispatch = useAppDispatch();
  const comments = useAppSelector(commentsSelector);
  const loadedTicketId = useRef<string | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = useMemo(() => {
    if (!comments.total) return false;
    return comments.items.length < comments.total;
  }, [comments.items.length, comments.total]);

  useEffect(() => {
    if (ticketId && loadedTicketId.current !== ticketId) {
      loadedTicketId.current = ticketId;
      dispatch(resetCommentsState());
      dispatch(getCommentsAction({ ticketId, page: 1, limit: 20 }));
    }
  }, [dispatch, ticketId]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!listContainerRef.current) return;
    if (!ticketId) return;

    const el = sentinelRef.current;
    const rootEl = listContainerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0]?.isIntersecting;
        if (!isIntersecting) return;

        if (comments.status === LOADING_STATUS.LOADING) return;
        if (!hasMore) return;

        dispatch(
          getCommentsAction({
            ticketId,
            page: (comments?.params?.page ?? 1) + 1,
            limit: comments?.params?.limit ?? 20,
            append: true,
          })
        );
      },
      { root: rootEl, rootMargin: "200px", threshold: 0 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [comments.params?.limit, comments.params?.page, comments.status, hasMore, ticketId]);

  return (
    <div>
      {comments.status === LOADING_STATUS.LOADING && comments.items.length === 0 && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <div className="flex gap-3" style={{ paddingLeft: "16px" }}>
            <div className="relative">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-700" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <div className="flex gap-3" style={{ paddingLeft: "16px" }}>
            <div className="relative">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-700" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      )}

      {comments.status === LOADING_STATUS.ERROR && (
        <div className="text-center py-8">
          <p className="text-sm text-red-400">Failed to load comments</p>
          <button
            onClick={() => dispatch(getCommentsAction({ ticketId }))}
            className="mt-2 text-xs text-blue-400 hover:text-blue-300"
          >
            Retry
          </button>
        </div>
      )}

      {(comments.status === LOADING_STATUS.SUCCESS ||
        comments.status === LOADING_STATUS.LOADING ||
        comments.status === LOADING_STATUS.IDLE) && (
        <div
          key="comments-list"
          ref={listContainerRef}
          className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2"
        >
          {comments.items.length > 0 ? (
            comments.items.map((comment: Comment) => <CommentItem key={comment.id} comment={comment} depth={0} />)
          ) : (
            <div key="no-comments" className="text-center py-8 bg-muted/80 rounded-md p-4">
              <p className="text-sm text-muted-foreground italic">No comments yet</p>
            </div>
          )}

          <div ref={sentinelRef} className="h-px" />
        </div>
      )}

      <CommentInput ticketId={ticketId} isAnswer />
    </div>
  );
}
