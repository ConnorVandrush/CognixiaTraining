import express from "express";
import transactionController from "../controllers/transactions.controller.js";
import { authGuard, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/v1/transactions/transfer
// Any authenticated user (customer or admin)
// Ownership check happens in the service
router.post("/transfer", authGuard, (req, res) =>
  transactionController.transfer(req, res),
);

// GET /api/v1/transactions
// Admin only — full transaction history
router.get("/", authGuard, requireAdmin, (req, res) =>
  transactionController.listTransactions(req, res),
);

export default router;
