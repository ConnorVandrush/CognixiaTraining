import promptSync from "prompt-sync";
const prompt = promptSync();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import users from "./users.json" with { type: "json" };

import Customer from "./Customer.js";
import Admin from "./Admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersPath = path.join(__dirname, "users.json");

export default class Main {
  constructor() {
    this.endProgram = false;
  }

  printMessage(message) {
    console.log(message);
  }

  getInput(message) {
    return prompt(message);
  }

  pause() {
    this.getInput("Press Enter to continue...");
  }

  findUser(userName) {
    return Object.entries(users).find(
      ([userId, user]) => user.userName === userName,
    );
  }

  hydrateUser(userId, user) {
    switch (user.userType) {
      case "customer":
        return new Customer(
          userId,
          user.userName,
          user.password,
          user.accounts,
          users,
        );

      case "admin":
        return new Admin(userId, user.userName, user.password);

      default:
        throw new Error(`Unknown user type: ${user.userType}`);
    }
  }

  saveUser(user, rawUser) {
    if (!(user instanceof Customer)) {
      return;
    }

    rawUser.accounts = user.getAccountData();

    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf8");
  }

  loginPrompt() {
    const userName = this.getInput("Please input your username: ");

    const result = this.findUser(userName);

    if (!result) {
      this.printMessage("User not found.");
      this.pause();
      return;
    }

    const [userId, rawUser] = result;

    const password = this.getInput("Please input your password: ");

    if (password !== rawUser.password) {
      this.printMessage("Incorrect password.");
      this.pause();
      return;
    }

    const user = this.hydrateUser(userId, rawUser);

    this.printMessage(`Welcome, ${user.userName}!`);
    this.pause();

    user.openDashboard();

    // Save any changes made during the session.
    this.saveUser(user, rawUser);
  }

  runMain() {
    while (!this.endProgram) {
      this.printMessage("\nWelcome to the console banking application.");

      this.printMessage("1. Login");
      this.printMessage("2. Exit");

      const input = this.getInput(
        "Please select an option by inputting its corresponding number: ",
      );

      switch (input) {
        case "1":
          this.loginPrompt();
          break;

        case "2":
          this.printMessage(
            "Thank you for using the console banking application. Have a nice day!",
          );

          this.endProgram = true;
          break;

        default:
          this.printMessage("Operation not found, please try again.");

          this.pause();
      }
    }
  }
}

const main = new Main();

main.runMain();
