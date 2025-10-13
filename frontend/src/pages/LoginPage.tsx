import LoginForm from "../components/LoginForm";
import PageTitle from "../components/PageTitle";
import "../styles/LoginPage.css";
import loginImage from "../assets/images/Login.jpg";

function LoginPage() {
  return (
    <div className="login-page-container">
      <PageTitle title="Login" />
      <div className="login-page-content">
        <div className="login-illustration">
          <img
            src={loginImage}
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
