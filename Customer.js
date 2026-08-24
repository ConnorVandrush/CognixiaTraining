import promptSync from "prompt-sync";
const prompt = promptSync();

import User from "./User.js";
import CheckingAccount from "./CheckingAccount.js";
import SavingsAccount from "./SavingsAccount.js";

export default class Customer extends User {
  constructor(userId, userName, password, accounts, users) {
    super(userId, userName, password);

    this.users = users;

    this.checkingAccounts = [];
    this.savingsAccounts = [];

    this.hydrateAccounts(accounts);
  }

  hydrateAccounts(accounts) {
    Object.entries(accounts).forEach(([accountId, account]) => {
      switch (account.accountType) {
        case "checking":
          this.checkingAccounts.push(
            new CheckingAccount(account.balance, accountId),
          );
          break;

        case "savings":
          this.savingsAccounts.push(
            new SavingsAccount(account.balance, accountId),
          );
          break;

        default:
          throw new Error(`Unknown account type: ${account.accountType}`);
      }
    });
  }

  getDashboardOptions() {
    return ["1. Checking Accounts", "2. Savings Accounts", "3. Logout"];
  }

  openDashboard() {
    let running = true;

    while (running) {
      console.log("\nCustomer Dashboard");

      this.getDashboardOptions().forEach((option) => {
        console.log(option);
      });

      const input = prompt("Please select an option: ");

      switch (input) {
        case "1":
          this.selectAccount(this.checkingAccounts, "Checking");
          break;

        case "2":
          this.selectAccount(this.savingsAccounts, "Savings");
          break;

        case "3":
          running = false;
          break;

        default:
          console.log("Operation not found, please try again.");
          prompt("Press Enter to continue...");
      }
    }
  }

  selectAccount(accounts, accountType) {
    let selecting = true;

    while (selecting) {
      console.log(`\n${accountType} Accounts`);

      if (accounts.length === 0) {
        console.log(
          `You don't have any ${accountType.toLowerCase()} accounts.`,
        );

        prompt("Press Enter to continue...");
        return;
      }

      accounts.forEach((account, index) => {
        console.log(
          `${index + 1}. ${accountType} Account ${index + 1} - $${account.balance.toFixed(2)}`,
        );
      });

      console.log(`${accounts.length + 1}. Back`);

      const selection = Number(prompt("Please select an account: "));

      if (selection === accounts.length + 1) {
        selecting = false;
        continue;
      }

      const account = accounts[selection - 1];

      if (!account) {
        console.log("Account not found, please try again.");
        prompt("Press Enter to continue...");
        continue;
      }

      this.openAccountDashboard(account, accountType);
    }
  }

  openAccountDashboard(account, accountType) {
    let running = true;

    while (running) {
      console.log(`\n${accountType} Account`);
      console.log(`Balance: $${account.balance.toFixed(2)}`);

      console.log("1. View Balance");
      console.log("2. Deposit");
      console.log("3. Withdraw");
      console.log("4. Transfer");
      console.log("5. Back");

      const input = prompt("Please select an option: ");

      switch (input) {
        case "1":
          this.viewBalance(account);
          break;

        case "2":
          this.depositPrompt(account);
          break;

        case "3":
          this.withdrawPrompt(account);
          break;

        case "4":
          this.transferPrompt(account);
          break;

        case "5":
          running = false;
          break;

        default:
          console.log("Operation not found, please try again.");
          prompt("Press Enter to continue...");
      }
    }
  }

  viewBalance(account) {
    console.log(`Current balance: $${account.balance.toFixed(2)}`);
    prompt("Press Enter to continue...");
  }

  depositPrompt(account) {
    const amount = Number(prompt("Enter deposit amount: "));

    if (!Number.isFinite(amount) || amount <= 0) {
      console.log("Please enter a valid positive amount.");
      prompt("Press Enter to continue...");
      return;
    }

    try {
      account.deposit(amount);

      console.log(`Successfully deposited $${amount.toFixed(2)}.`);

      console.log(`New balance: $${account.balance.toFixed(2)}`);
    } catch (error) {
      console.log(error.message);
    }

    prompt("Press Enter to continue...");
  }

  withdrawPrompt(account) {
    const amount = Number(prompt("Enter withdrawal amount: "));

    if (!Number.isFinite(amount) || amount <= 0) {
      console.log("Please enter a valid positive amount.");
      prompt("Press Enter to continue...");
      return;
    }

    try {
      account.withdraw(amount);

      console.log(`Successfully withdrew $${amount.toFixed(2)}.`);

      console.log(`New balance: $${account.balance.toFixed(2)}`);
    } catch (error) {
      console.log(error.message);
    }

    prompt("Press Enter to continue...");
  }

  transferPrompt(sourceAccount) {
    // Get recipient's user ID
    const recipientId = prompt("Enter the recipient's account number: ");

    const recipient = this.users[recipientId];

    if (!recipient) {
      console.log("User not found.");
      prompt("Press Enter to continue...");
      return;
    }

    // Make sure the recipient isn't the current user
    if (recipientId === this.userId) {
      console.log("You cannot transfer money to yourself.");
      prompt("Press Enter to continue...");
      return;
    }

    const recipientAccounts = Object.entries(recipient.accounts);

    if (recipientAccounts.length === 0) {
      console.log("This user has no accounts.");
      prompt("Press Enter to continue...");
      return;
    }

    // Display recipient's accounts
    console.log(`\n${recipient.userName}'s Accounts`);

    recipientAccounts.forEach(([accountId, account], index) => {
      console.log(
        `${index + 1}. ${accountId} (${account.accountType}) - $${account.balance.toFixed(2)}`,
      );
    });

    const selection = Number(prompt("Select the account to transfer to: "));

    const selectedAccount = recipientAccounts[selection - 1];

    if (!selectedAccount) {
      console.log("Account not found.");
      prompt("Press Enter to continue...");
      return;
    }

    const [recipientAccountId, recipientAccount] = selectedAccount;

    // Get transfer amount
    const amount = Number(prompt("Enter the amount to transfer: "));

    if (!Number.isFinite(amount) || amount <= 0) {
      console.log("Please enter a valid positive amount.");
      prompt("Press Enter to continue...");
      return;
    }

    // Try to withdraw from source account
    try {
      sourceAccount.withdraw(amount);
    } catch (error) {
      console.log(error.message);
      prompt("Press Enter to continue...");
      return;
    }

    // Add money to recipient's raw account
    recipientAccount.balance += amount;

    console.log(
      `Successfully transferred $${amount.toFixed(2)} to ${recipient.userName}.`,
    );

    console.log(`Your new balance: $${sourceAccount.balance.toFixed(2)}`);

    prompt("Press Enter to continue...");
  }

  getAccountData() {
    const accounts = {};

    this.checkingAccounts.forEach((account) => {
      accounts[account.accountId] = {
        accountType: "checking",
        balance: account.balance,
      };
    });

    this.savingsAccounts.forEach((account) => {
      accounts[account.accountId] = {
        accountType: "savings",
        balance: account.balance,
      };
    });

    return accounts;
  }
}
