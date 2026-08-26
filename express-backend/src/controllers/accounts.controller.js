import accountService from "../services/accounts.service.js";

class AccountController {
  // POST /api/v1/accounts
  async createAccount(req, res) {
    const result = await accountService.createAccount(req.body, req.user);

    return res
      .status(result.status)
      .json(result.data || { message: result.message });
  }

  // GET /api/v1/accounts?branch_id=&min_balance=
  async listAccounts(req, res) {
    const result = await accountService.listAccounts(req.query, req.user);

    if (result.status === 204) return res.status(204).send();

    return res
      .status(result.status)
      .json(result.data || { message: result.message });
  }

  // GET /api/v1/accounts/:id
  async getAccount(req, res) {
    const result = await accountService.getAccount(req.params.id, req.user);

    return res
      .status(result.status)
      .json(result.data || { message: result.message });
  }

  // PUT /api/v1/accounts/:id
  async updateAccount(req, res) {
    const result = await accountService.updateAccount(
      req.params.id,
      req.body,
      req.user,
    );

    return res
      .status(result.status)
      .json(result.data || { message: result.message });
  }

  // DELETE /api/v1/accounts/:id
  async closeAccount(req, res) {
    const result = await accountService.closeAccount(req.params.id, req.user);

    if (result.status === 204) return res.status(204).send();

    return res.status(result.status).json({ message: result.message });
  }
}

export default new AccountController();
