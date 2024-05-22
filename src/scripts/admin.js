const IP_WHITELIST = process.env.IP_WHITELIST.split(",");

// will need editing for production
export const ipWhitelistMiddleware = (req, res, next) => {
  const clientIp = req.ip;
  if (IP_WHITELIST.includes(clientIp)) {
    next();
  } else {
    res.status(403).send("Forbidden");
  }
};
