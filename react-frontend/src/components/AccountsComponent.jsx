import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./AccountsComponent.module.css";

export default function AccountsComponent() {
  const accounts = useSelector((state) => state.CustomerSlice.accountsInfo);

  const transactions = useSelector((state) => state.CustomerSlice.transactions);

  const [branches, setBranches] = useState([]);

  const [expandedAccount, setExpandedAccount] = useState(null);

  const token = localStorage.getItem("token");

  // =========================
  // FETCH BRANCHES
  // =========================
  useEffect(() => {
    async function fetchBranches() {
      try {
        const res = await fetch("http://localhost:8080/api/v1/branches", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error(data.message || "Unable to load branches.");
          return;
        }

        // Handle either:
        // [ ...branches ]
        // or
        // { data: [ ...branches ] }

        const branchList = Array.isArray(data) ? data : data.data || [];

        setBranches(branchList);
      } catch (error) {
        console.error("Error loading branches:", error);
      }
    }

    fetchBranches();
  }, [token]);

  // =========================
  // FIND BRANCH NAME
  // =========================
  function getBranchName(branchId) {
    const branch = branches.find((branch) => branch._id === branchId);

    return branch?.name || "Unknown Branch";
  }

  // =========================
  // TOGGLE ACCOUNT
  // =========================
  function toggleAccount(accountId) {
    setExpandedAccount((current) => (current === accountId ? null : accountId));
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
  // TRANSACTION DIRECTION
  // =========================
  function getTransactionDirection(transaction, accountId) {
    if (transaction.type === "DEPOSIT") {
      return "in";
    }

    if (transaction.type === "WITHDRAWAL") {
      return "out";
    }

    if (transaction.type === "TRANSFER") {
      if (transaction.toAccountId === accountId) {
        return "in";
      }

      if (transaction.fromAccountId === accountId) {
        return "out";
      }
    }

    return "out";
  }

  // =========================
  // TRANSACTION LABEL
  // =========================
  function getTransactionLabel(transaction, accountId) {
    if (transaction.type === "DEPOSIT") {
      return "Deposit";
    }

    if (transaction.type === "WITHDRAWAL") {
      return "Withdrawal";
    }

    if (transaction.type === "TRANSFER") {
      if (transaction.toAccountId === accountId) {
        return "Transfer Received";
      }

      if (transaction.fromAccountId === accountId) {
        return "Transfer Sent";
      }
    }

    return transaction.type;
  }

  // =========================
  // GROUP ACCOUNTS BY BRANCH
  // =========================
  const accountsByBranch = accounts.reduce((groups, account) => {
    const branchId = account.branchId;

    if (!groups[branchId]) {
      groups[branchId] = [];
    }

    groups[branchId].push(account);

    return groups;
  }, {});

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
          PAGE HEADER
      ========================== */}

      <div className={styles.heading}>
        <h1>Accounts</h1>

        <p>Your accounts and balances</p>
      </div>

      {/* =========================
          NO ACCOUNTS
      ========================== */}

      {accounts.length === 0 && (
        <motion.div
          className={styles.noAccounts}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
        >
          You have no accounts yet.
        </motion.div>
      )}

      {/* =========================
          BRANCHES
      ========================== */}

      <div className={styles.branchList}>
        {Object.entries(accountsByBranch).map(
          ([branchId, branchAccounts], branchIndex) => (
            <motion.section
              key={branchId}
              className={styles.branch}
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
                delay: branchIndex * 0.08,
                ease: "easeOut",
              }}
            >
              {/* =========================
                  BRANCH HEADER
              ========================== */}

              <div className={styles.branchHeader}>
                <div>
                  <h2>Branch</h2>

                  <span>{getBranchName(branchId)}</span>
                </div>

                <span>
                  {branchAccounts.length}{" "}
                  {branchAccounts.length === 1 ? "Account" : "Accounts"}
                </span>
              </div>

              {/* =========================
                  ACCOUNT LIST
              ========================== */}

              <div className={styles.accountList}>
                {branchAccounts.map((account, accountIndex) => {
                  const isExpanded = expandedAccount === account._id;

                  const accountTransactions = transactions?.[account._id] || [];

                  return (
                    <motion.div
                      key={account._id}
                      className={`${styles.account} ${
                        isExpanded ? styles.expanded : ""
                      }`}
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
                        delay: accountIndex * 0.04,
                      }}
                    >
                      {/* =========================
                            ACCOUNT HEADER
                        ========================== */}

                      <button
                        type="button"
                        className={styles.accountHeader}
                        onClick={() => toggleAccount(account._id)}
                        aria-expanded={isExpanded}
                      >
                        <div className={styles.accountMain}>
                          <span className={styles.accountType}>
                            {account.type}
                          </span>

                          <span className={styles.accountNumber}>
                            •••• {account._id.slice(-4)}
                          </span>
                        </div>

                        <div className={styles.accountRight}>
                          <span className={styles.balance}>
                            ${formatBalance(account.balance)}
                          </span>

                          <motion.span
                            className={styles.chevron}
                            animate={{
                              rotate: isExpanded ? 180 : 0,
                            }}
                            transition={{
                              duration: 0.2,
                            }}
                          >
                            ▼
                          </motion.span>
                        </div>
                      </button>

                      {/* =========================
                            EXPANDED DETAILS
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
                              duration: 0.3,
                              ease: "easeInOut",
                            }}
                            style={{
                              overflow: "hidden",
                            }}
                          >
                            {/* =========================
                                  BALANCE SUMMARY
                              ========================== */}

                            <motion.div
                              className={styles.balanceSummary}
                              initial={{
                                opacity: 0,
                                y: 8,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              transition={{
                                duration: 0.25,
                                delay: 0.05,
                              }}
                            >
                              <div>
                                <span className={styles.balanceLabel}>
                                  Available Balance
                                </span>

                                <div className={styles.largeBalance}>
                                  ${formatBalance(account.balance)}
                                </div>
                              </div>

                              <span
                                className={`${styles.statusBadge} ${
                                  account.isActive
                                    ? styles.active
                                    : styles.inactive
                                }`}
                              >
                                <span className={styles.statusDot} />

                                {account.isActive ? "Active" : "Inactive"}
                              </span>
                            </motion.div>

                            {/* =========================
                                  ACCOUNT INFORMATION
                              ========================== */}

                            <div className={styles.infoSection}>
                              <h3>Account Information</h3>

                              <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                  <span>Account Type</span>

                                  <strong>{account.type}</strong>
                                </div>

                                <div className={styles.infoItem}>
                                  <span>Account ID</span>

                                  <strong className={styles.mono}>
                                    {account._id}
                                  </strong>
                                </div>

                                <div className={styles.infoItem}>
                                  <span>Branch</span>

                                  <strong>
                                    {getBranchName(account.branchId)}
                                  </strong>
                                </div>

                                <div className={styles.infoItem}>
                                  <span>Branch ID</span>

                                  <strong className={styles.mono}>
                                    {account.branchId}
                                  </strong>
                                </div>

                                <div className={styles.infoItem}>
                                  <span>Customer ID</span>

                                  <strong className={styles.mono}>
                                    {account.customerId}
                                  </strong>
                                </div>

                                <div className={styles.infoItem}>
                                  <span>Opened</span>

                                  <strong>
                                    {formatDate(account.createdAt)}
                                  </strong>
                                </div>

                                <div className={styles.infoItem}>
                                  <span>Last Updated</span>

                                  <strong>
                                    {formatDate(account.updatedAt)}
                                  </strong>
                                </div>
                              </div>
                            </div>

                            {/* =========================
                                  TRANSACTIONS
                              ========================== */}

                            <div className={styles.transactionSection}>
                              <div className={styles.transactionHeader}>
                                <div>
                                  <h3>Recent Transactions</h3>

                                  <p>Activity for this account</p>
                                </div>

                                <span className={styles.transactionCount}>
                                  {accountTransactions.length}
                                </span>
                              </div>

                              {accountTransactions.length === 0 ? (
                                <div className={styles.noTransactions}>
                                  <span className={styles.noTransactionsIcon}>
                                    ✓
                                  </span>

                                  <div>
                                    <strong>No transactions yet</strong>

                                    <p>
                                      There is no activity to display for this
                                      account.
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className={styles.transactionList}>
                                  {accountTransactions.map((transaction) => {
                                    const direction = getTransactionDirection(
                                      transaction,
                                      account._id,
                                    );

                                    const label = getTransactionLabel(
                                      transaction,
                                      account._id,
                                    );

                                    return (
                                      <motion.div
                                        key={transaction._id}
                                        className={styles.transaction}
                                        initial={{
                                          opacity: 0,
                                          x: -8,
                                        }}
                                        animate={{
                                          opacity: 1,
                                          x: 0,
                                        }}
                                        transition={{
                                          duration: 0.2,
                                        }}
                                      >
                                        {/* Transaction Icon */}

                                        <div
                                          className={`${
                                            styles.transactionIcon
                                          } ${
                                            direction === "in"
                                              ? styles.moneyIn
                                              : styles.moneyOut
                                          }`}
                                        >
                                          {direction === "in" ? "↓" : "↑"}
                                        </div>

                                        {/* Transaction Info */}

                                        <div className={styles.transactionInfo}>
                                          <strong>{label}</strong>

                                          <span>
                                            {formatTransactionDate(
                                              transaction.createdAt,
                                            )}
                                          </span>
                                        </div>

                                        {/* Transaction Amount */}

                                        <div
                                          className={`${
                                            styles.transactionAmount
                                          } ${
                                            direction === "in"
                                              ? styles.amountIn
                                              : styles.amountOut
                                          }`}
                                        >
                                          {direction === "in" ? "+" : "-"}$
                                          {formatBalance(transaction.amount)}
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          ),
        )}
      </div>
    </motion.div>
  );
}
