import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/RegisterForm.css"; // Import the CSS styles
import skillSyncLogo from "./assets/images/SkillSync Logo Design.png";

function RegisterForm() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    if (profilePicture) {
      formData.append("profilePicture", profilePicture);
    }

    axios
      .post("http://localhost:3000/users/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        alert("User registered successfully!");
        // Reset form
        setName("");
        setEmail("");
        setPassword("");
        setProfilePicture(null);
        navigate("/login");
      })
      .catch((error) => {
        console.log("error => ", error);
        const errors = error?.response?.data?.message || "An error occurred";
        alert(errors);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-logo">
          <img
            src={skillSyncLogo}
            alt="SkillSync Logo"
            className="register-logo-img"
          />
        </div>
        <h1 className="register-title">Join Us Today</h1>
        <p className="register-subtitle">Create your account</p>

        <form
          onSubmit={handleSubmit}
          className="register-form"
          encType="multipart/form-data"
        >
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name:
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={name}
              onChange={handleNameChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email:
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password:
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              className="form-input"
              required
            />
          </div>

          {/* Profile Picture Field - Added this section */}
          <div className="form-group">
            <label htmlFor="profilePicture" className="form-label">
              Profile Picture:
            </label>
            <input
              type="file"
              name="profilePicture"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="form-input"
            />
            {profilePicture && (
              <p
                style={{ fontSize: "14px", color: "#4f46e5", marginTop: "5px" }}
              >
                Selected: {profilePicture.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="register-button"
          >
            {isLoading ? (
              <>
                <span className="button-loader"></span>
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
