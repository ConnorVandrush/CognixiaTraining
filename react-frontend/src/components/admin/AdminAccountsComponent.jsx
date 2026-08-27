import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

import styles from "./AdminAccountsComponent.module.css";

import {
  setAccounts,
  setCustomers,
  setBranches,
  setAccountSearch,
  setBranchSearch,
  setSelectedTab,
} from "../../store/AdminSlice";

export default function AdminAccountsComponent() {
  const dispatch = useDispatch();

  const token = localStorage.getItem("token");

  const accounts = useSelector((state) => state.AdminSlice.accounts);
  const customers = useSelector((state) => state.AdminSlice.customers);
  const branches = useSelector((state) => state.AdminSlice.branches);

  const accountSearch = useSelector((state) => state.AdminSlice.accountSearch);

  const [expandedAccount, setExpandedAccount] = useState(null);

  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const [creating, setCreating] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [message, setMessage] = useState(null);

  // =========================
  // CREATE ACCOUNT FORM
  // =========================

  const [createForm, setCreateForm] = useState({
    customerId: "",
    branchId: "",
    type: "CHECKING",
    balance: "",
  });

  // =========================
  // FETCH ACCOUNTS
  // =========================

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      try {
        const [accountRes, customerRes, branchRes] = await Promise.all([
          fetch("http://localhost:8080/api/v1/accounts", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("http://localhost:8080/api/v1/customers/admin/all", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("http://localhost:8080/api/v1/branches", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        // =========================
        // ACCOUNTS
        // =========================

        let accountData = null;

        try {
          accountData = await accountRes.json();
        } catch {
          accountData = null;
        }

        if (accountRes.status !== 204 && !accountRes.ok) {
          setMessage({
            type: "error",
            text: accountData?.message || "Unable to load accounts.",
          });

          return;
        }

        const accountList = Array.isArray(accountData)
          ? accountData
          : Array.isArray(accountData?.data)
            ? accountData.data
            : [];

        dispatch(setAccounts(accountList));

        // =========================
        // CUSTOMERS
        // =========================

        let customerData = null;

        try {
          customerData = await customerRes.json();
        } catch {
          customerData = null;
        }

        if (!customerRes.ok) {
          setMessage({
            type: "error",
            text: customerData?.message || "Unable to load customers.",
          });

          return;
        }

        const customerList = Array.isArray(customerData)
          ? customerData
          : Array.isArray(customerData?.data)
            ? customerData.data
            : [];

        dispatch(setCustomers(customerList));

        // =========================
        // BRANCHES
        // =========================

        let branchData = null;

        try {
          branchData = await branchRes.json();
        } catch {
          branchData = null;
        }

        if (!branchRes.ok) {
          setMessage({
            type: "error",
            text: branchData?.message || "Unable to load branches.",
          });

          return;
        }

        const branchList = Array.isArray(branchData)
          ? branchData
          : Array.isArray(branchData?.data)
            ? branchData.data
            : [];

        dispatch(setBranches(branchList));
      } catch {
        setMessage({
          type: "error",
          text: "Network error while loading accounts.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dispatch, token]);

  // =========================
  // FIND CUSTOMER
  // =========================

  function getCustomer(customerId) {
    return customers.find(
      (customer) => String(customer._id) === String(customerId),
    );
  }

  // =========================
  // FIND BRANCH
  // =========================

  function getBranch(branchId) {
    return branches.find((branch) => String(branch._id) === String(branchId));
  }

  // =========================
  // GO TO BRANCH
  // =========================

  function goToBranch(branchId) {
    const branch = getBranch(branchId);

    if (!branch) {
      return;
    }

    dispatch(setBranchSearch(String(branch._id)));
    dispatch(setSelectedTab("branches"));
  }

  // =========================
  // FILTER ACCOUNTS
  // =========================

  const filteredAccounts = accounts.filter((account) => {
    const search = (accountSearch || "").trim().toLowerCase();

    if (!search) {
      return true;
    }

    return String(account._id).toLowerCase().includes(search);
  });

  // =========================
  // CLEAR ACCOUNT SEARCH
  // =========================

  function clearAccountSearch() {
    dispatch(setAccountSearch(""));
  }

  // =========================
  // CLOSE EXPANDED ACCOUNT
  // IF IT IS FILTERED OUT
  // =========================

  useEffect(() => {
    if (!expandedAccount) {
      return;
    }

    const stillVisible = filteredAccounts.some(
      (account) => account._id === expandedAccount,
    );

    if (!stillVisible) {
      setExpandedAccount(null);
      setTransactions([]);
    }
  }, [accountSearch, expandedAccount, filteredAccounts]);

  // =========================
  // CREATE FORM CHANGE
  // =========================

  function handleCreateChange(e) {
    const { name, value } = e.target;

    setCreateForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // =========================
  // CREATE ACCOUNT
  // =========================

  async function handleCreateAccount(e) {
    e.preventDefault();

    setMessage(null);

    if (!createForm.customerId || !createForm.branchId || !createForm.type) {
      setMessage({
        type: "error",
        text: "Customer, branch, and account type are required.",
      });

      return;
    }

    const balance = createForm.balance === "" ? 0 : Number(createForm.balance);

    if (Number.isNaN(balance) || balance < 0) {
      setMessage({
        type: "error",
        text: "Balance must be a valid number greater than or equal to 0.",
      });

      return;
    }

    setCreating(true);

    try {
      const res = await fetch("http://localhost:8080/api/v1/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: createForm.customerId,
          branchId: createForm.branchId,
          type: createForm.type,
          balance,
        }),
      });

      let data = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data?.message || "Failed to create account.",
        });

        return;
      }

      const newAccount = data?.data || data;

      dispatch(setAccounts([...accounts, newAccount]));

      setMessage({
        type: "success",
        text: "Account created successfully.",
      });

      setCreateForm({
        customerId: "",
        branchId: "",
        type: "CHECKING",
        balance: "",
      });

      setShowCreateForm(false);
    } catch {
      setMessage({
        type: "error",
        text: "Network error while creating account.",
      });
    } finally {
      setCreating(false);
    }
  }

  // =========================
  // GET ACCOUNT TRANSACTIONS
  // =========================

  async function loadTransactions(accountId) {
    setLoadingTransactions(true);
    setTransactions([]);

    try {
      const res = await fetch("http://localhost:8080/api/v1/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (res.status === 204) {
        setTransactions([]);
        return;
      }

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data?.message || "Unable to load transactions.",
        });

        return;
      }

      const transactionList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      const accountTransactions = transactionList.filter(
        (transaction) =>
          String(transaction.fromAccountId) === String(accountId) ||
          String(transaction.toAccountId) === String(accountId),
      );

      setTransactions(accountTransactions);
    } catch {
      setMessage({
        type: "error",
        text: "Network error while loading transactions.",
      });
    } finally {
      setLoadingTransactions(false);
    }
  }

  // =========================
  // TOGGLE ACCOUNT
  // =========================

  function toggleAccount(accountId) {
    if (expandedAccount === accountId) {
      setExpandedAccount(null);
      setTransactions([]);
      return;
    }

    setExpandedAccount(accountId);
    loadTransactions(accountId);
  }

  // =========================
  // DELETE ACCOUNT
  // =========================

  async function handleDeleteAccount(account) {
    const balance = Number(account.balance);

    if (balance !== 0) {
      setMessage({
        type: "error",
        text: "This account cannot be deleted because it has a balance.",
      });

      return;
    }

    const customer = getCustomer(account.customerId);

    const customerName = customer
      ? `${customer.firstName} ${customer.lastName}`
      : "this customer";

    const confirmed = window.confirm(
      `Delete ${account.type} account for ${customerName}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingAccount(account._id);
    setMessage(null);

    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/accounts/${account._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      let data = null;

      try {
        data = await res.json();
      } catch {
        // 204 response
      }

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data?.message || "Unable to delete account.",
        });

        return;
      }

      dispatch(
        setAccounts(accounts.filter((item) => item._id !== account._id)),
      );

      if (expandedAccount === account._id) {
        setExpandedAccount(null);
        setTransactions([]);
      }

      setMessage({
        type: "success",
        text: "Account deleted successfully.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Network error while deleting account.",
      });
    } finally {
      setDeletingAccount(null);
    }
  }

  // =========================
  // FORMAT BALANCE
  // =========================

  function formatBalance(balance) {
    return Number(balance).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // =========================
  // FORMAT DATE
  // =========================

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  // =========================
  // FORMAT TRANSACTION DATE
  // =========================

  function formatTransactionDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // =========================
  // RENDER
  // =========================

  return (
    <motion.div
      className={styles.container}
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
    >
      {/* =========================
          HEADER
      ========================== */}

      <div className={styles.heading}>
        <h1>Accounts</h1>

        <p>Manage accounts and view their transactions.</p>
      </div>

      {/* =========================
          ACCOUNT SEARCH
      ========================== */}

      <div className={styles.searchSection}>
        <div className={styles.searchHeader}>
          {accountSearch?.trim() && (
            <span className={styles.searchCount}>
              {filteredAccounts.length}{" "}
              {filteredAccounts.length === 1 ? "account" : "accounts"}
            </span>
          )}
        </div>

        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            value={accountSearch || ""}
            onChange={(e) => dispatch(setAccountSearch(e.target.value))}
            placeholder="Search by account ID..."
            className={styles.searchInput}
            aria-label="Search accounts by account ID"
          />

          {accountSearch && (
            <button
              type="button"
              className={styles.clearSearch}
              onClick={clearAccountSearch}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* =========================
          MESSAGE
      ========================== */}

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message.text}
            className={`${styles.message} ${
              message.type === "success" ? styles.success : styles.error
            }`}
            initial={{
              opacity: 0,
              y: -6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -6,
            }}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================
          CREATE ACCOUNT
      ========================== */}

      <div className={styles.createSection}>
        <button
          type="button"
          className={styles.createToggle}
          onClick={() => setShowCreateForm((current) => !current)}
        >
          <span>{showCreateForm ? "Cancel" : "+ Create New Account"}</span>

          <motion.span
            animate={{
              rotate: showCreateForm ? 180 : 0,
            }}
          >
            ▼
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {showCreateForm && (
            <motion.form
              className={styles.createForm}
              onSubmit={handleCreateAccount}
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              <h2>Create Account</h2>

              <div className={styles.formGrid}>
                {/* CUSTOMER */}

                <div className={styles.formItem}>
                  <label>Customer *</label>

                  <select
                    name="customerId"
                    value={createForm.customerId}
                    onChange={handleCreateChange}
                    disabled={creating}
                    required
                  >
                    <option value="">Select customer</option>

                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.firstName} {customer.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* BRANCH */}

                <div className={styles.formItem}>
                  <label>Branch *</label>

                  <select
                    name="branchId"
                    value={createForm.branchId}
                    onChange={handleCreateChange}
                    disabled={creating}
                    required
                  >
                    <option value="">Select branch</option>

                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ACCOUNT TYPE */}

                <div className={styles.formItem}>
                  <label>Account Type *</label>

                  <select
                    name="type"
                    value={createForm.type}
                    onChange={handleCreateChange}
                    disabled={creating}
                    required
                  >
                    <option value="CHECKING">Checking</option>
                    <option value="SAVINGS">Savings</option>
                  </select>
                </div>

                {/* BALANCE */}

                <div className={styles.formItem}>
                  <label>Initial Balance</label>

                  <input
                    name="balance"
                    type="number"
                    min="0"
                    step="0.01"
                    value={createForm.balance}
                    onChange={handleCreateChange}
                    placeholder="0.00"
                    disabled={creating}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create Account"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* =========================
          LOADING
      ========================== */}

      {loading && <div className={styles.loading}>Loading accounts...</div>}

      {/* =========================
          NO ACCOUNTS
      ========================== */}

      {!loading && accounts.length === 0 && (
        <div className={styles.noAccounts}>
          <h2>No accounts found</h2>

          <p>Create an account to get started.</p>
        </div>
      )}

      {/* =========================
          NO SEARCH RESULTS
      ========================== */}

      {!loading &&
        accounts.length > 0 &&
        accountSearch?.trim() &&
        filteredAccounts.length === 0 && (
          <div className={styles.noAccounts}>
            <h2>No account found</h2>

            <p>
              No account matches the ID <strong>{accountSearch}</strong>.
            </p>
          </div>
        )}

      {/* =========================
          ACCOUNT LIST
      ========================== */}

      {!loading && filteredAccounts.length > 0 && (
        <div className={styles.accountList}>
          {filteredAccounts.map((account, index) => {
            const isExpanded = expandedAccount === account._id;

            const customer = getCustomer(account.customerId);
            const branch = getBranch(account.branchId);

            return (
              <motion.section
                key={account._id}
                className={styles.account}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.05,
                }}
              >
                {/* =========================
                    ACCOUNT HEADER
                ========================== */}

                <div className={styles.accountHeader}>
                  <button
                    type="button"
                    className={styles.accountButton}
                    onClick={() => toggleAccount(account._id)}
                  >
                    <div>
                      <h2>{account.type}</h2>

                      <span>
                        {customer
                          ? `${customer.firstName} ${customer.lastName}`
                          : "Unknown customer"}
                      </span>

                      <span>{account._id}</span>
                    </div>

                    <div className={styles.accountHeaderRight}>
                      <span className={styles.accountBadge}>
                        ${formatBalance(account.balance)}
                      </span>

                      <motion.span
                        className={styles.chevron}
                        animate={{
                          rotate: isExpanded ? 180 : 0,
                        }}
                      >
                        ▼
                      </motion.span>
                    </div>
                  </button>

                  <div className={styles.accountActions}>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => handleDeleteAccount(account)}
                      disabled={deletingAccount === account._id}
                      title="Delete account"
                    >
                      {deletingAccount === account._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>

                {/* =========================
                    ACCOUNT DETAILS
                ========================== */}

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      className={styles.accountDetails}
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                    >
                      {/* ACCOUNT INFORMATION */}

                      <div className={styles.infoSection}>
                        <h3>Account Information</h3>

                        <div className={styles.infoGrid}>
                          <div className={styles.infoItem}>
                            <span>Account Type</span>

                            <strong>{account.type}</strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Balance</span>

                            <strong>${formatBalance(account.balance)}</strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Customer</span>

                            <strong>
                              {customer
                                ? `${customer.firstName} ${customer.lastName}`
                                : "Unknown"}
                            </strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Email</span>

                            <strong>{customer?.email || "Unknown"}</strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Branch</span>

                            {branch ? (
                              <button
                                type="button"
                                className={styles.branchLink}
                                onClick={() => goToBranch(branch._id)}
                              >
                                {branch.name}
                              </button>
                            ) : (
                              <strong>Unknown</strong>
                            )}
                          </div>

                          <div className={styles.infoItem}>
                            <span>Status</span>

                            <strong
                              className={
                                account.isActive
                                  ? styles.active
                                  : styles.inactive
                              }
                            >
                              {account.isActive ? "Active" : "Inactive"}
                            </strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Created</span>

                            <strong>{formatDate(account.createdAt)}</strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Account ID</span>

                            <strong>{account._id}</strong>
                          </div>
                        </div>
                      </div>

                      {/* =========================
                          TRANSACTIONS
                      ========================== */}

                      <div className={styles.transactionSection}>
                        <div className={styles.transactionHeader}>
                          <div>
                            <h3>Transactions</h3>

                            <p>Transactions involving this account</p>
                          </div>

                          <span className={styles.transactionCount}>
                            {loadingTransactions ? "..." : transactions.length}
                          </span>
                        </div>

                        {loadingTransactions ? (
                          <div className={styles.loadingTransactions}>
                            Loading transactions...
                          </div>
                        ) : transactions.length === 0 ? (
                          <div className={styles.noTransactions}>
                            No transactions found for this account.
                          </div>
                        ) : (
                          <div className={styles.transactionList}>
                            {transactions.map((transaction) => {
                              const isIncoming =
                                String(transaction.toAccountId) ===
                                String(account._id);

                              return (
                                <div
                                  key={transaction._id}
                                  className={styles.transaction}
                                >
                                  <div className={styles.transactionMain}>
                                    <strong>{transaction.type}</strong>

                                    <span>
                                      {formatTransactionDate(
                                        transaction.createdAt,
                                      )}
                                    </span>
                                  </div>

                                  <div
                                    className={
                                      isIncoming
                                        ? styles.transactionIncoming
                                        : styles.transactionOutgoing
                                    }
                                  >
                                    {isIncoming ? "+" : "-"}$
                                    {formatBalance(transaction.amount)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
