import rateLimit from "express-rate-limit";

// seperate functions for future potential custom updates to each limiter
export const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many requests from this IP, please try again after 15 minutes",
  statusCode: 429,
  trustProxy: true,
});

export const subscriptionFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many requests from this IP, please try again after 15 minutes",
  statusCode: 429,
  trustProxy: true,
});

export const quoteFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: "Too many requests from this IP, please try again after 15 minutes",
  statusCode: 429,
  trustProxy: true,
});
