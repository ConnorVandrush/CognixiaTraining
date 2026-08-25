import transactionService from "../services/transactions.service.js";

class TransactionController {
  // POST /api/v1/transactions/transfer
  async transfer(req, res) {
    const result = await transactionService.transfer(req.body);

    if (result.status === 201) {
      return res.status(201).json(result.data);
    }

    return res.status(result.status).json({ message: result.message });
  }

  // GET /api/v1/transactions?start_date=&type=
  async listTransactions(req, res) {
    const result = await transactionService.listTransactions(req.query);

    if (result.status === 204) {
      return res.status(204).send();
    }

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.status(result.status).json(result.data);
  }
}

export default new TransactionController();
