import { useSelector } from "react-redux";

import BackgroundComponent from "./components/ui/BackgroundComponent";
import LoginModalComponent from "./components/login/LoginModalComponent";

import CustomerHeaderComponent from "./components/customer/CustomerHeaderComponent";
import AdminHeaderComponent from "./components/admin/AdminHeaderComponent";

import AccountsComponent from "./components/customer/AccountsComponent";
import CreateNewAccountComponent from "./components/customer/CreateNewAccountComponent";
import PersonalInformationComponent from "./components/customer/PersonalInformationComponent";
import TransferComponent from "./components/customer/TransferComponent";

// Admin panels
import AdminBranchesComponent from "./components/admin/AdminBranchesComponent";
import AdminCustomersComponent from "./components/admin/AdminCustomersComponent";
import AdminAccountsComponent from "./components/admin/AdminAccountsComponent";
import AdminAnalyticsComponent from "./components/admin/AdminAnalyticsComponent";

export default function App() {
  const header = useSelector((state) => state.LoginSlice.header);
  const loginModal = useSelector((state) => state.LoginSlice.loginModal);

  const customerTab = useSelector((state) => state.CustomerSlice.selectedTab);

  const adminTab = useSelector((state) => state.AdminSlice.selectedTab);

  const isLoggedIn = Boolean(header);
  const isAdmin = header?.role === "admin";

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <BackgroundComponent />

      {!isLoggedIn && loginModal && <LoginModalComponent modal={loginModal} />}

      {isLoggedIn && (
        <>
          {/* =========================
              HEADER BASED ON ROLE
          ========================== */}
          {isAdmin ? <AdminHeaderComponent /> : <CustomerHeaderComponent />}

          {/* =========================
              CUSTOMER DASHBOARD
          ========================== */}
          {!isAdmin && (
            <>
              {customerTab === "accounts" && <AccountsComponent />}
              {customerTab === "openAccount" && <CreateNewAccountComponent />}
              {customerTab === "transfer" && <TransferComponent />}
              {customerTab === "settings" && <PersonalInformationComponent />}
            </>
          )}

          {/* =========================
              ADMIN DASHBOARD
          ========================== */}
          {isAdmin && (
            <>
              {adminTab === "branches" && <AdminBranchesComponent />}
              {adminTab === "customers" && <AdminCustomersComponent />}
              {adminTab === "accounts" && <AdminAccountsComponent />}
              {adminTab === "analytics" && <AdminAnalyticsComponent />}
            </>
          )}
        </>
      )}
    </div>
  );
}
