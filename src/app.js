import cors from "cors";
import multer from "multer";
import bodyParser from "body-parser";
import {
  saveContactForm,
  saveSubscriptionForm,
  saveQuoteForm,
} from "./scripts/firebase.js";
import { verifyRecaptcha } from "./scripts/recaptcha.js";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import {
  sendUserEmail,
  sendOwnerEmailNotification,
} from "./scripts/sendEmail.js";

import {
  contactFormLimiter,
  subscriptionFormLimiter,
  quoteFormLimiter,
} from "./scripts/rateLimiter.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const multerMiddleware = multer().none();
const csrfProtection = csurf({ cookie: true });

export function appMiddleware(app) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use("/admin", (req, res) => {
    res.sendFile(path.resolve(__dirname, "views", "admin.html"));
  });

  app.get("/api/csrf-token", csrfProtection, (req, res) => {
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
    "/api/contact-form",
    multerMiddleware,
    csrfProtection,
    contactFormLimiter,
    async (req, res) => {
      const { recaptchaResponse, name, email, message } = req.body;

      try {
        const recaptchaData = await verifyRecaptcha(recaptchaResponse);
        if (recaptchaData.success && recaptchaData.score > 0.5) {
          const saveResult = await saveContactForm({ name, email, message });

          await sendOwnerEmailNotification("Contact");

          setTimeout(async () => {
            await sendUserEmail(
              email,
              "Contact Form Submission",
              `Hello ${name}, \n\nThank you for reaching out to us! We will get back to you shortly.`
            );
          }, 1 * 60 * 1000);

          res.json({
            message: "Contact saved successfully",
            id: saveResult.id,
          });
        } else {
          res.status(403).json({ message: "Failed reCAPTCHA verification" });
        }
      } catch (error) {
        console.log(`Server error: ${error}`);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  );

  app.post(
    "/api/subscribe",
    multerMiddleware,
    csrfProtection,
    subscriptionFormLimiter,
    async (req, res) => {
      const { recaptchaResponse, name, email } = req.body;
      console.log(req.body);
      try {
        const recaptchaData = await verifyRecaptcha(recaptchaResponse);
        if (recaptchaData.success && recaptchaData.score > 0.5) {
          const saveResult = await saveSubscriptionForm({ name, email });

          sendOwnerEmailNotification("Subscription");

          setTimeout(async () => {
            await sendUserEmail(
              email,
              "Subscription Confirmation",
              `Hello ${name}, \n\nThank you for subscribing to our newsletter!`
            );
          }, 15 * 60 * 1000);

          res.json({
            message: "Subscription saved successfully",
            id: saveResult.id,
          });
        } else {
          res.status(403).json({ message: "Failed reCAPTCHA verification" });
        }
      } catch (error) {
        console.log(`Server error: ${error}`);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  );

  app.post(
    "/api/quote-form",
    multerMiddleware,
    csrfProtection,
    quoteFormLimiter,
    async (req, res) => {
      const {
        name,
        email,
        company,
        phone,
        pickupAddress,
        shippingAddress,
        skids,
        pieces,
        service,
        weight,
        units,
        HSCode,
        hazardous,
        nonPersonal,
        recaptchaResponse,
        additionalInfo,
        ...dynamicFields
      } = req.body;
      try {
        const recaptchaData = await verifyRecaptcha(recaptchaResponse);
        if (recaptchaData.success && recaptchaData.score > 0.5) {
          console.log("Recaptcha verified successfully");
          const formData = {
            companyInformation: {
              name,
              email,
              company,
              phone,
            },
            pickupInformation: {
              pickupAddress,
            },
            shippingInformation: {
              shippingAddress,
            },
            shipmentDetails: {
              skids,
              pieces,
              service,
              weight,
              units,
              HSCode,
              hazardous,
              nonPersonal,
              skidsData: [],
            },
            additionalInfo,
          };

          for (let i = 0; i < parseInt(skids, 10); i++) {
            formData.shipmentDetails.skidsData.push({
              type: dynamicFields[`type-${i}`],
              length: dynamicFields[`length-${i}`],
              width: dynamicFields[`width-${i}`],
              height: dynamicFields[`height-${i}`],
            });
          }

          const saveResult = await saveQuoteForm(formData);

          await sendOwnerEmailNotification("Quote");

          setTimeout(async () => {
            await sendUserEmail(
              email,
              "Quote Form Submission",
              `Hello ${name}, \n\nThank you for requesting a logistics services quote for ${company}. We will get back to you with the details shortly.`
            );
          }, 30 * 60 * 1000);

          res.json({
            message: "Quote saved successfully",
            id: saveResult.id,
          });
        } else {
          res.status(403).json({ message: "Failed reCAPTCHA verification" });
        }
      } catch (error) {
        console.error(`Server error: ${error}`);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  );
}
