// seed.js
import mongoose from "mongoose";
import { connectDB } from "./src/config.js";

import Branch from "./src/schemas/branches.schema.js";
import Customer from "./src/schemas/customers.schema.js";
import Account from "./src/schemas/accounts.schema.js";
import Transaction from "./src/schemas/transactions.schema.js";

await connectDB();

async function runSeed() {
  try {
    console.log("Clearing existing collections...");

    await Branch.deleteMany({});
    await Customer.deleteMany({});
    await Account.deleteMany({});
    await Transaction.deleteMany({});

    console.log("Collections cleared.");

    // ---------------------------------------------------
    // 1. SEED BRANCHES
    // ---------------------------------------------------

    const branches = await Branch.insertMany([
      {
        branchCode: "BR-001",
        name: "Springfield Central Branch",
        address: {
          street: "100 Main St",
          city: "Springfield",
          state: "IL",
          zip: "62701",
        },
        region: "NORTH",
        directStaffCount: 18,
        contractStaffCount: 3,
      },
      {
        branchCode: "BR-002",
        name: "Springfield West Branch",
        address: {
          street: "455 Oakwood Dr",
          city: "Springfield",
          state: "IL",
          zip: "62704",
        },
        region: "WEST",
        directStaffCount: 12,
        contractStaffCount: 4,
      },
      {
        branchCode: "BR-003",
        name: "Springfield East Branch",
        address: {
          street: "88 Lincoln Ave",
          city: "Springfield",
          state: "IL",
          zip: "62703",
        },
        region: "EAST",
        directStaffCount: 10,
        contractStaffCount: 2,
      },
    ]);

    console.log(`Inserted ${branches.length} branches.`);

    // ---------------------------------------------------
    // 2. SEED CUSTOMERS
    //
    // Customer.create() is intentionally used instead of
    // insertMany() so the Customer pre("save") middleware
    // hashes the passwords with bcrypt.
    // ---------------------------------------------------

    const customers = await Customer.create([
      {
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        password: "AdminPass123!",
        phone: "555-0000",
        address: "1 Admin Plaza, Springfield, IL",
        role: "admin",
      },
      {
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@example.com",
        password: "Password123!",
        phone: "555-1010",
        address: "123 Maple St, Springfield, IL",
        role: "customer",
      },
      {
        firstName: "Bob",
        lastName: "Smith",
        email: "bob.smith@example.com",
        password: "Password123!",
        phone: "555-2020",
        address: "44 Oak Ave, Springfield, IL",
        role: "customer",
      },
      {
        firstName: "Charlie",
        lastName: "Davis",
        email: "charlie.davis@example.com",
        password: "Password123!",
        phone: "555-3030",
        address: "77 Pine Rd, Springfield, IL",
        role: "customer",
      },
    ]);

    console.log(`Inserted ${customers.length} customers (including admin).`);

    // ---------------------------------------------------
    // 3. SEED ACCOUNTS
    // ---------------------------------------------------

    const accounts = await Account.insertMany([
      {
        customerId: customers[1]._id, // Alice
        branchId: branches[0]._id,
        type: "CHECKING",
        balance: 1200,
      },
      {
        customerId: customers[2]._id, // Bob
        branchId: branches[0]._id,
        type: "SAVINGS",
        balance: 5400,
      },
      {
        customerId: customers[3]._id, // Charlie
        branchId: branches[1]._id,
        type: "CHECKING",
        balance: 850,
      },
      {
        customerId: customers[3]._id, // Charlie
        branchId: branches[2]._id,
        type: "SAVINGS",
        balance: 900,
      },
    ]);

    console.log(`Inserted ${accounts.length} accounts.`);

    // ---------------------------------------------------
    // 4. SEED TRANSACTIONS
    // ---------------------------------------------------

    const transactions = await Transaction.insertMany([
      {
        fromAccountId: accounts[0]._id,
        toAccountId: accounts[1]._id,
        amount: 250,
        type: "TRANSFER",
      },
      {
        fromAccountId: accounts[1]._id,
        toAccountId: accounts[2]._id,
        amount: 1200,
        type: "TRANSFER",
      },
      {
        fromAccountId: accounts[0]._id,
        toAccountId: accounts[0]._id,
        amount: 600,
        type: "DEPOSIT",
      },
      {
        fromAccountId: accounts[3]._id,
        toAccountId: accounts[3]._id,
        amount: 200,
        type: "WITHDRAWAL",
      },
    ]);

    console.log(`Inserted ${transactions.length} transactions.`);

    console.log("Seeding complete.");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
}

runSeed();
