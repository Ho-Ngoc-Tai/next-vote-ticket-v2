import { LOADING_STATUS } from "@constants/status";
import { UserInfo } from "@interfaces/auth";
import { createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@stores/index";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    signin: {
      status: LOADING_STATUS.IDLE,
      error: null,
      data: null,
      params: null,
    },
    userInfo: {
      status: LOADING_STATUS.IDLE,
      data: null as UserInfo | null,
      error: null,
      params: null,
    },
    logout: {
      status: LOADING_STATUS.IDLE,
      data: null,
      error: null,
      params: null,
    },
  },
  reducers: {
    getUserInfoAction: (state) => {
      state.userInfo.status = LOADING_STATUS.LOADING;
    },
    getUserInfoSuccess: (state, action) => {
      state.userInfo.status = LOADING_STATUS.SUCCESS;
      state.userInfo.data = action.payload;
    },
    getUserInfoFailure: (state, action) => {
      state.userInfo.status = LOADING_STATUS.ERROR;
      state.userInfo.data = null;
      state.userInfo.error = action.payload;
    },
    signinAction: (state, action) => {
      state.signin.status = LOADING_STATUS.LOADING;
      state.signin.params = action.payload;
    },
    signinSuccess: (state, action) => {
      state.signin.status = LOADING_STATUS.SUCCESS;
      state.signin.data = action.payload;
    },
    signFailure: (state, action) => {
      state.signin.status = LOADING_STATUS.ERROR;
      state.signin.data = null;
      state.signin.error = action.payload;
    },

    resetSigninState: (state) => {
      state.signin = {
        status: LOADING_STATUS.IDLE,
        error: null,
        data: null,
        params: null,
      };
      state.signin = {
        status: LOADING_STATUS.IDLE,
        error: null,
        data: null,
        params: null,
      };
    },
    logoutAction: (state) => {
      state.logout.status = LOADING_STATUS.LOADING;
    },
    logoutSuccess: (state) => {
      state.logout.status = LOADING_STATUS.SUCCESS;
    },
    logoutFailed: (state) => {
      state.logout.status = LOADING_STATUS.ERROR;
    },
    resetLogout: (state) => {
      state.logout = {
        status: LOADING_STATUS.IDLE,
        data: null,
        error: null,
        params: null,
      };
    },
  },
});
export const authReducer = authSlice.reducer;
export const {
  signinAction,
  signinSuccess,
  signFailure,
  resetSigninState,
  getUserInfoAction,
  getUserInfoSuccess,
  getUserInfoFailure,
  logoutAction,
  logoutSuccess,
  logoutFailed,
  resetLogout,
} = authSlice.actions;

// selectors
const selectState = (state: RootState) => state.auth;

export const signinSelector = createSelector(selectState, (state) => state.signin);

export const userInfoSelector = createSelector(selectState, (state) => state.userInfo);

export const userLogoutSelector = createSelector(selectState, (state) => state.logout);
