import RegisterForm from "../RegisterForm";
import PageTitle from "../components/PageTitle";
import "../styles/RegisterPage.css";
import registerImage from "../assets/images/Register.jpg";

function RegisterPage() {
  return (
    <div className="register-page-container">
      <PageTitle title="Register" />
      <div className="register-page-content">
        <div className="register-illustration">
          <img
            src={registerImage}
            alt="Register Illustration"
            className="register-illustration-img"
          />
          <div className="register-illustration-text">
            <h2>Join Our Community</h2>
            <p>Create your account and start your learning journey today</p>
          </div>
        </div>
        <div className="register-form-section">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;