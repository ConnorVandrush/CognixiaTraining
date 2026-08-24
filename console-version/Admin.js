import promptSync from "prompt-sync";
const prompt = promptSync();

import User from "./User.js";

export default class Admin extends User {
  constructor(userId, userName, password, users) {
    super(userId, userName, password);

    this.users = users;
  }

  openDashboard() {
    let running = true;

    while (running) {
      console.log("\nAdmin Dashboard");
      console.log("1. View Customers");
      console.log("2. Create User");
      console.log("3. Delete Customer");
      console.log("4. Logout");

      const input = prompt("Please select an option: ");

      switch (input) {
        case "1":
          this.viewCustomers();
          break;

        case "2":
          this.createUser();
          break;

        case "3":
          this.deleteCustomer();
          break;

        case "4":
          running = false;
          break;

        default:
          console.log("Operation not found.");
          prompt("Press Enter to continue...");
      }
    }
  }

  getCustomers() {
    return Object.entries(this.users).filter(
      ([userId, user]) => user.userType === "customer",
    );
  }

  viewCustomers() {
    const customers = this.getCustomers();

    if (customers.length === 0) {
      console.log("There are no customers.");
      prompt("Press Enter to continue...");
      return;
    }

    let selecting = true;

    while (selecting) {
      console.log("\nCustomers");

      customers.forEach(([userId, customer], index) => {
        console.log(`${index + 1}. ${customer.userName} (ID: ${userId})`);
      });

      console.log(`${customers.length + 1}. Back`);

      const selection = Number(prompt("Please select a customer: "));

      if (selection === customers.length + 1) {
        selecting = false;
        continue;
      }

      const selected = customers[selection - 1];

      if (!selected) {
        console.log("Customer not found.");
        prompt("Press Enter to continue...");
        continue;
      }

      const [userId, customer] = selected;

      this.customerDashboard(userId, customer);
    }
  }

  customerDashboard(userId, customer) {
    let running = true;

    while (running) {
      console.log(`\nCustomer: ${customer.userName}`);
      console.log(`User ID: ${userId}`);

      console.log("1. View Accounts");
      console.log("2. Change Username");
      console.log("3. Change Password");
      console.log("4. Create Account");
      console.log("5. Delete Account");
      console.log("6. Back");

      const input = prompt("Please select an option: ");

      switch (input) {
        case "1":
          this.viewAccounts(customer);
          break;

        case "2":
          this.changeUsername(customer);
          break;

        case "3":
          this.changePassword(customer);
          break;

        case "4":
          this.createAccount(customer);
          break;

        case "5":
          this.deleteAccount(customer);
          break;

        case "6":
          running = false;
          break;

        default:
          console.log("Operation not found.");
          prompt("Press Enter to continue...");
      }
    }
  }

  viewAccounts(customer) {
    console.log(`\n${customer.userName}'s Accounts`);

    const accounts = Object.entries(customer.accounts);

    if (accounts.length === 0) {
      console.log("This customer has no accounts.");
      prompt("Press Enter to continue...");
      return;
    }

    accounts.forEach(([accountId, account]) => {
      console.log(
        `${accountId} - ${account.accountType} - $${account.balance.toFixed(2)}`,
      );
    });

    prompt("Press Enter to continue...");
  }

  changeUsername(customer) {
    const newUsername = prompt("Enter the new username: ");

    if (!newUsername.trim()) {
      console.log("Username cannot be empty.");
      prompt("Press Enter to continue...");
      return;
    }

    // Make sure another user isn't already using it.
    const usernameTaken = Object.values(this.users).some(
      (user) =>
        user !== customer &&
        user.userName.toLowerCase() === newUsername.toLowerCase(),
    );

    if (usernameTaken) {
      console.log("That username is already in use.");
      prompt("Press Enter to continue...");
      return;
    }

    customer.userName = newUsername;

    console.log("Username successfully changed.");
    prompt("Press Enter to continue...");
  }

  changePassword(customer) {
    const newPassword = prompt("Enter the new password: ");

    if (newPassword.length < 4) {
      console.log("Password must be at least 4 characters.");
      prompt("Press Enter to continue...");
      return;
    }

    customer.password = newPassword;

    console.log("Password successfully changed.");
    prompt("Press Enter to continue...");
  }

  createAccount(customer) {
    console.log("\nCreate Account");
    console.log("1. Checking");
    console.log("2. Savings");

    const input = prompt("Select account type: ");

    let accountType;

    switch (input) {
      case "1":
        accountType = "checking";
        break;

      case "2":
        accountType = "savings";
        break;

      default:
        console.log("Invalid account type.");
        prompt("Press Enter to continue...");
        return;
    }

    const accountIds = Object.keys(customer.accounts);

    let nextNumber = 1;

    while (accountIds.includes(`account${nextNumber}`)) {
      nextNumber++;
    }

    const accountId = `account${nextNumber}`;

    customer.accounts[accountId] = {
      accountType,
      balance: 0,
    };

    console.log(`Created ${accountType} account: ${accountId}`);

    prompt("Press Enter to continue...");
  }

  deleteAccount(customer) {
    const accounts = Object.entries(customer.accounts);

    if (accounts.length === 0) {
      console.log("This customer has no accounts.");
      prompt("Press Enter to continue...");
      return;
    }

    console.log("\nAccounts");

    accounts.forEach(([accountId, account], index) => {
      console.log(
        `${index + 1}. ${accountId} - ${account.accountType} - $${account.balance.toFixed(2)}`,
      );
    });

    console.log(`${accounts.length + 1}. Cancel`);

    const selection = Number(prompt("Select an account to delete: "));

    if (selection === accounts.length + 1) {
      return;
    }

    const selected = accounts[selection - 1];

    if (!selected) {
      console.log("Account not found.");
      prompt("Press Enter to continue...");
      return;
    }

    const [accountId, account] = selected;

    if (account.balance !== 0) {
      console.log("You cannot delete an account with a non-zero balance.");

      prompt("Press Enter to continue...");
      return;
    }

    delete customer.accounts[accountId];

    console.log(`${accountId} successfully deleted.`);

    prompt("Press Enter to continue...");
  }

  createUser() {
    console.log("\nCreate User");
    console.log("1. Customer");
    console.log("2. Admin");

    const type = prompt("Select user type: ");

    let userType;

    switch (type) {
      case "1":
        userType = "customer";
        break;

      case "2":
        userType = "admin";
        break;

      default:
        console.log("Invalid user type.");
        prompt("Press Enter to continue...");
        return;
    }

    const userName = prompt("Enter username: ");

    if (!userName.trim()) {
      console.log("Username cannot be empty.");
      prompt("Press Enter to continue...");
      return;
    }

    const usernameTaken = Object.values(this.users).some(
      (user) => user.userName.toLowerCase() === userName.toLowerCase(),
    );

    if (usernameTaken) {
      console.log("That username is already in use.");
      prompt("Press Enter to continue...");
      return;
    }

    const password = prompt("Enter password: ");

    if (password.length < 4) {
      console.log("Password must be at least 4 characters.");
      prompt("Press Enter to continue...");
      return;
    }

    const userIds = Object.keys(this.users);

    let nextId = 1;

    while (userIds.includes(String(nextId))) {
      nextId++;
    }

    const userId = String(nextId);

    this.users[userId] = {
      userName,
      password,
      userType,
      accounts: {},
    };

    console.log(
      `Successfully created ${userType} "${userName}" with ID ${userId}.`,
    );

    prompt("Press Enter to continue...");
  }

  deleteCustomer() {
    const customers = this.getCustomers();

    if (customers.length === 0) {
      console.log("There are no customers.");
      prompt("Press Enter to continue...");
      return;
    }

    console.log("\nCustomers");

    customers.forEach(([userId, customer], index) => {
      console.log(`${index + 1}. ${customer.userName} (ID: ${userId})`);
    });

    console.log(`${customers.length + 1}. Cancel`);

    const selection = Number(prompt("Select a customer to delete: "));

    if (selection === customers.length + 1) {
      return;
    }

    const selected = customers[selection - 1];

    if (!selected) {
      console.log("Customer not found.");
      prompt("Press Enter to continue...");
      return;
    }

    const [userId, customer] = selected;

    const accountCount = Object.keys(customer.accounts).length;

    if (accountCount > 0) {
      console.log("Cannot delete a customer who still has accounts.");

      console.log("Delete their accounts first.");

      prompt("Press Enter to continue...");
      return;
    }

    delete this.users[userId];

    console.log(`Customer "${customer.userName}" successfully deleted.`);

    prompt("Press Enter to continue...");
  }
}
