import { post } from "@commons/ajax/client";
import { PayloadAction } from "@reduxjs/toolkit";
import { NEXT_API_UPLOAD_ENDPOINT } from "@routes/next.api";

import { uploadAction, uploadErrorAction, uploadSuccessAction } from "@stores/reducers/upload";
import { call, put, takeLatest } from "redux-saga/effects";

function* callApiUploadAction(action: PayloadAction): Generator<any, void, unknown> {
  try {
    const payload = action.payload;
    const response: any = yield call(post, NEXT_API_UPLOAD_ENDPOINT, payload);

    if (response.code === 200 && response.data?.medias?.length > 0) {
      const processedUrls = response.data.medias.map((media: any) => {
        if (media.path) {
          return media.path;
        }
        return media.path;
      });
      yield put(uploadSuccessAction(processedUrls));
      return processedUrls;
    }
    yield put(uploadErrorAction("Upload failed"));
  } catch (error: any) {
    yield put(uploadErrorAction(error?.message || "Upload failed"));
  }
}
export default function* uploadSaga() {
  yield takeLatest(uploadAction.type, callApiUploadAction);
}
