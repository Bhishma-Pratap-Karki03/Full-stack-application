import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ListQuestionSet.css"; // We'll create this CSS file
import { AuthContext } from "../../App";

export interface IListQuestionSet {
  _id: string;
  title: string;
  questionCount: number;
  attempted?: boolean;
  score?: number;
  total?: number;
  percentage?: number;
  attemptedAt?: string;
}

function ListQuestionSet() {
  const [questionSets, setQuestionSet] = useState<IListQuestionSet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { roleState } = useContext(AuthContext);
  const isAdmin = roleState === "admin";

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      axios
        .get("http://localhost:3000/api/questions/set/list", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setQuestionSet(response?.data?.questionSet);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="quiz-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading question sets...</p>
        </div>
      </div>
    );
  }

  if (questionSets.length === 0) {
    return (
      <div className="quiz-container">
        <div className="no-sets-container">
          <h2>No Question Sets Available</h2>
          <p>There are currently no question sets to attempt.</p>
          <button
            className="try-again-button"
            onClick={() => window.location.reload()}
          >
            Check Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1 className="quiz-title">Question Sets</h1>
        <p className="quiz-subtitle">
          {isAdmin
            ? "Create and review question sets with answers"
            : "Test your knowledge with these challenges"}
        </p>
        {isAdmin && (
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button
              className="take-quiz-button"
              onClick={() => navigate("/admin/question/set/create")}
            >
              Create Question Set
            </button>
          </div>
        )}
      </div>

      <div className="question-sets-container">
        <h2 className="sets-title">
          {isAdmin ? "All Question Sets" : "My Question Sets"}
        </h2>
        <div className="sets-grid">
          {questionSets.map((questionSet) => {
            const TakeQuizHandler = () => {
              if (isAdmin) return; // Block admin from attempting
              navigate(`/questionset/${questionSet._id}/attempt`);
            };

            const ViewWithAnswersHandler = () => {
              navigate(`/admin/questionset/${questionSet._id}/view`);
            };

            return (
              <div key={questionSet._id} className="set-card">
                <div className="set-info">
                  <h3 className="set-title">{questionSet.title}</h3>
                  <p className="set-count">
                    {questionSet.questionCount} questions
                  </p>
                </div>
                {isAdmin ? (
                  <button
                    className="take-quiz-button"
                    onClick={ViewWithAnswersHandler}
                  >
                    View With Answers
                  </button>
                ) : questionSet.attempted ? (
                  <div className="attempt-summary">
                    <div className="score-pill">
                      {questionSet.score}/{questionSet.total} (
                      {questionSet.percentage}%)
                    </div>
                    <button className="take-quiz-button" disabled>
                      Already Attempted
                    </button>
                  </div>
                ) : (
                  <button
                    className="take-quiz-button"
                    onClick={TakeQuizHandler}
                  >
                    Take Quiz
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ListQuestionSet;
