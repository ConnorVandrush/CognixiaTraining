import accountRepository from "../repositories/accounts.repository.js";
import transactionRepository from "../repositories/transactions.repository.js";

class TransactionService {
  // POST /transactions/transfer
  async transfer({ fromAccountId, toAccountId, amount }) {
    if (!fromAccountId || !toAccountId || !amount) {
      return {
        error: true,
        status: 400,
        message: "Missing required fields: fromAccountId, toAccountId, amount",
      };
    }

    // Fetch accounts from MongoDB
    const from = await accountRepository.findById(fromAccountId);
    const to = await accountRepository.findById(toAccountId);

    if (!from || !to) {
      return {
        error: true,
        status: 404,
        message: "One or both accounts not found",
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

    // Perform transfer in MongoDB
    await accountRepository.updateBalance(fromAccountId, from.balance - amount);
    await accountRepository.updateBalance(toAccountId, to.balance + amount);

    // Create transaction record
    const tx = await transactionRepository.create({
      fromAccountId,
      toAccountId,
      amount,
      type: "TRANSFER",
    });

    return {
      error: false,
      status: 201,
      data: tx,
    };
  }

  // GET /transactions?start_date=&type=
  async listTransactions(query) {
    const { start_date, type } = query;

    let txs = await transactionRepository.findAll();

    // Filter by start_date
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

    // Filter by type
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
