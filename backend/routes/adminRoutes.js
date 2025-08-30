var express = require("express");
const { validateTokenMiddleware } = require("../middleware/AuthMiddleware");
const {
  createQuestionSetController,
  getQuestionSetWithAnswersController,
  toggleQuestionSetStatusController,
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

// Admin: toggle question set active/inactive
router.patch(
  "/questionset/:id/status",
  validateTokenMiddleware,
  adminOnlyMiddleware,
  toggleQuestionSetStatusController
);

module.exports = router;
