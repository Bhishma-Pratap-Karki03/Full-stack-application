var express = require("express");

const {
  createUserController,
  loginHandleController,
  getUserListController,
  updateProfileMeController,
  viewMyProfileController,
  viewProfileofUserController,
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
router.get("/list", validateTokenMiddleware, getUserListController);

router.put("/profile", validateTokenMiddleware, updateProfileMeController);
router.get("/profile/me", validateTokenMiddleware, viewMyProfileController);
router.get(
  "/profile/:id",
  validateTokenMiddleware,
  viewProfileofUserController
);

module.exports = router;