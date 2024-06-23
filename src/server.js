// server.js
import express from "express";
import compression from "compression";
import { appMiddleware } from "./app.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", "loopback");
const PORT = process.env.PORT || 4444;

app.use(express.static(path.join(__dirname, "../public")));
app.use(compression());

appMiddleware(app);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
