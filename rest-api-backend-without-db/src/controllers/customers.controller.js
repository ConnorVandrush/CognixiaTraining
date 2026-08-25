import customerService from "../services/customers.service.js";

class CustomerController {
  // POST /api/v1/customers
  async createCustomer(req, res) {
    const result = customerService.createCustomer(req.body);
    return res
      .status(result.status)
      .json(result.data || { message: result.message });
  }

  // GET /api/v1/customers
  async listCustomers(req, res) {
    const result = customerService.listCustomers();
    if (result.status === 204) return res.status(204).send();
    return res.status(result.status).json(result.data);
  }

  // GET /api/v1/customers/:id
  async getCustomer(req, res) {
    const result = customerService.getCustomer(req.params.id);
    return res
      .status(result.status)
      .json(result.data || { message: result.message });
  }

  // PUT /api/v1/customers/:id
  async updateCustomer(req, res) {
    const result = customerService.updateCustomer(req.params.id, req.body);
    return res
      .status(result.status)
      .json(result.data || { message: result.message });
  }

  // DELETE /api/v1/customers/:id
  async deleteCustomer(req, res) {
    const result = customerService.deleteCustomer(req.params.id);
    if (result.status === 204) return res.status(204).send();
    return res.status(result.status).json({ message: result.message });
  }
}

export default new CustomerController();
