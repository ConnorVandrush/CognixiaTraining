import accountRepository from "../repositories/accounts.repository.js";
import transactionRepository from "../repositories/transactions.repository.js";

class TransactionService {
  // -----------------------------
  // POST /transactions/transfer
  // -----------------------------
  async transfer({ fromAccountId, toAccountId, amount }, user) {
    if (!fromAccountId || !toAccountId || !amount) {
      return {
        error: true,
        status: 400,
        message: "Missing required fields: fromAccountId, toAccountId, amount",
      };
    }

    const from = await accountRepository.findById(fromAccountId);
    const to = await accountRepository.findById(toAccountId);

    if (!from || !to) {
      return {
        error: true,
        status: 404,
        message: "One or both accounts not found",
      };
    }

    // Ownership check
    if (user.role === "customer" && from.customerId.toString() !== user.id) {
      return {
        error: true,
        status: 403,
        message: "Forbidden: You can only transfer from your own accounts",
      };
    }

    if (amount <= 0) {
      return {
        error: true,
        status: 400,
        message: "Transfer amount must be positive",
      };
    }

    if (from.balance < amount) {
      return {
        error: true,
        status: 400,
        message: "Insufficient funds",
      };
    }

    // Perform transfer
    const newFromBalance = from.balance - amount;
    const newToBalance = to.balance + amount;

    await accountRepository.updateBalance(fromAccountId, newFromBalance);
    await accountRepository.updateBalance(toAccountId, newToBalance);

    const tx = await transactionRepository.create({
      fromAccountId,
      toAccountId,
      amount,
      type: "TRANSFER",
    });

    // ⭐ Fetch updated accounts
    const updatedFrom = await accountRepository.findById(fromAccountId);
    const updatedTo = await accountRepository.findById(toAccountId);

    return {
      error: false,
      status: 201,
      data: {
        transaction: tx,
        fromAccount: updatedFrom,
        toAccount: updatedTo,
      },
    };
  }

  // -----------------------------
  // GET /transactions
  // -----------------------------
  async listTransactions(query, user) {
    // ⭐ Admin-only access
    if (user.role !== "admin") {
      return {
        error: true,
        status: 403,
        message: "Forbidden: Only admins can view all transactions",
      };
    }

    const { start_date, type } = query;

    let txs = await transactionRepository.findAll();

    if (start_date) {
      const start = new Date(start_date);
      if (isNaN(start.getTime())) {
        return {
          error: true,
          status: 400,
          message: "Invalid start_date format",
        };
      }
      txs = txs.filter((t) => t.createdAt >= start);
    }

    if (type) {
      txs = txs.filter((t) => t.type === type.toUpperCase());
    }

    if (txs.length === 0) {
      return { error: false, status: 204, data: null };
    }

    return { error: false, status: 200, data: txs };
  }
}

export default new TransactionService();
