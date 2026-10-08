import { combineReducers } from "@reduxjs/toolkit";
import { authReducer, authSlice } from "./auth";
import { chatReducer, chatSlice } from "./chat";
import { commentReducer, commentsSlice } from "./comments";
import { ticketReducer, ticketsSlice } from "./tickets";
import { uploadReducer, uploadSlice } from "./upload";

const rootReducer = combineReducers({
  // auth
  [authSlice.name]: authReducer,
  [ticketsSlice.name]: ticketReducer,
  [uploadSlice.name]: uploadReducer,
  [commentsSlice.name]: commentReducer,
  [chatSlice.name]: chatReducer,
});

export default rootReducer;
