import Account from "../models/accounts.model.js";
import crypto from "crypto";

class AccountRepository {
  constructor() {
    this.accounts = [
      new Account({
        id: "a1111111-2222-3333-4444-555555555555",
        customerId: "c1a2b3c4-d5e6-7890-abcd-111111111111",
        branchId: "BR-001",
        type: "CHECKING",
        balance: 1500,
        createdAt: new Date("2026-01-11"),
      }),
      new Account({
        id: "a2222222-3333-4444-5555-666666666666",
        customerId: "c1a2b3c4-d5e6-7890-abcd-111111111111",
        branchId: "BR-001",
        type: "SAVINGS",
        balance: 5000,
        createdAt: new Date("2026-01-11"),
      }),
      new Account({
        id: "a3333333-4444-5555-6666-777777777777",
        customerId: "c2b3c4d5-e6f7-8901-bcde-222222222222",
        branchId: "BR-002",
        type: "CHECKING",
        balance: 800,
        createdAt: new Date("2026-01-13"),
      }),
      new Account({
        id: "a4444444-5555-6666-7777-888888888888",
        customerId: "c3c4d5e6-f7g8-9012-cdef-333333333333",
        branchId: "BR-003",
        type: "CHECKING",
        balance: 1200,
        createdAt: new Date("2026-02-02"),
      }),
      new Account({
        id: "a5555555-6666-7777-8888-999999999999",
        customerId: "c4d5e6f7-g8h9-0123-def0-444444444444",
        branchId: "BR-001",
        type: "SAVINGS",
        balance: 9000,
        createdAt: new Date("2026-02-16"),
      }),
      new Account({
        id: "a6666666-7777-8888-9999-000000000000",
        customerId: "c5e6f7g8-h9i0-1234-ef01-555555555555",
        branchId: "BR-002",
        type: "CHECKING",
        balance: 300,
        createdAt: new Date("2026-03-02"),
      }),
    ];
  }

  create(data) {
    const account = new Account({
      id: crypto.randomUUID(),
      ...data,
    });

    this.accounts.push(account);
    return account;
  }

  findAll() {
    return this.accounts;
  }

  findById(id) {
    return this.accounts.find((a) => a.id === id);
  }

  updateBalance(id, newBalance) {
    const account = this.findById(id);
    if (!account) return null;

    account.balance = newBalance;
    return account;
  }
}

export default new AccountRepository();
