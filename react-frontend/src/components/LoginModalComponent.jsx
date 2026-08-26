import { motion, AnimatePresence } from "framer-motion";
import styles from "./LoginModalComponent.module.css";

import LoginComponent from "./LoginComponent.jsx";
import CreateAccountComponent from "./CreateAccountComponent.jsx";

export default function LoginModalComponent({ modal }) {
  // Don't render ANYTHING if there isn't a valid modal
  if (modal !== "login" && modal !== "createAccount") {
    return null;
  }

  return (
    <div className={styles.backdrop}>
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.35,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <AnimatePresence mode="wait">
          {modal === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{
                duration: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <LoginComponent />
            </motion.div>
          )}

          {modal === "createAccount" && (
            <motion.div
              key="createAccount"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{
                duration: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <CreateAccountComponent />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
