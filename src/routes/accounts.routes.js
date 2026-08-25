import express from "express";
import accountController from "../controllers/accounts.controller.js";

const router = express.Router();

// GET /api/v1/accounts?branch_id=123&min_balance=1000
router.get("/", (req, res) => accountController.listAccounts(req, res));

// POST /api/v1/accounts
router.post("/", (req, res) => accountController.createAccount(req, res));

// GET /api/v1/accounts/:id
router.get("/:id", (req, res) => accountController.getAccount(req, res));

// PUT /api/v1/accounts/:id
router.put("/:id", (req, res) => accountController.updateAccount(req, res));

// DELETE /api/v1/accounts/:id
router.delete("/:id", (req, res) => accountController.closeAccount(req, res));

export default router;
