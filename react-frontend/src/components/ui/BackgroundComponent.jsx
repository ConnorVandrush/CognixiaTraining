import styles from "./BackgroundComponent.module.css";

import LoginModalComponent from "../login/LoginModalComponent";

export default function BackgroundComponent() {
  return (
    <div className={styles.Background}>
      <LoginModalComponent></LoginModalComponent>
    </div>
  );
}
