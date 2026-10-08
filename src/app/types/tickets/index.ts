import { BaseApiResponse } from "@interfaces/base";

export type TicketStatus = "NEW" | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type AssignedTeam = "SALES_TEAM" | "DEV_TEAM" | "SUPPORT_TEAM";

// Comment Types
export interface CommentAuthor {
  name?: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  attachments: string[];
  isStaffReply: boolean;
  status: "ACTIVE" | "INACTIVE";
  parentId?: string;
  replyCount?: number;
  likeCount?: number;
  userName?: string;
  author?: CommentAuthor;
  createdAt: string;
  updatedAt: string;
}

export type CommentListResponse = BaseApiResponse<Comment[]>;

export interface CreateCommentRequest {
  ticketId: string;
  content: string;
  attachments?: string[];
  parentId?: string;
}

// LIST API Types
export interface TicketAuthor {
  name?: string;
  avatar?: string;
}

export interface Ticket {
  id: string;
  code: string;
  subject: string;
  description: string;
  status: TicketStatus;
  assignedTeam: AssignedTeam;
  createdAt: string;
  commentCount: number;
  updatedAt: string;
  customerName?: string;
  author?: TicketAuthor;
  categoryTitle?: string;
  attachments?: string[];
  hashtags?: string[];
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
}

export interface MyTicket extends Omit<Ticket, "customerName" | "categoryTitle"> {}
export interface TicketStatusCount {
  NEW: number;
  OPEN: number;
  PENDING: number;
  RESOLVED: number;
  CLOSED: number;
  total: number;
}

export interface TicketCustomerDetail {
  email: string;
  userId: string;
  name: string;
  phone: string;
  isLocked: boolean;
}

export interface TicketDetail {
  id: string;
  code: string;
  subject: string;
  description: string;
  status: TicketStatus;
  assignedTeam: AssignedTeam;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  customer?: TicketCustomerDetail;
  categoryTitle?: string;
  hashtags?: string[];
}

export interface MyTicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
}

// CREATE API Types
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface CreateTicketRequest {
  subject: string;
  category: string;
  description: string;
  attachments: string[];
  hashtags?: string[];
  customerInfo: CustomerInfo;
  customerId?: string | null;
}

export interface UpdateTicketRequest extends Omit<CreateTicketRequest, "customerId"> {
  id: string;
  tags?: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface CustomerCheckState {
  status: "idle" | "checking" | "found" | "not_found";
  data: Customer | null;
}

export interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// CATEGORIES TICKET
export interface TicketCategory {
  id: string;
  title: string;
}
