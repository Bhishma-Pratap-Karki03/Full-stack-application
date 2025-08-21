function validateRoleMiddleware(currentRole) {
  return (req, res, next) => {
    const { role } = req.user;
    if (currentRole !== role) {
      return res.status(403).json({ message: "Forbidden Request" });
    }
    next();
  };
}

const adminOnlyMiddleware = validateRoleMiddleware("admin");
const professionalOnlyMiddleware = validateRoleMiddleware("professional");

module.exports = {
  validateRoleMiddleware,
  adminOnlyMiddleware,
  professionalOnlyMiddleware,
};
