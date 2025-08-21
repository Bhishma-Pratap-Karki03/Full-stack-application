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

  const defaultValues: IAttempQuestionForm = {
    ...(questionSet as IAttempQuestionForm),
  };
  const methods = useForm({ defaultValues });

  const { register, handleSubmit } = methods;

  const onSubmitHandler = (data: IAttempQuestionForm) => {
    setIsSubmitting(true);
    const accessToken = localStorage.getItem("accessToken");

    const finalData: IAttemptQuizFinalData = {
      questionSet: data?._id,
      responses: data?.questions?.map((question) => {
        return {
          questionId: question?._id,
          selectedChoiceIds: question?.choices
            ?.filter((choice) => choice?.selected)
            ?.map((ch) => ch?._id),
        };
      }),
    };

    axios
      .post("http://localhost:3000/api/questions/answer/attempt", finalData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        alert("Answer Submitted Successfully!");
        const data = res.data.data;
        setAnswer(data);
      })
      .catch((err) => {
        console.error("Submission error:", err);
        alert("Failed to submit answers. Please try again.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
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

  return (
    <div className="questions-container">
      <h2 style={{ color: "#fff", marginBottom: "1.5rem", fontSize: "1.5rem" }}>
        Questions ({fields.length})
      </h2>
      {fields?.map((field, index) => {
        return (
          <div key={index} className="question-item">
            <h3 className="question-text">
              Q{index + 1}: {field?.questionText}
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
            <span className="choice-text">{field?.text}</span>
          </label>
        );
      })}
    </div>
  );
}

export default AttemptQuizForm;
