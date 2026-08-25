export default class Transaction {
  constructor({
    id,
    fromAccountId,
    toAccountId,
    amount,
    type,
    createdAt = new Date(),
  }) {
    this.id = id;
    this.fromAccountId = fromAccountId;
    this.toAccountId = toAccountId;
    this.amount = amount;
    this.type = type; // TRANSFER
    this.createdAt = createdAt;
  }
}
