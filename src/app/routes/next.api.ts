export const NEXT_LOGIN_ENDPOINT = "/auth/signin";
export const NEXT_CHECK_REFRESH_TOKEN_ENDPOINT = "/auth/refresh-token";
export const NEXT_LOGOUT_ENDPOINT = "/auth/signout";
export const NEXT_USER_INFO_ENDPOINT = "/auth/me";

// Ticket
export const NEXT_TICKET_LIST_ENDPOINT = "/tickets/list";
export const NEXT_TICKET_CREATE_ENDPOINT = "/tickets/create";
export const NEXT_TICKET_DETAIL_ENDPOINT = (id: string) => `/tickets/${id}/detail`;
export const NEXT_TICKET_UPDATE_ENDPOINT = (id: string) => `/tickets/${id}/update`;
export const NEXT_TICKET_STATUS_COUNT_ENDPOINT = "/tickets/status-count";
export const NEXT_MY_TICKET_STATUS_COUNT_ENDPOINT = "/tickets/my-status-count";
export const NEXT_TICKET_CATEGORIES_ENDPOINT = "/tickets/categories";

// Comment
export const NEXT_COMMENT_LIST_ENDPOINT = (ticketId: string) => `/tickets/${ticketId}/comments`;
export const NEXT_COMMENT_CREATE_ENDPOINT = (ticketId: string) => `/tickets/${ticketId}/comments`;
export const NEXT_COMMENT_REPLIES_ENDPOINT = (commentId: string) => `/comments/${commentId}/replies`;
export const NEXT_TICKET_LIST_MY_TICKETS_ENDPOINT = "/tickets/list-my-tickets";

// Upload
export const NEXT_API_UPLOAD_ENDPOINT = "/upload";

// Chat
export const NEXT_CHAT_CONVERSATIONS_ENDPOINT = "/chat/conversations";
export const NEXT_CHAT_MESSAGES_ENDPOINT = "/chat/messages";

// socket access token
export const NEXT_API_PERMISSION_ACCESS_ENDPOINT = "/permission-access";
