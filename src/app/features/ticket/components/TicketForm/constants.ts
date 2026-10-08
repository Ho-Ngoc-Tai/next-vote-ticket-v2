export const TICKET_CATEGORY_OPTIONS = [
  { value: "Technical", label: "Technical" },
  { value: "Billing", label: "Billing" },
  { value: "Account", label: "Account" },
  { value: "Feature", label: "Feature Request" },
  { value: "Bug Report", label: "Bug Report" },
  { value: "Complaint", label: "Complaint" },
  { value: "Consultation", label: "Consultation" },
  { value: "Feature Request", label: "Feature Request" },
  { value: "General", label: "General" },
  { value: "Technical Support", label: "Technical Support" },
  { value: "Other", label: "Other" },
] as const;

export const MAX_ATTACHMENTS = 6;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = ["image/*", "application/pdf", "text/plain"];
