import express from "express";
import accountController from "../controllers/accounts.controller.js";
import { authGuard, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/v1/accounts?branch_id=123&min_balance=1000
// Any authenticated user (customer or admin)
router.get("/", authGuard, (req, res) =>
  accountController.listAccounts(req, res),
);

// POST /api/v1/accounts
// Any authenticated user (customer or admin)
router.post("/", authGuard, (req, res) =>
  accountController.createAccount(req, res),
);

// GET /api/v1/accounts/:id
// Any authenticated user (customer or admin)
// Controller must check ownership for customers
router.get("/:id", authGuard, (req, res) =>
  accountController.getAccount(req, res),
);

// PUT /api/v1/accounts/:id
// Admin only
router.put("/:id", authGuard, requireAdmin, (req, res) =>
  accountController.updateAccount(req, res),
);

// DELETE /api/v1/accounts/:id
// Admin only
router.delete("/:id", authGuard, requireAdmin, (req, res) =>
  accountController.closeAccount(req, res),
);

export default router;
