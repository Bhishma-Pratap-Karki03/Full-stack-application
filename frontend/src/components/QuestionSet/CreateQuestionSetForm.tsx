import axios from "axios";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import "../../styles/AttemptQuizForm.css";
import { useNavigate } from "react-router-dom";
interface QuestionSetForm {
  title: string;
  isActive?: boolean;
  questions: {
    questionText: string;
    choices: { label: string; text: string; correctAnswer: boolean }[];
  }[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL;


function CreateQuestionSetForm() {
  const navigate = useNavigate();
  const defaultValues: QuestionSetForm = {
    title: "",
    isActive: true,
    questions: [
      {
        choices: [],
        questionText: "",
      },
    ],
  };

  const methods = useForm({ defaultValues });
  const { register, watch, handleSubmit } = methods;
  console.log("Form values:", watch());
  console.log("form values =>", watch());

  const onSubmitHandler = (data: QuestionSetForm) => {
    // Client-side validation to prevent empty submissions
    if (!data.title || !data.title.trim()) {
      return;
    }
    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      return;
    }
    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      if (!q.questionText || !q.questionText.trim()) {
        return;
      }
      if (!Array.isArray(q.choices) || q.choices.length === 0) {
        return;
      }
      for (let j = 0; j < q.choices.length; j++) {
        const c = q.choices[j];
        if (!c.text || !c.text.trim()) {
          return;
        }
      }
    }

    const accessToken = localStorage.getItem("accessToken");
    axios
      .post(`${API_BASE_URL}/api/admin/questionset/create`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(() => {
        navigate("/questionset/list");
      })
      .catch(() => {
        console.error("Error creating question set");
      });
  };
  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1 className="quiz-title">Create Question Set</h1>
        <p className="quiz-subtitle">
          Design questions and mark correct answers
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="quiz-form">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              {...register("title", { required: true })}
              placeholder={"Enter your Title"}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <div className="toggle-row">
              <input
                id="isActive"
                type="checkbox"
                defaultChecked
                {...register("isActive")}
                className="switch-input"
              />
              <label
                htmlFor="isActive"
                className="switch"
                aria-label="Toggle Active"
              >
                <span className="switch-track"></span>
                <span className="switch-thumb"></span>
              </label>
              <span
                className={`switch-text ${
                  watch("isActive") ? "active" : "inactive"
                }`}
              >
                {watch("isActive") ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <CreateQuestions />
          <div className="button-container">
            <button type="submit" className="submit-button">
              Create Question Set
            </button>
            <button
              type="button"
              className="try-again-button"
              onClick={() => navigate("/questionset/list")}
            >
              Cancel
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

function CreateQuestions() {
  const { register, control } = useFormContext<QuestionSetForm>();
  const { append, remove, fields } = useFieldArray({
    control,
    name: "questions",
  });
  const AddQuestionHandler = () => {
    append({
      choices: [],
      questionText: "",
    });
  };
  return (
    <div className="questions-container">
      <h2 style={{ color: "#fff", marginBottom: "1.5rem", fontSize: "1.5rem" }}>
        Questions ({fields.length})
      </h2>
      {fields.map((_, index) => {
        const RemoveQuestionHandler = () => {
          remove(index);
        };
        return (
          <div key={index} className="question-item">
            <input
              {...register(`questions.${index}.questionText`, {
                required: true,
              })}
              placeholder="Enter your Question"
              className="form-input"
              required
            />
            <button
              type="button"
              onClick={RemoveQuestionHandler}
              className="remove-button"
            >
              Remove
            </button>
            <CreateChoices questionIndex={index} />
          </div>
        );
      })}

      <button
        type="button"
        className="try-again-button"
        onClick={AddQuestionHandler}
      >
        Add Question
      </button>
    </div>
  );
}
function CreateChoices({ questionIndex }: { questionIndex: number }) {
  const { register, control } = useFormContext<QuestionSetForm>();
  const { append, remove, fields } = useFieldArray({
    control,
    name: `questions.${questionIndex}.choices`,
  });
  const AddChoiceHandler = () => {
    append({
      label: fields.length.toString(),
      text: "",
      correctAnswer: false,
    });
  };
  return (
    <div className="choices-container">
      {fields.map((_, index) => {
        const RemoveQuestionHandler = () => {
          remove(index);
        };
        return (
          <label key={index} className="choice-item">
            <input
              type="checkbox"
              className="choice-checkbox"
              {...register(
                `questions.${questionIndex}.choices.${index}.correctAnswer`
              )}
            />
            <input
              {...register(`questions.${questionIndex}.choices.${index}.text`, {
                required: true,
              })}
              placeholder="Enter your Choice"
              className="form-input"
              style={{ flex: 1 }}
              required
            />
            <button
              type="button"
              onClick={RemoveQuestionHandler}
              className="remove-button"
            >
              Remove
            </button>
          </label>
        );
      })}
      <button
        type="button"
        className="try-again-button"
        onClick={AddChoiceHandler}
      >
        Add Choices
      </button>
    </div>
  );
}

export default CreateQuestionSetForm;
