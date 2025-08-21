const AnswerModel = require("../model/AnswerModel");
const QuestionSet = require("../model/QuestionSetModel");

async function listQuestionSetController(req, res) {
  const userId = req.user?.id;

  const questionSets = await QuestionSet.aggregate([
    {
      $project: {
        title: 1,
        questionCount: { $size: { $ifNull: ["$questions", []] } },
      },
    },
  ]);

 
  const userAttempts = await AnswerModel.find({ user: userId }).select(
    "questionSet score total submittedAt"
  );
  const attemptsMap = new Map(
    userAttempts.map((a) => [String(a.questionSet), a])
  );

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
}

async function getQuestionSetController(req, res) {
  const { id } = req.params;
  const { id: userId } = req.user;

  // If user already attempted, return the attempt summary and do not include questions
  const existingAttempt = await AnswerModel.findOne({
    user: userId,
    questionSet: id,
  })
    .populate("questionSet", "title")
    .lean();

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

  const questionSet = await QuestionSet.findById(id).select(
    "-questions.choices.correctAnswer"
  );

  if (!questionSet) {
    return res.status(404).json({ message: "Question set not found" });
  }

  res.json(questionSet);
}

async function saveAttemptedQuestionController(req, res) {
  const { questionSet: questionSetId, responses } = req.body;
  const { id: userId } = req.user;

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

  // FIXED: Changed "correcAnswer" to "correctAnswer" (added the missing 't')
  const questionSet = await QuestionSet.findById(questionSetId).select(
    "questions._id questions.choices._id questions.choices.correctAnswer"
  );

  if (!questionSet)
    return res.status(404).json({ message: "QuestionSet not found" });

  const result = (responses || []).reduce(
    (acc, current) => {
      const questions = Array.isArray(questionSet?.questions)
        ? questionSet.questions
        : Array.isArray(questionSet)
        ? questionSet
        : [];

      // 1) find the question in this set
      const q = questions.find(
        (qn) => String(qn._id) === String(current.questionId)
      );
      if (!q) return acc; // skip unknown question ids

      // 2) build the list of correct choice ids using reduce
      const correctIds = (q.choices || []).reduce((ids, c) => {
        if (c?.correctAnswer) ids.push(String(c._id));
        return ids;
      }, []);

      // 3) count how many SELECTED are actually CORRECT (using find)
      const selected = current.selectedChoiceIds || [];
      const selectedAreCorrectCount = selected.reduce((cnt, selId) => {
        const hit =
          correctIds.find((cid) => cid === String(selId)) !== undefined;
        return cnt + (hit ? 1 : 0);
      }, 0);

      // 4) count how many CORRECT were actually SELECTED (using find)
      const correctSelectedCount = correctIds.reduce((cnt, cid) => {
        const hit =
          selected.find((selId) => String(selId) === cid) !== undefined;
        return cnt + (hit ? 1 : 0);
      }, 0);

      // exact match if:
      //  - every selected is correct, AND
      //  - every correct was selected, AND
      //  - lengths line up on both sides
      const allSelectedAreCorrect = selectedAreCorrectCount === selected.length;
      const allCorrectWereSelected = correctSelectedCount === correctIds.length;
      const isCorrect = allSelectedAreCorrect && allCorrectWereSelected;

      acc.total += 1;
      if (isCorrect) acc.score += 1;

      // optional per-question detail (nice for review UI)
      acc.details.push({
        questionId: String(q._id),
        selectedChoiceIds: selected.map(String),
        isCorrect,
      });

      return acc;
    },
    { score: 0, total: 0, details: [] }
  );

  const saveAnswerQuestion = await new AnswerModel({
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
      // id: saved?._id,
    },
  });
}

module.exports = {
  listQuestionSetController,
  getQuestionSetController,
  saveAttemptedQuestionController,
};
