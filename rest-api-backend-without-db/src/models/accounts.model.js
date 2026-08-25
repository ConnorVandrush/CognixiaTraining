export default class Account {
  constructor({
    id,
    customerId,
    branchId,
    type,
    balance = 0,
    createdAt = new Date(),
  }) {
    this.id = id;
    this.customerId = customerId;
    this.branchId = branchId;
    this.type = type; // CHECKING, SAVINGS, etc.
    this.balance = balance;
    this.createdAt = createdAt;
  }
}
