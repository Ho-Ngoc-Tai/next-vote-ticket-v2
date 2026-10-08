"use client";

import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Spinner } from "@components/ui/spinner";
import { LOADING_STATUS } from "@constants/status";
import { useAppDispatch, useAppSelector } from "@stores/index";
import { userInfoSelector } from "@stores/reducers/auth";
import { createCommentAction, createCommentSelector, resetCreateCommentState } from "@stores/reducers/comments";
import { makeUpload, uploadAction } from "@stores/reducers/upload";
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react";
import { File, Paperclip, Send, Smile, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

interface CommentInputProps {
  ticketId: string;
  replyToUserName?: string;
  parentId?: string;
  isAnswer?: boolean;
  autoFocus?: boolean;
}

export default function CommentInput({
  ticketId,
  replyToUserName,
  parentId,
  isAnswer = false,
  autoFocus = false,
}: CommentInputProps) {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const dispatch = useAppDispatch();
  const createComment = useAppSelector(createCommentSelector);
  const uploadState = useAppSelector(makeUpload);
  const { data: userInfo } = useAppSelector(userInfoSelector);
  const { resolvedTheme } = useTheme();

  const validateFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024;
    const acceptedTypes = ["image/*", "application/pdf", "text/plain"];

    if (file.size > maxSize) {
      setError(`File ${file.name} exceeds 10MB limit`);
      return false;
    }

    if (
      !acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      })
    ) {
      setError(`File ${file.name} is not a supported type`);
      return false;
    }

    return true;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(validateFile);

    if (attachments.length + validFiles.length > 3) {
      setError("Cannot add more than 3 files");
      return;
    }

    setError("");
    setAttachments([...attachments, ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <File className="h-4 w-4 text-green-500" />;
    }
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      if (attachments.length > 0) {
        const formData = new FormData();
        attachments.forEach((file) => formData.append("files", file));
        formData.append("source", "attachment");

        setIsUploading(true);
        dispatch(uploadAction(formData));
      } else {
        dispatch(
          createCommentAction({
            ticketId,
            content: content.trim(),
            attachments: [],
            parentId,
          })
        );

        setContent("");
        setError("");
      }
    } catch (err) {
      setError("Failed to send comment. Please try again.");
      console.error("Submit error:", err);
    }
  };

  useEffect(() => {
    if (isUploading && uploadState?.upload?.status === LOADING_STATUS.SUCCESS) {
      dispatch(
        createCommentAction({
          ticketId,
          content: content.trim(),
          attachments: uploadState?.upload?.data || [],
          parentId,
        })
      );
    } else if (isUploading && uploadState?.upload?.status === LOADING_STATUS.ERROR) {
      queueMicrotask(() => {
        setError("Upload failed. Please try again.");
        setIsUploading(false);
      });
    }
  }, [uploadState?.upload?.status, isUploading, content, ticketId, parentId]);

  useEffect(() => {
    if (createComment?.status === LOADING_STATUS.SUCCESS) {
      queueMicrotask(() => {
        setContent("");
        setAttachments([]);
        setError("");
        setIsUploading(false);
        dispatch(resetCreateCommentState());
      });
    }
  }, [createComment?.status, dispatch]);

  // Auto-resize textarea height based on content
  useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.max(18, ta.scrollHeight - 2)}px`;
  }, [content]);

  useEffect(() => {
    if (!autoFocus) return;
    queueMicrotask(() => {
      inputRef.current?.focus();
    });
  }, [autoFocus, parentId]);

  const placeholder = replyToUserName ? `Reply to ${replyToUserName}` : "Write a answer...";

  const showSendButton = isFocused || content.trim().length > 0;

  const avatarInitial = userInfo?.fullname?.charAt(0)?.toUpperCase() ?? "U";

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setContent((prev) => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
    // Shift+Enter: allow default (newline in textarea)
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={`mt-2 ${isAnswer ? "mb-0" : "mb-4"}`}>
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-md border bg-muted/80 dark:bg-muted/20 px-2 py-1 text-muted-foreground"
            >
              {getFileIcon(file)}
              <span className="max-w-20 truncate text-xs text-foreground">{file.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="text-gray-500 transition-colors hover:text-red-500 dark:text-muted-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <div className="mb-2 text-xs text-red-500">{error}</div>}

      {/* Flex row: avatar + pill input */}
      <div className="flex flex-row items-center gap-2">
        <Avatar className="h-9 w-9 shrink-0 rounded-full">
          <AvatarFallback className="rounded-full bg-gray-300 text-sm font-semibold text-gray-600 dark:bg-gray-600 dark:text-gray-300">
            {avatarInitial}
          </AvatarFallback>
        </Avatar>

        <div
          className={`relative flex-1 w-full rounded-2xl border-0 bg-muted/80 px-4 py-2.5 focus:bg-muted/80 focus:ring-0 dark:bg-muted/20 dark:placeholder:text-muted-foreground dark:focus:bg-muted/20`}
          onClick={() => inputRef.current?.focus()}
        >
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            disabled={createComment.status === LOADING_STATUS.LOADING || isUploading}
            rows={1}
            className="w-full resize-none overflow-hidden text-sm text-foreground placeholder:text-muted-foreground outline-none ring-0 transition-none focus:bg-none focus:ring-0 dark:placeholder:text-muted-foreground dark:focus:bg-none"
          />

          {/* Icons inside input */}
          <div
            className={`flex items-center gap-1 ${showSendButton ? "mt-3 justify-between" : "absolute right-2 top-1/2 -translate-y-1/2"}`}
          >
            <div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-foreground dark:text-gray-400 dark:hover:bg-gray-600"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-foreground dark:text-gray-400 dark:hover:bg-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-0 p-0" align="start" side="top">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme={resolvedTheme === "dark" ? Theme.DARK : resolvedTheme === "light" ? Theme.LIGHT : Theme.AUTO}
                    width={320}
                    height={360}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <button
                type="submit"
                disabled={!content.trim() || createComment.status === LOADING_STATUS.LOADING || isUploading}
                className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-blue-600 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-blue-400"
              >
                {isUploading || createComment.status === LOADING_STATUS.LOADING ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {createComment?.status === LOADING_STATUS.ERROR && (
        <div className="mt-2 text-xs text-red-500">Failed to send comment. Please try again.</div>
      )}
    </form>
  );
}
