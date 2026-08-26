import request from "supertest";
import app from "../app.js";

import { connectTestDB, closeTestDB } from "./setup.js";

import Customer from "../src/schemas/customers.schema.js";

let customer;

beforeAll(async () => {
  await connectTestDB();

  // Seed one customer for GET/PUT/DELETE tests
  customer = await Customer.create({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "555-1111",
    address: "123 Test Street",
  });
});

afterAll(async () => {
  await closeTestDB();
});

describe("Customers API", () => {
  // ---------------------------------------------------------
  // POST /customers
  // ---------------------------------------------------------
  test("POST /api/v1/customers creates a customer", async () => {
    const res = await request(app).post("/api/v1/customers").send({
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@example.com",
      phone: "555-2222",
      address: "456 Example Ave",
    });

    expect(res.status).toBe(201);
    expect(res.body.firstName).toBe("Alice");
    expect(res.body.email).toBe("alice@example.com");
  });

  test("POST /api/v1/customers fails with missing fields", async () => {
    const res = await request(app).post("/api/v1/customers").send({
      firstName: "Bob",
      // missing lastName, email, phone, address
    });

    expect(res.status).toBe(400);
  });

  // ---------------------------------------------------------
  // GET /customers
  // ---------------------------------------------------------
  test("GET /api/v1/customers returns all customers", async () => {
    const res = await request(app).get("/api/v1/customers");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // ---------------------------------------------------------
  // GET /customers/:id
  // ---------------------------------------------------------
  test("GET /api/v1/customers/:id returns a customer", async () => {
    const res = await request(app).get(`/api/v1/customers/${customer._id}`);

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("John");
  });

  test("GET /api/v1/customers/:id returns 404 for invalid ID", async () => {
    const res = await request(app).get(
      "/api/v1/customers/000000000000000000000000",
    );

    expect(res.status).toBe(404);
  });

  // ---------------------------------------------------------
  // PUT /customers/:id
  // ---------------------------------------------------------
  test("PUT /api/v1/customers/:id updates a customer", async () => {
    const res = await request(app)
      .put(`/api/v1/customers/${customer._id}`)
      .send({ phone: "555-9999" });

    expect(res.status).toBe(200);
    expect(res.body.phone).toBe("555-9999");
  });

  test("PUT /api/v1/customers/:id returns 404 for non-existent customer", async () => {
    const res = await request(app)
      .put("/api/v1/customers/000000000000000000000000")
      .send({ phone: "555-0000" });

    expect(res.status).toBe(404);
  });

  // ---------------------------------------------------------
  // DELETE /customers/:id
  // ---------------------------------------------------------
  test("DELETE /api/v1/customers/:id deletes a customer", async () => {
    const res = await request(app).delete(`/api/v1/customers/${customer._id}`);

    expect(res.status).toBe(204);
  });

  test("DELETE /api/v1/customers/:id returns 404 for invalid ID", async () => {
    const res = await request(app).delete(
      "/api/v1/customers/000000000000000000000000",
    );

    expect(res.status).toBe(404);
  });
});
