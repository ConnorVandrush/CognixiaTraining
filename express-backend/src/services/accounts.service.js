import accountRepository from "../repositories/accounts.repository.js";
import customerRepository from "../repositories/customers.repository.js";
import branchRepository from "../repositories/branches.repository.js";

class AccountService {
  // -----------------------------
  // CREATE ACCOUNT
  // -----------------------------
  async createAccount(data, user) {
    const { customerId, branchId, type, balance = 0 } = data;

    if (!customerId || !branchId || !type) {
      return {
        error: true,
        status: 400,
        message: "Missing required fields: customerId, branchId, type",
      };
    }

    // Customers can only create accounts for themselves
    if (user.role === "customer" && user.id !== customerId) {
      return {
        error: true,
        status: 403,
        message: "Forbidden: You can only create accounts for yourself",
      };
    }

    const allowedTypes = ["CHECKING", "SAVINGS"];
    if (!allowedTypes.includes(type.toUpperCase())) {
      return {
        error: true,
        status: 400,
        message: "Invalid account type. Allowed: CHECKING, SAVINGS",
      };
    }

    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      return { error: true, status: 404, message: "Customer not found" };
    }

    const branch = await branchRepository.findById(branchId);
    if (!branch) {
      return { error: true, status: 404, message: "Branch not found" };
    }

    if (balance < 0) {
      return {
        error: true,
        status: 400,
        message: "Balance cannot be negative",
      };
    }

    const account = await accountRepository.create({
      customerId,
      branchId,
      type: type.toUpperCase(),
      balance,
    });

    return { error: false, status: 201, data: account };
  }

  // -----------------------------
  // LIST ACCOUNTS
  // -----------------------------
  async listAccounts(query, user) {
    const { branch_id, min_balance } = query;

    let accounts = await accountRepository.findAll();

    // Customers can only see their own accounts
    if (user.role === "customer") {
      accounts = accounts.filter((a) => a.customerId.toString() === user.id);
    }

    if (branch_id) {
      accounts = accounts.filter((a) => String(a.branchId) === branch_id);
    }

    if (min_balance) {
      const min = Number(min_balance);
      if (isNaN(min)) {
        return {
          error: true,
          status: 400,
          message: "min_balance must be a number",
        };
      }
      accounts = accounts.filter((a) => a.balance >= min);
    }

    if (accounts.length === 0) {
      return { error: false, status: 204, data: null };
    }

    return { error: false, status: 200, data: accounts };
  }

  // -----------------------------
  // GET ACCOUNT
  // -----------------------------
  async getAccount(id, user) {
    if (!id) {
      return { error: true, status: 400, message: "Invalid account ID" };
    }

    const account = await accountRepository.findById(id);
    if (!account) {
      return { error: true, status: 404, message: "Account not found" };
    }

    // Customers can only view their own accounts
    if (user.role === "customer" && account.customerId.toString() !== user.id) {
      return {
        error: true,
        status: 403,
        message: "Forbidden: You can only view your own accounts",
      };
    }

    return { error: false, status: 200, data: account };
  }

  // -----------------------------
  // UPDATE ACCOUNT (ADMIN ONLY)
  // -----------------------------
  async updateAccount(id, updates, user) {
    if (!id) {
      return { error: true, status: 400, message: "Invalid account ID" };
    }

    // Customers cannot update accounts
    if (user.role === "customer") {
      return {
        error: true,
        status: 403,
        message: "Forbidden: Only admins can update accounts",
      };
    }

    if (updates.balance !== undefined && updates.balance < 0) {
      return {
        error: true,
        status: 400,
        message: "Balance cannot be negative",
      };
    }

    const updated = await accountRepository.update(id, updates);
    if (!updated) {
      return { error: true, status: 404, message: "Account not found" };
    }

    return { error: false, status: 200, data: updated };
  }

  // -----------------------------
  // CLOSE ACCOUNT (ADMIN ONLY)
  // -----------------------------
  async closeAccount(id, user) {
    if (!id) {
      return { error: true, status: 400, message: "Invalid account ID" };
    }

    // Customers cannot close accounts
    if (user.role === "customer") {
      return {
        error: true,
        status: 403,
        message: "Forbidden: Only admins can close accounts",
      };
    }

    const closed = await accountRepository.delete(id);
    if (!closed) {
      return { error: true, status: 404, message: "Account not found" };
    }

    return { error: false, status: 204, data: null };
  }
}

export default new AccountService();
