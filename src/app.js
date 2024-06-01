import cors from "cors";
import multer from "multer";
import bodyParser from "body-parser";
import { saveContactForm, saveSubscriptionForm } from "./scripts/firebase.js";
import { verifyRecaptcha } from "./scripts/recaptcha.js";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import { sendSubscriptionEmail } from "./scripts/sendEmail.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const multerMiddleware = multer().none();
const csrfProtection = csurf({ cookie: true });

export function appMiddleware(app) {
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use("/admin", (req, res) => {
    res.sendFile(path.resolve(__dirname, "views", "admin.html"));
  });

  app.get("/csrf-token", csrfProtection, (req, res) => {
    try {
      const token = req.csrfToken();
      console.log("CSRF token generated:", token);
      res.json({ csrfToken: token });
    } catch (error) {
      console.error("Error generating CSRF token:", error);
      res.status(500).json({ error: "Error generating CSRF token" });
    }
  });

  app.post(
    "/contact-form",
    multerMiddleware,
    csrfProtection,
    async (req, res) => {
      const { recaptcha_response, name, email, message } = req.body;

      try {
        const recaptchaData = await verifyRecaptcha(recaptcha_response);
        console.log(recaptchaData);
        // if (recaptchaData.success && recaptchaData.score > 0.5) {
        const saveResult = await saveContactForm({ name, email, message });
        res.json({
          message: "Contact saved successfully",
          id: saveResult.id,
        });
        // } else {
        //   res.status(403).json({ message: "Failed reCAPTCHA verification" });
        // }
      } catch (error) {
        console.log(`Server error: ${error}`);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  );

  app.post("/subscribe", multerMiddleware, csrfProtection, async (req, res) => {
    const { name, email } = req.body;
    try {
      const saveResult = await saveSubscriptionForm({ name, email });

      await sendSubscriptionEmail(
        email,
        "Subscription Confirmation",
        `Hello ${name}, \n\nThank you for subscribing to our newsletter! `
      );

      res.json({
        message: "Subscription saved successfully",
        id: saveResult.id,
      });
    } catch (error) {
      console.log(`Server error: ${error}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
}
