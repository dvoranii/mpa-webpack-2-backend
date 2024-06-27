// server.js
import express from "express";
import compression from "compression";
import { appMiddleware } from "./app.js";

const app = express();
app.set("trust proxy", "loopback");
const PORT = process.env.PORT || 4444;

app.use(compression());

appMiddleware(app);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
