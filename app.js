import express from "express";
import { connectDB } from "./src/config.js";

connectDB();

import customerRoutes from "./src/routes/customers.routes.js";
import accountRoutes from "./src/routes/accounts.routes.js";
import transactionRoutes from "./src/routes/transactions.routes.js";
import branchRoutes from "./src/routes/branches.routes.js";

const app = express();

app.use(express.json());
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/branches", branchRoutes);

app.listen(8080, () => console.log("Server running on port 8080"));
