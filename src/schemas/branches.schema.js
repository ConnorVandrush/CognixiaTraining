import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    branchCode: {
      type: String,
      required: true,
      unique: true,
      index: true, // fast lookups + aggregations
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },

    region: {
      type: String,
      required: true,
      index: true, // useful for analytics
    },

    // Staffing analytics
    directStaffCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    contractStaffCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Optional: branch metadata
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  },
);

// Index for analytics queries
branchSchema.index({ region: 1 });
branchSchema.index({ createdAt: 1 });

export default mongoose.model("Branch", branchSchema);
