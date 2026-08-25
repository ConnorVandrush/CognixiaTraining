import app from "./app.js";
import { connectDB } from "./src/config.js";

connectDB();

app.listen(8080, () => console.log("Server running on port 8080"));
