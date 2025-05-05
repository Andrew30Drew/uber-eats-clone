import jwt from "jsonwebtoken";
import axios from "axios";

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:3004";

export const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token with auth service
    try {
      const response = await axios.post(
        `${AUTH_SERVICE_URL}/auth/verify-token`,
        {
          token,
        }
      );

      req.user = response.data.user;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Authentication error" });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    next();
  };
};
