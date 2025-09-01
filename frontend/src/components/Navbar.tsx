import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import "../styles/Navbar.css";
import skillSyncLogo from "../assets/images/SkillSync Logo Design.png";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuth, roleState, setAuthState } = useContext(AuthContext);
  const navigate = useNavigate();

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
    alert("User logged out successfully!");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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

          {/* Show About Us only for non-admin users */}
          {roleState !== "admin" && (
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

          {/* Show Contact Us only for non-admin users */}
          {roleState !== "admin" && (
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
    </nav>
  );
}

export default Navbar;
