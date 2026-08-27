import Branch from "../schemas/branches.schema.js";

class BranchRepository {
  create(data) {
    return Branch.create(data);
  }

  findAll() {
    return Branch.find();
  }

  findById(id) {
    return Branch.findById(id);
  }

  findByCode(branchCode) {
    return Branch.findOne({ branchCode });
  }

  update(id, updates) {
    return Branch.findByIdAndUpdate(id, updates, {
      new: true,
    });
  }

  deactivate(id) {
    return Branch.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  // Permanently delete a branch
  delete(id) {
    return Branch.findByIdAndDelete(id);
  }

  aggregate(pipeline) {
    return Branch.aggregate(pipeline);
  }
}

export default new BranchRepository();
