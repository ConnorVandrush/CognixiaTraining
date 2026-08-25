import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    type: {
      type: String,
      enum: ["CHECKING", "SAVINGS", "LOAN", "CREDIT"],
      required: true,
    },

    balance: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  },
);

export default mongoose.model("Account", accountSchema);
