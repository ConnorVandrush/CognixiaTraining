export default class Account {
  #balance;

  constructor(balance = 0, accountId) {
    this.accountId = accountId;
    this.balance = balance;
  }

  get balance() {
    return this.#balance;
  }

  set balance(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error("Balance must be a valid number");
    }

    this.#balance = value;
  }

  deposit(amount) {
    if (typeof amount !== "number" || !Number.isFinite(amount)) {
      throw new Error("Deposit amount must be a valid number");
    }

    if (amount <= 0) {
      throw new Error("Deposit amount must be positive");
    }

    this.#balance += amount;
  }

  withdraw(amount) {
    if (typeof amount !== "number" || !Number.isFinite(amount)) {
      throw new Error("Withdrawal amount must be a valid number");
    }

    if (amount <= 0) {
      throw new Error("Withdrawal amount must be positive");
    }

    if (amount > this.#balance) {
      throw new Error("Insufficient funds");
    }

    this.#balance -= amount;
  }
}
