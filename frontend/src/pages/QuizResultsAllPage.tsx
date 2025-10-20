import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "../styles/AllQuizResults.css";
import "../styles/Profile.css"; // reuse profile detail styles
import "../styles/AuthHomePage.css"; // reuse skills/social pill styles
import { AuthContext } from "../App";

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

interface IMutualConnection {
  _id: string;
  name: string;
  profilePicture?: string;
}

function QuizResultsAllPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<IUserProfile | null>(null);
  const [results, setResults] = useState<IQuizResult[]>([]);
  const [mutualConnections, setMutualConnections] = useState<
    IMutualConnection[]
  >([]);
  const navigate = useNavigate();
  const { userId } = useParams();
  const { isAuth } = useContext(AuthContext);
  const accessToken = localStorage.getItem("accessToken");

  // Fetch mutual connections when component mounts or userId changes
  const fetchMutualConnections = useCallback(async () => {
    if (!isAuth || !userId || !accessToken) return;

    try {
      const response = await axios.get(
        `http://localhost:3000/api/connections/mutual/${userId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setMutualConnections(response.data.mutualConnections || []);
    } catch (error) {
      console.error("Error fetching mutual connections:", error);
    }
  }, [isAuth, userId, accessToken]);

  useEffect(() => {
    if (userId && userId !== "me") {
      fetchMutualConnections();
    }
  }, [userId, fetchMutualConnections]);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setIsLoading(false);
      return;
    }
    const fetchAll = async () => {
      try {
        const profileUrl = userId
          ? `http://localhost:3000/users/profile/${userId}`
          : "http://localhost:3000/users/profile/me";
        const resultsUrl = userId
          ? `http://localhost:3000/api/quiz/results/${userId}`
          : "http://localhost:3000/api/quiz/results";

        const [profileRes, resultsRes] = await Promise.all([
          axios.get(profileUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          axios.get(resultsUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);
        setUser(profileRes.data.user);
        setResults(resultsRes.data.results || []);
      } catch (e) {
        console.error("Error fetching all quiz results page data", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="all-results-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-results-container">
      <div className="all-results-header">
        <div className="title-row">
          <h1 className="all-results-title">All Quiz Results</h1>
          <div className="header-actions">
            <button
              className="btn-secondary"
              onClick={() =>
                navigate(userId ? `/profile/${userId}` : "/profile")
              }
            >
              {userId ? "Back to User Profile" : "Back to My Profile"}
            </button>
          </div>
        </div>
        <p className="all-results-subtitle">
          Full summary of your attempts with your profile details
        </p>
      </div>
      {user && (
        <div className="profile-summary-card">
          <div className="profile-info">
            <div className="profile-picture-container">
              {user.profilePicture ? (
                <img
                  src={`http://localhost:3000/uploads/profile-pictures/${user.profilePicture}`}
                  alt="Profile"
                  className="profile-picture"
                />
              ) : (
                <div className="profile-picture-placeholder">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="profile-details">
              <h2 className="user-name">{user.name}</h2>
              <p className="user-email">{user.email}</p>
              <p className={`user-role ${user.role}`}>{user.role}</p>

              {/* Mutual Connections Section */}
              {mutualConnections.length > 0 && userId && userId !== "me" && (
                <div className="mutual-connections">
                  <h3>Mutual Connections</h3>
                  <p className="mutual-count">
                    {mutualConnections.length} mutual connection
                    {mutualConnections.length !== 1 ? "s" : ""}
                  </p>
                  <div className="mutual-avatars">
                    {mutualConnections.slice(0, 5).map((conn, idx) => (
                      <Link
                        to={`/profile/${conn._id}`}
                        key={conn._id}
                        className="mutual-avatar-link"
                        style={{
                          zIndex: 5 - idx,
                          marginLeft: idx > 0 ? -8 : 0,
                        }}
                        title={conn.name}
                      >
                        <div className="mutual-avatar">
                          {conn.profilePicture ? (
                            <img
                              src={`http://localhost:3000/uploads/profile-pictures/${conn.profilePicture}`}
                              alt={conn.name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const fallback =
                                  target.parentElement?.querySelector(
                                    ".mutual-avatar-fallback"
                                  ) as HTMLElement;
                                if (fallback) {
                                  fallback.style.display = "flex";
                                }
                              }}
                            />
                          ) : null}
                          <div className="mutual-avatar-fallback">
                            {conn.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      </Link>
                    ))}
                    {mutualConnections.length > 5 && (
                      <div
                        className="more-connections"
                        title={`${
                          mutualConnections.length - 5
                        } more connections`}
                      >
                        +{mutualConnections.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {user.bio && (
                <div className="user-bio">
                  <h3>About Me</h3>
                  <div
                    className="bio-content"
                    style={{ whiteSpace: "pre-line", color: "#495057" }}
                  >
                    {user.bio}
                  </div>
                </div>
              )}

              {user.skills && user.skills.length > 0 && (
                <div className="user-skills">
                  <h3>Skills</h3>
                  <div className="skills-list">
                    {user.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">
                        {skill.name}{" "}
                        <span className="skill-level">({skill.level})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="social-links">
                {user.github && (
                  <a
                    href={user.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link github"
                  >
                    GitHub Link
                  </a>
                )}
                {user.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link linkedin"
                  >
                    LinkedIn Link
                  </a>
                )}
                {user.portfolioUrl && (
                  <a
                    href={user.portfolioUrl}
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
      )}

      <div className="all-results-list-card">
        <div className="list-header-row">
          <h2 className="section-title">Attempt History</h2>
        </div>

        {results.length === 0 ? (
          <div className="no-results">
            <p>No attempts yet.</p>
            <a href="/questionset/list" className="take-quiz-button">
              Take a Quiz
            </a>
          </div>
        ) : (
          <div className="results-list">
            {results.map((result, index) => (
              <div key={index} className="result-item">
                <div className="result-info">
                  <h3 className="quiz-title">{result.questionSet.title}</h3>
                  <p className="quiz-date">
                    Attempted on:{" "}
                    {new Date(result.attemptedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="result-stats">
                  <div
                    className="score-circle"
                    aria-label={`Score ${result.percentage}%`}
                  >
                    <svg
                      className="circle-chart"
                      viewBox="0 0 36 36"
                      width="80"
                      height="80"
                    >
                      <path
                        className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="circle"
                        strokeDasharray={`${result.percentage}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="20.35" className="percentage">
                        {result.percentage}%
                      </text>
                    </svg>
                  </div>
                  <div className="score-details">
                    <p className="score-text">
                      <span className="score-number">{result.score}</span> out
                      of <span className="total-number">{result.total}</span>{" "}
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
  );
}

export default QuizResultsAllPage;
