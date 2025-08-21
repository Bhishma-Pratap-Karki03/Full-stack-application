var express = require("express");
const { validateTokenMiddleware } = require("../middleware/AuthMiddleware");
const {
  createQuestionSetController,
  getQuestionSetWithAnswersController,
} = require("../controller/adminController");
const { adminOnlyMiddleware } = require("../middleware/RoleMiddleware");
var router = express.Router();

router.post(
  "/questionset/create",
  validateTokenMiddleware,
  adminOnlyMiddleware,
  createQuestionSetController
);

// Admin: view a question set including correct answers
router.get(
  "/questionset/:id",
  validateTokenMiddleware,
  adminOnlyMiddleware,
  getQuestionSetWithAnswersController
);

module.exports = router;
