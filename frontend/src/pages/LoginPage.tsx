import React from "react";
import LoginForm from "../components/LoginForm";
import PageTitle from "../components/PageTitle";
import "../styles/LoginPage.css";
import createAccountImage from "../assets/images/Create Account.jpg";

function LoginPage() {
  return (
    <div className="login-page-container">
      <PageTitle title="Login" />
      <div className="login-page-content">
        <div className="login-illustration">
          <img
            src={createAccountImage}
            alt="Login Illustration"
            className="login-illustration-img"
          />
        </div>
        <div className="login-form-section">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
