function validateRoleMiddleware(currentRole) {
  return (req, res, next) => {
    try {
      const { role } = req.user;

      if (!role) {
        return res.status(403).json({ message: "User role not found" });
      }

      if (currentRole !== role) {
        return res.status(403).json({ message: "Forbidden Request" });
      }

      next();
    } catch (error) {
      console.error("Role validation error:", error);
      return res.status(403).json({ message: "Forbidden Request" });
    }
  };
}

const adminOnlyMiddleware = validateRoleMiddleware("admin");
const professionalOnlyMiddleware = validateRoleMiddleware("professional");

module.exports = {
  validateRoleMiddleware,
  adminOnlyMiddleware,
  professionalOnlyMiddleware,
};
