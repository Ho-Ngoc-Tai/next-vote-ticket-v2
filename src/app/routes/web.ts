export const HOME_PAGE = "/";

// Auth
export const AUTH_SIGNIN_PAGE = "/signin";

// Dashboard
export const WEB_DASHBOARD_ENDPOINT = "/dashboard";

// Ticket
export const WEB_TICKET_ENDPOINT = "/tickets";
export const WEB_TICKET_MY_TICKET_ENDPOINT = "/my-tickets";
export const WEB_TICKET_DETAIL_ENDPOINT = (id: string) => `${WEB_TICKET_ENDPOINT}/${id}`;
export const WEB_TICKET_CREATE_ENDPOINT = `${WEB_TICKET_ENDPOINT}/create`;

// Chat
export const NEXT_CHAT_ENDPOINT = "/chats";
