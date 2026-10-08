"use client";

import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import { File, Upload, X } from "lucide-react";
import Image from "next/image";
import { ACCEPTED_FILE_TYPES, MAX_ATTACHMENTS, MAX_FILE_SIZE } from "./constants";
import { validateFile } from "./utils";

export interface TicketAttachmentUploadProps {
  files: File[];
  previewUrls: string[];
  onFilesChange: (files: File[], previewUrls: string[]) => void;
  onError: (message: string) => void;
  uploadError?: string;
  maxFiles?: number;
  accept?: string;
}

export function TicketAttachmentUpload({
  files,
  previewUrls,
  onFilesChange,
  onError,
  uploadError,
  maxFiles = MAX_ATTACHMENTS,
  accept = "image/*,application/pdf,text/plain",
}: TicketAttachmentUploadProps) {
  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <File className="h-6 w-6 text-green-400" />;
    }
    return <File className="h-6 w-6 text-gray-400" />;
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const fileArray = Array.from(fileList);
    if (files.length + fileArray.length > maxFiles) {
      onError(`Cannot add more than ${maxFiles} files`);
      return;
    }

    const validFiles = fileArray.filter((file, i) =>
      validateFile(file, {
        maxSize: MAX_FILE_SIZE,
        acceptedTypes: ACCEPTED_FILE_TYPES,
        maxCount: maxFiles,
        currentCount: files.length + i,
        onError,
      })
    );

    onError("");
    const newFiles = [...files, ...validFiles];
    const newPreviewUrls = [...previewUrls];

    validFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        newPreviewUrls.push(URL.createObjectURL(file));
      }
    });

    onFilesChange(newFiles, newPreviewUrls);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    onFilesChange(newFiles, newPreviewUrls);
    onError("");
  };

  return (
    <div>
      <Label className="gap-2 mb-2">Attachments</Label>
      <div className="flex gap-2 overflow-x-auto pb-2 p-4 border rounded-lg border-border">
        {files.map((file, index) => (
          <div key={index} className="relative flex-shrink-0 group">
            <div className="w-24 h-24 border rounded-lg overflow-hidden bg-muted">
              {file.type.startsWith("image/") ? (
                <Image
                  src={previewUrls[index] || URL.createObjectURL(file)}
                  alt={file.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">{getFileIcon(file)}</div>
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleRemoveFile(index)}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {files.length < maxFiles && (
          <div className="flex-shrink-0">
            <input
              type="file"
              accept={accept}
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
              id="ticket-file-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("ticket-file-upload")?.click()}
              className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-border/80 transition-colors"
            >
              <Upload className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Add</span>
            </Button>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2 mt-2">
          {uploadError}
        </div>
      )}

      <p className="text-muted-foreground text-sm mt-2">
        {files.length}/{maxFiles} files • Maximum 10MB each
      </p>
    </div>
  );
}
