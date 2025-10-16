const { verify } = require("jsonwebtoken");

function validateTokenMiddleware(req, res, next) {
  try {
    const rawAccessToken = req.headers.authorization;

    if (!rawAccessToken) {
      return res.status(401).json({
        message: "User is not Authenticated",
      });
    }

    const accessToken = req.headers.authorization.split(" ")[1];

    if (!accessToken || accessToken === "null") {
      return res.status(401).json({
        message: "User is not Authenticated",
      });
    }

    const verifyToken = verify(accessToken, process.env.AUTH_SECRET_KEY);

    if (verifyToken) {
      // Ensure the token has the required fields
      if (!verifyToken.id || !verifyToken.role) {
        return res.status(401).json({
          message: "Invalid token structure",
        });
      }

      req.user = verifyToken;
      next();
    } else {
      return res.status(401).json({
        message: "User is not Authenticated",
      });
    }
  } catch (error) {
    console.error("Token validation error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    return res.status(401).json({
      message: "User is not Authenticated",
    });
  }
}

module.exports = {
  validateTokenMiddleware,
};