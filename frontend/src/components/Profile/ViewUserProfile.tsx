import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../App";
import axios from "axios";
import "../../styles/Profile.css";
import addUserIcon from "../../assets/images/add-user.png";
import pendingIcon from "../../assets/images/Pending.png";
import messengerIcon from "../../assets/images/messenger.png";
import acceptIcon from "../../assets/images/Accept.png";
import rejectIcon from "../../assets/images/Reject.png";

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
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    isPending: boolean;
    isSender: boolean;
    isReceiver: boolean;
  }>({
    connected: false,
    isPending: false,
    isSender: false,
    isReceiver: false,
  });
  const [sendingRequest, setSendingRequest] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [mutualConnections, setMutualConnections] = useState<
    Array<{
      _id: string;
      name: string;
      profilePicture?: string;
    }>
  >([]);
  const { isAuth, roleState } = useContext(AuthContext);
  const { id } = useParams<{ id: string }>();

  // Fetch mutual connections when component mounts or id changes
  useEffect(() => {
    if (!isAuth || !id || !currentUserId) return;

    const fetchMutualConnections = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(
          `http://localhost:3000/api/connections/mutual/${id}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setMutualConnections(response.data.mutualConnections || []);
      } catch (error) {
        console.error("Error fetching mutual connections:", error);
      }
    };

    // Only fetch mutual connections if viewing another user's profile
    if (id !== currentUserId) {
      fetchMutualConnections();
    }
  }, [isAuth, id, currentUserId]);

  useEffect(() => {
    if (!isAuth || !id) return;

    const accessToken = localStorage.getItem("accessToken");

    // Get current user ID
    const currentId = getCurrentUserId();
    setCurrentUserId(currentId);

    // Fetch user profile data and connection status
    const requests = [
      axios.get(`http://localhost:3000/users/profile/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      axios.get(`http://localhost:3000/api/quiz/results/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ];

    // Add connection check for professionals
    if (roleState === "professional" && currentId !== id) {
      requests.push(
        axios.get(`http://localhost:3000/api/connections/check/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      );
    }

    Promise.all(requests)
      .then((responses) => {
        const [profileRes, resultsRes] = responses;
        setUserData(profileRes.data.user);
        setQuizResults(resultsRes.data.results || []);

        if (responses[2] && roleState === "professional") {
          const connectionData = responses[2].data;
          setConnectionStatus({
            connected: connectionData.connected,
            isPending: connectionData.isPending,
            isSender: connectionData.isSender,
            isReceiver: connectionData.isReceiver,
          });
          if (connectionData.connection) {
            setConnectionId(connectionData.connection._id);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching user profile or results:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuth, id, roleState]);

  const getCurrentUserId = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id);
        return payload.id;
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    return null;
  };

  const sendConnectionRequest = async () => {
    if (!id || sendingRequest) return;

    setSendingRequest(true);
    try {
      const token = localStorage.getItem("accessToken");
      const currentUserId = getCurrentUserId();
      const response = await axios.post(
        "http://localhost:3000/api/connections/send",
        {
          receiverId: id,
          senderId: currentUserId,
          message: `Hi ${userData?.name}, I'd like to connect with you!`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update connection status to show pending state
      setConnectionStatus({
        connected: false,
        isPending: true,
        isSender: true,
        isReceiver: false,
      });

      if (response.data.connectionRequest) {
        setConnectionId(response.data.connectionRequest._id);
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
    } finally {
      setSendingRequest(false);
    }
  };

  // Function to get the appropriate connection button based on status
  const renderConnectionButton = () => {
    // If connected, show message button
    if (connectionStatus.connected) {
      return (
        <Link
          to={`/messages/${userData?._id}`}
          className="icon-link"
          title="Message"
        >
          <img src={messengerIcon} alt="Message" className="action-icon" />
        </Link>
      );
    }

    // If there's a pending request
    if (connectionStatus.isPending) {
      // If current user is the sender, show pending state
      if (connectionStatus.isSender) {
        return (
          <button className="connect-btn-small" disabled title="Request Sent">
            <img
              src={pendingIcon}
              alt="Request Sent"
              className="action-icon"
              style={{ filter: "none" }}
            />
          </button>
        );
      }
      // If current user is the receiver, show accept/reject options
      else if (connectionStatus.isReceiver) {
        return (
          <div className="connection-actions">
            <button
              className="accept-request-btn"
              onClick={() => handleAcceptRequest()}
              title="Accept Request"
            >
              <img src={acceptIcon} alt="Accept" className="action-icon" />
            </button>
            <button
              className="reject-request-btn"
              onClick={() => handleRejectRequest()}
              title="Reject Request"
            >
              <img src={rejectIcon} alt="Reject" className="action-icon" />
            </button>
          </div>
        );
      }
    }

    // Default: show connect button
    return (
      <button
        onClick={sendConnectionRequest}
        disabled={sendingRequest}
        className="connect-btn-small"
        title="Connect"
      >
        <img
          src={addUserIcon}
          alt="Connect"
          className="action-icon"
          style={{ filter: "none" }}
        />
      </button>
    );
  };

  const handleAcceptRequest = async () => {
    if (!connectionId) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `http://localhost:3000/api/connections/accept/${connectionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update connection status to connected
      setConnectionStatus({
        connected: true,
        isPending: false,
        isSender: false,
        isReceiver: false,
      });
    } catch (error) {
      console.error("Error accepting connection request:", error);
    }
  };

  const handleRejectRequest = async () => {
    if (!connectionId) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `http://localhost:3000/api/connections/reject/${connectionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Reset connection status
      setConnectionStatus({
        connected: false,
        isPending: false,
        isSender: false,
        isReceiver: false,
      });
      setConnectionId(null);
    } catch (error) {
      console.error("Error rejecting connection request:", error);
    }
  };

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
              <p className={`user-role ${userData.role}`}>{userData.role}</p>

              {/* Mutual Connections Section */}
              {mutualConnections.length > 0 && id !== currentUserId && (
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

              {userData.bio && (
                <div className="user-bio">
                  <h3>About Me</h3>
                  <p style={{ whiteSpace: "pre-line", fontSize: "0.9rem" }}>
                    {userData.bio}
                  </p>
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
                    className="social-link github"
                  >
                    GitHub Link
                  </a>
                )}
                {userData.linkedin && (
                  <a
                    href={userData.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link linkedin"
                  >
                    LinkedIn Link
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

              {/* Connection and messaging actions for professionals */}
              {roleState === "professional" &&
                userData.role === "professional" &&
                currentUserId !== id && (
                  <div className="connection-actions">
                    {renderConnectionButton()}
                  </div>
                )}
            </div>
          </div>
        </div>

        <div className="quiz-results-card">
          <div className="quiz-results-header-row">
            <h2 className="quiz-results-title">Quiz Results</h2>
            <Link
              to={`/quiz/results/all/${id}`}
              className="view-all-results-btn"
              title="View all results"
            >
              View All
            </Link>
          </div>

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
