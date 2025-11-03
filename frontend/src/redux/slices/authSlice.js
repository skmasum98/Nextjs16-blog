import { createSlice } from "@reduxjs/toolkit";

// Load user from localStorage if exists
const user =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;

const initialState = {
  userInfo: user,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.userInfo = action.payload;
      state.error = null;

      if (typeof window !== "undefined") {
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
      }
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.userInfo = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("userInfo");
      }
    },
    logout: (state) => {
      state.userInfo = null;
      state.loading = false;
      state.error = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("userInfo");
      }
    },
  },
});

export const { authRequest, authSuccess, authFailure, logout } =
  authSlice.actions;
export default authSlice.reducer;
