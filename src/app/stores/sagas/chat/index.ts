import { get, post } from "@commons/ajax/client";
import { BaseApiResponse, FetchDataArgs } from "@interfaces/base";
import { IConversation, ICreateConversationRequest, ICreateMessageRequest, IMessage } from "@interfaces/chat";

import { PayloadAction } from "@reduxjs/toolkit";
import { NEXT_CHAT_CONVERSATIONS_ENDPOINT, NEXT_CHAT_MESSAGES_ENDPOINT } from "@routes/next.api";
import {
  createConversationAction,
  createConversationFailure,
  createConversationSuccess,
  createMessageAction,
  createMessageFailure,
  createMessageSuccess,
  getConversationsAction,
  getConversationsFailure,
  getConversationsSuccess,
  getMessagesAction,
  getMessagesFailure,
  getMessagesSuccess,
} from "@stores/reducers/chat";

import { all, call, put, takeLatest } from "redux-saga/effects";

function* callApiGetConversations(
  action: PayloadAction<FetchDataArgs & { page?: number; limit?: number }>
): Generator<unknown, void, BaseApiResponse<IConversation[]>> {
  try {
    const response: BaseApiResponse<IConversation[]> = yield call(
      get,
      NEXT_CHAT_CONVERSATIONS_ENDPOINT,
      action.payload
    );
    if (response.code === 200) {
      yield put(
        getConversationsSuccess({
          data: response.data ?? [],
          total: response.meta?.total ?? 0,
        })
      );
    } else {
      yield put(getConversationsFailure(response));
    }
  } catch (error: any) {
    yield put(getConversationsFailure(error?.data || error));
  }
}

function* callApiCreateConversation(
  action: PayloadAction<ICreateConversationRequest>
): Generator<any, void, IConversation> {
  try {
    const response: BaseApiResponse<IConversation> = yield call(post, NEXT_CHAT_CONVERSATIONS_ENDPOINT, action.payload);
    if (response.code === 200 && response.data) {
      yield put(createConversationSuccess(response.data));
    } else {
      yield put(createConversationFailure(response));
    }
  } catch (error: any) {
    yield put(createConversationFailure(error?.data || error));
  }
}

function* callApiGetMessages(
  action: PayloadAction<{ conversationId: string; page?: number; limit?: number }>
): Generator<unknown, void, BaseApiResponse<IMessage[]>> {
  try {
    const response: BaseApiResponse<IMessage[]> = yield call(get, NEXT_CHAT_MESSAGES_ENDPOINT, action.payload);
    if (response.code === 200) {
      yield put(
        getMessagesSuccess({
          data: response.data ?? [],
          total: response.meta?.total ?? 0,
        })
      );
    } else {
      yield put(getMessagesFailure(response));
    }
  } catch (error: any) {
    yield put(getMessagesFailure(error?.data || error));
  }
}

function* callApiCreateMessage(action: PayloadAction<ICreateMessageRequest>): Generator<unknown, void, IMessage> {
  try {
    const response: BaseApiResponse<IMessage> = yield call(post, NEXT_CHAT_MESSAGES_ENDPOINT, action.payload);
    if (response.code === 200 && response.data) {
      yield put(createMessageSuccess(response.data));
    } else {
      yield put(createMessageFailure(response));
    }
  } catch (error: any) {
    yield put(createMessageFailure(error?.data || error));
  }
}

export default function* chatSaga() {
  yield all([
    takeLatest(getConversationsAction.type, callApiGetConversations),
    takeLatest(createConversationAction.type, callApiCreateConversation),
    takeLatest(getMessagesAction.type, callApiGetMessages),
    takeLatest(createMessageAction.type, callApiCreateMessage),
  ]);
}
