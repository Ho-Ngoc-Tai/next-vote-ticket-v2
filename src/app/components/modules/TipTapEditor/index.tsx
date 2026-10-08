/* eslint-disable no-unused-vars */
"use client";

import Code from "@tiptap/extension-code";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Document from "@tiptap/extension-document";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, ReactNodeViewRenderer, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { createLowlight, common } from "lowlight";
import React, { useEffect, useRef, useState } from "react";
import "./tiptap.css";

import CodeBlockWithCopy from "./CodeBlockWithCopy";
import MenuBar from "./MenuBar";

const lowlight = createLowlight(common);

// --- Main App ---
export default function TipTapEditor({
  content,
  handleContent,
  isView,
  minHeight = 500,
  compact,
}: {
  content?: string;
  handleContent?: (content: string) => void;
  isView?: boolean;
  minHeight?: number;
  /** When true and isView, renders without border/shadow for inline display */
  compact?: boolean;
}) {
  const [editorContent, setEditorContent] = useState<string>(content || "<p></p>");
  const lastExternalContent = useRef<string | undefined>(undefined);
  const isApplyingExternal = useRef(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Document.extend({
        content: "block+",
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockWithCopy);
        },
      }).configure({ lowlight }),
      Underline,
      Link,
      Code,
      TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
      ImageExtension,
      HorizontalRule,
    ] as any,
    content: editorContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      // Nếu đang apply external content thì không emit (tránh vòng lặp)
      if (isApplyingExternal.current) {
        // vừa finish applying external content
        isApplyingExternal.current = false;
        lastExternalContent.current = html;
        return;
      }

      // Nếu nội dung thực sự khác với lastExternalContent -> user edit
      if (lastExternalContent.current !== html) {
        lastExternalContent.current = html;
        if (handleContent) handleContent(html);
        setEditorContent(html);
      }
    },
  });
  // Chỉ set content khi prop content thực sự khác với nội dung hiện tại editor
  useEffect(() => {
    if (!editor) return;

    // nếu content undefined/null: ignore
    if (content === undefined || content === null) return;

    const currentHtml = editor.getHTML();

    // Nếu prop content khác nội dung editor và khác lastExternalContent => apply
    if (content !== currentHtml && content !== lastExternalContent.current) {
      isApplyingExternal.current = true; // bật guard (tránh onUpdate emit)
      editor.commands.setContent(content);
      // lastExternalContent sẽ được cập nhật trong onUpdate khi apply xong,
      // nhưng đôi khi onUpdate không chạy ngay, ta vẫn set tạm:
      lastExternalContent.current = content;
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!isView);
  }, [isView, editor]);
  const isCompactView = isView && compact;
  return (
    <div className="w-full">
      <div
        className={
          isCompactView
            ? "w-full bg-transparent overflow-hidden"
            : `w-full bg-background rounded-xl overflow-hidden border border-border transition-all duration-200 shadow-sm ${!isView ? "hover:border-border/80" : ""}`
        }
      >
        {!isView && <MenuBar editor={editor} />}
        <EditorContent
          editor={editor}
          style={{ minHeight: `${minHeight}px` }}
          className={`prose prose-indigo dark:prose-invert max-w-full focus:outline-none focus:border-none text-foreground tiptap-editor ${isCompactView ? "tiptap-editor-compact p-0! min-h-0! max-h-none bg-transparent" : "p-6 bg-background"}`}
        />
      </div>
    </div>
  );
}
