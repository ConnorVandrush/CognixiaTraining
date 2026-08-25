import customerRepository from "../repositories/customers.repository.js";

class CustomerService {
  // Create a new customer
  createCustomer(data) {
    const { firstName, lastName, email } = data;

    // Required fields
    if (!firstName || !lastName || !email) {
      return {
        error: true,
        status: 400,
        message: "Missing required fields: firstName, lastName, email",
      };
    }

    // Duplicate email check
    const existing = customerRepository
      .findAll()
      .find((c) => c.email === email);

    if (existing) {
      return {
        error: true,
        status: 409,
        message: "A customer with this email already exists",
      };
    }

    // Create customer
    const customer = customerRepository.create(data);

    return {
      error: false,
      status: 201,
      data: customer,
    };
  }

  // List all customers
  listCustomers() {
    const customers = customerRepository.findAll();

    if (customers.length === 0) {
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
  getCustomer(id) {
    if (!id) {
      return {
        error: true,
        status: 400,
        message: "Invalid customer ID",
      };
    }

    const customer = customerRepository.findById(id);

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
  updateCustomer(id, updates) {
    if (!id) {
      return {
        error: true,
        status: 400,
        message: "Invalid customer ID",
      };
    }

    const updated = customerRepository.update(id, updates);

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

  // Delete (deactivate) customer
  deleteCustomer(id) {
    if (!id) {
      return {
        error: true,
        status: 400,
        message: "Invalid customer ID",
      };
    }

    const deleted = customerRepository.delete(id);

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
