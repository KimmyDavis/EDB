import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    jwt: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, sessionToken } = action.payload;
      if (accessToken) state.jwt = accessToken;
      if (sessionToken) state.token = sessionToken;
    },
    logout: (state, action) => {
      state.token = null;
      state.jwt = null;
    },
  },
});

export default authSlice.reducer;
export const { setCredentials, logout } = authSlice.actions;
export const selectCurrentToken = (state) => state.auth?.token ?? "";
export const selectCurrentJWT = (state) => state.auth?.jwt ?? "";
