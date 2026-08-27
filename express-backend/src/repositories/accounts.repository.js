import Account from "../schemas/accounts.schema.js";

class AccountRepository {
  findAll() {
    return Account.find();
  }

  findById(id) {
    return Account.findById(id);
  }

  findByBranchId(branchId) {
    return Account.find({ branchId });
  }

  create(data) {
    return Account.create(data);
  }

  update(id, updates) {
    return Account.findByIdAndUpdate(id, updates, {
      new: true,
    });
  }

  updateBalance(id, newBalance) {
    return Account.findByIdAndUpdate(
      id,
      { balance: newBalance },
      { new: true },
    );
  }

  delete(id) {
    return Account.findByIdAndDelete(id);
  }
}

export default new AccountRepository();
