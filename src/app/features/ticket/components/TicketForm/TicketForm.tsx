"use client";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import TipTapEditor from "@components/modules/TipTapEditor";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@stores/index";
import { getTicketCategoriesAction, ticketCategoriesSelector } from "@stores/reducers/tickets";
import { LOADING_STATUS } from "@constants/status";
import { hasContent } from "./utils";
import { TagsInput } from "./TagsInput";
import { TicketAttachmentUpload } from "./TicketAttachmentUpload";
import type { TicketFormData, TicketFormProps } from "./types";
import { TicketCategory } from "@interfaces/tickets";

const defaultCustomerInfo = {
  name: "",
  email: "",
  phone: "",
};

export function TicketForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  isSuccess = false,
  successMessage,
  submitLabel,
  cancelLabel = "Cancel",
  uploadError,
}: TicketFormProps & { uploadError?: string }) {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(ticketCategoriesSelector);

  const [formData, setFormData] = useState<Partial<TicketFormData>>({
    subject: "",
    category: "",
    description: "",
    tags: [],
    attachments: [],
    customerInfo: defaultCustomerInfo,
    ...defaultValues,
  });
  const [descriptionContent, setDescriptionContent] = useState(defaultValues?.description ?? "<p></p>");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState("");

  // Sync description when defaultValues change (edit mode)
  useEffect(() => {
    const desc = defaultValues?.description;
    if (mode === "edit" && desc) {
      queueMicrotask(() => setDescriptionContent(desc));
    }
  }, [mode, defaultValues?.description]);

  // Fetch categories on mount
  useEffect(() => {
    if (!categories.items || categories.items.length === 0) {
      dispatch(getTicketCategoriesAction());
    }
  }, [categories.items]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.subject?.trim() || !hasContent(descriptionContent)) {
      setError("Please fill in all required fields");
      return;
    }

    const data: TicketFormData & { newFiles?: File[] } = {
      subject: formData.subject ?? "",
      category: formData.category ?? "",
      description: hasContent(descriptionContent) ? descriptionContent : "",
      tags: formData.tags ?? [],
      attachments: formData.attachments ?? [],
      customerInfo: formData.customerInfo ?? defaultCustomerInfo,
    };

    if (attachments.length > 0) {
      data.newFiles = attachments;
    }

    onSubmit(data);
  };

  const displaySubmitLabel = submitLabel ?? (mode === "create" ? "Create Ticket" : "Update Ticket");

  const displaySuccessMessage =
    successMessage ??
    (mode === "create" ? "Ticket created successfully! Redirecting..." : "Ticket updated successfully!");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="subject" className="gap-2 mb-2">
          Title *
        </Label>
        <Input
          id="subject"
          value={formData.subject ?? ""}
          onChange={(e) => handleInputChange("subject", e.target.value)}
          placeholder="Enter ticket title"
          required
        />
      </div>

      <div>
        <Label htmlFor="category" className="gap-2 mb-2">
          Category *
        </Label>
        <Select value={formData.category ?? ""} onValueChange={(value) => handleInputChange("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.status === LOADING_STATUS.LOADING ? (
              <SelectItem value="loading" disabled>
                Loading categories...
              </SelectItem>
            ) : categories.status === LOADING_STATUS.ERROR ? (
              <SelectItem value="Error" disabled>
                Try again...
              </SelectItem>
            ) : (
              categories.items?.map((category: TicketCategory) => (
                <SelectItem key={category.id} value={category.title}>
                  {category.title}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description" className="gap-2 mb-2">
          Description *
        </Label>
        <TipTapEditor content={descriptionContent} handleContent={setDescriptionContent} minHeight={200} />
      </div>

      <TagsInput value={formData.tags ?? []} onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))} />

      <TicketAttachmentUpload
        files={attachments}
        previewUrls={previewUrls}
        onFilesChange={(files, urls) => {
          setAttachments(files);
          setPreviewUrls(urls);
        }}
        onError={setError}
        uploadError={uploadError}
      />

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded">{error}</div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (mode === "create" ? "Creating..." : "Updating...") : displaySubmitLabel}
        </Button>
      </div>

      {isSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 px-4 py-3 rounded">
          {displaySuccessMessage}
        </div>
      )}
    </form>
  );
}
