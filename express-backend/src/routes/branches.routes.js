import express from "express";
import branchController from "../controllers/branches.controller.js";
import { authGuard, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// CUSTOMER ROUTES
// ==========================================

// GET /api/v1/branches
router.get("/", authGuard, (req, res) =>
  branchController.listBranches(req, res),
);

// ==========================================
// ADMIN ROUTES
// ==========================================

// POST /api/v1/branches
router.post("/", authGuard, requireAdmin, (req, res) =>
  branchController.createBranch(req, res),
);

// ==========================================
// ANALYTICS ROUTES
// These MUST come before /:id
// ==========================================

// GET /api/v1/branches/analytics/monthly-transfers
router.get(
  "/analytics/monthly-transfers",
  authGuard,
  requireAdmin,
  (req, res) => branchController.monthlyTransferVolume(req, res),
);

// GET /api/v1/branches/analytics/staff-ratio
router.get("/analytics/staff-ratio", authGuard, requireAdmin, (req, res) =>
  branchController.staffRatioExceeds(req, res),
);

// ==========================================
// BRANCH CUSTOMER ROUTE
// ==========================================

// GET /api/v1/branches/:id/customers
router.get("/:id/customers", authGuard, requireAdmin, (req, res) =>
  branchController.getBranchCustomers(req, res),
);

// ==========================================
// SINGLE BRANCH ROUTES
// ==========================================

// GET /api/v1/branches/:id
router.get("/:id", authGuard, requireAdmin, (req, res) =>
  branchController.getBranch(req, res),
);

// PUT /api/v1/branches/:id
router.put("/:id", authGuard, requireAdmin, (req, res) =>
  branchController.updateBranch(req, res),
);

// DELETE /api/v1/branches/:id
router.delete("/:id", authGuard, requireAdmin, (req, res) =>
  branchController.deleteBranch(req, res),
);

export default router;
