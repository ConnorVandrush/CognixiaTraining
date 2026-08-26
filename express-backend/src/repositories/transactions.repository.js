import Transaction from "../schemas/transactions.schema.js";

class TransactionRepository {
  findAll() {
    return Transaction.find();
  }

  findById(id) {
    return Transaction.findById(id);
  }

  create(data) {
    return Transaction.create(data);
  }

  aggregate(pipeline) {
    return Transaction.aggregate(pipeline);
  }

  async findByAccountId(accountId) {
    return Transaction.find({
      $or: [{ fromAccountId: accountId }, { toAccountId: accountId }],
    });
  }
}

export default new TransactionRepository();
