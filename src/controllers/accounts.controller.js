import accountService from "../services/accounts.service.js";

class AccountController {
  // POST /api/v1/accounts
  async createAccount(req, res) {
    const result = await accountService.createAccount(req.body);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.status(result.status).json(result.data);
  }

  // GET /api/v1/accounts?branch_id=&min_balance=
  async listAccounts(req, res) {
    const result = await accountService.listAccounts(req.query);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    if (result.status === 204) {
      return res.status(204).send();
    }

    return res.status(result.status).json(result.data);
  }

  // GET /api/v1/accounts/:id
  async getAccount(req, res) {
    const result = await accountService.getAccount(req.params.id);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.status(result.status).json(result.data);
  }

  // PUT /api/v1/accounts/:id
  async updateAccount(req, res) {
    const result = await accountService.updateAccount(req.params.id, req.body);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.status(result.status).json(result.data);
  }

  // DELETE /api/v1/accounts/:id
  async closeAccount(req, res) {
    const result = await accountService.closeAccount(req.params.id);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.status(204).send();
  }
}

export default new AccountController();
