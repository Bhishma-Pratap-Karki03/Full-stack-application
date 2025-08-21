const { verify } = require("jsonwebtoken");

function validateTokenMiddleware(req, res, next) {
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
    req.user = verifyToken;
    next();
  } else {
    return res.status(401).json({
      message: "User is not Authenticated",
    });
  }
}

module.exports = {
  validateTokenMiddleware,
};
