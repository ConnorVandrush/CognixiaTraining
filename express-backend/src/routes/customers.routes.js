import express from "express";
import customerController from "../controllers/customers.controller.js";
import { authGuard, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// PUBLIC ROUTES
router.post("/", (req, res) => customerController.createCustomer(req, res));
router.post("/login", (req, res) => customerController.login(req, res));

// PROTECTED ROUTES (any logged-in user)
router.get("/", authGuard, (req, res) =>
  customerController.listCustomers(req, res),
);
router.get("/:id", authGuard, (req, res) =>
  customerController.getCustomer(req, res),
);
router.put("/:id", authGuard, (req, res) =>
  customerController.updateCustomer(req, res),
);
router.delete("/:id", authGuard, (req, res) =>
  customerController.deleteCustomer(req, res),
);

// ADMIN-ONLY ROUTES
router.get("/admin/all", authGuard, requireAdmin, (req, res) =>
  customerController.listCustomers(req, res),
);

export default router;
