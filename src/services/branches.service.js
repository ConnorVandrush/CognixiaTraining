import branchRepository from "../repositories/branches.repository.js";
import accountRepository from "../repositories/accounts.repository.js";
import transactionRepository from "../repositories/transactions.repository.js";

class BranchService {
  // POST /branches
  async createBranch(data) {
    const { branchCode, name, region } = data;

    if (!branchCode || !name || !region) {
      return {
        error: true,
        status: 400,
        message: "Missing required fields: branchCode, name, region",
      };
    }

    // Ensure branchCode is unique
    const existing = await branchRepository.findByCode(branchCode);
    if (existing) {
      return {
        error: true,
        status: 409,
        message: "Branch code already exists",
      };
    }

    const branch = await branchRepository.create(data);

    return {
      error: false,
      status: 201,
      data: branch,
    };
  }

  // GET /branches
  async listBranches(query) {
    const branches = await branchRepository.findAll();

    if (branches.length === 0) {
      return { error: false, status: 204, data: null };
    }

    return { error: false, status: 200, data: branches };
  }

  // GET /branches/:id
  async getBranch(id) {
    if (!id) {
      return { error: true, status: 400, message: "Invalid branch ID" };
    }

    const branch = await branchRepository.findById(id);

    if (!branch) {
      return { error: true, status: 404, message: "Branch not found" };
    }

    return { error: false, status: 200, data: branch };
  }

  // PUT /branches/:id
  async updateBranch(id, updates) {
    if (!id) {
      return { error: true, status: 400, message: "Invalid branch ID" };
    }

    const updated = await branchRepository.update(id, updates);

    if (!updated) {
      return { error: true, status: 404, message: "Branch not found" };
    }

    return { error: false, status: 200, data: updated };
  }

  // DELETE /branches/:id
  async deactivateBranch(id) {
    if (!id) {
      return { error: true, status: 400, message: "Invalid branch ID" };
    }

    const updated = await branchRepository.deactivate(id);

    if (!updated) {
      return { error: true, status: 404, message: "Branch not found" };
    }

    return { error: false, status: 204, data: null };
  }

  // GET /branches/analytics/monthly-transfers
  async monthlyTransferVolume() {
    const results = await transactionRepository.aggregate([
      // Join accounts
      {
        $lookup: {
          from: "accounts",
          localField: "fromAccountId",
          foreignField: "_id",
          as: "fromAccount",
        },
      },
      { $unwind: "$fromAccount" },

      // Join branches
      {
        $lookup: {
          from: "branches",
          localField: "fromAccount.branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      { $unwind: "$branch" },

      // Only transfers
      { $match: { type: "TRANSFER" } },

      // Group by branch + month
      {
        $group: {
          _id: {
            branchId: "$branch._id",
            branchCode: "$branch.branchCode",
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalVolume: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },

      // Sort by branch + date
      { $sort: { "_id.branchCode": 1, "_id.year": 1, "_id.month": 1 } },
    ]);

    return {
      error: false,
      status: 200,
      data: results,
    };
  }

  // GET /branches/analytics/staff-ratio
  async staffRatioExceeds(query) {
    const threshold = Number(query.threshold ?? 0.2);

    const results = await branchRepository.aggregate([
      {
        $project: {
          branchCode: 1,
          name: 1,
          region: 1,
          directStaffCount: 1,
          contractStaffCount: 1,
          ratio: {
            $cond: [
              { $eq: ["$directStaffCount", 0] },
              1, // avoid division by zero
              { $divide: ["$contractStaffCount", "$directStaffCount"] },
            ],
          },
        },
      },
      { $match: { ratio: { $gt: threshold } } },
      { $sort: { ratio: -1 } },
    ]);

    return {
      error: false,
      status: 200,
      data: results,
    };
  }
}

export default new BranchService();
