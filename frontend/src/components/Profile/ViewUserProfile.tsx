import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../App";
import axios from "axios";
import "../../styles/Profile.css";

interface IQuizResult {
  questionSet: {
    _id: string;
    title: string;
  };
  score: number;
  total: number;
  percentage: number;
  attemptedAt: string;
}

interface IUserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePicture: string;
  bio?: string;
  skills?: Array<{
    name: string;
    level: string;
  }>;
  github?: string;
  linkedin?: string;
  portfolioUrl?: string;
  createdAt: string;
}

function ViewUserProfile() {
  const [userData, setUserData] = useState<IUserProfile | null>(null);
  const [quizResults, setQuizResults] = useState<IQuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuth } = useContext(AuthContext);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!isAuth || !id) return;

    const accessToken = localStorage.getItem("accessToken");

    // Fetch user profile data
    Promise.all([
      axios.get(`http://localhost:3000/users/profile/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
      axios.get(`http://localhost:3000/api/quiz/results/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    ])
      .then(([profileRes, resultsRes]) => {
        setUserData(profileRes.data.user);
        setQuizResults(resultsRes.data.results || []);
      })
      .catch((error) => {
        console.error("Error fetching user profile or results:", error);
        alert("Error loading user profile");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuth, id]);

  if (!isAuth) {
    return (
      <div className="profile-container">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to view profiles.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-container">
        <div className="auth-required">
          <h2>Profile Not Found</h2>
          <p>The requested user profile could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">{userData.name}'s Profile</h1>
        <p className="profile-subtitle">Viewing professional profile</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-picture-container">
              {userData.profilePicture ? (
                <img
                  src={`http://localhost:3000/uploads/profile-pictures/${userData.profilePicture}`}
                  alt="Profile"
                  className="profile-picture"
                />
              ) : (
                <div className="profile-picture-placeholder">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="profile-details">
              <h2 className="user-name">{userData.name}</h2>
              <p className="user-email">{userData.email}</p>
              <p className="user-role">{userData.role}</p>

              {userData.bio && (
                <div className="user-bio">
                  <h3>About Me</h3>
                  <p>{userData.bio}</p>
                </div>
              )}

              {userData.skills && userData.skills.length > 0 && (
                <div className="user-skills">
                  <h3>Skills</h3>
                  <div className="skills-list">
                    {userData.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill.name}{" "}
                        <span className="skill-level">({skill.level})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="social-links">
                {userData.github && (
                  <a
                    href={userData.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    GitHub
                  </a>
                )}
                {userData.linkedin && (
                  <a
                    href={userData.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    LinkedIn
                  </a>
                )}
                {userData.portfolioUrl && (
                  <a
                    href={userData.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="quiz-results-card">
          <h2>Quiz Results</h2>

          {quizResults.length === 0 ? (
            <div className="no-results">
              <p>No quiz attempts found for this user.</p>
            </div>
          ) : (
            <div className="results-list">
              {quizResults.map((result, index) => (
                <div key={index} className="result-item">
                  <div className="result-info">
                    <h3 className="quiz-title">{result.questionSet.title}</h3>
                    <p className="quiz-date">
                      Attempted on:{" "}
                      {new Date(result.attemptedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="result-stats">
                    <div className="score-circle">
                      <svg
                        className="circle-chart"
                        viewBox="0 0 36 36"
                        width="80"
                        height="80"
                      >
                        <path
                          className="circle-bg"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="circle"
                          strokeDasharray={`${result.percentage}, 100`}
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" className="percentage">
                          {result.percentage}%
                        </text>
                      </svg>
                    </div>

                    <div className="score-details">
                      <p className="score-text">
                        <span className="score-number">{result.score}</span> out
                        of
                        <span className="total-number">
                          {" "}
                          {result.total}
                        </span>{" "}
                        questions
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewUserProfile;
