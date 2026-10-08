import { NEXT_LOGIN_ENDPOINT, NEXT_LOGOUT_ENDPOINT, NEXT_USER_INFO_ENDPOINT } from "@routes/next.api";
import { get, post } from "@commons/ajax/client";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  getUserInfoAction,
  getUserInfoFailure,
  getUserInfoSuccess,
  logoutAction,
  logoutFailed,
  logoutSuccess,
  signFailure,
  signinAction,
  signinSuccess,
} from "@stores/reducers/auth";
import { call, put, takeLatest } from "redux-saga/effects";

function* callApiLogin(action: PayloadAction<any>): Generator<any, void, unknown> {
  try {
    const payload = action.payload;
    const response: any = yield call(post, NEXT_LOGIN_ENDPOINT, {
      ...payload,
      //   password: md5(payload.password),
    });
    if (response.code === 200) {
      yield put(signinSuccess(response.data));
    } else {
      yield put(signFailure(response));
    }
  } catch (error: any) {
    yield put(signFailure(error?.data || error));
  }
}

function* callApiGetUserInfo(): Generator<any, void, unknown> {
  try {
    const response: any = yield call(get, NEXT_USER_INFO_ENDPOINT);
    if (response.code === 200) {
      yield put(getUserInfoSuccess(response.data));
    } else {
      yield put(getUserInfoFailure(response));
    }
  } catch (error: any) {
    yield put(getUserInfoFailure(error?.data || error));
  }
}

function* callApiLogout(): Generator<any, void, unknown> {
  try {
    const response: any = yield call(post, NEXT_LOGOUT_ENDPOINT, {});
    if (response.code === 200) {
      yield put(logoutSuccess(response.data));
    } else {
      yield put(logoutFailed(response));
    }
  } catch (error: any) {
    yield put(logoutFailed(error?.data || error));
  }
}

export default function* authSaga() {
  // Define your auth sagas here
  yield takeLatest(signinAction.type, callApiLogin);
  yield takeLatest(getUserInfoAction.type, callApiGetUserInfo);
  yield takeLatest(logoutAction.type, callApiLogout);
}
