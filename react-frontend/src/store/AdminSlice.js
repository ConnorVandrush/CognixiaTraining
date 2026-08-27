import { createSlice } from "@reduxjs/toolkit";

const AdminSlice = createSlice({
  name: "AdminSlice",

  initialState: {
    selectedTab: "branches",
    branches: [],
    customers: [],
    accounts: [],
    branchSearch: null,
    customerSearch: null,
    accountSearch: null,
  },

  reducers: {
    setSelectedTab(state, action) {
      state.selectedTab = action.payload;
    },

    setBranches(state, action) {
      state.branches = action.payload;
    },

    setCustomers(state, action) {
      state.customers = action.payload;
    },

    setAccounts(state, action) {
      state.accounts = action.payload;
    },

    updateBranch(state, action) {
      const updatedBranch = action.payload;

      const index = state.branches.findIndex(
        (branch) => branch._id === updatedBranch._id,
      );

      if (index !== -1) {
        state.branches[index] = updatedBranch;
      }
    },

    removeBranch(state, action) {
      state.branches = state.branches.filter(
        (branch) => branch._id !== action.payload,
      );
    },

    setBranchSearch(state, action) {
      state.branchSearch = action.payload;
    },

    setCustomerSearch(state, action) {
      state.customerSearch = action.payload;
    },

    setAccountSearch(state, action) {
      state.accountSearch = action.payload;
    },
  },
});

export const {
  setSelectedTab,
  setAccounts,
  setBranches,
  setCustomers,
  updateBranch,
  removeBranch,
  setAccountSearch,
  setBranchSearch,
  setCustomerSearch,
} = AdminSlice.actions;

export default AdminSlice.reducer;
