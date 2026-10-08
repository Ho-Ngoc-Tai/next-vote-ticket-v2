import { Info, Phone, Search, Video } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import type { IConversation } from "@interfaces/chat";

interface ChatHeaderProps {
  conversation: IConversation | null;
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Select a conversation to start chatting</p>
      </div>
    );
  }

  const displayName = "Support";
  const displayAvatar = "https://github.com/shadcn.png";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="flex h-full items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="size-10 cursor-pointer">
          <AvatarImage src={displayAvatar} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-semibold">{displayName}</h2>
            <Badge variant="secondary" className="text-xs cursor-pointer">
              Chat
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {conversation?.agentIds?.length ? "Active now" : "Connecting to an agent..."}
          </p>
        </div>
      </div>

      {/* Right: actions */}
      <TooltipProvider>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <Search className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search in conversation</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <Phone className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voice call</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <Video className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Video call</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <Info className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Conversation info</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
