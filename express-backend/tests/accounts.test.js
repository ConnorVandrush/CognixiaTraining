import request from "supertest";
import app from "../app.js";
import { connectTestDB, closeTestDB } from "./setup.js";

import Customer from "../src/schemas/customers.schema.js";
import Branch from "../src/schemas/branches.schema.js";
import Account from "../src/schemas/accounts.schema.js";

let customer;
let branch;

beforeAll(async () => {
  await connectTestDB();

  // Seed required Customer
  customer = await Customer.create({
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phone: "555-1234",
    address: "123 Test Street",
  });

  // Seed required Branch
  branch = await Branch.create({
    branchCode: "BR-TEST",
    name: "Test Branch",
    region: "NORTH",
    directStaffCount: 10,
    contractStaffCount: 2,
  });
});

afterAll(async () => {
  await closeTestDB();
});

describe("Accounts API", () => {
  // ---------------------------------------------------------
  // CREATE ACCOUNT
  // ---------------------------------------------------------
  test("POST /api/v1/accounts creates an account", async () => {
    const res = await request(app).post("/api/v1/accounts").send({
      customerId: customer._id.toString(),
      branchId: branch._id.toString(),
      type: "CHECKING",
      balance: 500,
    });

    expect(res.status).toBe(201);
    expect(res.body.balance).toBe(500);
    expect(res.body.type).toBe("CHECKING");
  });

  test("POST /api/v1/accounts fails with missing fields", async () => {
    const res = await request(app).post("/api/v1/accounts").send({
      balance: 500,
    });

    expect(res.status).toBe(400);
  });

  test("POST /api/v1/accounts fails with invalid customerId", async () => {
    const res = await request(app).post("/api/v1/accounts").send({
      customerId: "000000000000000000000000",
      branchId: branch._id.toString(),
      type: "CHECKING",
      balance: 500,
    });

    expect(res.status).toBe(404);
  });

  test("POST /api/v1/accounts fails with invalid branchId", async () => {
    const res = await request(app).post("/api/v1/accounts").send({
      customerId: customer._id.toString(),
      branchId: "000000000000000000000000",
      type: "CHECKING",
      balance: 500,
    });

    expect(res.status).toBe(404);
  });

  test("POST /api/v1/accounts fails with invalid account type", async () => {
    const res = await request(app).post("/api/v1/accounts").send({
      customerId: customer._id.toString(),
      branchId: branch._id.toString(),
      type: "INVALID_TYPE",
      balance: 500,
    });

    expect(res.status).toBe(400);
  });

  test("POST /api/v1/accounts fails with negative balance", async () => {
    const res = await request(app).post("/api/v1/accounts").send({
      customerId: customer._id.toString(),
      branchId: branch._id.toString(),
      type: "CHECKING",
      balance: -100,
    });

    expect(res.status).toBe(400);
  });

  test("POST /api/v1/accounts creates account with default balance", async () => {
    const res = await request(app).post("/api/v1/accounts").send({
      customerId: customer._id.toString(),
      branchId: branch._id.toString(),
      type: "SAVINGS",
    });

    expect(res.status).toBe(201);
    expect(res.body.balance).toBe(0); // schema default
  });

  // ---------------------------------------------------------
  // GET ACCOUNTS
  // ---------------------------------------------------------
  test("GET /api/v1/accounts returns accounts", async () => {
    const res = await request(app).get("/api/v1/accounts");

    expect([200, 204]).toContain(res.status);

    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  test("GET /api/v1/accounts returns 204 when no accounts exist", async () => {
    await Account.deleteMany({});

    const res = await request(app).get("/api/v1/accounts");

    expect(res.status).toBe(204);
  });
});
