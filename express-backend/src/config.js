// src/config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_KEY);
    console.log("Connected to BankApp DB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}
