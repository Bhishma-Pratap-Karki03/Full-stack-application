import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import "../styles/Navbar.css";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuth, setAuthState } = useContext(AuthContext);
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
          Nissan
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

          <li className="nav-item">
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </NavLink>
          </li>

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
