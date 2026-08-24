import Account from "./Account.js";

export default class CheckingAccount extends Account {
  constructor(balance = 0, accountId, overdraftLimit = 500) {
    super(balance, accountId);

    this.overdraftLimit = overdraftLimit;
  }

  withdraw(amount) {
    if (typeof amount !== "number" || !Number.isFinite(amount)) {
      throw new Error("Withdrawal amount must be a valid number");
    }

    if (amount <= 0) {
      throw new Error("Withdrawal amount must be positive");
    }

    if (amount > this.balance + this.overdraftLimit) {
      throw new Error(
        `Withdrawal exceeds your $${this.overdraftLimit} overdraft limit`,
      );
    }

    this.balance -= amount;
  }
}
