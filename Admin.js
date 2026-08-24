import User from "./User.js";

export default class Admin extends User {
  constructor(userName, password) {
    super(userName, password);
  }

  openDashboard() {
    let running = true;

    while (running) {
      console.log("\nAdmin Dashboard");
      console.log("1. Admin functionality");
      console.log("2. Logout");

      const input = prompt("Please select an option: ");

      switch (input) {
        case "1":
          console.log("Admin functionality coming soon.");
          prompt("Press Enter to continue...");
          break;

        case "2":
          running = false;
          break;

        default:
          console.log("Operation not found.");
          prompt("Press Enter to continue...");
      }
    }
  }
}
