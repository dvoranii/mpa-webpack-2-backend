import cors from "cors";
import multer from "multer";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fetch from "node-fetch";
// import db from "./scripts/firebase.js";
import { saveContact, db } from "./scripts/firebase.js";

dotenv.config();

const multerMiddleware = multer().none();

export function appMiddleware(app) {
  app.get("/", (req, res) => {
    console.log(db);
    res.send("Hello from Express!");
  });

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

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
}
