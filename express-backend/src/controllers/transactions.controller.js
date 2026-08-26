import transactionService from "../services/transactions.service.js";

class TransactionController {
  // POST /api/v1/transactions/transfer
  async transfer(req, res) {
    try {
      const result = await transactionService.transfer(req.body, req.user);

      if (result.error) {
        return res.status(result.status).json({
          message: result.message,
        });
      }

      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("Transfer controller error:", error);

      return res.status(500).json({
        message: "Internal server error during transfer",
      });
    }
  }

  // GET /api/v1/transactions?start_date=&type=
  async listTransactions(req, res) {
    try {
      const result = await transactionService.listTransactions(
        req.query,
        req.user,
      );

      if (result.status === 204) {
        return res.status(204).send();
      }

      if (result.error) {
        return res.status(result.status).json({
          message: result.message,
        });
      }

      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error("List transactions controller error:", error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}

export default new TransactionController();
