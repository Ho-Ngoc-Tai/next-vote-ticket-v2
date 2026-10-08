import { LOADING_STATUS } from "@constants/status";
import { BaseReducerState, FetchDataArgs } from "@interfaces/base/";
import {
  CreateTicketRequest,
  MyTicket,
  Ticket,
  TicketCategory,
  TicketDetail,
  TicketStatusCount,
  UpdateTicketRequest,
} from "@interfaces/tickets/index";
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@stores/index";

export type TicketCounts = {
  total: number;
  new: number;
  open: number;
  pending: number;
  resolved: number;
  closed: number;
};

interface TicketsState {
  ticket: BaseReducerState<Ticket>;
  myTickets: BaseReducerState<MyTicket>;
  statusCount: BaseReducerState<TicketStatusCount>;
  createTicket: BaseReducerState<CreateTicketRequest>;
  updateTicket: BaseReducerState<UpdateTicketRequest>;
  detail: BaseReducerState<TicketDetail>;
  categories: BaseReducerState<TicketCategory>;
}

const initialState = {
  status: LOADING_STATUS.IDLE,
  items: [],
  error: null,
  params: { page: 1, limit: 20 },
  total: 0,
};

const initialStates: TicketsState = {
  ticket: initialState,
  myTickets: initialState,
  statusCount: initialState,
  createTicket: initialState,
  updateTicket: initialState,
  detail: { ...initialState, data: {} as TicketDetail, params: {} as FetchDataArgs },
  categories: initialState,
};

export const ticketsSlice = createSlice({
  name: "tickets",
  initialState: initialStates,
  reducers: {
    getTicketStatusCountAction: (state, action: PayloadAction<{ isGeneral: boolean | undefined }>) => {
      state.statusCount.status = LOADING_STATUS.LOADING;
      state.statusCount.params = action.payload;
      state.statusCount.error = null;
    },
    getTicketStatusCountSuccess: (state, action: PayloadAction<TicketStatusCount>) => {
      state.statusCount.status = LOADING_STATUS.SUCCESS;
      state.statusCount.data = action.payload;
      state.statusCount.error = null;
    },
    getTicketStatusCountFailure: (state, action) => {
      state.statusCount.status = LOADING_STATUS.ERROR;
      state.statusCount.data = undefined;
      state.statusCount.error = action.payload;
    },
    resetTicketStatusCountState: (state) => {
      state.statusCount = initialState;
    },

    getTicketsAction: (state, action) => {
      state.ticket.status = LOADING_STATUS.LOADING;
      state.ticket.params = action.payload;
    },
    getTicketsSuccess: (state, action: PayloadAction<{ items: Ticket[]; total: number }>) => {
      state.ticket.status = LOADING_STATUS.SUCCESS;
      state.ticket.items = action.payload?.items ?? [];
      state.ticket.total = action.payload?.total ?? 0;
    },
    getTicketsFailure: (state, action) => {
      state.ticket.status = LOADING_STATUS.ERROR;
      state.ticket.items = [];
      state.ticket.error = action.payload;
    },
    resetTicketsState: (state) => {
      state.ticket = initialState;
    },
    getMyTicketsAction: (state, action) => {
      state.myTickets.status = LOADING_STATUS.LOADING;
      state.myTickets.params = action.payload;
    },
    getMyTicketsSuccess: (state, action: PayloadAction<{ items: MyTicket[]; total: number }>) => {
      state.myTickets.status = LOADING_STATUS.SUCCESS;
      state.myTickets.items = action.payload?.items ?? [];
      state.myTickets.total = action.payload?.total ?? 0;
    },
    getMyTicketsFailure: (state, action) => {
      state.myTickets.status = LOADING_STATUS.ERROR;
      state.myTickets.items = [];
      state.myTickets.error = action.payload;
    },
    resetMyTicketsState: (state) => {
      state.myTickets = initialState;
    },

    createTicketAction: (state, action) => {
      state.createTicket.status = LOADING_STATUS.LOADING;
      state.createTicket.params = action.payload;
    },
    createTicketSuccess: (state, action: PayloadAction<CreateTicketRequest>) => {
      state.createTicket.status = LOADING_STATUS.SUCCESS;
      state.createTicket.data = action.payload;
    },
    createTicketFailure: (state, action) => {
      state.createTicket.status = LOADING_STATUS.ERROR;
      state.createTicket.error = action.payload;
    },
    resetCreateTicketState: (state) => {
      state.createTicket = initialState;
    },
    updateTicketAction: (state, action) => {
      state.updateTicket.status = LOADING_STATUS.LOADING;
      state.updateTicket.params = action.payload;
    },
    updateTicketSuccess: (state, action: PayloadAction<UpdateTicketRequest>) => {
      state.updateTicket.status = LOADING_STATUS.SUCCESS;
      state.updateTicket.data = action.payload;
    },
    updateTicketFailure: (state, action) => {
      state.updateTicket.status = LOADING_STATUS.ERROR;
      state.updateTicket.error = action.payload;
    },
    resetUpdateTicketState: (state) => {
      state.updateTicket = initialState;
    },
    getTicketDetailAction: (state, action: PayloadAction<{ id: string }>) => {
      state.detail.status = LOADING_STATUS.LOADING;
      state.detail.params = action.payload;
    },
    getTicketDetailSuccess: (state, action: PayloadAction<TicketDetail>) => {
      state.detail.status = LOADING_STATUS.SUCCESS;
      state.detail.data = action.payload;
      state.detail.error = null;
    },
    getTicketDetailFailure: (state, action) => {
      state.detail.status = LOADING_STATUS.ERROR;
      state.detail.data = undefined;
      state.detail.error = action.payload;
    },
    resetTicketDetailState: (state) => {
      state.detail = initialState;
    },
    getTicketCategoriesAction: (state) => {
      state.categories.status = LOADING_STATUS.LOADING;
      state.categories.error = null;
    },
    getTicketCategoriesSuccess: (state, action: PayloadAction<TicketCategory[]>) => {
      state.categories.status = LOADING_STATUS.SUCCESS;
      state.categories.items = action.payload;
      state.categories.error = null;
    },
    getTicketCategoriesFailure: (state, action) => {
      state.categories.status = LOADING_STATUS.ERROR;
      state.categories.error = action.payload;
    },
    resetTicketCategoriesState: (state) => {
      state.categories = initialState;
    },
  },
});

export const ticketReducer = ticketsSlice.reducer;
export const {
  getTicketStatusCountAction,
  getTicketStatusCountSuccess,
  getTicketStatusCountFailure,
  resetTicketStatusCountState,
  getTicketsAction,
  getTicketsSuccess,
  getTicketsFailure,
  resetTicketsState,
  getMyTicketsAction,
  getMyTicketsSuccess,
  getMyTicketsFailure,
  resetMyTicketsState,
  createTicketAction,
  createTicketSuccess,
  createTicketFailure,
  resetCreateTicketState,
  updateTicketAction,
  updateTicketSuccess,
  updateTicketFailure,
  resetUpdateTicketState,
  getTicketDetailAction,
  getTicketDetailSuccess,
  getTicketDetailFailure,
  resetTicketDetailState,
  getTicketCategoriesAction,
  getTicketCategoriesSuccess,
  getTicketCategoriesFailure,
  resetTicketCategoriesState,
} = ticketsSlice.actions;

// selectors
const selectState = (state: RootState) => state.tickets;

export const ticketsSelector = createSelector(selectState, (state) => state.ticket);
export const myTicketsSelector = createSelector(selectState, (state) => state.myTickets);
export const ticketStatusCountSelector = createSelector(selectState, (state) => state.statusCount);
export const createTicketSelector = createSelector(selectState, (state) => state.createTicket);
export const updateTicketSelector = createSelector(selectState, (state) => state.updateTicket);
export const ticketDetailSelector = createSelector(selectState, (state) => state.detail);
export const ticketCategoriesSelector = createSelector(selectState, (state) => state.categories);
