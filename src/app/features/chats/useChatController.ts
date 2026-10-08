"use client";

import { get } from "@commons/ajax/client";
import { eventKeys, topicKeys, topicTypes } from "@constants/socket";
import { LOADING_STATUS } from "@constants/status";
import type { IConversation, IMessage } from "@interfaces/chat";
import { NEXT_API_PERMISSION_ACCESS_ENDPOINT } from "@routes/next.api";
import socketService from "@services/socket-service";
import { SubscribeBody, SubscribeResponse } from "@services/socket-service/type";
import { userInfoSelector } from "@stores/reducers/auth";
import {
  conversationsSelector,
  createConversationAction,
  createConversationSelector,
  createMessageAction,
  createMessageSelector,
  messagesSelector,
  resetCreateConversationState,
  updateConversationAction,
  updateMessageFromSocket,
  updateUnreadCount,
} from "@stores/reducers/chat";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

export const TEMP_PREFIX = "temp-";
const SUPPORT_NAME = "Agent";
const SUPPORT_AVATAR = "https://github.com/shadcn.png";
export const GUIDE_PLACEHOLDER = "Hi, I need your help with...";

export function createTempConversation(): IConversation {
  const id = `${TEMP_PREFIX}${Date.now()}`;
  const now = new Date().toISOString();
  return {
    id,
    unreadCount: 0,
    createdBy: "",
    type: "support",
    source: "web",
    status: "open",
    customerId: "",
    resolvedAt: null,
    closedAt: null,
    lastMessageAt: now,
    createdAt: now,
    updatedAt: now,
    customer: { id: "", name: "", avatar: "" },
    agents: [{ id: "support", name: SUPPORT_NAME, avatar: SUPPORT_AVATAR }],
  };
}

interface ConversationSocketData {
  type: string;
  conversationId: string;
  unreadCount?: number;
  agentIds?: string[];
}

interface ChatLocalState {
  selectedConversation: string | null;
  allMessages: Record<string, IMessage[]>;
  isSidebarOpen: boolean;
  tempConversations: IConversation[];
  createdConversations: IConversation[];
  createFailedForTemp: string | null;
}

type ChatLocalAction =
  | { type: "select"; id: string | null; closeSidebar?: boolean }
  | { type: "setSidebar"; open: boolean }
  | { type: "startTempConversation" }
  | {
      type: "createSuccess";
      newConv: IConversation;
      /** Conversation id from API response — updates selectedConversation */
      selectedConversationId: string;
      tempId: string | null;
      pendingMessage: string | null;
      senderId: string;
    }
  | { type: "createError"; tempId: string | null }
  | { type: "clearCreateError" };

function createInitialState(conversations: IConversation[]): ChatLocalState {
  return {
    selectedConversation: conversations[0]?.id ?? null,
    allMessages: {},
    isSidebarOpen: false,
    tempConversations: [],
    createdConversations: [],
    createFailedForTemp: null,
  };
}

function chatLocalReducer(state: ChatLocalState, action: ChatLocalAction): ChatLocalState {
  switch (action.type) {
    case "select": {
      const id = action.id;
      const clearCreateError = !id || !id.startsWith(TEMP_PREFIX);
      return {
        ...state,
        selectedConversation: id,
        isSidebarOpen: action.closeSidebar ? false : state.isSidebarOpen,
        createFailedForTemp: clearCreateError ? null : state.createFailedForTemp,
      };
    }
    case "setSidebar":
      return { ...state, isSidebarOpen: action.open };
    case "startTempConversation": {
      const temp = createTempConversation();
      return {
        ...state,
        tempConversations: [...state.tempConversations, temp],
        selectedConversation: temp.id,
        isSidebarOpen: false,
      };
    }
    case "createSuccess": {
      const { newConv, selectedConversationId, tempId, pendingMessage, senderId } = action;
      const nextTemp = state.tempConversations.filter((c) => !c.id.startsWith(TEMP_PREFIX));

      const nextMessages: Record<string, IMessage[]> = { ...state.allMessages };
      for (const key of Object.keys(nextMessages)) {
        if (key.startsWith(TEMP_PREFIX)) {
          delete nextMessages[key];
        }
      }
      if (tempId?.startsWith(TEMP_PREFIX) && pendingMessage) {
        const now = new Date().toISOString();
        nextMessages[selectedConversationId] = [
          {
            id: selectedConversationId,
            conversationId: selectedConversationId,
            senderId,
            content: pendingMessage,
            contentType: "text",
            status: "sent",
            deletedAt: null,
            createdAt: now,
            updatedAt: now,
          },
        ];
      }

      return {
        ...state,
        createdConversations: [...state.createdConversations, newConv],
        tempConversations: nextTemp,
        allMessages: nextMessages,
        selectedConversation: selectedConversationId,
      };
    }
    case "createError":
      return { ...state, createFailedForTemp: action.tempId };
    case "clearCreateError":
      return { ...state, createFailedForTemp: null };
    default:
      return state;
  }
}

interface UseChatControllerArgs {
  conversations: IConversation[];
}

export function useChatController({ conversations }: UseChatControllerArgs) {
  const dispatch = useDispatch();
  const createState = useSelector(createConversationSelector);
  const createMessageState = useSelector(createMessageSelector);
  const messagesState = useSelector(messagesSelector);
  const { status: conversationsStatus } = useSelector(conversationsSelector);
  const { data: userInfo } = useSelector(userInfoSelector);

  const pendingCreateMessageRef = useRef<string | null>(null);

  const [local, dispatchLocal] = useReducer(chatLocalReducer, { conversations }, (init) =>
    createInitialState(init.conversations)
  );

  const mergedConversations = useMemo(() => {
    const byId = new Map<string, IConversation>();
    for (const c of conversations) {
      byId.set(c.id, c);
    }
    for (const c of local.createdConversations) {
      if (!byId.has(c.id)) byId.set(c.id, c);
    }
    for (const c of local.tempConversations) {
      if (!byId.has(c.id)) byId.set(c.id, c);
    }
    return [...byId.values()];
  }, [conversations, local.createdConversations, local.tempConversations]);

  const selectedConversation = local.selectedConversation;
  const currentConversation = mergedConversations.find((conv) => conv.id === selectedConversation);

  const currentMessages = useMemo((): IMessage[] => {
    if (!selectedConversation) return [];
    if (selectedConversation.startsWith(TEMP_PREFIX)) {
      return local.allMessages[selectedConversation] ?? [];
    }
    return (messagesState.items as IMessage[]) ?? [];
  }, [selectedConversation, messagesState.items, local.allMessages]);

  const isTempSelected = selectedConversation?.startsWith(TEMP_PREFIX) ?? false;
  const isFirstMessageForTemp = isTempSelected && currentMessages.length === 0;
  const isCreatingConversation = isTempSelected && createState.status === LOADING_STATUS.LOADING;
  const isSendingMessage = createMessageState.status === LOADING_STATUS.LOADING;
  const showCreateError = isTempSelected && local.createFailedForTemp === selectedConversation;
  const isLoadingMessages =
    !isTempSelected && Boolean(selectedConversation) && messagesState.status === LOADING_STATUS.LOADING;
  const isShowCreateMessage = conversations?.length === 0 && conversationsStatus === LOADING_STATUS.SUCCESS;

  useEffect(() => {
    if (!userInfo?.id) return;
    const body: SubscribeBody<{ userId: string }> = {
      topicKey: topicKeys.chat_conversations_private,
      topicType: topicTypes.private,
      params: {
        userId: userInfo?.id,
      },
    };

    const handleSubscribe = async () => {
      const token = await get(NEXT_API_PERMISSION_ACCESS_ENDPOINT);
      if (token.code !== 200 || !token?.data) {
        return;
      }
      body.token = token?.data || "";

      socketService.subscribe<SubscribeBody<{ userId: string }>, SubscribeResponse>(body);
    };
    handleSubscribe();
    socketService.on(eventKeys.conversations, (data: ConversationSocketData) => {
      if (data.type === "unread") {
        dispatch(
          updateUnreadCount({
            id: data.conversationId,
            unreadCount: data.unreadCount ?? 0,
          })
        );
      }
      if (data.type === "joinConversation") {
        dispatch(
          updateConversationAction({
            id: data.conversationId,
            agentIds: data.agentIds ?? [],
          })
        );
      }
    });
    return () => {
      socketService.unsubscribe(body);
    };
  }, [userInfo?.id, dispatch]);

  useEffect(() => {
    if (!selectedConversation) return;
    const body: SubscribeBody<{ conversationId: string }> = {
      topicKey: topicKeys.chat_conversation_private,
      topicType: topicTypes.private,
      params: {
        conversationId: selectedConversation,
      },
    };

    const handleSubscribe = async () => {
      const token = await get(NEXT_API_PERMISSION_ACCESS_ENDPOINT);
      if (token.code !== 200 || !token?.data) {
        return;
      }
      body.token = token?.data || "";
      socketService.subscribe<SubscribeBody<{ conversationId: string }>, SubscribeResponse>(body);
    };
    handleSubscribe();
    socketService.on(eventKeys.conversation, (data: { conversationId: string; message: IMessage }) => {
      if (data.conversationId !== selectedConversation) return;
      dispatch(updateMessageFromSocket(data.message));
    });
    return () => {
      socketService.unsubscribe(body);
    };
  }, [selectedConversation, dispatch]);

  useEffect(() => {
    if (createState.status !== LOADING_STATUS.SUCCESS || !createState.data) return;

    const newConv = createState.data;
    const selectedConversationId = newConv.id;
    if (!selectedConversationId) return;

    const tempId = selectedConversation;
    const pendingMessage = pendingCreateMessageRef.current;

    queueMicrotask(() => {
      dispatchLocal({
        type: "createSuccess",
        newConv,
        selectedConversationId,
        tempId,
        pendingMessage,
        senderId: userInfo?.id ?? "",
      });
      pendingCreateMessageRef.current = null;
      dispatch(resetCreateConversationState());
    });
  }, [createState.status, createState.data, selectedConversation, userInfo?.id, dispatch]);

  useEffect(() => {
    if (createState.status !== LOADING_STATUS.ERROR) return;
    queueMicrotask(() => {
      dispatchLocal({ type: "createError", tempId: selectedConversation });
      dispatch(resetCreateConversationState());
    });
  }, [createState.status, dispatch, selectedConversation]);

  useEffect(() => {
    queueMicrotask(() => {
      if (!isTempSelected) dispatchLocal({ type: "clearCreateError" });
    });
  }, [isTempSelected]);

  const handleStartConversation = useCallback(() => {
    dispatchLocal({ type: "startTempConversation" });
  }, []);

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!selectedConversation) return;

      if (isFirstMessageForTemp) {
        pendingCreateMessageRef.current = content;
        dispatchLocal({ type: "clearCreateError" });
        dispatch(createConversationAction({ source: "support", message: content }));
        return;
      }
      dispatch(
        createMessageAction({
          conversationId: selectedConversation,
          senderId: userInfo?.id ?? "",
          content,
          contentType: "text",
        })
      );
    },
    [dispatch, isFirstMessageForTemp, selectedConversation, userInfo?.id]
  );

  const selectConversation = useCallback((id: string, options?: { closeSidebar?: boolean }) => {
    dispatchLocal({ type: "select", id, closeSidebar: options?.closeSidebar });
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    dispatchLocal({ type: "setSidebar", open });
  }, []);

  const clearCreateError = useCallback(() => {
    dispatchLocal({ type: "clearCreateError" });
  }, []);

  return {
    mergedConversations,
    currentConversation,
    currentMessages,
    selectedConversation,
    userInfo,
    isSidebarOpen: local.isSidebarOpen,
    isTempSelected,
    isFirstMessageForTemp,
    isCreatingConversation,
    isSendingMessage,
    showCreateError,
    isLoadingMessages,
    isShowCreateMessage,
    messagesState,
    handleStartConversation,
    handleSendMessage,
    selectConversation,
    setSidebarOpen,
    clearCreateError,
    dispatch,
    conversations,
  };
}
