import express from "express";
import transactionController from "../controllers/transactions.controller.js";

const router = express.Router();

// POST /api/v1/transactions/transfer
router.post("/transfer", (req, res) =>
  transactionController.transfer(req, res),
);

// GET /api/v1/transactions?start_date=2026-01-01&type=TRANSFER
router.get("/", (req, res) => transactionController.listTransactions(req, res));

export default router;
