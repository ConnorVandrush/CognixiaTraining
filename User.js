export default class User {
  #userId;
  #userName;
  #password;

  constructor(userId, userName, password) {
    this.#userId = userId;
    this.#userName = userName;
    this.#password = password;
  }

  get userId() {
    return this.#userId;
  }

  get userName() {
    return this.#userName;
  }

  get password() {
    return this.#password;
  }
}
