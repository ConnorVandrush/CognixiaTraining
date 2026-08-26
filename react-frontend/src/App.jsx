import { useSelector } from "react-redux";

import BackgroundComponent from "./components/BackgroundComponent";
import LoginModalComponent from "./components/LoginModalComponent";
import CustomerHeaderComponent from "./components/CustomerHeaderComponent";

import AccountsComponent from "./components/AccountsComponent";
import CreateNewAccountComponent from "./components/CreateNewAccountComponent";
import PersonalInformationComponent from "./components/PersonalInformationComponent";
import TransferComponent from "./components/TransferComponent";

export default function App() {
  const header = useSelector((state) => state.LoginSlice.header);
  const loginModal = useSelector((state) => state.LoginSlice.loginModal);
  const selectedTab = useSelector((state) => state.CustomerSlice.selectedTab);

  const isLoggedIn = Boolean(header);

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <BackgroundComponent />

      {!isLoggedIn && loginModal && <LoginModalComponent modal={loginModal} />}

      {isLoggedIn && (
        <>
          <CustomerHeaderComponent />
          {selectedTab === "accounts" && <AccountsComponent />}
          {selectedTab === "openAccount" && <CreateNewAccountComponent />}
          {selectedTab === "transfer" && <TransferComponent />}
          {selectedTab === "settings" && <PersonalInformationComponent />}
        </>
      )}
    </div>
  );
}
