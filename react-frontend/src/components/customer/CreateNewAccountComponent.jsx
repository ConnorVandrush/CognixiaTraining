import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./CreateNewAccountComponent.module.css";

import { setAccountsInfo } from "../../store/CustomerSlice";

export default function CreateNewAccountComponent() {
  const dispatch = useDispatch();

  const token = localStorage.getItem("token");
  const customer = useSelector((state) => state.CustomerSlice.customerInfo);
  const accounts = useSelector((state) => state.CustomerSlice.accountsInfo);

  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  const [form, setForm] = useState({
    branchId: "",
    type: "",
    balance: "",
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

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
          setMessage({
            type: "error",
            text: data.message || "Unable to load branches.",
          });
          return;
        }

        // API returns either { data: [...] } or [...]
        const branchList = Array.isArray(data) ? data : data.data || [];
        setBranches(branchList);
      } catch (error) {
        console.error("Error loading branches:", error);
        setMessage({
          type: "error",
          text: "Network error while loading branches.",
        });
      } finally {
        setLoadingBranches(false);
      }
    }

    fetchBranches();
  }, [token]);

  // =========================
  // HANDLE FORM CHANGES
  // =========================
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // =========================
  // SUBMIT NEW ACCOUNT
  // =========================
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!form.branchId || !form.type) {
      setMessage({
        type: "error",
        text: "Branch and account type are required.",
      });
      return;
    }

    if (!customer?._id) {
      setMessage({
        type: "error",
        text: "Customer information is not available.",
      });
      return;
    }

    if (form.balance && Number(form.balance) < 0) {
      setMessage({
        type: "error",
        text: "Balance cannot be negative.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/v1/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: customer._id,
          branchId: form.branchId,
          type: form.type,
          balance: Number(form.balance || 0),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.message || "Failed to create account.",
        });
        return;
      }

      // Update Redux accounts
      dispatch(setAccountsInfo([...(accounts || []), data]));

      setMessage({
        type: "success",
        text: "Account created successfully!",
      });

      // Reset form
      setForm({
        branchId: "",
        type: "",
        balance: "",
      });
    } catch (error) {
      console.error("Error creating account:", error);
      setMessage({
        type: "error",
        text: "Network error — please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* =========================
          PAGE HEADER
      ========================== */}
      <div className={styles.heading}>
        <h1>Create New Account</h1>
        <p>Open a secure account at your selected branch</p>
      </div>

      {/* =========================
          FORM CARD
      ========================== */}
      <motion.form
        className={styles.form}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* =========================
            BRANCH SELECT
        ========================== */}
        <motion.div
          className={styles.formItem}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <label className={styles.label}>Branch</label>

          <select
            name="branchId"
            className={styles.select}
            value={form.branchId}
            onChange={handleChange}
            disabled={loading || loadingBranches}
          >
            <option value="">
              {loadingBranches ? "Loading branches..." : "Select branch"}
            </option>

            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name} ({branch.branchCode})
              </option>
            ))}
          </select>
        </motion.div>

        {/* =========================
            ACCOUNT TYPE
        ========================== */}
        <motion.div
          className={styles.formItem}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
        >
          <label className={styles.label}>Account Type</label>

          <select
            name="type"
            className={styles.select}
            value={form.type}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select type</option>
            <option value="CHECKING">Checking</option>
            <option value="SAVINGS">Savings</option>
            <option value="LOAN">Loan</option>
            <option value="CREDIT">Credit</option>
          </select>
        </motion.div>

        {/* =========================
            BALANCE
        ========================== */}
        <motion.div
          className={styles.formItem}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
        >
          <label className={styles.label}>Starting Balance (optional)</label>

          <input
            name="balance"
            type="number"
            min="0"
            step="0.01"
            className={styles.input}
            value={form.balance}
            onChange={handleChange}
            disabled={loading}
            placeholder="0.00"
          />
        </motion.div>

        {/* =========================
            SUBMIT BUTTON
        ========================== */}
        <motion.button
          type="submit"
          className={styles.submitButton}
          disabled={loading || loadingBranches}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.2 }}
        >
          {loading ? "Creating..." : "Create Account"}
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
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </motion.div>
  );
}
