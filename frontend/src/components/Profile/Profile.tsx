import { useState, useEffect, useContext } from "react";
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

interface ISkill {
  name: string;
  level: string;
}

function Profile() {
  const [userData, setUserData] = useState<IUserProfile | null>(null);
  const [quizResults, setQuizResults] = useState<IQuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuth, roleState } = useContext(AuthContext);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [linkedinInput, setLinkedinInput] = useState("");
  const [skillsInput, setSkillsInput] = useState<ISkill[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Beginner");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuth) return;

    const accessToken = localStorage.getItem("accessToken");

    axios
      .get("http://localhost:3000/users/profile/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        setUserData(response.data.user);

        if (roleState !== "admin") {
          return axios.get("http://localhost:3000/api/quiz/results", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }
        return null;
      })
      .then((response) => {
        if (response) {
          setQuizResults(response.data.results || []);
        }
      })
      .catch((error) => {
        console.error("Error fetching profile data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuth, roleState]);

  const startEditing = () => {
    if (roleState !== "admin") {
      setBioInput(userData?.bio || "");
      setGithubInput(userData?.github || "");
      setLinkedinInput(userData?.linkedin || "");
      setSkillsInput(userData?.skills || []);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setNewSkillName("");
    setNewSkillLevel("Beginner");
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const addSkill = () => {
    if (newSkillName.trim() && newSkillLevel) {
      const skillExists = skillsInput.some(
        (skill) =>
          skill.name.toLowerCase() === newSkillName.trim().toLowerCase()
      );

      if (skillExists) {
        alert("This skill already exists in your profile.");
        return;
      }

      setSkillsInput([
        ...skillsInput,
        {
          name: newSkillName.trim(),
          level: newSkillLevel,
        },
      ]);
      setNewSkillName("");
      setNewSkillLevel("Beginner");
    }
  };

  const removeSkill = (index: number) => {
    setSkillsInput(skillsInput.filter((_, i) => i !== index));
  };

  const updateSkillLevel = (index: number, level: string) => {
    const updatedSkills = [...skillsInput];
    updatedSkills[index].level = level;
    setSkillsInput(updatedSkills);
  };

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      const accessToken = localStorage.getItem("accessToken");

      const formData = new FormData();
      
      // For admin users, only allow profile picture updates
      if (roleState === "admin") {
        if (selectedFile) {
          formData.append("profilePicture", selectedFile);
        }
      } else {
        // For non-admin users, allow all profile updates
        formData.append("bio", bioInput);
        formData.append("github", githubInput);
        formData.append("linkedin", linkedinInput);
        formData.append("skills", JSON.stringify(skillsInput));
        
        if (selectedFile) {
          formData.append("profilePicture", selectedFile);
        }
      }

      const response = await axios.put(
        "http://localhost:3000/users/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const { profile } = response.data;
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              bio: roleState === "admin" ? prev.bio : profile.bio,
              skills: roleState === "admin" ? prev.skills : profile.skills,
              github: roleState === "admin" ? prev.github : profile.github,
              linkedin: roleState === "admin" ? prev.linkedin : profile.linkedin,
              profilePicture: profile.profilePicture || prev.profilePicture,
            }
          : prev
      );
      setIsEditing(false);
      setNewSkillName("");
      setNewSkillLevel("Beginner");
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuth) {
    return (
      <div className="profile-container">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`profile-container ${
        roleState === "admin" ? "admin-profile" : ""
      }`}
    >
      <div className="profile-header">
        <h1 className="profile-title">Your Profile</h1>
        <p className="profile-subtitle">
          Manage your account and track your progress
        </p>
      </div>

      <div
        className={`profile-content ${
          roleState === "admin" ? "admin-content" : ""
        }`}
      >
        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-picture-container">
              {userData?.profilePicture ? (
                <img
                  src={`http://localhost:3000/uploads/profile-pictures/${userData.profilePicture}`}
                  alt="Profile"
                  className="profile-picture"
                />
              ) : (
                <div className="profile-picture-placeholder">
                  {userData?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>

            <div className="profile-details">
              <h2 className="user-name">{userData?.name}</h2>
              <p className="user-email">{userData?.email}</p>
              <p className={`user-role ${userData?.role}`}>{userData?.role}</p>

              {userData?.bio && (
                <div className="user-bio">
                  <h3>About Me</h3>
                  <p>{userData.bio}</p>
                </div>
              )}

              {userData?.skills && userData.skills.length > 0 && (
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
                {userData?.github && (
                  <a
                    href={userData.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    GitHub
                  </a>
                )}
                {userData?.linkedin && (
                  <a
                    href={userData.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    LinkedIn
                  </a>
                )}
                {userData?.portfolioUrl && (
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

              <div className="edit-controls">
                {!isEditing ? (
                  <button className="btn-primary" onClick={startEditing}>
                    Edit Profile
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="edit-profile-card">
            <h2>{roleState === "admin" ? "Edit Profile Picture" : "Edit Profile"}</h2>
            <div className="profile-form">
              {/* Profile Picture Upload Section */}
              <div className="form-group">
                <label className="form-label">Profile Picture</label>
                <div className="profile-picture-upload">
                  <div className="current-picture">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="profile-picture-preview" />
                    ) : userData?.profilePicture ? (
                      <img
                        src={`http://localhost:3000/uploads/profile-pictures/${userData.profilePicture}`}
                        alt="Current Profile"
                        className="profile-picture-preview"
                      />
                    ) : (
                      <div className="profile-picture-placeholder-large">
                        {userData?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <div className="upload-controls">
                    <input
                      type="file"
                      id="profilePictureInput"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="profilePictureInput" className="btn-upload">
                      Choose New Picture
                    </label>
                    {(selectedFile || previewUrl) && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={removeSelectedFile}
                      >
                        Remove Selected
                      </button>
                    )}
                  </div>
                  <p className="upload-hint">
                    Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                </div>
              </div>

              {/* Only show additional fields for non-admin users */}
              {roleState !== "admin" && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="bio">
                      Bio (optional)
                    </label>
                    <textarea
                      id="bio"
                      className="form-textarea"
                      placeholder="Write something about yourself..."
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Skills Section */}
                  <div className="form-group">
                    <label className="form-label">Skills</label>
                    <div className="skills-editor">
                      <div className="add-skill-section">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter skill name (e.g., React, MongoDB, Java)"
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSkill();
                            }
                          }}
                        />
                        <select
                          className="form-select"
                          value={newSkillLevel}
                          onChange={(e) => setNewSkillLevel(e.target.value)}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                        <button
                          type="button"
                          className="btn-add-skill"
                          onClick={addSkill}
                        >
                          Add Skill
                        </button>
                      </div>

                      {skillsInput.length > 0 && (
                        <div className="current-skills">
                          <h4>Current Skills</h4>
                          <div className="skills-list-edit">
                            {skillsInput.map((skill, index) => (
                              <div key={index} className="skill-item-edit">
                                <span className="skill-name">{skill.name}</span>
                                <select
                                  className="skill-level-select"
                                  value={skill.level}
                                  onChange={(e) =>
                                    updateSkillLevel(index, e.target.value)
                                  }
                                >
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Advanced">Advanced</option>
                                </select>
                                <button
                                  type="button"
                                  className="btn-remove-skill"
                                  onClick={() => removeSkill(index)}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="github">
                      GitHub URL
                    </label>
                    <input
                      id="github"
                      type="url"
                      className="form-input"
                      placeholder="https://github.com/username"
                      value={githubInput}
                      onChange={(e) => setGithubInput(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="linkedin">
                      LinkedIn URL
                    </label>
                    <input
                      id="linkedin"
                      type="url"
                      className="form-input"
                      placeholder="https://www.linkedin.com/in/username"
                      value={linkedinInput}
                      onChange={(e) => setLinkedinInput(e.target.value)}
                    />
                  </div>
                </>
              )}
              
              <div className="form-actions">
                <button
                  className="btn-primary"
                  onClick={saveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button className="btn-secondary" onClick={cancelEditing}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {roleState !== "admin" && (
          <div className="quiz-results-card">
            <h2>Quiz Results</h2>

            {quizResults.length === 0 ? (
              <div className="no-results">
                <p>You haven't attempted any quizzes yet.</p>
                <a href="/questionset/list" className="take-quiz-button">
                  Take a Quiz
                </a>
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
                          <span className="score-number">{result.score}</span>{" "}
                          out of{" "}
                          <span className="total-number">{result.total}</span>{" "}
                          questions
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
