import { configureStore } from "@reduxjs/toolkit";
import isConnectedSlice from "./isConnectedSlice";

export const store = configureStore({
  reducer: { isConnected: isConnectedSlice },
});
