var express = require("express");

const {
  createUserController,
  loginHandleController,
  getUserListController,
  updateProfileMeController,
  viewMyProfileController,
  viewProfileofUserController,
  changePassword,
} = require("../controller/userController");
const { validateTokenMiddleware } = require("../middleware/AuthMiddleware");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res) {
  res.json({
    message: "User Controller is working",
  });
});
router.post("/create", createUserController);
router.post("/login", loginHandleController);
// Add this route to your userRoutes.js
router.post("/change-password", validateTokenMiddleware, changePassword);
router.get("/list", validateTokenMiddleware, getUserListController);

router.put("/profile", validateTokenMiddleware, updateProfileMeController);
router.get("/profile/me", validateTokenMiddleware, viewMyProfileController);
router.get(
  "/profile/:id",
  validateTokenMiddleware,
  viewProfileofUserController
);

module.exports = router;