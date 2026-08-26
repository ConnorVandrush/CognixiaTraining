import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    fromAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    toAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    type: {
      type: String,
      enum: ["TRANSFER", "DEPOSIT", "WITHDRAWAL"],
      required: true,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  },
);

export default mongoose.model("Transaction", transactionSchema);
