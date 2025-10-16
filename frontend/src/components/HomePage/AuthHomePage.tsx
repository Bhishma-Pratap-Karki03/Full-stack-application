import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import "../../styles/AuthHomePage.css"; // Import the CSS file
import "../../styles/Profile.css"; // Reuse profile page styles for consistency
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import addUserIcon from "../../assets/images/add-user.png";
import messengerIcon from "../../assets/images/messenger.png";
import pendingIcon from "../../assets/images/Pending.png";
import xIcon from "../../assets/images/X Icon.png";
import acceptIcon from "../../assets/images/Accept.png";
import rejectIcon from "../../assets/images/Reject.png";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<IAuthUserList[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [connectionStatuses, setConnectionStatuses] = useState<{
    [key: string]: {
      connected: boolean;
      isPending: boolean;
      isSender: boolean;
      isReceiver: boolean;
    }
  }>({});
  interface IMutualConnection {
    _id: string;
    name: string;
    profilePicture?: string;
  }

  const [mutualConnections, setMutualConnections] = useState<Record<string, IMutualConnection[]>>({});
  const [sendingRequests, setSendingRequests] = useState<{[key: string]: boolean}>({});
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [connectionIds, setConnectionIds] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  let currentRole: string | null = null;
  let currentUserId: string | null = null;

  // Fetch mutual connections for a user
  const fetchMutualConnections = useCallback(async (userId: string) => {
    if (!accessToken) return;
    
    try {
      const response = await axios.get(
        `http://localhost:3000/api/connections/mutual/${userId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      setMutualConnections(prev => ({
        ...prev,
        [userId]: response.data.mutualConnections || []
      }));
    } catch (error) {
      console.error("Error fetching mutual connections:", error);
    }
  }, [accessToken]);

  // When user data is loaded, fetch mutual connections for each user
  useEffect(() => {
    if (users.length > 0 && accessToken && currentUserId) {
      users.forEach(user => {
        if (user.role === 'professional' && user._id !== currentUserId) {
          fetchMutualConnections(user._id);
        }
      });
    }
  }, [users, accessToken, currentUserId, fetchMutualConnections]);

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
          console.error("AuthHome load users error:", errors);
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
    if (userId === currentUserId) {
      navigate('/profile');
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  // Search functionality
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setShowSearchResults(false);
      setFilteredUsers([]);
      return;
    }

    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredUsers(filtered);
    setShowSearchResults(true);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    if (query.trim()) {
      const timeoutId = setTimeout(() => {
        handleSearch(query);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setShowSearchResults(false);
      setFilteredUsers([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredUsers([]);
    setShowSearchResults(false);
    // Keep focus on the input after clearing for better UX
    const el = document.querySelector<HTMLInputElement>(".search-input");
    el?.focus();
  };

  // Send connection request
  const sendConnectionRequest = async (userId: string, userName: string) => {
    if (sendingRequests[userId]) return;

    setSendingRequests(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await axios.post(
        "http://localhost:3000/api/connections/send",
        { 
          receiverId: userId, 
          message: `Hi ${userName}, I'd like to connect with you!`,
          senderId: currentUserId
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      // Update the connection status for this user
      setConnectionStatuses(prev => ({
        ...prev,
        [userId]: { 
          connected: false,
          isPending: true,
          isSender: true,
          isReceiver: false
        }
      }));

      // Store the connection ID if available
      if (response.data.connectionRequest?._id) {
        setConnectionIds(prev => ({
          ...prev,
          [userId]: response.data.connectionRequest._id
        }));
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      // Optionally show error to user
    } finally {
      setSendingRequests(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Handle accepting a connection request
  const handleAcceptRequest = async (userId: string) => {
    if (!connectionIds[userId]) return;
    
    try {
      const response = await axios.put(
        `http://localhost:3000/api/connections/accept/${connectionIds[userId]}`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      // Update the connection status to connected
      setConnectionStatuses(prev => ({
        ...prev,
        [userId]: { 
          connected: true,
          isPending: false,
          isSender: false,
          isReceiver: false
        }
      }));
      
      // Update the connection ID if a new connection was created
      if (response.data.connection?._id) {
        setConnectionIds(prev => ({
          ...prev,
          [userId]: response.data.connection._id
        }));
      }
    } catch (error) {
      console.error("Error accepting connection request:", error);
      // Optionally show error to user
    }
  };
  
  // Handle rejecting a connection request
  const handleRejectRequest = async (userId: string) => {
    if (!connectionIds[userId]) return;
    
    try {
      await axios.put(
        `http://localhost:3000/api/connections/reject/${connectionIds[userId]}`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      // Remove the connection status
      setConnectionStatuses(prev => {
        const newStatuses = { ...prev };
        delete newStatuses[userId];
        return newStatuses;
      });
      
      // Remove the connection ID
      setConnectionIds(prev => {
        const newIds = { ...prev };
        delete newIds[userId];
        return newIds;
      });
    } catch (error) {
      console.error("Error rejecting connection request:", error);
      // Optionally show error to user
    }
  };

  // Check connection status with a specific user
  const checkConnectionStatus = useCallback(async (userId: string) => {
    if (!currentUserId || currentUserId === userId) return;
    
    try {
      const response = await axios.get(
        `http://localhost:3000/api/connections/check/${userId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      const { connected, isPending, isSender, isReceiver, connection } = response.data;
      
      setConnectionStatuses(prev => ({
        ...prev,
        [userId]: { connected, isPending, isSender, isReceiver }
      }));
      
      if (connection?._id) {
        setConnectionIds(prev => ({
          ...prev,
          [userId]: connection._id
        }));
      }
    } catch (error) {
      console.error(`Error checking connection status with user ${userId}:`, error);
    }
  }, [accessToken, currentUserId]);

  // Load connection statuses for all users
  const loadConnectionStatuses = useCallback(async () => {
    if (currentRole !== "professional" || users.length === 0) return;

    try {
      // Check connection status for each user
      await Promise.all(
        users
          .filter(user => user._id !== currentUserId) // Don't check connection with self
          .map(user => checkConnectionStatus(user._id))
      );
    } catch (error) {
      console.error("Error loading connection statuses:", error);
    }
  }, [accessToken, currentRole, currentUserId, users, checkConnectionStatus]);

  // Load connection statuses when component mounts or users change
  useEffect(() => {
    loadConnectionStatuses();
  }, [loadConnectionStatuses]);

  // Update connection status when a user is clicked in search results
  const handleUserClick = (userId: string) => {
    if (currentRole === "professional" && userId !== currentUserId) {
      checkConnectionStatus(userId);
    }
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
              {/* Match Profile page: top-right controls inside card */}
              {(currentUserProfile.role === "professional" || currentUserProfile.role === "admin") && (
                <div className="edit-controls">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigate("/profile")}
                  >
                    View Profile
                  </button>
                </div>
              )}

              <div className="profile-info">
                <div className="profile-picture-row">
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
                    <div className="bio-content" style={{ whiteSpace: 'pre-line', color: '#495057' }}>
                      {currentUserProfile.bio}
                    </div>
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
                      className="social-link github"
                    >
                      GitHub Link
                    </a>
                  )}
                  {currentUserProfile.linkedin && (
                    <a
                      href={currentUserProfile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link linkedin"
                    >
                      LinkedIn Link
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

      {/* Search Section */}
      <div className="search-section">
        <div className="search-header">
          <h2 className="search-title">Search Professionals</h2>
          <p className="search-subtitle">Find professionals by name or email</p>
        </div>
        
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search professionals by name or email..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="search-input"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {isSearchFocused || searchQuery.trim().length > 0 ? (
              <button
                onClick={clearSearch}
                className="clear-search-btn"
                aria-label="Clear search"
                type="button"
                title="Clear"
              >
                <img src={xIcon} alt="Clear" style={{ width: 16, height: 16 }} />
              </button>
            ) : (
              <span className="search-icon" aria-hidden="true"></span>
            )}
          </div>
        </div>

        {/* Search Results */}
        {showSearchResults && (
          <div className="search-results">
            <div className="search-results-header">
              <h3>Search Results</h3>
              <p>{filteredUsers.length} professional{filteredUsers.length !== 1 ? "s" : ""} found</p>
            </div>
            
            {filteredUsers.length > 0 ? (
              <div className="users-grid">
                {filteredUsers.map((user) => (
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
                      
                      {/* Mutual connections */}
                      {mutualConnections[user._id]?.length > 0 && (
                        <div className="mutual-connections">
                          <span className="mutual-count">
                            {mutualConnections[user._id].length} mutual connection
                            {mutualConnections[user._id].length !== 1 ? 's' : ''}
                          </span>
                          <div className="mutual-avatars">
                            {mutualConnections[user._id].slice(0, 3).map((conn, idx) => (
                              <div key={conn._id} className="mutual-avatar" 
                                style={{ zIndex: 3 - idx, marginLeft: idx > 0 ? -8 : 0 }}>
                                {conn.profilePicture ? (
                                  <img 
                                    src={`http://localhost:3000/uploads/profile-pictures/${conn.profilePicture}`}
                                    alt={conn.name}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const fallback = document.createElement('div');
                                      fallback.className = 'mutual-avatar-fallback';
                                      fallback.textContent = conn.name.charAt(0).toUpperCase();
                                      target.parentNode?.appendChild(fallback);
                                    }}
                                  />
                                ) : (
                                  <div className="mutual-avatar-fallback">
                                    {conn.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            ))}
                            {mutualConnections[user._id].length > 3 && (
                              <div className="more-connections">
                                +{mutualConnections[user._id].length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Connection and messaging actions for professionals */}
                      {currentRole === "professional" && user.role === "professional" && user._id !== currentUserId && (
                        <div className="connection-actions">
                          {connectionStatuses[user._id]?.connected ? (
                            <Link
                              to={`/messages/${user._id}`}
                              className="message-btn-small"
                              title="Send Message"
                            >
                              <img src={messengerIcon} alt="Message" className="action-icon" />
                            </Link>
                          ) : connectionStatuses[user._id]?.isPending ? (
                            connectionStatuses[user._id]?.isSender ? (
                              <button 
                                className="request-sent-btn-small" 
                                disabled 
                                title="Request Pending"
                              >
                                <img src={pendingIcon} alt="Pending" className="action-icon" />
                              </button>
                            ) : (
                              <div className="connection-request-actions">
                                <button 
                                  className="accept-request-btn"
                                  onClick={() => handleAcceptRequest(user._id)}
                                  title="Accept Request"
                                >
                                  <img src={acceptIcon} alt="Accept" className="action-icon" />
                                </button>
                                <button 
                                  className="reject-request-btn"
                                  onClick={() => handleRejectRequest(user._id)}
                                  title="Reject Request"
                                >
                                  <img src={rejectIcon} alt="Reject" className="action-icon" />
                                </button>
                              </div>
                            )
                          ) : (
                            <button
                              className="connect-btn-small"
                              onClick={() => sendConnectionRequest(user._id, user.name)}
                              disabled={sendingRequests[user._id]}
                              title="Send Connection Request"
                            >
                              {sendingRequests[user._id] ? 
                                "..." : 
                                <img src={addUserIcon} alt="Connect" className="action-icon" />
                              }
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No professionals found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* All Professionals Section */}
      <div className="all-professionals-container">
        <h2 className="professionals-title">All Professionals</h2>
        <div className="users-grid">
          {users.map((user) => (
            <div 
              key={user._id} 
              className="user-card"
              onClick={() => handleUserClick(user._id)}
            >
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProfile(user._id);
                  }}
                >
                  View Profile
                </button>
                
                {currentRole === "professional" && user.role === "professional" && user._id !== currentUserId && (
                  <div className="connection-actions" onClick={(e) => e.stopPropagation()}>
                    {connectionStatuses[user._id]?.connected ? (
                      <Link
                        to={`/messages/${user._id}`}
                        className="message-btn-small"
                        title="Send Message"
                      >
                        <img src={messengerIcon} alt="Message" className="action-icon" />
                      </Link>
                    ) : connectionStatuses[user._id]?.isPending ? (
                      connectionStatuses[user._id]?.isSender ? (
                        <button 
                          className="request-sent-btn-small" 
                          disabled 
                          title="Request Pending"
                        >
                          <img src={pendingIcon} alt="Pending" className="action-icon" />
                        </button>
                      ) : (
                        <div className="connection-request-actions">
                          <button 
                            className="accept-request-btn"
                            onClick={() => handleAcceptRequest(user._id)}
                            title="Accept Request"
                          >
                            <img src={acceptIcon} alt="Accept" className="action-icon" />
                          </button>
                          <button 
                            className="reject-request-btn"
                            onClick={() => handleRejectRequest(user._id)}
                            title="Reject Request"
                          >
                            <img src={rejectIcon} alt="Reject" className="action-icon" />
                          </button>
                        </div>
                      )
                    ) : (
                      <button
                        className="connect-btn-small"
                        onClick={() => sendConnectionRequest(user._id, user.name)}
                        disabled={sendingRequests[user._id]}
                        title="Send Connection Request"
                      >
                        {sendingRequests[user._id] ? 
                          "..." : 
                          <img src={addUserIcon} alt="Connect" className="action-icon" />
                        }
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
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
