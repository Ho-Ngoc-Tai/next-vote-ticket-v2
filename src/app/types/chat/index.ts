export interface IConversationCustomer {
  id: string;
  name: string;
  avatar: string;
}

/** Agent assigned to the conversation; only present when an agent has joined. */
export interface IConversationAgent {
  id: string;
  name: string;
  avatar: string;
}

export interface IConversation {
  id: string;
  unreadCount: number;
  createdBy: string;
  type: string;
  source: string;
  status: string;
  customerId: string;
  resolvedAt: string | null;
  closedAt: string | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  customer: IConversationCustomer;
  /** Assigned agent; only set when an agent has joined the conversation. */
  agents?: IConversationAgent[];
  agentIds?: string[];
  firstMessage?: IMessage;
}

export type Conversation = IConversation;

export interface ICreateConversationRequest {
  source: "support";
  message: string;
}

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  contentType: string;
  status: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateMessageRequest {
  conversationId: string;
  senderId: string;
  content: string;
  contentType?: string;
  metadata?: Record<string, unknown>;
}
