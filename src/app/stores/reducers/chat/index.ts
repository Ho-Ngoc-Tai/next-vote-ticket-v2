import { LOADING_STATUS } from "@constants/status";
import { BaseReducerState } from "@interfaces/base/";
import { IConversation, ICreateConversationRequest, ICreateMessageRequest, IMessage } from "@interfaces/chat";
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@stores/index";

interface CommentsState {
  conversations: BaseReducerState<IConversation, { page: number; limit: number }>;
  mapConversations: Record<string, IConversation>;
  create: BaseReducerState<IConversation, ICreateConversationRequest>;
  messages: BaseReducerState<IMessage, { conversationId: string; page: number; limit: number }>;
  mapMessages: Record<string, IMessage>;
  createMessage: BaseReducerState<IMessage, ICreateMessageRequest>;
}

const initialState = {
  status: LOADING_STATUS.IDLE,
  items: [],
  error: null,
  params: { page: 1, limit: 20 },
  total: 0,
};

const initialConversationsState = {
  status: LOADING_STATUS.IDLE,
  items: [],
  error: null,
  params: { page: 1, limit: 10 },
  total: 0,
};

const initialMessagesState = {
  status: LOADING_STATUS.IDLE,
  items: [],
  error: null,
  params: { conversationId: "", page: 1, limit: 20 },
  total: 0,
};

const initialStates: CommentsState = {
  conversations: { ...initialConversationsState },
  mapConversations: {} as Record<string, IConversation>,
  create: { ...initialState, data: null as unknown as IConversation, params: {} as ICreateConversationRequest },
  messages: { ...initialMessagesState },
  mapMessages: {} as Record<string, IMessage>,
  createMessage: { ...initialState, data: null as unknown as IMessage, params: {} as ICreateMessageRequest },
};

export const chatSlice = createSlice({
  name: "chat",
  initialState: initialStates,
  reducers: {
    getConversationsAction: (state, action: PayloadAction<{ page?: number; limit?: number }>) => {
      state.conversations.status = LOADING_STATUS.LOADING;
      state.conversations.error = null;
      state.conversations.params = {
        page: action.payload.page || 1,
        limit: action.payload.limit || 20,
      };
    },
    getConversationsSuccess: (state, action: PayloadAction<{ data: IConversation[]; total: number }>) => {
      state.conversations.status = LOADING_STATUS.SUCCESS;
      state.conversations.items = action.payload.data;
      state.conversations.total = action.payload.total;
      state.conversations.error = null;
      for (const conversation of action.payload.data) {
        state.mapConversations[conversation.id] = conversation;
      }
    },
    getConversationsFailure: (state, action: PayloadAction<unknown>) => {
      state.conversations.status = LOADING_STATUS.ERROR;
      state.conversations.items = [];
      state.conversations.total = 0;
      state.conversations.error = action.payload;
    },
    resetConversationsState: (state) => {
      state.conversations = { ...initialConversationsState };
    },
    updateUnreadCount: (state, action: PayloadAction<{ id: string; unreadCount: number }>) => {
      if (!state.mapConversations[action.payload.id]) return;
      state.mapConversations[action.payload.id].unreadCount = action.payload.unreadCount;
    },
    updateConversationAction: (state, action: PayloadAction<{ id: string; agentIds: string[] }>) => {
      if (!state.mapConversations[action.payload.id]) return;
      state.mapConversations[action.payload.id].agentIds = action.payload.agentIds;
    },
    createConversationAction: (state, action: PayloadAction<ICreateConversationRequest>) => {
      state.create.status = LOADING_STATUS.LOADING;
      state.create.error = null;
      state.create.params = action.payload;
    },
    createConversationSuccess: (state, action: PayloadAction<IConversation>) => {
      state.create.status = LOADING_STATUS.SUCCESS;
      state.create.data = action.payload;
      state.create.error = null;
      if (action.payload.firstMessage?.id) {
        state.messages.items = [action.payload.firstMessage];
        state.mapMessages[action.payload.firstMessage.id] = action.payload.firstMessage;
      }
      if (action.payload.id in state.mapConversations) return;
      state.mapConversations[action.payload.id!] = action.payload;
    },
    createConversationFailure: (state, action) => {
      state.create.status = LOADING_STATUS.ERROR;
      state.create.error = action.payload;
    },
    resetCreateConversationState: (state) => {
      state.create = {
        status: LOADING_STATUS.IDLE,
        items: [],
        total: 0,
        data: null as unknown as IConversation,
        error: null,
        params: {} as ICreateConversationRequest,
      };
    },

    getMessagesAction: (state, action: PayloadAction<{ conversationId: string; page: number; limit: number }>) => {
      const { conversationId, page } = action.payload;
      const prevId = state.messages.params?.conversationId;
      state.messages.status = LOADING_STATUS.LOADING;
      state.messages.error = null;
      if (page === 1 && prevId !== conversationId) {
        state.messages.items = [];
      }
      state.messages.params = action.payload;
    },
    getMessagesSuccess: (state, action: PayloadAction<{ data: IMessage[]; total: number }>) => {
      state.messages.status = LOADING_STATUS.SUCCESS;
      const page = state.messages.params?.page ?? 1;
      state.messages.items =
        page > 1
          ? [...(action.payload.data ?? []), ...(state.messages.items as IMessage[])]
          : (action.payload.data ?? []);
      state.messages.total = action.payload.total;
      for (const message of action.payload.data ?? []) {
        state.mapMessages[message.id] = message;
      }
      state.messages.error = null;
    },
    getMessagesFailure: (state, action: PayloadAction<unknown>) => {
      state.messages.status = LOADING_STATUS.ERROR;
      state.messages.items = [];
      state.messages.total = 0;
      state.messages.error = action.payload;
    },
    updateMessageFromSocket: (state, action: PayloadAction<IMessage>) => {
      const msg = action.payload;
      if (msg.id in state.mapMessages) return;
      state.mapMessages[msg.id] = msg;
      const items = state.messages.items as IMessage[];
      state.messages.items = [...items, msg];
    },
    resetMessagesState: (state) => {
      state.messages = { ...initialMessagesState };
    },

    createMessageAction: (state, action: PayloadAction<ICreateMessageRequest>) => {
      state.createMessage.status = LOADING_STATUS.LOADING;
      state.createMessage.error = null;
      state.createMessage.params = action.payload;
    },
    createMessageSuccess: (state, action: PayloadAction<IMessage>) => {
      state.createMessage.status = LOADING_STATUS.SUCCESS;
      state.createMessage.data = action.payload;
      state.createMessage.error = null;
    },
    createMessageFailure: (state, action: PayloadAction<unknown>) => {
      state.createMessage.status = LOADING_STATUS.ERROR;
      state.createMessage.error = action.payload;
    },
    resetCreateMessageState: (state) => {
      state.createMessage = { ...initialState, data: null as unknown as IMessage, params: {} as ICreateMessageRequest };
    },
  },
});

export const chatReducer = chatSlice.reducer;
export const {
  getConversationsAction,
  getConversationsSuccess,
  getConversationsFailure,
  resetConversationsState,
  createConversationAction,
  createConversationSuccess,
  createConversationFailure,
  resetCreateConversationState,
  getMessagesAction,
  getMessagesSuccess,
  getMessagesFailure,
  updateMessageFromSocket,
  resetMessagesState,
  createMessageAction,
  createMessageSuccess,
  createMessageFailure,
  resetCreateMessageState,
  updateUnreadCount,
  updateConversationAction,
} = chatSlice.actions;

// selectors
const selectState = (state: RootState) => state.chat;

export const conversationsSelector = createSelector(selectState, (state) => state.conversations);
export const mapConversationsSelector = createSelector(selectState, (state) => state.mapConversations);
export const createConversationSelector = createSelector(selectState, (state) => state.create);
export const messagesSelector = createSelector(selectState, (state) => state.messages);
export const createMessageSelector = createSelector(selectState, (state) => state.createMessage);
