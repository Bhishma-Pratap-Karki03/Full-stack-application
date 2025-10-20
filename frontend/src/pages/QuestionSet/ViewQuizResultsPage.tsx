import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/ViewQuizResults.css";

interface IResultChoice {
  _id: string;
  label: string;
  text: string;
  correctAnswer: boolean;
  userSelected: boolean;
}

interface IResultQuestion {
  _id: string;
  questionText: string;
  choices: IResultChoice[];
}

interface IResultQuestionSet {
  _id: string;
  title: string;
  questions: IResultQuestion[];
}

interface IQuizResult {
  questionSet: IResultQuestionSet;
  score: number;
  total: number;
  percentage: number;
  attemptedAt: string;
}

function ViewQuizResultsPage() {
  const { questionSetId } = useParams();
  const [result, setResult] = useState<IQuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !questionSetId) {
      setIsLoading(false);
      setError("Authentication required");
      return;
    }

    axios
      .get(`http://localhost:3000/api/quiz/result/${questionSetId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        setResult(res.data.result);
      })
      .catch((err) => {
        console.error("Error fetching quiz result:", err);
        setError("Failed to load quiz result");
      })
      .finally(() => setIsLoading(false));
  }, [questionSetId]);

  if (isLoading) {
    return (
      <div className="quiz-results-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading quiz results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="quiz-results-container">
        <div className="error-container">
          <p>{error || "Quiz result not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-results-container">
      <div className="results-header">
        <h1 className="results-title">{result.questionSet.title}</h1>
        <p className="results-subtitle">Your Quiz Results</p>
        
        <div className="score-summary">
          <div className="score-card">
            <div className="score-main">
              <span className="score-number">{result.score}</span>
              <span className="score-divider">/</span>
              <span className="total-number">{result.total}</span>
            </div>
            <div className="score-percentage">{result.percentage}%</div>
            <div className="score-label">Final Score</div>
          </div>
          
          <div className="attempt-info">
            <p className="attempt-date">
              Attempted on: {new Date(result.attemptedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="questions-container">
        {result.questionSet.questions.map((question, index) => {
          const userChoice = question.choices.find(choice => choice.userSelected);
          const isCorrect = userChoice?.correctAnswer || false;

          return (
            <div key={question._id} className="question-item">
              <div className="question-header">
                <h3 className="question-text">
                  Q{index + 1}: {question.questionText}
                </h3>
                <div className={`result-indicator ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </div>
              </div>
              
              <div className="choices-container">
                {question.choices.map((choice) => {
                  let choiceClass = "choice-item";
                  
                  if (choice.correctAnswer) {
                    choiceClass += " choice-correct";
                  }
                  
                  if (choice.userSelected && !choice.correctAnswer) {
                    choiceClass += " choice-incorrect";
                  }
                  
                  if (choice.userSelected) {
                    choiceClass += " choice-selected";
                  }

                  return (
                    <div key={choice._id} className={choiceClass}>
                      <span className="choice-text">{choice.text}</span>
                      <div className="choice-indicators">
                        {choice.correctAnswer && (
                          <span className="badge badge-success">Correct Answer</span>
                        )}
                        {choice.userSelected && (
                          <span className={`badge ${choice.correctAnswer ? 'badge-success' : 'badge-error'}`}>
                            {choice.correctAnswer ? 'Your Answer' : 'Your Answer'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ViewQuizResultsPage;