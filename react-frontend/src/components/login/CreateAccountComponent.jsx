import { useState } from "react";
import styles from "./CreateAccountComponent.module.css";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { setLoginModal } from "../../store/LoginSlice";

export default function CreateAccountComponent() {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    // Missing fields check
    const missing = Object.entries(form).filter(([_, value]) => !value.trim());
    if (missing.length > 0) {
      setMessage({
        type: "error",
        text: "Please fill out all fields before creating an account.",
      });
      return;
    }

    // Password match check
    if (form.password !== form.confirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords do not match.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/v1/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.message || "Account creation failed.",
        });
        setLoading(false);
        return;
      }

      // Success
      setMessage({
        type: "success",
        text: "Account created successfully! You may now log in.",
      });

      // Clear form
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect to login after short delay
      setTimeout(() => {
        dispatch(setLoginModal("login"));
      }, 1200);
    } catch (err) {
      setMessage({
        type: "error",
        text: "Network error — please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      className={styles.form}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <label>First Name</label>
      <input
        name="firstName"
        type="text"
        value={form.firstName}
        onChange={handleChange}
        disabled={loading}
      />

      <label>Last Name</label>
      <input
        name="lastName"
        type="text"
        value={form.lastName}
        onChange={handleChange}
        disabled={loading}
      />

      <label>Email</label>
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        disabled={loading}
      />

      <label>Phone</label>
      <input
        name="phone"
        type="text"
        value={form.phone}
        onChange={handleChange}
        disabled={loading}
      />

      <label>Address</label>
      <input
        name="address"
        type="text"
        value={form.address}
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

      <label>Confirm Password</label>
      <input
        name="confirmPassword"
        type="password"
        value={form.confirmPassword}
        onChange={handleChange}
        disabled={loading}
      />

      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? "Creating..." : "Create Account"}
      </button>

      {/* Animated message */}
      <AnimatePresence>
        {message && (
          <motion.div
            className={`${styles.message} ${
              message.type === "success" ? styles.success : styles.error
            }`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.registerWrapper}>
        <button
          type="button"
          className={styles.registerLink}
          onClick={() => dispatch(setLoginModal("login"))}
          disabled={loading}
        >
          Back to Login
        </button>
      </div>
    </motion.form>
  );
}
