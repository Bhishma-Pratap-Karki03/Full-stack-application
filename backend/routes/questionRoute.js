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

// Test endpoint to verify authentication
router.get("/test", validateTokenMiddleware, (req, res) => {
  res.json({
    message: "Authentication working",
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint for professionals only
router.get(
  "/test/professional",
  validateTokenMiddleware,
  professionalOnlyMiddleware,
  (req, res) => {
    res.json({
      message: "Professional access working",
      user: req.user,
      timestamp: new Date().toISOString(),
    });
  }
);

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
