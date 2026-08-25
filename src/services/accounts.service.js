import accountRepository from "../repositories/accounts.repository.js";
import customerRepository from "../repositories/customers.repository.js";
import branchRepository from "../repositories/branches.repository.js";

class AccountService {
  // Create a new account
  async createAccount(data) {
    const { customerId, branchId, type, initialDeposit = 0 } = data;

    if (!customerId || !branchId || !type) {
      return {
        error: true,
        status: 400,
        message: "Missing required fields: customerId, branchId, type",
      };
    }

    // Validate customer exists
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      return {
        error: true,
        status: 404,
        message: "Customer not found",
      };
    }

    // Validate branch exists
    const branch = await branchRepository.findById(branchId);
    if (!branch) {
      return {
        error: true,
        status: 404,
        message: "Branch not found",
      };
    }

    if (initialDeposit < 0) {
      return {
        error: true,
        status: 400,
        message: "Initial deposit cannot be negative",
      };
    }

    const account = await accountRepository.create({
      customerId,
      branchId,
      type,
      balance: initialDeposit,
    });

    return {
      error: false,
      status: 201,
      data: account,
    };
  }

  // List accounts with optional filtering
  async listAccounts(query) {
    const { branch_id, min_balance } = query;

    let accounts = await accountRepository.findAll();

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
      return {
        error: false,
        status: 204,
        data: null,
      };
    }

    return {
      error: false,
      status: 200,
      data: accounts,
    };
  }

  // Get account by ID
  async getAccount(id) {
    if (!id) {
      return {
        error: true,
        status: 400,
        message: "Invalid account ID",
      };
    }

    const account = await accountRepository.findById(id);

    if (!account) {
      return {
        error: true,
        status: 404,
        message: "Account not found",
      };
    }

    return {
      error: false,
      status: 200,
      data: account,
    };
  }

  // Update account details
  async updateAccount(id, updates) {
    if (!id) {
      return {
        error: true,
        status: 400,
        message: "Invalid account ID",
      };
    }

    const updated = await accountRepository.update(id, updates);

    if (!updated) {
      return {
        error: true,
        status: 404,
        message: "Account not found",
      };
    }

    return {
      error: false,
      status: 200,
      data: updated,
    };
  }

  // Close (deactivate) account
  async closeAccount(id) {
    if (!id) {
      return {
        error: true,
        status: 400,
        message: "Invalid account ID",
      };
    }

    const closed = await accountRepository.delete(id);

    if (!closed) {
      return {
        error: true,
        status: 404,
        message: "Account not found",
      };
    }

    return {
      error: false,
      status: 204,
      data: null,
    };
  }
}

export default new AccountService();
