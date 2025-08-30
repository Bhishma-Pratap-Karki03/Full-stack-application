const QuestionSet = require("../model/QuestionSetModel");

async function createQuestionSetController(req, res) {
  try {
    const { title, questions, isActive } = req.body || {};

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one question is required" });
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q || typeof q.questionText !== "string" || !q.questionText.trim()) {
        return res.status(400).json({
          message: `Question ${i + 1} text is required`,
        });
      }
      if (!Array.isArray(q.choices) || q.choices.length === 0) {
        return res.status(400).json({
          message: `Question ${i + 1} must have at least one choice`,
        });
      }
      for (let j = 0; j < q.choices.length; j++) {
        const c = q.choices[j];
        if (!c || typeof c.text !== "string" || !c.text.trim()) {
          return res.status(400).json({
            message: `Question ${i + 1} - Choice ${j + 1} text is required`,
          });
        }
      }
    }

    const { id } = req.user;
    const finalData = {
      title: title.trim(),
      questions: questions.map((q) => ({
        questionText: String(q.questionText).trim(),
        choices: (q.choices || []).map((c, idx) => ({
          label: c.label ?? String(idx),
          text: String(c.text).trim(),
          correctAnswer: Boolean(c.correctAnswer),
        })),
      })),
      createdBy: id,
      isActive: typeof isActive === "boolean" ? isActive : true,
    };

    const createSet = new QuestionSet(finalData);
    await createSet.save();
    return res
      .status(201)
      .json({ message: "Question set created successfully" });
  } catch (error) {
    console.error("Error creating question set:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getQuestionSetWithAnswersController(req, res) {
  try {
    const { id } = req.params;
    const questionSet = await QuestionSet.findById(id);
    if (!questionSet) {
      return res.status(404).json({ message: "Question set not found" });
    }
    return res.status(200).json({ questionSet });
  } catch (error) {
    console.error("Error fetching question set (admin view):", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function toggleQuestionSetStatusController(req, res) {
  try {
    const { id } = req.params;
    const { isActive } = req.body || {};

    const update = {};
    if (typeof isActive === "boolean") {
      update.isActive = isActive;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "isActive boolean is required" });
    }

    const updated = await QuestionSet.findByIdAndUpdate(id, update, {
      new: true,
    }).select("_id title isActive");

    if (!updated) {
      return res.status(404).json({ message: "Question set not found" });
    }

    return res
      .status(200)
      .json({ message: "Status updated", questionSet: updated });
  } catch (error) {
    console.error("Error toggling question set status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createQuestionSetController,
  getQuestionSetWithAnswersController,
  toggleQuestionSetStatusController,
};
