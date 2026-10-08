/* eslint-disable no-unused-vars */

import { MoreVertical, Search, Users } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Input } from "@components/ui/input";
import { ScrollArea } from "@components/ui/scroll-area";
import type { IConversation } from "@interfaces/chat";

interface ConversationListProps {
  conversations: IConversation[];
  selectedConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export function ChatConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const filteredConversations = conversations.filter((c) => {
    const name = c.agents?.[0]?.name ?? c.customer?.name ?? "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="hidden h-16 shrink-0 items-center justify-between border-b px-4 lg:flex">
        <h2 className="text-lg font-semibold">Messages</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 cursor-pointer p-0">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer">New Conversation</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Filter Messages</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Chat Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="shrink-0 border-b px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="cursor-text pl-9"
          />
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="h-0 flex-1">
        <div className="space-y-1 p-2">
          {filteredConversations.map((conversation) => {
            const displayName = "Agent";
            const displayAvatar = "https://github.com/shadcn.png";
            return (
              <div
                key={conversation.id}
                className={cn(
                  "relative flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all duration-200",
                  selectedConversation === conversation.id
                    ? "bg-primary/10 text-accent-foreground shadow-sm"
                    : "hover:bg-accent/50"
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="relative shrink-0">
                  <Avatar
                    className={cn(
                      "h-12 w-12 transition-all",
                      selectedConversation === conversation.id &&
                        "ring-primary ring-offset-2 ring-offset-background ring-2"
                    )}
                  >
                    <AvatarImage src={displayAvatar} alt={displayName} />
                    <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 text-sm">
                      <Users className="size-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="mb-1 flex min-w-0 items-center justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden pr-2">
                      <h3 className="min-w-0 max-w-[180px] truncate font-medium">{displayName}</h3>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {conversation.lastMessageAt && new Date(conversation.lastMessageAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    {conversation.unreadCount ? (
                      <p className="min-w-0 max-w-[200px] flex-1 truncate text-sm pr-2">
                        {`${conversation.unreadCount} new messages`}
                      </p>
                    ) : (
                      <p className="min-w-0 max-w-[200px] flex-1 truncate text-sm text-muted-foreground pr-2">
                        {conversation.firstMessage?.content ?? "No messages yet"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
