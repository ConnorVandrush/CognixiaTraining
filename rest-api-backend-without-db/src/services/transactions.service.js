import accountRepository from "../repositories/accounts.repository.js";
import transactionRepository from "../repositories/transactions.repository.js";

class TransactionService {
  // POST /transactions/transfer
  transfer({ fromAccountId, toAccountId, amount }) {
    if (!fromAccountId || !toAccountId || !amount) {
      return {
        error: true,
        status: 400,
        message: "Missing required fields: fromAccountId, toAccountId, amount",
      };
    }

    const from = accountRepository.findById(fromAccountId);
    const to = accountRepository.findById(toAccountId);

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

    // Perform transfer
    accountRepository.updateBalance(fromAccountId, from.balance - amount);
    accountRepository.updateBalance(toAccountId, to.balance + amount);

    const tx = transactionRepository.create({
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
  listTransactions(query) {
    const { start_date, type } = query;

    let txs = transactionRepository.findAll();

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
