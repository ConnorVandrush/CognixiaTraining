import request from "supertest";
import app from "../app.js";

import { connectTestDB, closeTestDB } from "./setup.js";

import Customer from "../src/schemas/customers.schema.js";
import Branch from "../src/schemas/branches.schema.js";
import Account from "../src/schemas/accounts.schema.js";
import Transaction from "../src/schemas/transactions.schema.js";

let customer;
let branch;
let fromAccount;
let toAccount;

beforeAll(async () => {
  await connectTestDB();

  // Seed Customer
  customer = await Customer.create({
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phone: "555-1234",
    address: "123 Test Street",
  });

  // Seed Branch
  branch = await Branch.create({
    branchCode: "BR-TEST",
    name: "Test Branch",
    region: "NORTH",
    directStaffCount: 10,
    contractStaffCount: 2,
  });

  // Seed Accounts
  fromAccount = await Account.create({
    customerId: customer._id,
    branchId: branch._id,
    type: "CHECKING",
    balance: 1000,
  });

  toAccount = await Account.create({
    customerId: customer._id,
    branchId: branch._id,
    type: "SAVINGS",
    balance: 500,
  });
});

afterAll(async () => {
  await closeTestDB();
});

describe("Transactions API", () => {
  // ---------------------------------------------------------
  // POST /transactions/transfer
  // ---------------------------------------------------------
  test("POST /api/v1/transactions/transfer creates a transaction", async () => {
    const res = await request(app).post("/api/v1/transactions/transfer").send({
      fromAccountId: fromAccount._id.toString(),
      toAccountId: toAccount._id.toString(),
      amount: 250,
    });

    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(250);
    expect(res.body.type).toBe("TRANSFER");
  });

  test("POST /api/v1/transactions/transfer fails with missing fields", async () => {
    const res = await request(app).post("/api/v1/transactions/transfer").send({
      fromAccountId: fromAccount._id.toString(),
      // missing toAccountId, amount
    });

    expect(res.status).toBe(400);
  });

  test("POST /api/v1/transactions/transfer fails with invalid account IDs", async () => {
    const res = await request(app).post("/api/v1/transactions/transfer").send({
      fromAccountId: "000000000000000000000000",
      toAccountId: toAccount._id.toString(),
      amount: 100,
    });

    expect(res.status).toBe(404);
  });

  // ---------------------------------------------------------
  // GET /transactions
  // ---------------------------------------------------------
  test("GET /api/v1/transactions returns all transactions", async () => {
    const res = await request(app).get("/api/v1/transactions");

    expect([200, 204]).toContain(res.status);

    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
});
