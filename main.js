import express from "express";
import cors from "cors";
import multer from "multer";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4444;

app.use(cors());

const multerMiddleware = multer().none();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

async function verifyRecaptcha(token) {
  const secretKey = process.env.SECRET_KEY;
  const url = "https://www.google.com/recaptcha/api/siteverify";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${token}`,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to verify reCAPTCHA:", error);
    return { success: false };
  }
}

app.post("/submit-form", multerMiddleware, async (req, res) => {
  const token = req.body.recaptcha_response;
  const { name, email, message } = req.body;
  console.log(name, email, message);
  const recaptchaData = await verifyRecaptcha(token);

  if (recaptchaData.success && recaptchaData.score > 0.5) {
    res.json({ message: "Success, form processed" });
  } else {
    res.status(403).json({ message: "Failed reCAPTCHA verification" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
