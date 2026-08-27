import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import styles from "./AdminHeaderComponent.module.css";

import { setSelectedTab } from "../../store/AdminSlice";
import { setHeader, setLoginModal } from "../../store/LoginSlice";

export default function AdminHeaderComponent() {
  const dispatch = useDispatch();

  const admin = useSelector((state) => state.LoginSlice.header);
  const selectedTab = useSelector((state) => state.AdminSlice.selectedTab);

  function handleTab(tab) {
    dispatch(setSelectedTab(tab));
  }

  function handleLogout() {
    // Clear header → logged out
    dispatch(setHeader(null));

    // Show login modal again
    dispatch(setLoginModal("login"));
  }

  return (
    <motion.div
      className={styles.headerContainer}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* =========================
          TOP ROW — ADMIN GREETING + LOGOUT
      ========================== */}
      <div className={styles.topRow}>
        <div className={styles.greeting}>
          Admin Dashboard —{" "}
          <span className={styles.name}>
            {admin?.firstName} {admin?.lastName}
          </span>
        </div>

        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* =========================
          TABS
      ========================== */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${
            selectedTab === "branches" ? styles.active : ""
          }`}
          onClick={() => handleTab("branches")}
        >
          Branches
        </button>

        <button
          className={`${styles.tabButton} ${
            selectedTab === "customers" ? styles.active : ""
          }`}
          onClick={() => handleTab("customers")}
        >
          Customers
        </button>

        <button
          className={`${styles.tabButton} ${
            selectedTab === "accounts" ? styles.active : ""
          }`}
          onClick={() => handleTab("accounts")}
        >
          Accounts
        </button>

        <button
          className={`${styles.tabButton} ${
            selectedTab === "analytics" ? styles.active : ""
          }`}
          onClick={() => handleTab("analytics")}
        >
          Analytics
        </button>
      </div>
    </motion.div>
  );
}
