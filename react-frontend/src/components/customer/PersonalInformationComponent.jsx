import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./PersonalInformationComponent.module.css";

import { setCustomerInfo } from "../../store/CustomerSlice";

export default function PersonalInformationComponent() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const customer = useSelector((state) => state.CustomerSlice.customerInfo);

  const [form, setForm] = useState({
    firstName: customer?.firstName || "",
    lastName: customer?.lastName || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // HANDLE INPUT CHANGES
  // =========================
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // =========================
  // SUBMIT UPDATED INFO
  // =========================
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    // Validate required fields
    const missing = Object.entries(form).filter(([_, v]) => !v.trim());
    if (missing.length > 0) {
      setMessage({
        type: "error",
        text: "All fields are required.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/customers/${customer._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.message || "Failed to update information.",
        });
        return;
      }

      // ⭐ Update Redux state with new customer info
      dispatch(setCustomerInfo(data));

      setMessage({
        type: "success",
        text: "Personal information updated successfully!",
      });
    } catch (err) {
      console.error("Update error:", err);
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
        <h1>Personal Information</h1>
        <p>Manage your personal details securely</p>
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
        {/* FIRST NAME */}
        <motion.div
          className={styles.formItem}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <label className={styles.label}>First Name</label>
          <input
            name="firstName"
            className={styles.input}
            value={form.firstName}
            onChange={handleChange}
            disabled={loading}
          />
        </motion.div>

        {/* LAST NAME */}
        <motion.div
          className={styles.formItem}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
        >
          <label className={styles.label}>Last Name</label>
          <input
            name="lastName"
            className={styles.input}
            value={form.lastName}
            onChange={handleChange}
            disabled={loading}
          />
        </motion.div>

        {/* EMAIL */}
        <motion.div
          className={styles.formItem}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
        >
          <label className={styles.label}>Email</label>
          <input
            name="email"
            type="email"
            className={styles.input}
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />
        </motion.div>

        {/* PHONE */}
        <motion.div
          className={styles.formItem}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.2 }}
        >
          <label className={styles.label}>Phone</label>
          <input
            name="phone"
            className={styles.input}
            value={form.phone}
            onChange={handleChange}
            disabled={loading}
          />
        </motion.div>

        {/* ADDRESS */}
        <motion.div
          className={styles.formItem}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.25 }}
        >
          <label className={styles.label}>Address</label>
          <input
            name="address"
            className={styles.input}
            value={form.address}
            onChange={handleChange}
            disabled={loading}
          />
        </motion.div>

        {/* SUBMIT BUTTON */}
        <motion.button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.3 }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </motion.button>

        {/* MESSAGE */}
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
