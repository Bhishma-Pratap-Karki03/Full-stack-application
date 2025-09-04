import React, { useContext } from "react";
import { AuthContext } from "../../App";
import "./Footer.css";
import skillSyncLogo from "../../assets/images/SkillSync Logo Design.png";

const Footer = () => {
  const { roleState } = useContext(AuthContext);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">
            <img
              src={skillSyncLogo}
              alt="SkillSync Logo"
              className="footer-logo-img"
            />
          </div>
          <p>Connecting clients with top professionals in every field</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            {roleState !== "admin" && (
              <li>
                <a href="/about">About Us</a>
              </li>
            )}
            {roleState !== "admin" && (
              <li>
                <a href="/contact">Contact</a>
              </li>
            )}
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: contact@skillsync.com</p>
          <p>Phone: 456-7890</p>
        </div>

        {/* Admin-specific footer section */}
        {roleState === "admin" && (
          <div className="footer-section">
            <h4>Admin Links</h4>
            <ul>
              <li>
                <a href="/about">About Us</a>
              </li>
              <li>
                <a href="/admin/contacts">Manage Contacts</a>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} SkillSync. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
