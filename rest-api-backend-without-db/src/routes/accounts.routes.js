import express from "express";
import accountController from "../controllers/accounts.controller.js";

const router = express.Router();

// POST /api/v1/accounts
router.post("/", (req, res) => accountController.createAccount(req, res));

// GET /api/v1/accounts?branch_id=123&min_balance=1000
router.get("/", (req, res) => accountController.listAccounts(req, res));

export default router;
