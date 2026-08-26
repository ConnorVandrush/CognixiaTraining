import { createSlice } from "@reduxjs/toolkit";

const CustomerSlice = createSlice({
  name: "CustomerSlice",
  initialState: {
    customerInfo: {},
    accountsInfo: [],
    transactions: {},
    selectedTab: null,
  },
  reducers: {
    setCustomerInfo(state, action) {
      state.customerInfo = action.payload;
    },
    setAccountsInfo(state, action) {
      state.accountsInfo = action.payload;
    },
    setSelectedTab(state, action) {
      state.selectedTab = action.payload;
    },
    setTransactions(state, action) {
      state.transactions = action.payload;
    },
  },
});

export const {
  setCustomerInfo,
  setAccountsInfo,
  setSelectedTab,
  setTransactions,
} = CustomerSlice.actions;
export default CustomerSlice.reducer;
