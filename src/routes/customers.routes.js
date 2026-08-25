import express from "express";
import customerController from "../controllers/customers.controller.js";

const router = express.Router();

// POST /api/v1/customers
router.post("/", (req, res) => customerController.createCustomer(req, res));

// GET /api/v1/customers
router.get("/", (req, res) => customerController.listCustomers(req, res));

// GET /api/v1/customers/:id
router.get("/:id", (req, res) => customerController.getCustomer(req, res));

// PUT /api/v1/customers/:id
router.put("/:id", (req, res) => customerController.updateCustomer(req, res));

// DELETE /api/v1/customers/:id
router.delete("/:id", (req, res) =>
  customerController.deleteCustomer(req, res),
);

export default router;
