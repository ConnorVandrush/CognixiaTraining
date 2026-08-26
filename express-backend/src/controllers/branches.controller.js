import branchService from "../services/branches.service.js";

class BranchController {
  // POST /api/v1/branches
  async createBranch(req, res) {
    const result = await branchService.createBranch(req.body);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.status(result.status).json(result.data);
  }

  // GET /api/v1/branches
  async listBranches(req, res) {
    const result = await branchService.listBranches(req.query);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    if (result.status === 204) {
      return res.status(204).send();
    }

    return res.status(result.status).json(result.data);
  }

  // GET /api/v1/branches/:id
  async getBranch(req, res) {
    const result = await branchService.getBranch(req.params.id);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.status(result.status).json(result.data);
  }

  // PUT /api/v1/branches/:id
  async updateBranch(req, res) {
    const result = await branchService.updateBranch(req.params.id, req.body);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.status(result.status).json(result.data);
  }

  // DELETE /api/v1/branches/:id
  async deactivateBranch(req, res) {
    const result = await branchService.deactivateBranch(req.params.id);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.status(204).send();
  }

  // GET /api/v1/branches/analytics/monthly-transfers
  async monthlyTransferVolume(req, res) {
    const result = await branchService.monthlyTransferVolume(req.query);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.status(result.status).json(result.data);
  }

  // GET /api/v1/branches/analytics/staff-ratio
  async staffRatioExceeds(req, res) {
    const result = await branchService.staffRatioExceeds(req.query);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.status(result.status).json(result.data);
  }
}

export default new BranchController();
