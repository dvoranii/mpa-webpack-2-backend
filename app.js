import cors from "cors";
import multer from "multer";
import bodyParser from "body-parser";
import { saveContact } from "./scripts/firebase.js";
import { verifyRecaptcha } from "./scripts/recaptcha.js";

const multerMiddleware = multer().none();

export function appMiddleware(app) {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.post("/submit-form", multerMiddleware, async (req, res) => {
    const { recaptcha_response, name, email, message } = req.body;

    try {
      const recaptchaData = await verifyRecaptcha(recaptcha_response);
      if (recaptchaData.success && recaptchaData.score > 0.5) {
        const saveResult = await saveContact({ name, email, message });
        res.json({ message: "Contact saved successfully", id: saveResult.id });
      } else {
        res.status(403).json({ message: "Failed reCAPTCHA verification" });
      }
    } catch (error) {
      console.log(`Server error: ${error}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
}
