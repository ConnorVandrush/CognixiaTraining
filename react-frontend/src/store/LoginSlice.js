import { createSlice } from "@reduxjs/toolkit";

const LoginSlice = createSlice({
  name: "LoginSlice",
  initialState: {
    loginModal: "login",
    header: null,
  },
  reducers: {
    setLoginModal(state, action) {
      state.loginModal = action.payload;
    },
    setHeader(state, action) {
      state.header = action.payload;
    },
    logout(state) {
      state.header = null;
      state.loginModal = "login";
    },
  },
});

export const { setLoginModal, setHeader, logout } = LoginSlice.actions;
export default LoginSlice.reducer;
