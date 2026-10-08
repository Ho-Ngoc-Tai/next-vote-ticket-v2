"use client";

import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { X } from "lucide-react";

export interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function TagsInput({ value, onChange, placeholder = "Add tag (press Enter)", label = "Tags" }: TagsInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = e.currentTarget;
      const tagValue = input.value.trim().replace("#", "");
      if (tagValue && !value.includes(tagValue)) {
        onChange([...value, tagValue]);
        input.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full"
          >
            #{tag}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="ml-1 text-primary/70 hover:text-primary"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input placeholder={placeholder} onKeyDown={handleKeyDown} />
      </div>
    </div>
  );
}
