const { mongoose } = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  questionSet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuestionSet",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  responses: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      selectedChoiceIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      ],
    },
  ],
  score: { type: Number, default: 0 }, // Number of correct answers
  total: { type: Number, default: 0 }, // Total questions in this attempt
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent multiple attempts per user per question set
AnswerSchema.index({ user: 1, questionSet: 1 }, { unique: true });

const AnswerModel = mongoose.model("Answer", AnswerSchema);
module.exports = AnswerModel;
