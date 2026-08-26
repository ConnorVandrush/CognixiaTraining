import { useSelector, useDispatch } from "react-redux";
import styles from "./CustomerHeaderComponent.module.css";
import { setSelectedTab } from "../store/CustomerSlice";
import { setHeader, setLoginModal } from "../store/LoginSlice";

export default function CustomerHeaderComponent() {
  const dispatch = useDispatch();

  const customer = useSelector((state) => state.CustomerSlice.customerInfo);
  const selectedTab = useSelector((state) => state.CustomerSlice.selectedTab);

  function handleTab(tab) {
    dispatch(setSelectedTab(tab));
  }

  function handleLogout() {
    dispatch(setHeader(null));
    dispatch(setLoginModal("login"));
  }

  return (
    <div className={styles.headerContainer}>
      <div className={styles.topRow}>
        <div className={styles.greeting}>
          Hello,{" "}
          <span className={styles.name}>
            {customer.firstName} {customer.lastName}
          </span>
        </div>

        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className={styles.tabs}>
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
            selectedTab === "transfer" ? styles.active : ""
          }`}
          onClick={() => handleTab("transfer")}
        >
          Transfer Funds
        </button>

        <button
          className={`${styles.tabButton} ${
            selectedTab === "openAccount" ? styles.active : ""
          }`}
          onClick={() => handleTab("openAccount")}
        >
          Open New Account
        </button>

        <button
          className={`${styles.tabButton} ${
            selectedTab === "settings" ? styles.active : ""
          }`}
          onClick={() => handleTab("settings")}
        >
          Personal Information
        </button>
      </div>
    </div>
  );
}
