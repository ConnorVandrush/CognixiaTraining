import request from "supertest";
import app from "../app.js";
import { connectTestDB, closeTestDB } from "./setup.js";

import Branch from "../src/schemas/branches.schema.js";
import Account from "../src/schemas/accounts.schema.js";
import Transaction from "../src/schemas/transactions.schema.js";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("Branch Analytics – Monthly Transfers", () => {
  // ---------------------------------------------------------
  // HAPPY PATH
  // ---------------------------------------------------------
  test("returns monthly transfer data for a branch", async () => {
    const branch = await Branch.create({
      branchCode: "BR-001",
      name: "Test Branch",
      region: "NORTH",
      directStaffCount: 10,
      contractStaffCount: 3,
    });

    const account = await Account.create({
      customerId: "6a8de1a768d97b652d7bc487",
      branchId: branch._id,
      type: "CHECKING",
      balance: 1000,
    });

    await Transaction.create({
      fromAccountId: account._id,
      toAccountId: account._id,
      amount: 250,
      type: "TRANSFER",
    });

    const res = await request(app).get(
      "/api/v1/branches/analytics/monthly-transfers",
    );

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].totalVolume).toBe(250);
  });

  // ---------------------------------------------------------
  // EMPTY RESULT → 204
  // ---------------------------------------------------------
  test("returns 204 when no transfers exist", async () => {
    await Transaction.deleteMany({});
    await Branch.deleteMany({});
    await Account.deleteMany({});

    const res = await request(app).get(
      "/api/v1/branches/analytics/monthly-transfers",
    );

    expect(res.status).toBe(204);
  });

  // ---------------------------------------------------------
  // NON‑TRANSFER TRANSACTIONS ARE IGNORED
  // ---------------------------------------------------------
  test("ignores non-TRANSFER transactions", async () => {
    const branch = await Branch.create({
      branchCode: "BR-002",
      name: "Ignore Branch",
      region: "SOUTH",
      directStaffCount: 5,
      contractStaffCount: 1,
    });

    const account = await Account.create({
      customerId: "6a8de1a768d97b652d7bc487",
      branchId: branch._id,
      type: "CHECKING",
      balance: 500,
    });

    await Transaction.create({
      fromAccountId: account._id,
      toAccountId: account._id,
      amount: 999,
      type: "DEPOSIT",
    });

    const res = await request(app).get(
      "/api/v1/branches/analytics/monthly-transfers",
    );

    expect(res.status).toBe(204);
  });

  // ---------------------------------------------------------
  // MULTI‑MONTH GROUPING
  // ---------------------------------------------------------
  test("groups transfers by month and year", async () => {
    await Transaction.deleteMany({});
    await Branch.deleteMany({});
    await Account.deleteMany({});

    const branch = await Branch.create({
      branchCode: "BR-003",
      name: "Grouping Branch",
      region: "WEST",
      directStaffCount: 8,
      contractStaffCount: 2,
    });

    const account = await Account.create({
      customerId: "6a8de1a768d97b652d7bc487",
      branchId: branch._id,
      type: "CHECKING",
      balance: 2000,
    });

    // January transfer
    await Transaction.create({
      fromAccountId: account._id,
      toAccountId: account._id,
      amount: 100,
      type: "TRANSFER",
      createdAt: new Date("2026-01-15"),
    });

    // February transfer
    await Transaction.create({
      fromAccountId: account._id,
      toAccountId: account._id,
      amount: 200,
      type: "TRANSFER",
      createdAt: new Date("2026-02-10"),
    });

    const res = await request(app).get(
      "/api/v1/branches/analytics/monthly-transfers",
    );

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    const jan = res.body.find((x) => x._id.month === 1);
    const feb = res.body.find((x) => x._id.month === 2);

    expect(jan.totalVolume).toBe(100);
    expect(feb.totalVolume).toBe(200);
  });

  // ---------------------------------------------------------
  // MULTI‑BRANCH GROUPING
  // ---------------------------------------------------------
  test("groups transfers by branch", async () => {
    await Transaction.deleteMany({});
    await Branch.deleteMany({});
    await Account.deleteMany({});

    const branchA = await Branch.create({
      branchCode: "BR-A",
      name: "Branch A",
      region: "NORTH",
      directStaffCount: 5,
      contractStaffCount: 1,
    });

    const branchB = await Branch.create({
      branchCode: "BR-B",
      name: "Branch B",
      region: "SOUTH",
      directStaffCount: 7,
      contractStaffCount: 2,
    });

    const accountA = await Account.create({
      customerId: "6a8de1a768d97b652d7bc487",
      branchId: branchA._id,
      type: "CHECKING",
      balance: 1000,
    });

    const accountB = await Account.create({
      customerId: "6a8de1a768d97b652d7bc487",
      branchId: branchB._id,
      type: "CHECKING",
      balance: 1000,
    });

    await Transaction.create({
      fromAccountId: accountA._id,
      toAccountId: accountA._id,
      amount: 300,
      type: "TRANSFER",
    });

    await Transaction.create({
      fromAccountId: accountB._id,
      toAccountId: accountB._id,
      amount: 400,
      type: "TRANSFER",
    });

    const res = await request(app).get(
      "/api/v1/branches/analytics/monthly-transfers",
    );

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    const a = res.body.find((x) => x._id.branchCode === "BR-A");
    const b = res.body.find((x) => x._id.branchCode === "BR-B");

    expect(a.totalVolume).toBe(300);
    expect(b.totalVolume).toBe(400);
  });
});
