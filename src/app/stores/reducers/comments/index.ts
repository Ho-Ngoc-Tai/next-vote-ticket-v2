import { LOADING_STATUS } from "@constants/status";
import { BaseReducerState } from "@interfaces/base/";
import { Comment, CommentListResponse, CreateCommentRequest } from "@interfaces/tickets/index";
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@stores/index";

interface CommentsState {
  list: BaseReducerState<Comment, { ticketId: string; page: number; limit: number; append?: boolean }>;
  create: BaseReducerState<Comment, CreateCommentRequest>;
  replies: Record<
    string,
    BaseReducerState<Comment, { commentId: string; page: number; limit: number; append?: boolean }>
  >;
}

const initialState = {
  status: LOADING_STATUS.IDLE,
  items: [],
  error: null,
  params: { page: 1, limit: 20 },
  total: 0,
};

const initialStates: CommentsState = {
  list: { ...initialState, params: { ticketId: "", page: 1, limit: 20, append: false } },
  create: { ...initialState, data: null as unknown as Comment, params: {} as CreateCommentRequest },
  replies: {},
};

const initialRepliesState = {
  status: LOADING_STATUS.IDLE,
  items: [],
  error: null,
  params: { commentId: "", page: 1, limit: 10, append: false },
  total: 0,
};

export const commentsSlice = createSlice({
  name: "comments",
  initialState: initialStates,
  reducers: {
    getCommentsAction: (
      state,
      action: PayloadAction<{ ticketId: string; page?: number; limit?: number; append?: boolean }>
    ) => {
      state.list.status = LOADING_STATUS.LOADING;
      state.list.error = null;
      state.list.params = {
        ticketId: action.payload.ticketId,
        page: action.payload.page || 1,
        limit: action.payload.limit || 20,
        append: Boolean(action.payload.append),
      };
    },
    getCommentsSuccess: (state, action: PayloadAction<CommentListResponse>) => {
      state.list.status = LOADING_STATUS.SUCCESS;
      const incomingItems = action.payload?.data ?? [];
      state.list.items = state.list.params.append ? [...state.list.items, ...incomingItems] : incomingItems;
      state.list.total = action.payload?.meta?.total ?? 0;
      state.list.error = null;
    },
    getCommentsFailure: (state, action) => {
      state.list.status = LOADING_STATUS.ERROR;
      state.list.items = [];
      state.list.total = 0;
      state.list.error = action.payload;
    },
    resetCommentsState: (state) => {
      state.list = {
        status: LOADING_STATUS.IDLE,
        items: [],
        error: null,
        params: { ticketId: "", page: 1, limit: 20, append: false },
        total: 0,
      };
    },
    createCommentAction: (state, action: PayloadAction<CreateCommentRequest>) => {
      state.create.status = LOADING_STATUS.LOADING;
      state.create.error = null;
      state.create.params = action.payload;
    },
    createCommentSuccess: (state, action: PayloadAction<Comment>) => {
      state.create.status = LOADING_STATUS.SUCCESS;
      state.create.data = action.payload;
      state.create.error = null;

      const parentId = action.payload.parentId;
      if (parentId) {
        const current = state.replies[parentId];
        if (!current) {
          state.replies[parentId] = {
            status: LOADING_STATUS.SUCCESS,
            items: [action.payload],
            error: null,
            params: { commentId: parentId, page: 1, limit: 10, append: false },
            total: 1,
          };
        } else {
          current.items.push(action.payload);
          current.total += 1;
        }
      } else {
        state.list.items.push(action.payload);
        state.list.total += 1;
      }
    },
    createCommentFailure: (state, action) => {
      state.create.status = LOADING_STATUS.ERROR;
      state.create.error = action.payload;
    },
    resetCreateCommentState: (state) => {
      state.create = {
        status: LOADING_STATUS.IDLE,
        items: [],
        total: 0,
        data: null as unknown as Comment,
        error: null,
        params: {} as CreateCommentRequest,
      };
    },

    getCommentRepliesAction: (
      state,
      action: PayloadAction<{ commentId: string; page?: number; limit?: number; append?: boolean }>
    ) => {
      const { commentId } = action.payload;
      const current = state.replies[commentId] ?? {
        ...initialRepliesState,
        params: { ...initialRepliesState.params, commentId },
      };

      state.replies[commentId] = {
        ...current,
        status: LOADING_STATUS.LOADING,
        error: null,
        params: {
          commentId,
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          append: Boolean(action.payload.append),
        },
      };
    },
    getCommentRepliesSuccess: (state, action: PayloadAction<{ commentId: string; response: CommentListResponse }>) => {
      const { commentId, response } = action.payload;
      const current = state.replies[commentId] ?? {
        ...initialRepliesState,
        params: { ...initialRepliesState.params, commentId },
      };

      const incoming = Array.isArray(response?.data) ? response.data : ((response as any)?.data?.items ?? []);

      state.replies[commentId] = {
        ...current,
        status: LOADING_STATUS.SUCCESS,
        items: current.params.append ? [...current.items, ...incoming] : incoming,
        total: (response as any)?.meta?.total ?? (response as any)?.data?.total ?? 0,
        error: null,
      };
    },
    getCommentRepliesFailure: (state, action: PayloadAction<{ commentId: string; error: unknown }>) => {
      const { commentId, error } = action.payload;
      const current = state.replies[commentId] ?? {
        ...initialRepliesState,
        params: { ...initialRepliesState.params, commentId },
      };

      state.replies[commentId] = {
        ...current,
        status: LOADING_STATUS.ERROR,
        error,
      };
    },
    resetCommentRepliesState: (state, action: PayloadAction<{ commentId: string }>) => {
      delete state.replies[action.payload.commentId];
    },
  },
});

export const commentReducer = commentsSlice.reducer;
export const {
  getCommentsAction,
  getCommentsSuccess,
  getCommentsFailure,
  resetCommentsState,
  createCommentAction,
  createCommentSuccess,
  createCommentFailure,
  resetCreateCommentState,
  getCommentRepliesAction,
  getCommentRepliesSuccess,
  getCommentRepliesFailure,
  resetCommentRepliesState,
} = commentsSlice.actions;

// selectors
const selectState = (state: RootState) => state.comments;

export const commentsSelector = createSelector(selectState, (state) => state.list);
export const createCommentSelector = createSelector(selectState, (state) => state.create);
export const commentRepliesSelector = (commentId: string) =>
  createSelector(selectState, (state) => state.replies[commentId]);
