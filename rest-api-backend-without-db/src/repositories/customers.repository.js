import Customer from "../models/customers.model.js";
import crypto from "crypto";

class CustomerRepository {
  constructor() {
    this.customers = [
      new Customer({
        id: "c1a2b3c4-d5e6-7890-abcd-111111111111",
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@example.com",
        phone: "555-1010",
        address: "123 Maple St, Springfield, IL",
        createdAt: new Date("2026-01-10"),
      }),
      new Customer({
        id: "c2b3c4d5-e6f7-8901-bcde-222222222222",
        firstName: "Bob",
        lastName: "Smith",
        email: "bob@example.com",
        phone: "555-2020",
        address: "44 Oak Ave, Springfield, IL",
        createdAt: new Date("2026-01-12"),
      }),
      new Customer({
        id: "c3c4d5e6-f7g8-9012-cdef-333333333333",
        firstName: "Charlie",
        lastName: "Davis",
        email: "charlie@example.com",
        phone: "555-3030",
        address: "77 Pine Rd, Springfield, IL",
        createdAt: new Date("2026-02-01"),
      }),
      new Customer({
        id: "c4d5e6f7-g8h9-0123-def0-444444444444",
        firstName: "Diana",
        lastName: "Miller",
        email: "diana@example.com",
        phone: "555-4040",
        address: "12 Birch Ln, Springfield, IL",
        createdAt: new Date("2026-02-15"),
      }),
      new Customer({
        id: "c5e6f7g8-h9i0-1234-ef01-555555555555",
        firstName: "Ethan",
        lastName: "Brown",
        email: "ethan@example.com",
        phone: "555-5050",
        address: "9 Cedar Ct, Springfield, IL",
        createdAt: new Date("2026-03-01"),
      }),
    ];
  }

  // Create customer
  create(data) {
    const newCustomer = new Customer({
      id: crypto.randomUUID(),
      ...data,
    });

    this.customers.push(newCustomer);
    return newCustomer;
  }

  // List all customers
  findAll() {
    return this.customers;
  }

  // Find customer by ID
  findById(id) {
    return this.customers.find((c) => c.id === id);
  }

  // Update customer
  update(id, updates) {
    const customer = this.findById(id);
    if (!customer) return null;

    Object.assign(customer, updates);
    return customer;
  }

  // Delete customer
  delete(id) {
    const index = this.customers.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const removed = this.customers.splice(index, 1)[0];
    return removed;
  }
}

export default new CustomerRepository();
