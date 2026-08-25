import Account from "../schemas/accounts.schema.js";

class AccountRepository {
  findAll() {
    return Account.find();
  }

  findById(id) {
    return Account.findById(id);
  }

  create(data) {
    return Account.create(data);
  }

  update(id, updates) {
    return Account.findByIdAndUpdate(id, updates, { new: true });
  }

  updateBalance(id, newBalance) {
    return Account.findByIdAndUpdate(
      id,
      { balance: newBalance },
      { new: true },
    );
  }

  close(id) {
    return Account.findByIdAndUpdate(
      id,
      { isActive: false, closedAt: new Date() },
      { new: true },
    );
  }
}

export default new AccountRepository();
