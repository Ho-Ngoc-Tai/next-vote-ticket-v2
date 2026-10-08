import { Editor } from "@tiptap/react";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface HeadingDropdownProps {
  editor: Editor;
}

const HeadingDropdown: React.FC<HeadingDropdownProps> = ({ editor }) => {
  const [open, setOpen] = useState(false);
  const chain = () => editor.chain().focus() as any;
  const ref = useRef<HTMLDivElement>(null); // ref cho toàn bộ dropdown

  type HeadingLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

  const headings: { level: HeadingLevel; label: string }[] = [
    { level: 0, label: "Paragraph" },
    { level: 1, label: "H1" },
    { level: 2, label: "H2" },
    { level: 3, label: "H3" },
    { level: 4, label: "H4" },
    { level: 5, label: "H5" },
    { level: 6, label: "H6" },
  ];

  const handleSelect = (level: HeadingLevel) => {
    if (!editor) return;

    if (level === 0) chain().clearNodes().run();
    else chain().toggleHeading({ level }).run();

    setOpen(false);
  };

  // Close dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 p-2 border-0 rounded-lg hover:bg-muted text-foreground"
      >
        Title
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute mt-1 w-40 bg-background dark:bg-card border border-border rounded-lg shadow-lg z-20">
          {headings.map((h) => (
            <button
              key={h.level}
              type="button"
              onClick={() => handleSelect(h.level)}
              className={`block w-full text-left px-4 py-2 hover:bg-muted ${
                h.level === 0 && editor.isActive("paragraph")
                  ? "bg-primary/10 font-semibold"
                  : h.level > 0 && editor.isActive("heading", { level: h.level })
                    ? "bg-primary/10 font-semibold"
                    : ""
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeadingDropdown;
