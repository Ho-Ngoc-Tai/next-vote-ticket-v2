import { cn } from "@/lib/utils";
import { UserInfo } from "@interfaces/auth";
import type { IConversation, IMessage } from "@interfaces/chat";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

interface MessageListProps {
  messages: IMessage[];
  authors: UserInfo | null;
  loadingHint?: string;
  conversation: IConversation | null;
  isSending?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

const SCROLL_NEAR_TOP = 120;
const SCROLL_NEAR_BOTTOM = 100;

export function MessageList({
  messages,
  authors,
  loadingHint,
  conversation,
  isSending,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const prevMessagesRef = useRef<IMessage[]>([]);
  const hasScrolledInitiallyRef = useRef(false);
  const hasBeenNearBottomRef = useRef(false);
  const prevConvIdRef = useRef<string | null>(null);

  useEffect(() => {
    const convId = conversation?.id ?? null;
    if (convId !== prevConvIdRef.current) {
      prevConvIdRef.current = convId;
      hasBeenNearBottomRef.current = false;
    }
  }, [conversation?.id]);

  useEffect(() => {
    if (hasScrolledInitiallyRef.current) return;
    if (messages.length === 0 && !isSending) return;
    hasScrolledInitiallyRef.current = true;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    const prev = prevMessagesRef.current;
    if (!container || messages.length <= prev.length) {
      prevMessagesRef.current = messages;
      return;
    }
    const firstId = messages[0]?.id;
    const prevFirstId = prev[0]?.id;
    if (prev.length > 0 && firstId !== prevFirstId && firstId) {
      const oldScrollHeight = container.scrollHeight;
      const oldScrollTop = container.scrollTop;
      prevMessagesRef.current = messages;
      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight;
        const delta = newScrollHeight - oldScrollHeight;
        if (delta > 0) container.scrollTop = oldScrollTop + delta;
      });
    } else {
      prevMessagesRef.current = messages;
      // Append at bottom (e.g. user sent) — scroll down; load-more prepends take the branch above.
      const last = messages[messages.length - 1];
      if (authors?.id && last?.senderId === authors.id) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, authors?.id]);

  useEffect(() => {
    if (!isSending) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isSending]);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || !onLoadMore || !hasMore || isLoadingMore) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const distFromBottom = scrollHeight - clientHeight - scrollTop;
    if (distFromBottom <= SCROLL_NEAR_BOTTOM) hasBeenNearBottomRef.current = true;
    if (hasBeenNearBottomRef.current && scrollTop <= SCROLL_NEAR_TOP) onLoadMore();
  }, [onLoadMore, hasMore, isLoadingMore]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const getSenderName = (id: string) => (id === authors?.id ? "You" : "Agent");

  return (
    <div ref={scrollContainerRef} className="flex flex-1 flex-col overflow-y-auto p-4">
      <div className="flex-1 space-y-3">
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <span className="text-xs text-muted-foreground">Loading older messages...</span>
          </div>
        )}
        <div ref={topSentinelRef} className="h-px" aria-hidden />
        {messages.map((message) => {
          const isMe = message.senderId === authors?.id;
          return (
            <div key={message?.id} className={cn("flex gap-2", isMe ? "justify-end text-right" : "justify-start")}>
              <div
                className={cn(
                  "inline-flex max-w-[75%] flex-col rounded-2xl px-3 py-2 text-sm",
                  "bg-muted text-foreground rounded-bl-sm"
                )}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {getSenderName(message.senderId)}
                  </span>
                </div>
                <span className="text-left">{message.content}</span>
              </div>
            </div>
          );
        })}
        {isSending && (
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-1 rounded-2xl rounded-br-sm bg-muted px-3 py-2">
              <span className="text-sm text-muted-foreground">Sending</span>
              <span className="inline-flex gap-0.5">
                <span className="h-1 w-1 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
                <span className="h-1 w-1 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {loadingHint && <p className="mt-2 text-center text-xs text-muted-foreground">{loadingHint}</p>}
      {!conversation?.agentIds?.length && (
        <div className="flex flex-col items-center justify-center">
          <p className="text-center text-xs text-muted-foreground">
            Please hang on while we connect you to an agent. Agent will join the conversation soon...
          </p>
        </div>
      )}
    </div>
  );
}
