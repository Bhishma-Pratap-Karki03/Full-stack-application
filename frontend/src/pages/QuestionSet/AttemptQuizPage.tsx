import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AttemptQuizForm from "../../components/QuestionSet/AttemptQuizForm";
const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface IAttempQuestionForm {
  _id: string;
  title: string;
  questions: IQuestion[];
  createdBy: string;
  __v: number;
}

export interface IAttemptSummaryResponse {
  attempted?: boolean;
  attempt?: {
    questionSet: { _id: string; title: string };
    score: number;
    total: number;
    percentage: number;
    attemptedAt: string;
  };
}

export interface IQuestion {
  questionText: string;
  choices: IChoice[];
  _id: string;
}

export interface IChoice {
  label: string;
  text: string;
  _id: string;
  selected?: boolean;
}

function AttemptQuizPage() {
  const { id } = useParams();

  const [questionSets, setQuestionSet] = useState<
    IAttempQuestionForm | IAttemptSummaryResponse
  >({} as IAttempQuestionForm);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const Navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !id) {
      setError("Authentication required or invalid quiz ID");
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/questions/set/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log("[DEBUG] Frontend received response:", response.data);
        setQuestionSet(response?.data);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching quiz:", err);
        setIsLoading(false);

        let errorMessage = "Failed to load quiz. Please try again.";

        if (err.response?.status === 404) {
          errorMessage = "Quiz not found.";
        } else if (err.response?.status === 403) {
          errorMessage = "You don't have permission to access this quiz.";
        } else if (err.response?.status === 401) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }

        setError(errorMessage);
      }
    }

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="quiz-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="result-container">
          <h2 className="result-title">Error</h2>
          <p style={{ color: "#c62828", marginBottom: "2rem" }}>{error}</p>
          <button
            className="try-again-button"
            onClick={() => Navigate("/questionset/list")}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {questionSets ? <AttemptQuizForm questionSet={questionSets} /> : null}
    </div>
  );
}

export default AttemptQuizPage;
