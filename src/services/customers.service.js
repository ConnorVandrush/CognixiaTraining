import customerRepository from "../repositories/customers.repository.js";

class CustomerService {
  // Create a new customer
  async createCustomer(data) {
    const { firstName, lastName, email } = data;

    if (!firstName || !lastName || !email) {
      return {
        error: true,
        status: 400,
        message: "Missing required fields: firstName, lastName, email",
      };
    }

    // Duplicate email check (MongoDB)
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

  // List all customers
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

  // Get customer by ID
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

  // Update customer
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

  // Delete customer
  async deleteCustomer(id) {
    if (!id) {
      return {
        error: true,
        status: 400,
        message: "Invalid customer ID",
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
