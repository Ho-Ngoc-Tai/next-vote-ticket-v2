import { LOADING_STATUS } from "@constants/status";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "@stores/index";

export const uploadSlice = createSlice({
  name: "upload",
  initialState: {
    upload: {
      status: LOADING_STATUS.IDLE,
      params: null,
      data: [],
      error: null,
    },
  },
  reducers: {
    uploadAction: (state, action) => {
      state.upload.status = LOADING_STATUS.LOADING;
      state.upload.params = action.payload;
    },
    uploadSuccessAction: (state, action) => {
      state.upload.status = LOADING_STATUS.SUCCESS;
      state.upload.data = action.payload;
    },
    uploadErrorAction: (state, action) => {
      state.upload.status = LOADING_STATUS.ERROR;
      state.upload.error = action.payload;
    },
    resetStateUpload: (state) => {
      state.upload.status = LOADING_STATUS.IDLE;
    },
  },
});

export const uploadReducer = uploadSlice.reducer;
export const { uploadAction, uploadSuccessAction, uploadErrorAction, resetStateUpload } = uploadSlice.actions;

export const makeUpload = (state: RootState) => state.upload;
