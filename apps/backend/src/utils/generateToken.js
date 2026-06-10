// utils/generateToken.js
import jwt from "jsonwebtoken";

/**
 * Signs a JWT and sets it as an httpOnly cookie on the response.
 * Also returns the raw token for API clients that prefer Authorization headers.
 */
const generateToken = (res, userId, role) => {
  const token = jwt.sign(
    { id: userId, role }, // Payload — keep it minimal
    process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  res.cookie("jwt", token, {
    httpOnly: true,                                    // JS cannot access — XSS protection
    secure: process.env.NODE_ENV === "production",     // HTTPS only in prod
    sameSite: "strict",                                // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000,                  // 7 days in ms
  });

  return token;
};

export default generateToken;
