import { configureStore } from "@reduxjs/toolkit";

import LoginSliceReducer from "./LoginSlice";
import CustomerSliceReducer from "./CustomerSlice";

export const Store = configureStore({
  reducer: {
    LoginSlice: LoginSliceReducer,
    CustomerSlice: CustomerSliceReducer,
  },
  middleware: (getDefault) => getDefault(),
});

export default Store;
