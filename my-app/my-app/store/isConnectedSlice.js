import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: false,
};

export const isConnectedSlice = createSlice({
  name: "isConnected",
  initialState,
  reducers: {
    changeAddMemberToFalse: (state) => {
      state.value = false;
    },
    changeAddMemberToTrue: (state) => {
      state.value = true;
    },
  },
});

// Action creators are generated for each case reducer function
export const { changeAddMemberToFalse, changeAddMemberToTrue } =
  isConnectedSlice.actions;

export default isConnectedSlice.reducer;
