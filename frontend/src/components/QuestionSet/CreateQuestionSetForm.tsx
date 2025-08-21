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
  questions: {
    questionText: string;
    choices: { label: string; text: string; correctAnswer: boolean }[];
  }[];
}

function CreateQuestionSetForm() {
  const navigate = useNavigate();
  const defaultValues: QuestionSetForm = {
    title: "",
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
      alert("Title is required");
      return;
    }
    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      alert("At least one question is required");
      return;
    }
    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      if (!q.questionText || !q.questionText.trim()) {
        alert(`Question ${i + 1} text is required`);
        return;
      }
      if (!Array.isArray(q.choices) || q.choices.length === 0) {
        alert(`Question ${i + 1} must have at least one choice`);
        return;
      }
      for (let j = 0; j < q.choices.length; j++) {
        const c = q.choices[j];
        if (!c.text || !c.text.trim()) {
          alert(`Question ${i + 1} - Choice ${j + 1} text is required`);
          return;
        }
      }
    }

    const accessToken = localStorage.getItem("accessToken");
    axios
      .post("http://localhost:3000/api/admin/questionset/create", data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(() => {
        alert("Question set created successfully!");
        navigate("/questionset/list");
      })
      .catch(() => {
        alert("Error creating question set");
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
          <CreateQuestions />
          <div style={{ display: "flex", gap: "1rem" }}>
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
