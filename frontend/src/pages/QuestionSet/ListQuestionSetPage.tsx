import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ListQuestionSet.css"; // We'll create this CSS file
import { AuthContext } from "../../App";

export interface IListQuestionSet {
  _id: string;
  title: string;
  questionCount: number;
  isActive?: boolean;
  attempted?: boolean;
  score?: number;
  total?: number;
  percentage?: number;
  attemptedAt?: string;
}

interface IUserSkill {
  name: string;
  level: string;
}

interface IUserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePicture: string;
  bio?: string;
  skills?: IUserSkill[];
  github?: string;
  linkedin?: string;
  portfolioUrl?: string;
  createdAt: string;
}

function ListQuestionSet() {
  const [questionSets, setQuestionSet] = useState<IListQuestionSet[]>([]);
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { roleState } = useContext(AuthContext);
  const isAdmin = roleState === "admin";

  // Debug logging
  console.log("[DEBUG] roleState:", roleState);
  console.log("[DEBUG] isAdmin:", isAdmin);
  console.log("[DEBUG] questionSets.length:", questionSets.length);

  // Calculate statistics
  const activeCount = questionSets.filter(
    (set) => set.isActive === true
  ).length;
  const inactiveCount = questionSets.filter(
    (set) => set.isActive === false
  ).length;
  const totalCount = questionSets.length;

  // Function to check if a question set matches user skills
  const getMatchingSkills = (
    questionSetTitle: string,
    userSkills: IUserSkill[]
  ) => {
    const titleLower = questionSetTitle.toLowerCase();
    return userSkills.filter((skill) =>
      titleLower.includes(skill.name.toLowerCase())
    );
  };

  // Function to organize question sets into suggested and overall
  const organizeQuestionSets = (
    sets: IListQuestionSet[],
    skills: IUserSkill[]
  ) => {
    if (!skills || skills.length === 0) {
      return {
        suggested: [],
        overall: sets,
      };
    }

    const suggested: { skill: IUserSkill; questionSets: IListQuestionSet[] }[] =
      [];
    const overall: IListQuestionSet[] = [];

    // Group question sets by matching skills
    sets.forEach((set) => {
      const matchingSkills = getMatchingSkills(set.title, skills);

      if (matchingSkills.length > 0) {
        // Add to suggested for each matching skill
        matchingSkills.forEach((skill) => {
          const existingSkillGroup = suggested.find(
            (group) => group.skill.name === skill.name
          );
          if (existingSkillGroup) {
            // Check if this question set is already in this skill group
            const alreadyExists = existingSkillGroup.questionSets.some(
              (qs) => qs._id === set._id
            );
            if (!alreadyExists) {
              existingSkillGroup.questionSets.push(set);
            }
          } else {
            suggested.push({
              skill,
              questionSets: [set],
            });
          }
        });
      } else {
        overall.push(set);
      }
    });

    return { suggested, overall };
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setIsLoading(false);
      setIsProfileLoading(false);
      return;
    }

    async function fetchData() {
      try {
        // Fetch question sets
        const questionSetsResponse = await axios.get(
          "http://localhost:3000/api/questions/set/list",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log(
          "[DEBUG] Question sets response:",
          questionSetsResponse.data
        );
        console.log(
          "[DEBUG] Question sets array:",
          questionSetsResponse?.data?.questionSet
        );
        console.log("[DEBUG] Is admin:", isAdmin);

        setQuestionSet(questionSetsResponse?.data?.questionSet || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching question sets:", error);
        setIsLoading(false);
      }
    }

    async function fetchUserProfile() {
      if (isAdmin) {
        setIsProfileLoading(false);
        return;
      }

      try {
        const profileResponse = await axios.get(
          "http://localhost:3000/users/profile/me",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setUserProfile(profileResponse.data.user);
        setIsProfileLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsProfileLoading(false);
      }
    }

    fetchData();
    fetchUserProfile();
  }, [isAdmin]);

  // Render question set card
  const renderQuestionSetCard = (questionSet: IListQuestionSet) => {
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
          <p className="set-count">{questionSet.questionCount} questions</p>
        </div>
        {isAdmin ? (
          <div className="admin-actions">
            <span
              className={`status-label ${
                questionSet.isActive ? "active" : "inactive"
              }`}
            >
              Status: {questionSet.isActive ? "Active" : "Inactive"}
            </span>
            <button
              className="take-quiz-button"
              onClick={ViewWithAnswersHandler}
            >
              View With Answers
            </button>
            <div className="toggle-row">
              <input
                id={`isActive-${questionSet._id}`}
                type="checkbox"
                defaultChecked={Boolean(questionSet.isActive)}
                className="switch-input"
                onChange={async (e) => {
                  const accessToken = localStorage.getItem("accessToken");
                  if (!accessToken) return;
                  const next = e.currentTarget.checked;
                  await axios.patch(
                    `http://localhost:3000/api/admin/questionset/${questionSet._id}/status`,
                    { isActive: next },
                    {
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                      },
                    }
                  );
                  const res = await axios.get(
                    "http://localhost:3000/api/questions/set/list",
                    {
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                      },
                    }
                  );
                  setQuestionSet(res?.data?.questionSet ?? []);
                }}
              />
              <label
                htmlFor={`isActive-${questionSet._id}`}
                className="switch"
                aria-label="Toggle Active"
              >
                <span className="switch-track"></span>
                <span className="switch-thumb"></span>
              </label>
              <span
                className={`switch-text ${
                  questionSet.isActive ? "active" : "inactive"
                }`}
              >
                {questionSet.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ) : questionSet.attempted ? (
          <div className="attempt-summary">
            <div className="score-pill">
              {questionSet.score}/{questionSet.total} ({questionSet.percentage}
              %)
            </div>
            <button className="take-quiz-button" disabled>
              Already Attempted
            </button>
          </div>
        ) : (
          <button className="take-quiz-button" onClick={TakeQuizHandler}>
            Take Quiz
          </button>
        )}
      </div>
    );
  };

  if (isLoading || isProfileLoading) {
    return (
      <div className="quiz-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading question sets...</p>
        </div>
      </div>
    );
  }

  // Show different messages for admins vs professionals when no question sets exist
  if (questionSets.length === 0) {
    if (isAdmin) {
      return (
        <div className="quiz-container">
          <div className="quiz-header">
            <h1 className="quiz-title">Question Sets</h1>
            <p className="quiz-subtitle">
              Create and review question sets with answers
            </p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                className="take-quiz-button"
                onClick={() => navigate("/admin/question/set/create")}
              >
                Create Question Set
              </button>
            </div>
          </div>

          <div className="no-sets-container">
            <h2>No Question Sets Created Yet</h2>
            <p>
              Start by creating your first question set to test professionals.
            </p>
            <button
              className="try-again-button"
              onClick={() => navigate("/admin/question/set/create")}
            >
              Create First Question Set
            </button>
          </div>
        </div>
      );
    } else {
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
  }

  // Organize question sets for professionals
  const { suggested, overall } = organizeQuestionSets(
    questionSets,
    userProfile?.skills || []
  );

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1 className="quiz-title">Question Sets</h1>
        <p className="quiz-subtitle">
          {isAdmin
            ? "Create and review question sets with answers"
            : "Test your knowledge with these challenges"}
        </p>

        {/* Statistics Section */}
        {isAdmin && (
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">{totalCount}</span>
              <span className="stat-label">Total Sets</span>
            </div>
            <div className="stat-item active">
              <span className="stat-number">{activeCount}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item inactive">
              <span className="stat-number">{inactiveCount}</span>
              <span className="stat-label">Inactive</span>
            </div>
          </div>
        )}

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

      {/* Skill-based Suggestions for Professionals */}
      {!isAdmin && suggested.length > 0 && (
        <div className="suggestions-container">
          <h2 className="suggestions-title">Suggested for Your Skills</h2>
          {suggested.map((skillGroup) => (
            <div key={skillGroup.skill.name} className="skill-suggestion-group">
              <h3 className="skill-suggestion-title">
                Suggestions for {skillGroup.skill.name} (
                {skillGroup.skill.level})
              </h3>
              <div className="sets-grid">
                {skillGroup.questionSets.map(renderQuestionSetCard)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overall Question Sets */}
      <div className="question-sets-container">
        <h2 className="sets-title">
          {isAdmin
            ? "All Question Sets"
            : suggested.length > 0
            ? "All Question Sets"
            : "Available Question Sets"}
        </h2>
        <div className="sets-grid">
          {isAdmin
            ? questionSets.map(renderQuestionSetCard)
            : overall.map(renderQuestionSetCard)}
        </div>
      </div>
    </div>
  );
}

export default ListQuestionSet;
