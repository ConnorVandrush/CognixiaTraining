import Account from "./Account.js";

export default class SavingsAccount extends Account {
  constructor(balance = 0, accountId) {
    super(balance, accountId);
  }
}
