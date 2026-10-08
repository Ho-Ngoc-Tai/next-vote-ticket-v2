import { get, post } from "@commons/ajax/client";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  getCommentsAction,
  getCommentsSuccess,
  getCommentsFailure,
  createCommentAction,
  createCommentSuccess,
  createCommentFailure,
  getCommentRepliesAction,
  getCommentRepliesSuccess,
  getCommentRepliesFailure,
} from "@stores/reducers/comments";
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import {
  NEXT_COMMENT_LIST_ENDPOINT,
  NEXT_COMMENT_CREATE_ENDPOINT,
  NEXT_COMMENT_REPLIES_ENDPOINT,
} from "@routes/next.api";

function* callApiGetComments(
  action: PayloadAction<{ ticketId: string; page?: number; limit?: number; append?: boolean }>
): Generator<any, void, unknown> {
  try {
    const { ticketId, page, limit } = action.payload;
    const response: any = yield call(get, NEXT_COMMENT_LIST_ENDPOINT(ticketId), {
      page: page,
      limit: limit,
    });
    if (response?.code === 200 && response?.data) {
      yield put(getCommentsSuccess(response));
    } else {
      yield put(getCommentsFailure(response));
    }
  } catch (error: any) {
    yield put(getCommentsFailure(error?.data || error));
  }
}

function* callApiGetCommentReplies(
  action: PayloadAction<{ commentId: string; page?: number; limit?: number; append?: boolean }>
): Generator<any, void, unknown> {
  try {
    const { commentId, page, limit } = action.payload;
    const response: any = yield call(get, NEXT_COMMENT_REPLIES_ENDPOINT(commentId), {
      page: page,
      limit: limit,
    });

    if (response?.code === 200 && response?.data) {
      yield put(getCommentRepliesSuccess({ commentId, response }));
    } else {
      yield put(getCommentRepliesFailure({ commentId, error: response }));
    }
  } catch (error: any) {
    yield put(getCommentRepliesFailure({ commentId: action.payload.commentId, error: error?.data || error }));
  }
}

function* callApiCreateComment(action: PayloadAction<any>): Generator<any, void, unknown> {
  try {
    const payload = action.payload;
    const response: any = yield call(post, NEXT_COMMENT_CREATE_ENDPOINT(payload.ticketId), {
      content: payload.content,
      attachments: payload.attachments,
      parentId: payload.parentId,
    });
    if (response && response.data) {
      yield put(createCommentSuccess(response.data));
      if (payload.parentId) {
        yield put(getCommentRepliesAction({ commentId: payload.parentId }));
      } else {
        yield put(getCommentsAction({ ticketId: payload.ticketId }));
      }
    } else {
      yield put(createCommentFailure(response));
    }
  } catch (error: any) {
    yield put(createCommentFailure(error?.data || error));
  }
}

export default function* commentsSaga() {
  yield takeLatest(getCommentsAction.type, callApiGetComments);
  yield takeLatest(createCommentAction.type, callApiCreateComment);
  yield takeEvery(getCommentRepliesAction.type, callApiGetCommentReplies);
}
