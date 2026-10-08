import { get, post, put as putRequest } from "@commons/ajax/client";
import { BaseApiResponse, FetchDataArgs } from "@interfaces/base";
import {
  CreateTicketRequest,
  MyTicket,
  Ticket,
  TicketStatusCount,
  UpdateTicketRequest,
} from "@interfaces/tickets/index";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  NEXT_MY_TICKET_STATUS_COUNT_ENDPOINT,
  NEXT_TICKET_CATEGORIES_ENDPOINT,
  NEXT_TICKET_CREATE_ENDPOINT,
  NEXT_TICKET_DETAIL_ENDPOINT,
  NEXT_TICKET_LIST_ENDPOINT,
  NEXT_TICKET_LIST_MY_TICKETS_ENDPOINT,
  NEXT_TICKET_STATUS_COUNT_ENDPOINT,
  NEXT_TICKET_UPDATE_ENDPOINT,
} from "@routes/next.api";
import {
  createTicketAction,
  createTicketFailure,
  createTicketSuccess,
  getMyTicketsAction,
  getMyTicketsFailure,
  getMyTicketsSuccess,
  getTicketCategoriesAction,
  getTicketCategoriesFailure,
  getTicketCategoriesSuccess,
  getTicketDetailAction,
  getTicketDetailFailure,
  getTicketDetailSuccess,
  getTicketsAction,
  getTicketsFailure,
  getTicketsSuccess,
  getTicketStatusCountAction,
  getTicketStatusCountFailure,
  getTicketStatusCountSuccess,
  updateTicketAction,
  updateTicketFailure,
  updateTicketSuccess,
} from "@stores/reducers/tickets";
import { all, call, put, takeLatest } from "redux-saga/effects";

function* callApiGetTickets(
  action: PayloadAction<FetchDataArgs & { search?: string; status?: string; category?: string }>
): Generator<unknown, void, BaseApiResponse<Ticket[]>> {
  try {
    const response: BaseApiResponse<Ticket[]> = yield call(get, NEXT_TICKET_LIST_ENDPOINT, action.payload);
    if (response?.code === 200 && response?.data) {
      yield put(getTicketsSuccess({ items: response.data ?? [], total: response.meta?.total ?? 0 }));
    } else {
      yield put(getTicketsFailure(response));
    }
  } catch (error: unknown) {
    yield put(getTicketsFailure(error));
  }
}

function* callApiGetTicketStatusCount(
  action: PayloadAction<{ isGeneral: boolean | undefined }>
): Generator<unknown, void, BaseApiResponse<TicketStatusCount>> {
  try {
    // const isMy = action.type === getMyTicketStatusCountAction.type;
    const endpoint =
      action.payload.isGeneral === true ? NEXT_TICKET_STATUS_COUNT_ENDPOINT : NEXT_MY_TICKET_STATUS_COUNT_ENDPOINT;
    const response: BaseApiResponse<TicketStatusCount> = yield call(get, endpoint);
    if (response?.code === 200 && response?.data) {
      yield put(getTicketStatusCountSuccess(response.data));
    } else {
      yield put(getTicketStatusCountFailure(response));
    }
  } catch (error: unknown) {
    yield put(getTicketStatusCountFailure(error));
  }
}

function* callApiGetMyTickets(
  action: PayloadAction<FetchDataArgs & { search?: string; status?: string; category?: string }>
): Generator<unknown, void, BaseApiResponse<MyTicket[]>> {
  try {
    const response: BaseApiResponse<MyTicket[]> = yield call(get, NEXT_TICKET_LIST_MY_TICKETS_ENDPOINT, action.payload);
    if (response?.code === 200 && response?.data) {
      yield put(getMyTicketsSuccess({ items: response.data ?? [], total: response.meta?.total ?? 0 }));
      return;
    }
    yield put(getMyTicketsFailure(response));
  } catch (error: unknown) {
    yield put(getMyTicketsFailure(error));
  }
}

function* callApiGetTicketDetail(action: PayloadAction<{ id: string }>): Generator<any, void, unknown> {
  try {
    const { id } = action.payload;
    const endpoint = NEXT_TICKET_DETAIL_ENDPOINT(id);
    const response: any = yield call(get, endpoint);
    if (response.code === 200) {
      yield put(getTicketDetailSuccess(response.data));
    } else {
      yield put(getTicketDetailFailure(response));
    }
  } catch (error: any) {
    yield put(getTicketDetailFailure(error?.data || error));
  }
}

function* callApiCreateTicket(action: PayloadAction<CreateTicketRequest>): Generator<any, void, unknown> {
  try {
    const response: any = yield call(post, NEXT_TICKET_CREATE_ENDPOINT, action.payload);
    if (response.code === 200) {
      yield put(createTicketSuccess(response.data));
    } else {
      yield put(createTicketFailure(response.error || "Failed to create ticket"));
    }
  } catch (error: any) {
    yield put(createTicketFailure(error?.data || error));
  }
}

function* callApiUpdateTicket(action: PayloadAction<UpdateTicketRequest>): Generator<any, void, BaseApiResponse<null>> {
  try {
    const { id, ...payload } = action.payload;
    const endpoint = NEXT_TICKET_UPDATE_ENDPOINT(id);
    const response: BaseApiResponse<null> = yield call(putRequest, endpoint, payload);
    if (response.code === 200) {
      yield put(updateTicketSuccess(action.payload));
    } else {
      yield put(updateTicketFailure(response || "Failed to update ticket"));
    }
  } catch (error: any) {
    yield put(updateTicketFailure(error?.data || error));
  }
}

function* callApiGetTicketCategories(): Generator<any, void, unknown> {
  try {
    const endpoint = NEXT_TICKET_CATEGORIES_ENDPOINT;
    const response: any = yield call(get, endpoint);
    if (response.code === 200) {
      yield put(getTicketCategoriesSuccess(response.data));
    } else {
      yield put(getTicketCategoriesFailure(response));
    }
  } catch (error: any) {
    yield put(getTicketCategoriesFailure(error?.data || error));
  }
}

export default function* ticketsSaga() {
  yield all([
    takeLatest(getTicketsAction.type, callApiGetTickets),
    takeLatest(getMyTicketsAction.type, callApiGetMyTickets),
    takeLatest(getTicketStatusCountAction.type, callApiGetTicketStatusCount),

    takeLatest(createTicketAction.type, callApiCreateTicket),
    takeLatest(updateTicketAction.type, callApiUpdateTicket),
    takeLatest(getTicketDetailAction.type, callApiGetTicketDetail),
    takeLatest(getTicketCategoriesAction.type, callApiGetTicketCategories),
  ]);
}
