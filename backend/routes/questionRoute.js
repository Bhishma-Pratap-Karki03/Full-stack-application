var express = require("express");
const {
  listQuestionSetController,
  getQuestionSetController,
  saveAttemptedQuestionController,
} = require("../controller/questionController");
const { validateTokenMiddleware } = require("../middleware/AuthMiddleware");
const { professionalOnlyMiddleware } = require("../middleware/RoleMiddleware");
var router = express.Router();

router.get("/set/list", validateTokenMiddleware, listQuestionSetController);
// Only professionals can fetch an attemptable question set
router.get(
  "/set/:id",
  validateTokenMiddleware,
  professionalOnlyMiddleware,
  getQuestionSetController
);
router.post(
  "/answer/attempt",
  validateTokenMiddleware,
  professionalOnlyMiddleware,
  saveAttemptedQuestionController
);

module.exports = router;
