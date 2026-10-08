/* eslint-disable no-unused-vars */

import { Send } from "lucide-react";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { useLayoutEffect, useRef, useState } from "react";

interface MessageInputProps {
  onSendMessage: (_content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed);
    setValue("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-3">
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
          disabled={disabled}
        />
        <Button type="button" size="icon" onClick={handleSend} disabled={disabled} className="cursor-pointer">
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
