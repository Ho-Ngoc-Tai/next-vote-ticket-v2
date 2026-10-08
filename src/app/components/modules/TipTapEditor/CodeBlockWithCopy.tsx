"use client";

import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function CodeBlockWithCopy({ node }: { node: { textContent: string } }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const codeContent = node.textContent ?? "";
    if (codeContent) {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <button
        type="button"
        onClick={copyToClipboard}
        className="code-block-copy-btn"
        title={copied ? "Copied!" : "Copy"}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        <span className="ml-1.5">{copied ? "Copied" : "Copy"}</span>
      </button>
      <pre className="code-block-pre">
        <code>
          <NodeViewContent />
        </code>
      </pre>
    </NodeViewWrapper>
  );
}
