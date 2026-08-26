import Branch from "../schemas/branches.schema.js";

class BranchRepository {
  // Create a new branch
  create(data) {
    return Branch.create(data);
  }

  // Find all branches
  findAll() {
    return Branch.find();
  }

  // Find branch by ID
  findById(id) {
    return Branch.findById(id);
  }

  // Find branch by branchCode (unique)
  findByCode(branchCode) {
    return Branch.findOne({ branchCode });
  }

  // Update branch
  update(id, updates) {
    return Branch.findByIdAndUpdate(id, updates, { new: true });
  }

  // Soft delete / deactivate branch
  deactivate(id) {
    return Branch.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  // Aggregation pipeline support
  aggregate(pipeline) {
    return Branch.aggregate(pipeline);
  }
}

export default new BranchRepository();
