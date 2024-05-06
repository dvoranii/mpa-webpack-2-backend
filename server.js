// server.js
import express from "express";
import { appMiddleware } from "./app.js";

const app = express();
const PORT = process.env.PORT || 4444;

appMiddleware(app);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
