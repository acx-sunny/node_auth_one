// Middleware to verify the access token
import jwt from "jsonwebtoken";
import { secretKey } from "../common.shared.js";

export function verifyAccessToken(req, res, next) {
  const accessToken = req.header("Authorization");

  if (!accessToken) {
    return res.status(401).json({ error: "Access token not provided" });
  }

  try {
    const decoded = jwt.verify(accessToken, secretKey); // Replace with your actual secret key
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid access token" });
  }
}
