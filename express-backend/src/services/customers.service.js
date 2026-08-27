import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import customerRepository from "../repositories/customers.repository.js";
import accountRepository from "../repositories/accounts.repository.js";
import transactionRepository from "../repositories/transactions.repository.js";

class CustomerService {
  // -------------------------------------------------------
  // CREATE CUSTOMER
  // -------------------------------------------------------
  async createCustomer(data) {
    const { firstName, lastName, email, phone, address, password } = data;

    if (!firstName || !lastName || !email || !phone || !address || !password) {
      return {
        error: true,
        status: 400,
        message: "Missing required fields",
      };
    }

    const existing = await customerRepository.findByEmail(email);
    if (existing) {
      return {
        error: true,
        status: 409,
        message: "A customer with this email already exists",
      };
    }

    const customer = await customerRepository.create(data);

    return {
      error: false,
      status: 201,
      data: customer,
    };
  }

  // -------------------------------------------------------
  // LOGIN CUSTOMER
  // -------------------------------------------------------
  async loginCustomer({ email, password }) {
    if (!email || !password) {
      return {
        error: true,
        status: 400,
        message: "Email and password are required",
      };
    }

    const customer = await customerRepository.findByEmailWithPassword(email);

    if (!customer) {
      return {
        error: true,
        status: 401,
        message: "Invalid email or password",
      };
    }

    const valid = await bcrypt.compare(password, customer.password);

    if (!valid) {
      return {
        error: true,
        status: 401,
        message: "Invalid email or password",
      };
    }

    // Fetch accounts owned by this customer
    const accounts = await accountRepository.findAll();
    const ownedAccounts = accounts.filter(
      (acc) => acc.customerId.toString() === customer._id.toString(),
    );

    // ⭐ Fetch transactions for each owned account
    const transactionsByAccount = {};

    for (const account of ownedAccounts) {
      const txns = await transactionRepository.findByAccountId(account._id);
      transactionsByAccount[account._id] = txns;
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: customer._id,
        role: customer.role,
        email: customer.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Remove password
    const customerData = customer.toObject();
    delete customerData.password;

    return {
      error: false,
      status: 200,
      data: {
        token,
        customer: customerData,
        accounts: ownedAccounts,
        transactions: transactionsByAccount, // ⭐ Added
      },
    };
  }

  // -------------------------------------------------------
  // LIST CUSTOMERS
  // -------------------------------------------------------
  async listCustomers() {
    const customers = await customerRepository.findAll();

    if (!customers || customers.length === 0) {
      return {
        error: false,
        status: 204,
        data: null,
      };
    }

    return {
      error: false,
      status: 200,
      data: customers,
    };
  }

  // -------------------------------------------------------
  // GET CUSTOMER BY ID
  // -------------------------------------------------------
  async getCustomer(id) {
    if (!id) {
      return {
        error: true,
        status: 400,
        message: "Invalid customer ID",
      };
    }

    const customer = await customerRepository.findById(id);

    if (!customer) {
      return {
        error: true,
        status: 404,
        message: "Customer not found",
      };
    }

    return {
      error: false,
      status: 200,
      data: customer,
    };
  }

  // -------------------------------------------------------
  // UPDATE CUSTOMER
  // -------------------------------------------------------
  async updateCustomer(id, updates) {
    if (!id) {
      return {
        error: true,
        status: 400,
        message: "Invalid customer ID",
      };
    }

    const updated = await customerRepository.update(id, updates);

    if (!updated) {
      return {
        error: true,
        status: 404,
        message: "Customer not found",
      };
    }

    return {
      error: false,
      status: 200,
      data: updated,
    };
  }

  // -------------------------------------------------------
  // DELETE CUSTOMER
  // -------------------------------------------------------
  async deleteCustomer(id) {
    if (!id) {
      return {
        error: true,
        status: 400,
        message: "Invalid customer ID",
      };
    }

    const customer = await customerRepository.findById(id);

    if (!customer) {
      return {
        error: true,
        status: 404,
        message: "Customer not found",
      };
    }

    // Check whether customer has any accounts
    const accounts = await accountRepository.findAll();

    const customerAccounts = accounts.filter(
      (account) => account.customerId.toString() === id.toString(),
    );

    if (customerAccounts.length > 0) {
      return {
        error: true,
        status: 409,
        message: "Cannot delete customer while they have accounts.",
      };
    }

    const deleted = await customerRepository.delete(id);

    if (!deleted) {
      return {
        error: true,
        status: 404,
        message: "Customer not found",
      };
    }

    return {
      error: false,
      status: 204,
      data: null,
    };
  }
}

export default new CustomerService();
