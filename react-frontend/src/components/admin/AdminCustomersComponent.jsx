import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

import styles from "./AdminCustomersComponent.module.css";

import {
  setCustomers,
  setAccounts,
  setCustomerSearch,
  setAccountSearch,
  setSelectedTab,
} from "../../store/AdminSlice";

export default function AdminCustomersComponent() {
  const dispatch = useDispatch();

  const token = localStorage.getItem("token");

  const customers = useSelector((state) => state.AdminSlice.customers);

  const accounts = useSelector((state) => state.AdminSlice.accounts);

  // =========================
  // CUSTOMER SEARCH
  // =========================

  const customerSearch = useSelector(
    (state) => state.AdminSlice.customerSearch,
  );

  const [expandedCustomer, setExpandedCustomer] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [creating, setCreating] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [message, setMessage] = useState(null);

  // =========================
  // CREATE CUSTOMER FORM
  // =========================

  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  // =========================
  // FETCH CUSTOMERS + ACCOUNTS
  // =========================

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setLoadingAccounts(true);

      try {
        const [customerRes, accountRes] = await Promise.all([
          fetch("http://localhost:8080/api/v1/customers/admin/all", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("http://localhost:8080/api/v1/accounts", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

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
        // ACCOUNTS
        // =========================

        let accountData = null;

        try {
          accountData = await accountRes.json();
        } catch {
          accountData = null;
        }

        if (!accountRes.ok) {
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
      } catch {
        setMessage({
          type: "error",
          text: "Network error while loading customers.",
        });
      } finally {
        setLoading(false);
        setLoadingAccounts(false);
      }
    }

    fetchData();
  }, [dispatch, token]);

  // =========================
  // CUSTOMER ID SEARCH
  // =========================

  function handleCustomerSearch(e) {
    dispatch(setCustomerSearch(e.target.value));
  }

  // =========================
  // FILTER CUSTOMERS
  // =========================

  const filteredCustomers = customers.filter((customer) => {
    if (!customerSearch?.trim()) {
      return true;
    }

    return String(customer._id)
      .toLowerCase()
      .includes(customerSearch.trim().toLowerCase());
  });

  // =========================
  // CLEAR CUSTOMER SEARCH
  // =========================

  function clearCustomerSearch() {
    dispatch(setCustomerSearch(""));
  }

  // =========================
  // GO TO ACCOUNT
  // =========================

  function goToAccount(accountId) {
    dispatch(setAccountSearch(String(accountId)));

    dispatch(setSelectedTab("accounts"));
  }

  // =========================
  // CLOSE EXPANDED CUSTOMER
  // IF IT IS FILTERED OUT
  // =========================

  useEffect(() => {
    if (!expandedCustomer) {
      return;
    }

    const stillVisible = filteredCustomers.some(
      (customer) => customer._id === expandedCustomer,
    );

    if (!stillVisible) {
      setExpandedCustomer(null);
    }
  }, [customerSearch, expandedCustomer, filteredCustomers]);

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
  // CREATE CUSTOMER
  // =========================

  async function handleCreateCustomer(e) {
    e.preventDefault();

    setMessage(null);

    if (
      !createForm.firstName.trim() ||
      !createForm.lastName.trim() ||
      !createForm.email.trim() ||
      !createForm.phone.trim() ||
      !createForm.address.trim() ||
      !createForm.password
    ) {
      setMessage({
        type: "error",
        text: "All customer fields are required.",
      });

      return;
    }

    setCreating(true);

    try {
      const res = await fetch("http://localhost:8080/api/v1/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: createForm.firstName.trim(),
          lastName: createForm.lastName.trim(),
          email: createForm.email.trim(),
          phone: createForm.phone.trim(),
          address: createForm.address.trim(),
          password: createForm.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data?.message || "Failed to create customer.",
        });

        return;
      }

      const newCustomer = data?.data || data;

      dispatch(setCustomers([...customers, newCustomer]));

      setMessage({
        type: "success",
        text: "Customer created successfully.",
      });

      setCreateForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
      });

      setShowCreateForm(false);
    } catch {
      setMessage({
        type: "error",
        text: "Network error while creating customer.",
      });
    } finally {
      setCreating(false);
    }
  }

  // =========================
  // GET CUSTOMER ACCOUNTS
  // =========================

  function getCustomerAccounts(customerId) {
    if (!Array.isArray(accounts)) {
      return [];
    }

    return accounts.filter(
      (account) => String(account.customerId) === String(customerId),
    );
  }

  // =========================
  // TOGGLE CUSTOMER
  // =========================

  function toggleCustomer(customerId) {
    setExpandedCustomer((current) =>
      current === customerId ? null : customerId,
    );
  }

  // =========================
  // DELETE CUSTOMER
  // =========================

  async function handleDeleteCustomer(customer) {
    const customerAccounts = getCustomerAccounts(customer._id);

    if (customerAccounts.length > 0) {
      setMessage({
        type: "error",
        text: "This customer cannot be deleted because they have accounts.",
      });

      return;
    }

    const confirmed = window.confirm(
      `Delete ${customer.firstName} ${customer.lastName}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingCustomer(customer._id);
    setMessage(null);

    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/customers/${customer._id}`,
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
          text: data?.message || "Unable to delete customer.",
        });

        return;
      }

      dispatch(
        setCustomers(customers.filter((item) => item._id !== customer._id)),
      );

      if (expandedCustomer === customer._id) {
        setExpandedCustomer(null);
      }

      setMessage({
        type: "success",
        text: "Customer deleted successfully.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Network error while deleting customer.",
      });
    } finally {
      setDeletingCustomer(null);
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
        <h1>Customers</h1>

        <p>Manage customers and view their accounts.</p>
      </div>

      {/* =========================
          CUSTOMER ID SEARCH
      ========================== */}

      <div className={styles.searchSection}>
        <div className={styles.searchHeader}>
          {customerSearch?.trim() && (
            <span className={styles.searchCount}>
              {filteredCustomers.length}{" "}
              {filteredCustomers.length === 1 ? "customer" : "customers"}
            </span>
          )}
        </div>

        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            value={customerSearch || ""}
            onChange={handleCustomerSearch}
            placeholder="Search by customer ID..."
            className={styles.searchInput}
            aria-label="Search customers by customer ID"
          />

          {customerSearch && (
            <button
              type="button"
              className={styles.clearSearchButton}
              onClick={clearCustomerSearch}
              aria-label="Clear customer search"
            >
              ×
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
          CREATE CUSTOMER
      ========================== */}

      <div className={styles.createSection}>
        <button
          type="button"
          className={styles.createToggle}
          onClick={() => setShowCreateForm((current) => !current)}
        >
          <span>{showCreateForm ? "Cancel" : "+ Create New Customer"}</span>

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
              onSubmit={handleCreateCustomer}
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
              <h2>Create Customer</h2>

              <div className={styles.formGrid}>
                <div className={styles.formItem}>
                  <label>First Name *</label>

                  <input
                    name="firstName"
                    value={createForm.firstName}
                    onChange={handleCreateChange}
                    placeholder="Charlie"
                    disabled={creating}
                    required
                  />
                </div>

                <div className={styles.formItem}>
                  <label>Last Name *</label>

                  <input
                    name="lastName"
                    value={createForm.lastName}
                    onChange={handleCreateChange}
                    placeholder="Davis"
                    disabled={creating}
                    required
                  />
                </div>

                <div className={styles.formItem}>
                  <label>Email *</label>

                  <input
                    name="email"
                    type="email"
                    value={createForm.email}
                    onChange={handleCreateChange}
                    placeholder="charlie@example.com"
                    disabled={creating}
                    required
                  />
                </div>

                <div className={styles.formItem}>
                  <label>Phone *</label>

                  <input
                    name="phone"
                    value={createForm.phone}
                    onChange={handleCreateChange}
                    placeholder="555-3030"
                    disabled={creating}
                    required
                  />
                </div>

                <div className={styles.formItemFull}>
                  <label>Address *</label>

                  <input
                    name="address"
                    value={createForm.address}
                    onChange={handleCreateChange}
                    placeholder="77 Pine Rd, Springfield, IL"
                    disabled={creating}
                    required
                  />
                </div>

                <div className={styles.formItemFull}>
                  <label>Password *</label>

                  <input
                    name="password"
                    type="password"
                    value={createForm.password}
                    onChange={handleCreateChange}
                    placeholder="Password"
                    disabled={creating}
                    required
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
                  {creating ? "Creating..." : "Create Customer"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* =========================
          LOADING
      ========================== */}

      {loading && <div className={styles.loading}>Loading customers...</div>}

      {/* =========================
          NO CUSTOMERS
      ========================== */}

      {!loading && customers.length === 0 && (
        <div className={styles.noCustomers}>
          <h2>No customers found</h2>

          <p>Create a customer to get started.</p>
        </div>
      )}

      {/* =========================
          NO SEARCH RESULTS
      ========================== */}

      {!loading &&
        customers.length > 0 &&
        customerSearch?.trim() &&
        filteredCustomers.length === 0 && (
          <div className={styles.noCustomers}>
            <h2>No customer found</h2>

            <p>
              No customer matches the ID{" "}
              <strong>{customerSearch.trim()}</strong>.
            </p>
          </div>
        )}

      {/* =========================
          CUSTOMER LIST
      ========================== */}

      {!loading && filteredCustomers.length > 0 && (
        <div className={styles.customerList}>
          {filteredCustomers.map((customer, index) => {
            const isExpanded = expandedCustomer === customer._id;

            const customerAccounts = getCustomerAccounts(customer._id);

            const hasAccounts = customerAccounts.length > 0;

            return (
              <motion.section
                key={customer._id}
                className={styles.customer}
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
                    CUSTOMER HEADER
                ========================== */}

                <div className={styles.customerHeader}>
                  <button
                    type="button"
                    className={styles.customerButton}
                    onClick={() => toggleCustomer(customer._id)}
                  >
                    <div>
                      <h2>
                        {customer.firstName} {customer.lastName}
                      </h2>

                      <span>{customer.email}</span>
                    </div>

                    <motion.span
                      className={styles.chevron}
                      animate={{
                        rotate: isExpanded ? 180 : 0,
                      }}
                    >
                      ▼
                    </motion.span>
                  </button>

                  <div className={styles.customerActions}>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => handleDeleteCustomer(customer)}
                      disabled={deletingCustomer === customer._id}
                      title={
                        hasAccounts
                          ? "Customer cannot be deleted because they have accounts"
                          : "Delete customer"
                      }
                    >
                      {deletingCustomer === customer._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>

                {/* =========================
                    CUSTOMER DETAILS
                ========================== */}

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      className={styles.customerDetails}
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
                      {/* =========================
                          CUSTOMER INFO
                      ========================== */}

                      <div className={styles.infoSection}>
                        <h3>Customer Information</h3>

                        <div className={styles.infoGrid}>
                          <div className={styles.infoItem}>
                            <span>Customer ID</span>

                            <strong>{customer._id}</strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Name</span>

                            <strong>
                              {customer.firstName} {customer.lastName}
                            </strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Email</span>

                            <strong>{customer.email}</strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Phone</span>

                            <strong>{customer.phone}</strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Address</span>

                            <strong>{customer.address}</strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Status</span>

                            <strong
                              className={
                                customer.isActive
                                  ? styles.active
                                  : styles.inactive
                              }
                            >
                              {customer.isActive ? "Active" : "Inactive"}
                            </strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Created</span>

                            <strong>{formatDate(customer.createdAt)}</strong>
                          </div>
                        </div>
                      </div>

                      {/* =========================
                          ACCOUNTS
                      ========================== */}

                      <div className={styles.accountSection}>
                        <div className={styles.accountHeader}>
                          <div>
                            <h3>Accounts</h3>

                            <p>Accounts owned by this customer</p>
                          </div>

                          <span className={styles.accountCount}>
                            {customerAccounts.length}
                          </span>
                        </div>

                        {loadingAccounts ? (
                          <div className={styles.loadingAccounts}>
                            Loading accounts...
                          </div>
                        ) : customerAccounts.length === 0 ? (
                          <div className={styles.noAccounts}>
                            No accounts found for this customer.
                          </div>
                        ) : (
                          <div className={styles.accountList}>
                            {customerAccounts.map((account) => (
                              <button
                                key={account._id}
                                type="button"
                                className={styles.account}
                                onClick={() => goToAccount(account._id)}
                              >
                                <div className={styles.accountMain}>
                                  <strong>{account.type}</strong>

                                  <span>{account._id}</span>
                                </div>

                                <div className={styles.accountRight}>
                                  <strong>
                                    ${formatBalance(account.balance)}
                                  </strong>

                                  <span
                                    className={
                                      account.isActive
                                        ? styles.active
                                        : styles.inactive
                                    }
                                  >
                                    {account.isActive ? "Active" : "Inactive"}
                                  </span>
                                </div>
                              </button>
                            ))}
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
