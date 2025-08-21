import axios from "axios";
import { useContext, useState } from "react";
import { AuthContext } from "../App";
import "../styles/LoginForm.css";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { isAuth, setAuthState } = useContext(AuthContext);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const finalData = {
      email,
      password,
    };

    axios
      .post("http://localhost:3000/users/login", finalData)
      .then((response) => {
        const token = response.data.accessToken;
        localStorage.setItem("accessToken", token);
        window.location.href = "/";
        alert("User logged in successfully!");
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
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Login Form</h1>
        <p className="login-subtitle">Login to Continue</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email:
            </label>
            <input
              type="email"
              name="search_email"
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
              name="search_password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              className="form-input"
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
export default LoginForm;
