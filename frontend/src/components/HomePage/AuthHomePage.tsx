import axios from "axios";
import { useEffect, useState } from "react";
import "../../styles/AuthHomePage.css"; // Import the CSS file
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export interface IAuthUserList {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  profilePicture: string;
  __v: number;
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

function AuthHomePage() {
  const [users, setUsers] = useState<IAuthUserList[]>([]);
  const [currentUserProfile, setCurrentUserProfile] =
    useState<IUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  let currentRole: string | null = null;
  let currentUserId: string | null = null;

  try {
    if (accessToken) {
      const decoded: { id: string; role: string } = jwtDecode(
        accessToken as string
      );
      currentRole = decoded?.role || null;
      currentUserId = decoded?.id || null;
    }
  } catch (e) {
    currentRole = null;
    currentUserId = null;
  }

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      axios
        .get("http://localhost:3000/users/list", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          const userList: IAuthUserList[] = response?.data?.users || [];
          // Exclude all admin users from the Home list
          const filtered = userList.filter((u) => u.role !== "admin");
          setUsers(filtered);
        })
        .catch((error) => {
          console.log("error => ", error);
          const errors = error?.response?.data?.message || "An error occurred";
          alert(errors);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    async function fetchCurrentUserProfile() {
      if (!currentUserId) {
        setIsProfileLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:3000/users/profile/me",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setCurrentUserProfile(response.data.user);
      } catch (error) {
        console.error("Error fetching current user profile:", error);
      } finally {
        setIsProfileLoading(false);
      }
    }

    fetchData();
    fetchCurrentUserProfile();
  }, [accessToken, currentUserId]);

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="auth-home-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="auth-home-container">
      {/* Current User Profile Section */}
      {!isProfileLoading && currentUserProfile && (
        <div className="current-user-profile">
          <div className="profile-header">
            <h2 className="profile-title">
              Welcome, {currentUserProfile.name}!
            </h2>
            <p className="profile-subtitle">Your Profile Overview</p>
          </div>

          <div className="profile-card">
            <div className="profile-info">
              <div className="profile-picture-container">
                {currentUserProfile.profilePicture ? (
                  <img
                    src={`http://localhost:3000/uploads/profile-pictures/${currentUserProfile.profilePicture}`}
                    alt="Profile"
                    className="profile-picture"
                  />
                ) : (
                  <div className="profile-picture-placeholder">
                    {currentUserProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="profile-details">
                <h3 className="user-name">{currentUserProfile.name}</h3>
                <p className="user-email">{currentUserProfile.email}</p>
                <p className={`user-role ${currentUserProfile.role}`}>
                  {currentUserProfile.role}
                </p>

                {currentUserProfile.bio && (
                  <div className="user-bio">
                    <h4>About Me</h4>
                    <p>{currentUserProfile.bio}</p>
                  </div>
                )}

                {currentUserProfile.skills &&
                  currentUserProfile.skills.length > 0 && (
                    <div className="user-skills">
                      <h4>Skills</h4>
                      <div className="skills-list">
                        {currentUserProfile.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {skill.name}{" "}
                            <span className="skill-level">({skill.level})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="social-links">
                  {currentUserProfile.github && (
                    <a
                      href={currentUserProfile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      GitHub
                    </a>
                  )}
                  {currentUserProfile.linkedin && (
                    <a
                      href={currentUserProfile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      LinkedIn
                    </a>
                  )}
                  {currentUserProfile.portfolioUrl && (
                    <a
                      href={currentUserProfile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      Portfolio
                    </a>
                  )}
                </div>

                <div className="profile-actions">
                  {(currentUserProfile.role === "professional" || currentUserProfile.role === "admin") && (
                    <button
                      className="edit-profile-btn"
                      onClick={() => navigate("/profile")}
                    >
                      View Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="auth-home-header">
        <h1 className="auth-home-title">List of Professionals</h1>
        <p className="auth-home-subtitle">
          {users.length} professional{users.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="users-grid">
        {users.map((user, index) => (
          <div key={user._id} className="user-card">
            <div className="user-avatar">
              {user.profilePicture ? (
                <img
                  src={`http://localhost:3000/uploads/profile-pictures/${user.profilePicture}`}
                  alt={user.name}
                  className="profile-picture"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = document.createElement("div");
                    fallback.className = "avatar-fallback";
                    fallback.textContent = user.name.charAt(0).toUpperCase();
                    target.parentNode?.appendChild(fallback);
                  }}
                />
              ) : (
                <div className="avatar-fallback">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="user-info">
              <h3 className="user-name">{user.name}</h3>
              <p className="user-email">{user.email}</p>
              <span className={`user-role ${user.role}`}>{user.role}</span>
            </div>

            <div className="user-actions">
              <button
                className="view-profile-btn"
                onClick={() => handleViewProfile(user._id)}
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="no-users">
          <h3>No users found</h3>
          <p>There are no users in the system yet.</p>
        </div>
      )}
    </div>
  );
}

export default AuthHomePage;
