const { mongoose } = require("mongoose");

const questionSetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  questions: [
    {
      questionText: {
        type: String,
        required: true,
      },
      choices: [
        {
          label: {
            type: String,
            required: true,
          },
          text: {
            type: String,
            required: true,
          },
          correctAnswer: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const QuestionSet = mongoose.model("QuestionSet", questionSetSchema);
module.exports = QuestionSet;
