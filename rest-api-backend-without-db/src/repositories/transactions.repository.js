import Transaction from "../models/transactions.model.js";
import crypto from "crypto";

class TransactionRepository {
  constructor() {
    this.transactions = [
      new Transaction({
        id: "t1111111-aaaa-bbbb-cccc-111111111111",
        fromAccountId: "a1111111-2222-3333-4444-555555555555",
        toAccountId: "a2222222-3333-4444-5555-666666666666",
        amount: 200,
        type: "TRANSFER",
        createdAt: new Date("2026-02-01"),
      }),
      new Transaction({
        id: "t2222222-bbbb-cccc-dddd-222222222222",
        fromAccountId: "a3333333-4444-5555-6666-777777777777",
        toAccountId: "a4444444-5555-6666-7777-888888888888",
        amount: 100,
        type: "TRANSFER",
        createdAt: new Date("2026-02-10"),
      }),
      new Transaction({
        id: "t3333333-cccc-dddd-eeee-333333333333",
        fromAccountId: "a4444444-5555-6666-7777-888888888888",
        toAccountId: "a5555555-6666-7777-8888-999999999999",
        amount: 300,
        type: "TRANSFER",
        createdAt: new Date("2026-02-20"),
      }),
      new Transaction({
        id: "t4444444-dddd-eeee-ffff-444444444444",
        fromAccountId: "a2222222-3333-4444-5555-666666666666",
        toAccountId: "a1111111-2222-3333-4444-555555555555",
        amount: 150,
        type: "TRANSFER",
        createdAt: new Date("2026-03-01"),
      }),
      new Transaction({
        id: "t5555555-eeee-ffff-gggg-555555555555",
        fromAccountId: "a5555555-6666-7777-8888-999999999999",
        toAccountId: "a6666666-7777-8888-9999-000000000000",
        amount: 250,
        type: "TRANSFER",
        createdAt: new Date("2026-03-05"),
      }),
      new Transaction({
        id: "t6666666-ffff-gggg-hhhh-666666666666",
        fromAccountId: "a1111111-2222-3333-4444-555555555555",
        toAccountId: "a3333333-4444-5555-6666-777777777777",
        amount: 100,
        type: "TRANSFER",
        createdAt: new Date("2026-03-10"),
      }),
    ];
  }

  create(data) {
    const tx = new Transaction({
      id: crypto.randomUUID(),
      ...data,
    });

    this.transactions.push(tx);
    return tx;
  }

  findAll() {
    return this.transactions;
  }
}

export default new TransactionRepository();
