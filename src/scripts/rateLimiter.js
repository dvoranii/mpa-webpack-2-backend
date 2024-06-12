import rateLimit from "express-rate-limit";

export const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many requests from this IP, please try again after 15 minutes",
  statusCode: 429,
});

export const subscriptionFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many requests from this IP, please try again after 15 minutes",
  statusCode: 429,
});

export const quoteFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: "Too many requests from this IP, please try again after 15 minutes",
  statusCode: 429,
});
