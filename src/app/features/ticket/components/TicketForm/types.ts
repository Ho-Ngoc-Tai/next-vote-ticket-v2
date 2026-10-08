import { CustomerInfo } from "@interfaces/tickets";

export type TicketFormMode = "create" | "edit";

export interface TicketFormData {
  subject: string;
  category: string;
  description: string;
  tags: string[];
  attachments: string[];
  customerInfo: CustomerInfo;
}

export interface TicketFormProps {
  mode: TicketFormMode;
  defaultValues?: Partial<TicketFormData>;
  onSubmit: (data: TicketFormData & { newFiles?: File[] }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  successMessage?: string;
  submitLabel?: string;
  cancelLabel?: string;
}
