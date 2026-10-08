import { all } from "redux-saga/effects";
import authSaga from "./auth";
import chatSaga from "./chat";
import commentsSaga from "./comments";
import ticketsSaga from "./tickets";
import uploadSaga from "./upload";

function* rootSaga() {
  yield all([authSaga(), ticketsSaga(), uploadSaga(), commentsSaga(), chatSaga()]);
}
export default rootSaga;
