import express from "express";
import cors from "cors";

import customerRoutes from "./src/routes/customers.routes.js";
import accountRoutes from "./src/routes/accounts.routes.js";
import transactionRoutes from "./src/routes/transactions.routes.js";
import branchRoutes from "./src/routes/branches.routes.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/branches", branchRoutes);

export default app;
