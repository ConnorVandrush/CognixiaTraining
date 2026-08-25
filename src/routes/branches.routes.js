import express from "express";
import branchController from "../controllers/branches.controller.js";

const router = express.Router();

// POST /api/v1/branches
router.post("/", (req, res) => branchController.createBranch(req, res));

// GET /api/v1/branches
router.get("/", (req, res) => branchController.listBranches(req, res));

// GET /api/v1/branches/:id
router.get("/:id", (req, res) => branchController.getBranch(req, res));

// PUT /api/v1/branches/:id
router.put("/:id", (req, res) => branchController.updateBranch(req, res));

// DELETE /api/v1/branches/:id
router.delete("/:id", (req, res) =>
  branchController.deactivateBranch(req, res),
);

// GET /api/v1/branches/analytics/monthly-transfers
router.get("/analytics/monthly-transfers", (req, res) =>
  branchController.monthlyTransferVolume(req, res),
);

// GET /api/v1/branches/analytics/staff-ratio"
router.get("/analytics/staff-ratio", (req, res) =>
  branchController.staffRatioExceeds(req, res),
);

export default router;
