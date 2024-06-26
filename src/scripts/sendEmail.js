import nodemailer from "nodemailer";
import { google } from "googleapis";

// Validate required environment variables
const {
  CLIENT_ID,
  CLIENT_SECRET,
  REFRESH_TOKEN,
  EMAIL_USER,
  OAUTH_PLAYGROUND,
  NODE_ENV,
} = process.env;

if (
  (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !EMAIL_USER, !NODE_ENV)
) {
  throw new Error("Missing required environment variables");
}

const OAuth2 = google.auth.OAuth2;

class Mailer {
  constructor() {
    this.oauth2Client = new OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      OAUTH_PLAYGROUND || "https://developers.google.com/oauthplayground"
    );
    this.oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  }

  async getAccessToken() {
    try {
      const { token } = await this.oauth2Client.getAccessToken();
      return token;
    } catch (error) {
      console.error("Error getting access token:", error);
      throw new Error("Error getting access token");
    }
  }

  async createTransporter() {
    const accessToken = await this.getAccessToken();
    const transporterOptions = {
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    };

    if (NODE_ENV === "development") {
      transporterOptions.tls = { rejectUnauthorized: false };
    }
    return nodemailer.createTransport(transporterOptions);
  }

  async sendMail(to, subject, text) {
    try {
      const transporter = await this.createTransporter();
      const mailOptions = {
        from: EMAIL_USER,
        to,
        subject,
        text,
      };
      const result = await transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Error sending email");
    }
  }
}

const mailer = new Mailer();

export async function sendUserEmail(to, subject, text) {
  return mailer.sendMail(to, subject, text);
}

export async function sendOwnerEmailNotification(formType) {
  const subject = `New ${formType} Form Submission`;
  const text = `A new ${formType} form has been submitted. Please check the admin dashboard for more details.`;
  return mailer.sendMail(EMAIL_USER, subject, text);
}
