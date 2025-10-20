import { useState } from "react";
import type {
  IAttempQuestionForm,
  IAttemptSummaryResponse,
} from "../../pages/QuestionSet/AttemptQuizPage";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import axios from "axios";
import "../../styles/AttemptQuizForm.css";
import { useNavigate } from "react-router-dom";

export interface IAttemptQuizFinalData {
  questionSet: string;
  responses: {
    questionId: string;
    selectedChoiceIds: string[];
  }[];
}

function AttemptQuizForm({
  questionSet,
}: {
  questionSet: IAttempQuestionForm | IAttemptSummaryResponse;
}) {
  const [answer, setAnswer] = useState({
    score: 0,
    total: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // If backend says already attempted, show summary instead of form
  if ((questionSet as IAttemptSummaryResponse)?.attempted) {
    const attempt = (questionSet as IAttemptSummaryResponse).attempt!;
    return (
      <div className="quiz-container">
        <div className="result-container">
          <h2 className="result-title">Quiz Already Attempted</h2>
          <div className="result-score">{attempt.score}</div>
          <p className="result-total">out of {attempt.total} questions</p>
          <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
            Percentage: {attempt.percentage}%
          </p>
          <button
            className="try-again-button"
            onClick={() => navigate("/questionset/list")}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Validate questionSet structure
  if (
    !questionSet ||
    !(questionSet as IAttempQuestionForm)._id ||
    !(questionSet as IAttempQuestionForm).questions
  ) {
    return (
      <div className="quiz-container">
        <div className="result-container">
          <h2 className="result-title">Error Loading Quiz</h2>
          <p>Unable to load the quiz. Please try again.</p>
          <button
            className="try-again-button"
            onClick={() => navigate("/questionset/list")}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const defaultValues: IAttempQuestionForm = {
    ...(questionSet as IAttempQuestionForm),
  };
  const methods = useForm({ defaultValues });

  const { register, handleSubmit } = methods;

  const onSubmitHandler = async (data: IAttempQuestionForm) => {
    setIsSubmitting(true);
    setError(null);

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setError("Authentication required. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Validate data before sending
      if (!data?._id || !data?.questions) {
        throw new Error("Invalid quiz data");
      }

      const finalData: IAttemptQuizFinalData = {
        questionSet: data._id,
        responses: data.questions
          .filter((question) => question?._id && question?.choices)
          .map((question) => {
            return {
              questionId: question._id,
              selectedChoiceIds: question.choices
                .filter((choice) => choice?.selected && choice?._id)
                .map((ch) => ch._id),
            };
          }),
      };

      const response = await axios.post(
        "http://localhost:3000/api/questions/answer/attempt",
        finalData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data?.data) {
        setAnswer(response.data.data);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      console.error("Submission error:", err);

      let errorMessage = "Failed to submit answers. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (answer?.total > 0) {
    return (
      <div className="quiz-container">
        <div className="result-container">
          <h2 className="result-title">Quiz Results</h2>
          <div className="result-score">{answer.score}</div>
          <p className="result-total">out of {answer.total} questions</p>
          <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
            Percentage: {Math.round((answer.score / answer.total) * 100)}%
          </p>
          <button
            className="try-again-button"
            onClick={() => navigate("/questionset/list")}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1 className="quiz-title">Knowledge Challenge</h1>
        <p className="quiz-subtitle">
          Test your skills and prove your expertise
        </p>
      </div>

      {error && (
        <div
          className="error-message"
          style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "1rem",
            margin: "1rem 0",
            borderRadius: "4px",
            border: "1px solid #ffcdd2",
          }}
        >
          {error}
        </div>
      )}

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="quiz-form">
          <div className="form-group">
            <label className="form-label">Quiz Title</label>
            <input
              {...register("title")}
              placeholder="Enter Quiz Title"
              className="form-input"
              disabled
            />
          </div>

          <CreateQuestions />

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="button-loader"></span>
                Submitting Answers...
              </>
            ) : (
              "Submit Answers"
            )}
          </button>
        </form>
      </FormProvider>
    </div>
  );
}

function CreateQuestions() {
  const { control } = useFormContext<IAttempQuestionForm>();

  const { fields } = useFieldArray({
    control,
    name: "questions",
  });

  if (!fields || fields.length === 0) {
    return (
      <div className="questions-container">
        <p style={{ color: "#fff", textAlign: "center" }}>
          No questions available in this quiz.
        </p>
      </div>
    );
  }

  return (
    <div className="questions-container">
      <h2 style={{ color: "#fff", marginBottom: "1.5rem", fontSize: "1.5rem" }}>
        Questions ({fields.length})
      </h2>
      {fields?.map((field, index) => {
        return (
          <div key={index} className="question-item">
            <h3 className="question-text">
              Q{index + 1}:{" "}
              {field?.questionText || "Question text not available"}
            </h3>
            <CreateChoices questionIndex={index} />
          </div>
        );
      })}
    </div>
  );
}

function CreateChoices({ questionIndex }: { questionIndex: number }) {
  const { register, control } = useFormContext<IAttempQuestionForm>();

  const { fields } = useFieldArray({
    control,
    name: `questions.${questionIndex}.choices`,
  });

  if (!fields || fields.length === 0) {
    return (
      <div className="choices-container">
        <p style={{ color: "#ccc", fontStyle: "italic" }}>
          No choices available for this question.
        </p>
      </div>
    );
  }

  return (
    <div className="choices-container">
      {fields?.map((field, index) => {
        return (
          <label key={index} className="choice-item">
            <input
              type="checkbox"
              className="choice-checkbox"
              {...register(
                `questions.${questionIndex}.choices.${index}.selected`
              )}
            />
            <span className="choice-text">
              {field?.text || "Choice text not available"}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default AttemptQuizForm;
