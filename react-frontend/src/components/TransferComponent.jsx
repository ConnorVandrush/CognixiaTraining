import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./TransferComponent.module.css";

import { setAccountsInfo, setTransactions } from "../store/CustomerSlice";

export default function TransferComponent() {
  const accounts = useSelector((state) => state.CustomerSlice.accountsInfo);

  const transactions = useSelector((state) => state.CustomerSlice.transactions);

  const dispatch = useDispatch();

  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  function maskAccount(id) {
    if (!id) return "";
    return `••••${id.slice(-4)}`;
  }

  function formatBalance(balance) {
    return Number(balance).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  async function handleTransfer(e) {
    e.preventDefault();

    setMessage(null);

    // =========================
    // VALIDATION
    // =========================

    if (!fromAccount || !toAccount || !amount) {
      setMessage({
        type: "error",
        text: "All fields are required.",
      });

      return;
    }

    if (fromAccount === toAccount) {
      setMessage({
        type: "error",
        text: "Cannot transfer to the same account.",
      });

      return;
    }

    const transferAmount = Number(amount);

    if (Number.isNaN(transferAmount) || transferAmount <= 0) {
      setMessage({
        type: "error",
        text: "Please enter a valid transfer amount.",
      });

      return;
    }

    // =========================
    // GET TOKEN
    // =========================

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage({
        type: "error",
        text: "You are not logged in.",
      });

      return;
    }

    // =========================
    // LOADING
    // =========================

    setLoading(true);

    try {
      // =========================
      // API REQUEST
      // =========================

      const res = await fetch(
        "http://localhost:8080/api/v1/transactions/transfer",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            fromAccountId: fromAccount,
            toAccountId: toAccount,
            amount: transferAmount,
          }),
        },
      );

      // =========================
      // PARSE RESPONSE
      // =========================

      const data = await res.json();

      // =========================
      // API ERROR
      // =========================

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.message || "Transfer failed.",
        });

        return;
      }

      // =========================
      // RESPONSE STRUCTURE
      //
      // Backend returns:
      //
      // {
      //   transaction,
      //   fromAccount,
      //   toAccount
      // }
      // =========================

      const updatedFrom = data.fromAccount;
      const updatedTo = data.toAccount;
      const newTransaction = data.transaction;

      // Safety check
      if (!updatedFrom || !updatedTo || !newTransaction) {
        console.error("Unexpected transfer response:", data);

        setMessage({
          type: "error",
          text: "Transfer completed, but the server returned unexpected data.",
        });

        return;
      }

      // =========================
      // UPDATE ACCOUNTS IN REDUX
      // =========================

      const updatedAccounts = accounts.map((account) => {
        if (account._id === updatedFrom._id) {
          return updatedFrom;
        }

        if (account._id === updatedTo._id) {
          return updatedTo;
        }

        return account;
      });

      dispatch(setAccountsInfo(updatedAccounts));

      // =========================
      // UPDATE TRANSACTIONS
      // =========================

      const updatedTransactions = {
        ...transactions,

        // Transaction for sending account
        [newTransaction.fromAccountId]: [
          ...(transactions[newTransaction.fromAccountId] || []),
          newTransaction,
        ],

        // Transaction for receiving account
        [newTransaction.toAccountId]: [
          ...(transactions[newTransaction.toAccountId] || []),
          newTransaction,
        ],
      };

      dispatch(setTransactions(updatedTransactions));

      // =========================
      // SUCCESS MESSAGE
      // =========================

      setMessage({
        type: "success",
        text: `Transfer of $${formatBalance(
          transferAmount,
        )} completed successfully.`,
      });

      // =========================
      // RESET FORM
      // =========================

      setAmount("");
      setFromAccount("");
      setToAccount("");
    } catch (error) {
      // =========================
      // REAL NETWORK / JAVASCRIPT ERROR
      // =========================

      console.error("Transfer error:", error);

      setMessage({
        type: "error",
        text: "Unable to connect to the banking server.",
      });
    } finally {
      setLoading(false);
    }
  }

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
        <h1>Transfer Funds</h1>

        <p>Move money securely between your accounts</p>
      </div>

      {/* =========================
          TRANSFER FORM
      ========================== */}

      <motion.form
        className={styles.form}
        onSubmit={handleTransfer}
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
      >
        {/* =========================
            FROM ACCOUNT
        ========================== */}

        <motion.div
          className={styles.formItem}
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
          <label className={styles.label}>From Account</label>

          <select
            className={styles.select}
            value={fromAccount}
            onChange={(e) => setFromAccount(e.target.value)}
            disabled={loading}
          >
            <option value="">Select account</option>

            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.type} {maskAccount(account._id)} — $
                {formatBalance(account.balance)}
              </option>
            ))}
          </select>
        </motion.div>

        {/* =========================
            TO ACCOUNT
        ========================== */}

        <motion.div
          className={styles.formItem}
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
            delay: 0.1,
          }}
        >
          <label className={styles.label}>To Account</label>

          <select
            className={styles.select}
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            disabled={loading}
          >
            <option value="">Select account</option>

            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.type} {maskAccount(account._id)} — $
                {formatBalance(account.balance)}
              </option>
            ))}
          </select>
        </motion.div>

        {/* =========================
            AMOUNT
        ========================== */}

        <motion.div
          className={styles.formItem}
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
            delay: 0.15,
          }}
        >
          <label className={styles.label}>Amount</label>

          <div className={styles.amountWrapper}>
            <span className={styles.currency}>$</span>

            <input
              className={styles.amountInput}
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={loading}
            />
          </div>
        </motion.div>

        {/* =========================
            SUBMIT BUTTON
        ========================== */}

        <motion.button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
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
            delay: 0.2,
          }}
        >
          {loading ? (
            <span className={styles.buttonContent}>
              <span className={styles.spinner} />
              Processing...
            </span>
          ) : (
            "Transfer Funds"
          )}
        </motion.button>

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
                y: 6,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -6,
              }}
              transition={{
                duration: 0.2,
              }}
            >
              <span className={styles.messageIcon}>
                {message.type === "success" ? "✓" : "!"}
              </span>

              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </motion.div>
  );
}
