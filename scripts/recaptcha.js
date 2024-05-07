import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export async function verifyRecaptcha(token) {
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
