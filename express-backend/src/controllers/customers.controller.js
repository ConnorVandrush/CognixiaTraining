import customerService from "../services/customers.service.js";

class CustomerController {
  // POST /api/v1/customers
  async createCustomer(req, res) {
    const result = await customerService.createCustomer(req.body);
    return res
      .status(result.status)
      .json(result.data || { message: result.message });
  }

  // POST /api/v1/customers/login
  async login(req, res) {
    const result = await customerService.loginCustomer(req.body);

    return res
      .status(result.status)
      .json(result.data || { message: result.message });
  }

  // GET /api/v1/customers
  async listCustomers(req, res) {
    const result = await customerService.listCustomers();
    if (result.status === 204) return res.status(204).send();
    return res.status(result.status).json(result.data);
  }

  // GET /api/v1/customers/:id
  async getCustomer(req, res) {
    const result = await customerService.getCustomer(req.params.id);
    return res
      .status(result.status)
      .json(result.data || { message: result.message });
  }

  // PUT /api/v1/customers/:id
  async updateCustomer(req, res) {
    const result = await customerService.updateCustomer(
      req.params.id,
      req.body,
    );
    return res
      .status(result.status)
      .json(result.data || { message: result.message });
  }

  // DELETE /api/v1/customers/:id
  async deleteCustomer(req, res) {
    const result = await customerService.deleteCustomer(req.params.id);
    if (result.status === 204) return res.status(204).send();
    return res.status(result.status).json({ message: result.message });
  }
}

export default new CustomerController();
