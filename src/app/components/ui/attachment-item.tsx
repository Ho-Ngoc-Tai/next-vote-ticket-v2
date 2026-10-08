import { renderMedia } from "@commons/utils/renderMedia";
import { Download, File, FileText, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
interface AttachmentItemProps {
  attachment: string;
  index?: number;
}

const getFileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return <FileText className="h-3 w-3 text-red-400" />;
    case "png":
    case "jpg":
    case "jpeg":
      return <ImageIcon className="h-3 w-3 text-green-400" />;
    case "txt":
    case "log":
      return <FileText className="h-3 w-3 text-blue-400" />;
    default:
      return <File className="h-3 w-3 text-gray-400" />;
  }
};

const isImageFile = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ["png", "jpg", "jpeg", "gif", "webp"].includes(ext || "");
};

export default function AttachmentItem({ attachment, index }: AttachmentItemProps) {
  const isImage = isImageFile(attachment);
  const imageUrl = renderMedia(attachment);

  if (isImage) {
    return (
      <div key={index} className="mt-2">
        <Image
          src={imageUrl}
          alt="attachment"
          width={500}
          height={500}
          className="max-w-full h-auto max-h-96 rounded-lg border border-border cursor-pointer hover:border-primary transition-colors object-contain"
          onClick={() => window.open(imageUrl, "_blank")}
        />
      </div>
    );
  }

  return (
    <div
      key={index}
      className="group flex items-center gap-2 px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-all cursor-pointer"
      onClick={() => {
        const url = renderMedia(attachment);
        window.open(url, "_blank");
      }}
    >
      {getFileIcon(attachment)}
      <span className="text-xs text-cyan-300 truncate max-w-20">{attachment.split("/").pop()}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const url = renderMedia(attachment);
          window.open(url, "_blank");
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Download className="h-3 w-3 text-cyan-400" />
      </button>
    </div>
  );
}
