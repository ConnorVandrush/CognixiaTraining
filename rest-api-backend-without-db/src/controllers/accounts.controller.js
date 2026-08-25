import accountService from "../services/accounts.service.js";

class AccountController {
  // POST /api/v1/accounts
  createAccount(req, res) {
    const result = accountService.createAccount(req.body);

    // If service returned an error
    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    // Successful create
    return res.status(result.status).json(result.data);
  }

  // GET /api/v1/accounts?branch_id=&min_balance=
  listAccounts(req, res) {
    const result = accountService.listAccounts(req.query);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    // 204 No Content
    if (result.status === 204) {
      return res.status(204).send();
    }

    // 200 OK
    return res.status(result.status).json(result.data);
  }

  // GET /api/v1/accounts/:id
  getAccount(req, res) {
    const result = accountService.getAccount(req.params.id);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.status(result.status).json(result.data);
  }

  // PUT /api/v1/accounts/:id
  updateAccount(req, res) {
    const result = accountService.updateAccount(req.params.id, req.body);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.status(result.status).json(result.data);
  }

  // DELETE /api/v1/accounts/:id
  closeAccount(req, res) {
    const result = accountService.closeAccount(req.params.id);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    // 204 No Content
    return res.status(204).send();
  }
}

export default new AccountController();
