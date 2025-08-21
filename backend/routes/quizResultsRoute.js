const express = require("express");
const { validateTokenMiddleware } = require("../middleware/AuthMiddleware");
const AnswerModel = require("../model/AnswerModel");
const router = express.Router();

// Get user's quiz results from AnswerModel (one attempt per set)
router.get("/results", validateTokenMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const results = await AnswerModel.find({ user: userId })
      .populate("questionSet", "title")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      message: "Quiz results retrieved successfully",
      results: results.map((result) => ({
        questionSet: {
          _id: result.questionSet._id,
          title: result.questionSet.title,
        },
        score: result.score,
        total: result.total,
        percentage: Math.round((result.score / result.total) * 100),
        attemptedAt: result.submittedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get quiz results for a specific user by ID (view-only)
router.get("/results/:id", validateTokenMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    const results = await AnswerModel.find({ user: targetUserId })
      .populate("questionSet", "title")
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      message: "Quiz results retrieved successfully",
      results: results.map((result) => ({
        questionSet: {
          _id: result.questionSet._id,
          title: result.questionSet.title,
        },
        score: result.score,
        total: result.total,
        percentage: Math.round((result.score / result.total) * 100),
        attemptedAt: result.submittedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching quiz results by userId:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
