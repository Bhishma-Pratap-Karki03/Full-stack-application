const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  questionSet: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "QuestionSet", 
    required: true 
  },
  score: { 
    type: Number, 
    required: true 
  },
  total: { 
    type: Number, 
    required: true 
  },
  attemptedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const QuizResult = mongoose.model("QuizResult", quizResultSchema);
module.exports = QuizResult;