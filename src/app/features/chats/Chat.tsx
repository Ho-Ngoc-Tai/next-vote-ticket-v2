"use client";

import { Menu, Plus, X } from "lucide-react";

import PageHeader from "@components/modules/page-header";
import { Button } from "@components/ui/button";
import { TooltipProvider } from "@components/ui/tooltip";
import { LOADING_STATUS } from "@constants/status";
import type { IConversation } from "@interfaces/chat";
import { createConversationAction, getMessagesAction } from "@stores/reducers/chat";
import { ChatConversationList } from "./ChatConversationList";
import { ChatHeader } from "./ChatHeader";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { GUIDE_PLACEHOLDER, useChatController } from "./useChatController";

interface ChatProps {
  conversations: IConversation[];
}

export function Chat({ conversations }: ChatProps) {
  const {
    mergedConversations,
    currentConversation,
    currentMessages,
    selectedConversation,
    userInfo,
    isSidebarOpen,
    isTempSelected,
    isFirstMessageForTemp,
    isCreatingConversation,
    isSendingMessage,
    showCreateError,
    isLoadingMessages,
    isShowCreateMessage,
    messagesState,
    handleStartConversation,
    handleSendMessage,
    selectConversation,
    setSidebarOpen,
    clearCreateError,
    dispatch,
  } = useChatController({ conversations });

  return (
    <TooltipProvider delayDuration={0}>
      <PageHeader
        title="Chats"
        description="Contact with support in real time."
        actions={
          isShowCreateMessage ? (
            <Button variant="outline" className="cursor-pointer" onClick={handleStartConversation}>
              <Plus />
              <span className="hidden lg:inline">Start conversation with support</span>
            </Button>
          ) : null
        }
      />

      <div className="flex h-[calc(95vh-180px)] mt-4 min-h-[500px] overflow-hidden rounded-xl border bg-background shadow-sm">
        {isSidebarOpen ? (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        ) : null}

        <div
          className={`fixed inset-y-0 left-0 z-50 w-80 shrink-0 border-r bg-background transition-transform duration-300 ease-in-out lg:relative lg:block ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between border-b bg-background p-4 lg:hidden">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="cursor-pointer">
              <X className="size-4" />
            </Button>
          </div>

          <ChatConversationList
            conversations={mergedConversations}
            selectedConversation={selectedConversation}
            onSelectConversation={(id) => {
              selectConversation(id, { closeSidebar: true });
              if (id === selectedConversation && conversations?.find((c) => c.id === id)?.unreadCount === 0) return;
              dispatch(getMessagesAction({ conversationId: id, page: 1, limit: 50 }));
            }}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-background">
          <div className="flex h-16 items-center border-b bg-background px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="mr-2 cursor-pointer lg:hidden"
            >
              <Menu className="size-4" />
            </Button>

            <div className="flex-1">
              <ChatHeader conversation={currentConversation ?? null} />
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            {selectedConversation ? (
              <>
                {showCreateError ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3">
                    <p className="text-sm text-destructive">Failed to create conversation. Please try again.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const msg = currentMessages[0]?.content ?? "";
                        clearCreateError();
                        dispatch(createConversationAction({ source: "support", message: msg }));
                      }}
                      className="cursor-pointer"
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <>
                    {isFirstMessageForTemp ? (
                      <div className="flex flex-1 flex-col items-center justify-center px-4">
                        <p className="mb-1 text-center text-sm font-medium text-muted-foreground">
                          What do you need help with?
                        </p>
                        <p className="text-center text-xs text-muted-foreground">
                          Enter a message below to start a conversation with support.
                        </p>
                      </div>
                    ) : (
                      <MessageList
                        conversation={currentConversation ?? null}
                        messages={currentMessages}
                        authors={userInfo}
                        isSending={isSendingMessage}
                        loadingHint={
                          isCreatingConversation
                            ? "Creating conversation..."
                            : isLoadingMessages
                              ? "Loading messages..."
                              : undefined
                        }
                        onLoadMore={
                          messagesState.status !== LOADING_STATUS.LOADING &&
                          !isTempSelected &&
                          selectedConversation &&
                          messagesState.total > currentMessages.length
                            ? () =>
                                dispatch(
                                  getMessagesAction({
                                    conversationId: selectedConversation,
                                    page: (messagesState.params?.page ?? 1) + 1,
                                    limit: messagesState.params?.limit ?? 50,
                                  })
                                )
                            : undefined
                        }
                        hasMore={messagesState.total > currentMessages.length}
                        isLoadingMore={messagesState.status === LOADING_STATUS.LOADING && currentMessages.length > 0}
                      />
                    )}
                    <MessageInput
                      onSendMessage={handleSendMessage}
                      placeholder={isTempSelected ? GUIDE_PLACEHOLDER : undefined}
                      disabled={isCreatingConversation}
                    />
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <h3 className="mb-2 text-lg font-semibold">Welcome to Chat</h3>
                  <p className="text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
