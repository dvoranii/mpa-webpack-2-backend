import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

export async function sendEmail(to, subject, text) {
  try {
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "ildidvorani@gmail.com",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: "ildidvorani@gmail.com",
      to: to,
      subject: subject,
      text: text,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
}
