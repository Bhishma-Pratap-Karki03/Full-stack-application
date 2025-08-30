const AnswerModel = require("../model/AnswerModel");
const QuestionSet = require("../model/QuestionSetModel");

async function listQuestionSetController(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Fetch user's attempts first
    const userAttempts = await AnswerModel.find({ user: userId }).select(
      "questionSet score total submittedAt"
    );
    const attemptsMap = new Map(
      userAttempts.map((a) => [String(a.questionSet), a])
    );

    // Professionals: show only active sets + any attempted sets even if inactive
    // Admins: will be handled on frontend by role; we still return all sets to admins
    const isAdmin = req.user?.role === "admin";

    let questionSets;
    if (isAdmin) {
      questionSets = await QuestionSet.aggregate([
        {
          $project: {
            title: 1,
            isActive: 1,
            questionCount: { $size: { $ifNull: ["$questions", []] } },
          },
        },
      ]);
    } else {
      // Professionals: include active sets and also sets they attempted
      const attemptedIds = Array.from(attemptsMap.keys()).map(
        (id) => new (require("mongoose").Types.ObjectId)(id)
      );
      questionSets = await QuestionSet.aggregate([
        {
          $match: {
            $or: [
              { isActive: true },
              { _id: { $in: attemptedIds.length ? attemptedIds : [null] } },
            ],
          },
        },
        {
          $project: {
            title: 1,
            isActive: 1,
            questionCount: { $size: { $ifNull: ["$questions", []] } },
          },
        },
      ]);
    }

    const enriched = questionSets.map((qs) => {
      const attempt = attemptsMap.get(String(qs._id));
      if (!attempt) return qs;
      const percentage = attempt.total
        ? Math.round((attempt.score / attempt.total) * 100)
        : 0;
      return {
        ...qs,
        attempted: true,
        score: attempt.score,
        total: attempt.total,
        percentage,
        attemptedAt: attempt.submittedAt,
      };
    });

    res.json({
      questionSet: enriched,
    });
  } catch (error) {
    console.error("Error in listQuestionSetController:", error);
    res.status(500).json({ message: "Failed to fetch question sets" });
  }
}

async function getQuestionSetController(req, res) {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    console.log(
      `[DEBUG] getQuestionSetController called with id: ${id}, userId: ${userId}`
    );

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!id) {
      return res.status(400).json({ message: "Question set ID is required" });
    }

    // If user already attempted, return the attempt summary and do not include questions
    const existingAttempt = await AnswerModel.findOne({
      user: userId,
      questionSet: id,
    })
      .populate("questionSet", "title")
      .lean();

    console.log(
      `[DEBUG] Existing attempt found:`,
      existingAttempt ? "Yes" : "No"
    );

    if (existingAttempt) {
      const percentage = existingAttempt.total
        ? Math.round((existingAttempt.score / existingAttempt.total) * 100)
        : 0;
      return res.json({
        attempted: true,
        attempt: {
          questionSet: {
            _id: existingAttempt.questionSet._id,
            title: existingAttempt.questionSet.title,
          },
          score: existingAttempt.score,
          total: existingAttempt.total,
          percentage,
          attemptedAt: existingAttempt.submittedAt,
        },
      });
    }

    // Get the question set with questions but exclude correct answers
    const questionSet = await QuestionSet.findById(id).select(
      "title questions isActive"
    );

    console.log(`[DEBUG] Question set found:`, questionSet ? "Yes" : "No");
    if (questionSet) {
      console.log(`[DEBUG] Question set title: ${questionSet.title}`);
      console.log(`[DEBUG] Question set isActive: ${questionSet.isActive}`);
      console.log(
        `[DEBUG] Number of questions: ${
          questionSet.questions ? questionSet.questions.length : 0
        }`
      );
    }

    if (!questionSet) {
      return res.status(404).json({ message: "Question set not found" });
    }

    // If inactive and not attempted, block access
    if (questionSet.isActive !== true) {
      const priorAttempt = await AnswerModel.findOne({
        user: userId,
        questionSet: id,
      }).lean();
      if (!priorAttempt) {
        return res
          .status(403)
          .json({ message: "This question set is inactive" });
      }
    }

    // Remove isActive and correctAnswer from response to prevent frontend from seeing them
    const { isActive, ...questionSetForUser } = questionSet.toObject();

    // Remove correctAnswer from each choice
    if (questionSetForUser.questions) {
      questionSetForUser.questions = questionSetForUser.questions.map(
        (question) => ({
          ...question,
          choices: question.choices.map((choice) => {
            const { correctAnswer, ...choiceForUser } = choice;
            return choiceForUser;
          }),
        })
      );
    }

    console.log(
      `[DEBUG] Sending response with ${
        questionSetForUser.questions ? questionSetForUser.questions.length : 0
      } questions`
    );

    res.json(questionSetForUser);
  } catch (error) {
    console.error("Error in getQuestionSetController:", error);
    res.status(500).json({ message: "Failed to fetch question set" });
  }
}

async function saveAttemptedQuestionController(req, res) {
  try {
    const { questionSet: questionSetId, responses } = req.body;
    const { id: userId } = req.user;

    // Validate required fields
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!questionSetId) {
      return res.status(400).json({ message: "Question set ID is required" });
    }

    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({ message: "Responses must be an array" });
    }

    // If user already attempted this question set, return the existing score
    const existingAttempt = await AnswerModel.findOne({
      user: userId,
      questionSet: questionSetId,
    });

    if (existingAttempt) {
      return res.status(200).json({
        message: "Already attempted. Returning existing score.",
        data: {
          score: existingAttempt.score,
          total: existingAttempt.total,
        },
      });
    }

    // Get the question set with correct answers
    const questionSet = await QuestionSet.findById(questionSetId).select(
      "isActive questions._id questions.choices._id questions.choices.correctAnswer"
    );

    if (!questionSet) {
      return res.status(404).json({ message: "QuestionSet not found" });
    }

    // If inactive and no prior attempt, block submission
    const priorAttempt = await AnswerModel.findOne({
      user: userId,
      questionSet: questionSetId,
    }).lean();

    if (questionSet.isActive !== true && !priorAttempt) {
      return res.status(403).json({ message: "This question set is inactive" });
    }

    // Validate that questions array exists
    if (!questionSet.questions || !Array.isArray(questionSet.questions)) {
      return res
        .status(400)
        .json({ message: "Invalid question set structure" });
    }

    const result = (responses || []).reduce(
      (acc, current) => {
        // Validate current response
        if (!current.questionId || !current.selectedChoiceIds) {
          return acc; // skip invalid responses
        }

        const questions = questionSet.questions;

        // Find the question in this set
        const q = questions.find(
          (qn) => String(qn._id) === String(current.questionId)
        );
        if (!q) return acc; // skip unknown question ids

        // Validate choices array exists
        if (!q.choices || !Array.isArray(q.choices)) {
          return acc; // skip questions without choices
        }

        // Build the list of correct choice ids
        const correctIds = (q.choices || []).reduce((ids, c) => {
          if (c?.correctAnswer) ids.push(String(c._id));
          return ids;
        }, []);

        // Count how many SELECTED are actually CORRECT
        const selected = current.selectedChoiceIds || [];
        const selectedAreCorrectCount = selected.reduce((cnt, selId) => {
          const hit =
            correctIds.find((cid) => cid === String(selId)) !== undefined;
          return cnt + (hit ? 1 : 0);
        }, 0);

        // Count how many CORRECT were actually SELECTED
        const correctSelectedCount = correctIds.reduce((cnt, cid) => {
          const hit =
            selected.find((selId) => String(selId) === cid) !== undefined;
          return cnt + (hit ? 1 : 0);
        }, 0);

        // Exact match if:
        //  - every selected is correct, AND
        //  - every correct was selected, AND
        //  - lengths line up on both sides
        const allSelectedAreCorrect =
          selectedAreCorrectCount === selected.length;
        const allCorrectWereSelected =
          correctSelectedCount === correctIds.length;
        const isCorrect = allSelectedAreCorrect && allCorrectWereSelected;

        acc.total += 1;
        if (isCorrect) acc.score += 1;

        // Optional per-question detail (nice for review UI)
        acc.details.push({
          questionId: String(q._id),
          selectedChoiceIds: selected.map(String),
          isCorrect,
        });

        return acc;
      },
      { score: 0, total: 0, details: [] }
    );

    // Save the answer
    const saveAnswerQuestion = new AnswerModel({
      questionSet: questionSetId,
      user: userId,
      responses,
      score: result.score,
      total: result.total,
    });

    await saveAnswerQuestion.save();

    return res.status(201).json({
      message: "Graded",
      data: {
        score: result.score,
        total: result.total,
        responses: result.responses,
      },
    });
  } catch (error) {
    console.error("Error in saveAttemptedQuestionController:", error);
    res.status(500).json({ message: "Failed to save quiz attempt" });
  }
}

module.exports = {
  listQuestionSetController,
  getQuestionSetController,
  saveAttemptedQuestionController,
};
