import { useState } from "react";
import styles from "./LoginComponent.module.css";
import { useDispatch } from "react-redux";

import { setLoginModal, setHeader } from "../store/LoginSlice";
import {
  setCustomerInfo,
  setAccountsInfo,
  setTransactions,
  setSelectedTab,
} from "../store/CustomerSlice";

export default function LoginComponent() {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/v1/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Store JWT
      localStorage.setItem("token", data.token);

      // Store customer + accounts + transactions in Redux
      dispatch(setCustomerInfo(data.customer));
      dispatch(setAccountsInfo(data.accounts));
      dispatch(setTransactions(data.transactions));

      // Set header to logged-in customer
      dispatch(setHeader(data.customer));

      // Default dashboard tab
      dispatch(setSelectedTab("accounts"));

      // Close modal
      dispatch(setLoginModal(null));
    } catch (err) {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* =========================
          APP TITLE
      ========================== */}
      <div className={styles.appTitle}>
        <h1>The Banking App</h1>
      </div>

      {/* =========================
          LOGIN FORM
      ========================== */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          disabled={loading}
        />

        <label>Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          disabled={loading}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? (
            <div className={styles.spinnerWrapper}>
              <span>Logging in...</span>
              <div className={styles.spinner}></div>
            </div>
          ) : (
            "Login"
          )}
        </button>

        <div className={styles.registerWrapper}>
          <button
            type="button"
            className={styles.registerLink}
            onClick={() => dispatch(setLoginModal("createAccount"))}
            disabled={loading}
          >
            Create Account
          </button>
        </div>
      </form>
    </>
  );
}
