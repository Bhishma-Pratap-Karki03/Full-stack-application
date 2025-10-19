import { useContext, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import "../styles/Navbar.css";
import skillSyncLogo from "../assets/images/SkillSync Logo Design.png";
import axios from "axios";
import menuIcon from "../assets/images/Menu.png";
import requestIcon from "../assets/images/Request.png";
import messageFriendIcon from "../assets/images/MessageFriend.png";
const API_BASE_URL = import.meta.env.VITE_API_URL;

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNetworkingDrawerOpen, setIsNetworkingDrawerOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const { isAuth, roleState, setAuthState } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuth && roleState === "professional") {
      fetchNotificationCounts();
      // Set up polling for real-time updates
      const interval = setInterval(fetchNotificationCounts, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuth, roleState]);

  const fetchNotificationCounts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const [pendingResponse, unreadResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/connections/pending`, { headers }),
        axios.get(`${API_BASE_URL}/api/messages/unread-count`, {
          headers,
        }),
      ]);

      setPendingRequestsCount(pendingResponse.data.requests.length);
      setUnreadMessagesCount(unreadResponse.data.unreadCount);
    } catch (error) {
      console.error("Error fetching notification counts:", error);
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem("accessToken");
    setAuthState((prev) => ({
      ...prev,
      isAuth: false,
      roleState: "guest",
    }));
    setIsMenuOpen(false);
    // Navigate to home page to show UnAuthHomePage
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleNetworkingDrawer = () => {
    setIsNetworkingDrawerOpen(!isNetworkingDrawerOpen);
  };

  const closeDrawer = () => {
    setIsNetworkingDrawerOpen(false);
  };

  const getTotalNotifications = () => {
    return pendingRequestsCount + unreadMessagesCount;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink
          to="/"
          className="nav-logo"
          onClick={() => setIsMenuOpen(false)}
        >
          <img
            src={skillSyncLogo}
            alt="SkillSync Logo"
            className="nav-logo-img"
          />
        </NavLink>

        <button className="nav-toggle" onClick={toggleMenu}>
          ☰
        </button>

        <ul className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <li className="nav-item">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
          </li>

          {/* Show About Us only when not logged in */}
          {!isAuth && (
            <li className="nav-item">
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </NavLink>
            </li>
          )}

          {/* Show Contact Us only when not logged in */}
          {!isAuth && (
            <li className="nav-item">
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Contact Us
              </NavLink>
            </li>
          )}

          {isAuth ? (
            <>
              <li className="nav-item">
                <NavLink
                  to="/profile"
                  end
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/questionset/List"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Question Sets
                </NavLink>
              </li>

              {/* Professional-specific navigation - Network Menu Icon */}
              {roleState === "professional" && (
                <li className="nav-item">
                  <button
                    className="nav-link network-menu-btn"
                    onClick={toggleNetworkingDrawer}
                    title="Network Menu"
                  >
                    <span className="network-icon-wrap">
                      <img src={menuIcon} alt="Network Menu" className="network-icon-img" />
                      {getTotalNotifications() > 0 && (
                        <span className="notification-badge">
                          {getTotalNotifications()}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              )}

              {/* Admin-specific navigation */}
              {roleState === "admin" && (
                <>
                  <li className="nav-item">
                    <NavLink
                      to="/admin/contacts"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Manage Contacts
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      to="/admin/question/set/create"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Create Quiz
                    </NavLink>
                  </li>
                </>
              )}

              <li className="nav-item">
                <button className="nav-button" onClick={logoutHandler}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Networking Side Drawer */}
      {roleState === "professional" && (
        <>
          {/* Overlay */}
          {isNetworkingDrawerOpen && (
            <div className="drawer-overlay" onClick={closeDrawer} />
          )}

          {/* Side Drawer */}
          <div
            className={`networking-drawer ${
              isNetworkingDrawerOpen ? "open" : ""
            }`}
          >
            <div className="drawer-header">
              <h3>Network Menu</h3>
              <button className="drawer-close-btn" onClick={closeDrawer}>
                ✕
              </button>
            </div>

            <div className="drawer-content">
              <NavLink
                to="/connections"
                className="drawer-item"
                onClick={closeDrawer}
              >
                <span className="drawer-icon">👥</span>
                <div className="drawer-item-content">
                  <span className="drawer-item-title">Connections</span>
                  <span className="drawer-item-desc">
                    View your professional network
                  </span>
                </div>
              </NavLink>

              <NavLink
                to="/connection-requests"
                className="drawer-item"
                onClick={closeDrawer}
              >
                <img src={requestIcon} alt="Friend Requests" className="drawer-icon-img" />
                <div className="drawer-item-content">
                  <span className="drawer-item-title">Friend Requests</span>
                  <span className="drawer-item-desc">
                    Manage connection requests
                  </span>
                  {pendingRequestsCount > 0 && (
                    <span className="notification-badge">
                      {pendingRequestsCount}
                    </span>
                  )}
                </div>
              </NavLink>

              <NavLink
                to="/messages"
                className="drawer-item"
                onClick={closeDrawer}
              >
                <img src={messageFriendIcon} alt="Messages" className="drawer-icon-img" />
                <div className="drawer-item-content">
                  <span className="drawer-item-title">Messages</span>
                  <span className="drawer-item-desc">
                    Chat with your connections
                  </span>
                  {unreadMessagesCount > 0 && (
                    <span className="notification-badge">
                      {unreadMessagesCount}
                    </span>
                  )}
                </div>
              </NavLink>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;
