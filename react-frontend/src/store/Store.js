import { configureStore } from "@reduxjs/toolkit";

import LoginSliceReducer from "./LoginSlice";
import CustomerSliceReducer from "./CustomerSlice";
import AdminSliceReducer from "./AdminSlice";

export const Store = configureStore({
  reducer: {
    LoginSlice: LoginSliceReducer,
    CustomerSlice: CustomerSliceReducer,
    AdminSlice: AdminSliceReducer,
  },
  middleware: (getDefault) => getDefault(),
});

export default Store;
