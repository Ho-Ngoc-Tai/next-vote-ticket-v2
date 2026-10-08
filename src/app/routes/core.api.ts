// Auth
export const CORE_USER_INFO_ENDPOINT = "user/profile";
export const CORE_LOGIN_ENDPOINT = "auth/login";
export const CORE_LOGIN_GOOGLE_ENDPOINT = "auth/login/google";
export const CORE_CHECK_REFRESH_TOKEN_ENDPOINT = "auth/login/refreshToken";
export const CORE_LOGOUT_ENDPOINT = "auth/logout";

// Ticket
export const CORE_TICKET_LIST_ENDPOINT = "ticket-support/list";
export const CORE_TICKET_CREATE_ENDPOINT = "ticket-support/create";
export const CORE_TICKET_DETAIL_ENDPOINT = (id: string) => `ticket-support/${id}/detail`;
export const CORE_TICKET_UPDATE_ENDPOINT = (id: string) => `ticket-support/${id}/update`;
export const CORE_TICKET_CATEGORIES_ENDPOINT = "ticket-support/categories";

// Comment
export const CORE_COMMENT_LIST_ENDPOINT = (ticketId: string) => `ticket-support/${ticketId}/comments`;
export const CORE_COMMENT_CREATE_ENDPOINT = (ticketId: string) => `ticket-support/${ticketId}/comment`;
export const CORE_COMMENT_REPLIES_ENDPOINT = (commentId: string) => `ticket-support/comments/${commentId}/replies`;
export const CORE_TICKET_LIST_MY_TICKETS_ENDPOINT = "ticket-support/my-tickets";
export const CORE_TICKET_STATUS_COUNT_TICKETS_ENDPOINT = "ticket-support/status-count";
export const CORE_MY_TICKET_STATUS_COUNT_TICKETS_ENDPOINT = "ticket-support/my-status-count";

// Upload
export const CORE_GET_TOKEN_UPLOAD_ENDPOINT = "auth/upload-token";
export const CORE_UPLOAD_ENDPOINT = "upload";

// Chat
export const CORE_CHAT_CONVERSATIONS_ENDPOINT = "chat/conversations";
export const CORE_CHAT_MESSAGES_ENDPOINT = (conversationId: string) => `chat/conversations/${conversationId}/messages`;
