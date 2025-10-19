import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/AttemptQuizForm.css";
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface IAdminChoice {
  label: string;
  text: string;
  correctAnswer: boolean;
  _id: string;
}

interface IAdminQuestion {
  _id: string;
  questionText: string;
  choices: IAdminChoice[];
}

interface IAdminQuestionSet {
  _id: string;
  isActive?: boolean;
  title: string;
  questions: IAdminQuestion[];
}

function AdminViewQuestionSetPage() {
  const { id } = useParams();
  const [data, setData] = useState<IAdminQuestionSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !id) {
      setIsLoading(false);
      return;
    }

    axios
      .get(`${API_BASE_URL}/api/admin/questionset/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        setData(res.data.questionSet);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Not found</div>;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1 className="quiz-title">{data.title}</h1>
        <p className="quiz-subtitle">Admin view (answers visible)</p>
        <div
          className="toggle-row"
          style={{ justifyContent: "center", marginTop: "0.5rem" }}
        >
          <input
            id={`isActive-${id}`}
            type="checkbox"
            defaultChecked={Boolean(data.isActive)}
            className="switch-input"
            onChange={async (e) => {
              const accessToken = localStorage.getItem("accessToken");
              if (!accessToken || !id) return;
              const next = e.currentTarget.checked;
              await axios.patch(
                `${API_BASE_URL}/api/admin/questionset/${id}/status`,
                { isActive: next },
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );
              const res = await axios.get(
                `${API_BASE_URL}/api/admin/questionset/${id}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );
              setData(res.data.questionSet);
            }}
          />
          <label
            htmlFor={`isActive-${id}`}
            className="switch"
            aria-label="Toggle Active"
          >
            <span className="switch-track"></span>
            <span className="switch-thumb"></span>
          </label>
          <span
            className={`switch-text ${data.isActive ? "active" : "inactive"}`}
          >
            {data.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="questions-container">
        {data.questions.map((q, qi) => (
          <div key={q._id} className="question-item">
            <h3 className="question-text">
              Q{qi + 1}: {q.questionText}
            </h3>
            <div className="choices-container">
              {q.choices.map((c) => (
                <div
                  key={c._id}
                  className={`choice-item ${
                    c.correctAnswer ? "choice-correct" : ""
                  }`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span className="choice-text">{c.text}</span>
                  {c.correctAnswer && (
                    <span className="badge badge-success">Correct</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminViewQuestionSetPage;
