/* eslint-disable react-hooks/rules-of-hooks */
"use client";
// --- MenuBar.tsx ---
import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Strikethrough as StrikeIcon,
  Underline as UnderlineIcon,
  Code as CodeIcon,
  Code2 as CodeBlockIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ImageIcon,
} from "lucide-react";
import HeadingDropdown from "./HeadingDropdown";
import { NEXT_API_UPLOAD_ENDPOINT } from "@routes/next.api";
import { post } from "@commons/ajax/client";
import { toast } from "sonner";
interface MenuBarProps {
  editor: Editor | null;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  if (!editor) return null;
  const chain = () => editor.chain().focus() as any;

  const MenuItem = ({
    icon: Icon,
    title,
    command,
  }: {
    icon: React.ComponentType<{ className: string }>;
    title: string;
    command: { run: () => void; active: () => boolean };
  }) => {
    const isActive = command?.active ? command.active() : false;
    return (
      <button
        type="button"
        onClick={() => command?.run()}
        className={`p-2 rounded-lg transition-all duration-150 ease-in-out ${
          isActive
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
        title={title}
      >
        <Icon className="w-5 h-5" />
      </button>
    );
  };

  const [isUploadProcess, setUploadProccess] = useState(false);
  return (
    <div className="flex flex-wrap gap-2 p-3 bg-background border-b border-border sticky top-0 z-10 shadow-sm rounded-t-xl dark:bg-card">
      {/* Paragraph & Headings H1-H6 */}
      <div className="flex gap-1.5 p-1 border border-border rounded-lg">
        <HeadingDropdown editor={editor} />
      </div>

      {/* Marks */}
      <div className="flex gap-1.5 p-1 border border-border rounded-lg">
        <MenuItem
          icon={BoldIcon}
          title="Bold"
          command={{
            run: () => chain().toggleBold().run(),
            active: () => editor.isActive("bold"),
          }}
        />
        <MenuItem
          icon={ItalicIcon}
          title="Italic"
          command={{
            run: () => chain().toggleItalic().run(),
            active: () => editor.isActive("italic"),
          }}
        />
        <MenuItem
          icon={UnderlineIcon}
          title="Underline"
          command={{
            run: () => chain().toggleUnderline().run(),
            active: () => editor.isActive("underline"),
          }}
        />
        <MenuItem
          icon={StrikeIcon}
          title="Strike"
          command={{
            run: () => chain().toggleStrike().run(),
            active: () => editor.isActive("strike"),
          }}
        />
        <MenuItem
          icon={CodeIcon}
          title="Inline Code"
          command={{
            run: () => chain().toggleCode().run(),
            active: () => editor.isActive("code"),
          }}
        />
        <MenuItem
          icon={CodeBlockIcon}
          title="Code Block"
          command={{
            run: () => chain().toggleCodeBlock().run(),
            active: () => editor.isActive("codeBlock"),
          }}
        />
      </div>

      {/* Lists & Blockquote */}
      <div className="flex gap-1.5 p-1 border border-border rounded-lg">
        <MenuItem
          icon={List}
          title="Bullet List"
          command={{
            run: () => chain().toggleBulletList().run(),
            active: () => editor.isActive("bulletList"),
          }}
        />
        <MenuItem
          icon={ListOrdered}
          title="Ordered List"
          command={{
            run: () => chain().toggleOrderedList().run(),
            active: () => editor.isActive("orderedList"),
          }}
        />
        <MenuItem
          icon={Quote}
          title="Blockquote"
          command={{
            run: () => chain().toggleBlockquote().run(),
            active: () => editor.isActive("blockquote"),
          }}
        />
        <MenuItem
          icon={Minus}
          title="Horizontal Rule"
          command={{
            run: () => chain().setHorizontalRule().run(),
            active: () => false,
          }}
        />
      </div>

      {/* Links */}
      <div className="flex gap-1.5 p-1 border border-border rounded-lg">
        <MenuItem
          icon={LinkIcon}
          title="Link"
          command={{
            run: () => {
              const url = prompt("Nhập URL:");
              if (url) chain().extendMarkRange("link").setLink({ href: url }).run();
            },
            active: () => editor.isActive("link"),
          }}
        />
      </div>

      {/* Text Align */}
      <div className="flex gap-1.5 p-1 border border-border rounded-lg">
        <MenuItem
          icon={AlignLeft}
          title="Align Left"
          command={{
            run: () => chain().setTextAlign("left").run(),
            active: () => editor.isActive({ textAlign: "left" }),
          }}
        />
        <MenuItem
          icon={AlignCenter}
          title="Align Center"
          command={{
            run: () => chain().setTextAlign("center").run(),
            active: () => editor.isActive({ textAlign: "center" }),
          }}
        />
        <MenuItem
          icon={AlignRight}
          title="Align Right"
          command={{
            run: () => chain().setTextAlign("right").run(),
            active: () => editor.isActive({ textAlign: "right" }),
          }}
        />
        <MenuItem
          icon={AlignJustify}
          title="Justify"
          command={{
            run: () => chain().setTextAlign("justify").run(),
            active: () => editor.isActive({ textAlign: "justify" }),
          }}
        />
      </div>
      <div className="flex gap-1.5 p-1 border border-border rounded-lg">
        <button
          type="button"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async () => {
              if (!input.files?.length) return;
              const file = input.files[0];

              try {
                const formData = new FormData();
                formData.append("files", file);
                formData.append("source", "news");
                setUploadProccess(true);
                const upload: any = await post(NEXT_API_UPLOAD_ENDPOINT, formData);
                setUploadProccess(false);

                if (upload.code !== 200 || !upload?.data?.medias?.length) {
                  toast.error("Upload media failed");
                  return;
                }
                chain()
                  .insertContent(
                    `
                      <figure style="text-align:center;">
                        <img src="${upload?.data?.medias[0]?.url}" width="640" height="450" style="object-fit:contain;" />
                      </figure>
                    `
                  )
                  .run();
              } catch {
                setUploadProccess(false);
                toast.error("Upload media failed");
              }
            };
            input.click();
          }}
          title="Upload Image"
          className="p-2 rounded-lg transition-all duration-150 ease-in-out text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
      </div>
      {isUploadProcess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background dark:bg-card rounded-lg p-6 flex flex-col items-center gap-3 border border-border">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <div className="text-foreground">Uploading ...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuBar;
