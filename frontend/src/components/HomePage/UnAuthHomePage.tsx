import { useNavigate } from "react-router-dom";
import "../../styles/UnAuthHomePage.css";
import heroLearning from "../../assets/images/imageslider1.jpg";
import onlineQuiz from "../../assets/images/Online Quiz.jpg";
import quizImg from "../../assets/images/Quiz.webp";
import trackingImg from "../../assets/images/Tracking.jpg";
import communityImg from "../../assets/images/Community.png";
import createAccountImg from "../../assets/images/Create Account.jpg";
import professionalImg1 from "../../assets/images/Professional 1.jpg";
import professionalImg2 from "../../assets/images/Diya.jpg";
import heroimage from "../../assets/images/digital.png";
import skillSyncLogo from "../../assets/images/SkillSync Logo Design.png";

function UnAuthHomePage() {
  const navigate = useNavigate();

  return (
    <div className="unauth-home">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-logo">
              <img
                src={skillSyncLogo}
                alt="SkillSync Logo"
                className="hero-logo-img"
              />
            </div>
            <h1 className="hero-title">
              Master Your Skills with Professional Quizzes
            </h1>
            <p className="hero-subtitle">
              Join thousands of professionals who use our curated question sets
              to enhance their expertise, prepare for certifications, and stay
              ahead in their careers.
            </p>
            <div className="hero-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/register")}
              >
                Start Learning
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => navigate("/register")}
              >
                Browse Questions
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-value">15k+</span>
                <span className="stat-label">Questions</span>
              </div>
              <div className="stat">
                <div className="stat-value">2.5k+</div>
                <span className="stat-label">Professionals</span>
              </div>
              <div className="stat">
                <span className="stat-value">4.9/5</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="image-container">
              <img
                src={heroLearning}
                alt="Professional learning platform"
                className="hero-image"
              />
              <img
                src={heroimage}
                alt="Digital progress tracking"
                className="hero-overlay"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Professionals Choose Us</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src={quizImg}
                  alt="Expert-curated quizzes"
                  className="feature-image"
                />
              </div>
              <h3 className="feature-title">Expert-Curated Content</h3>
              <p className="feature-text">
                Industry professionals design our question sets to match
                real-world scenarios and current industry standards.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src={trackingImg}
                  alt="Advanced analytics"
                  className="feature-image"
                />
              </div>
              <h3 className="feature-title">Smart Analytics</h3>
              <p className="feature-text">
                Get detailed insights into your performance with comprehensive
                progress tracking and personalized recommendations.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src={communityImg}
                  alt="Professional community"
                  className="feature-image"
                />
              </div>
              <h3 className="feature-title">Professional Network</h3>
              <p className="feature-text">
                Connect with peers, share knowledge, and learn from experienced
                professionals in your field.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">Get Started in 3 Simple Steps</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-image">
                <img src={createAccountImg} alt="Create your account" />
              </div>
              <h4>Create Account</h4>
              <p>
                Sign up in seconds and select your areas of interest and
                expertise.
              </p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-image">
                <img src={onlineQuiz} alt="Take quizzes" />
              </div>
              <h4>Take Quizzes</h4>
              <p>
                Practice with our mobile-friendly quizzes designed for busy
                professionals.
              </p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-image">
                <img src={trackingImg} alt="Track your progress" />
              </div>
              <h4>Track Progress</h4>
              <p>
                Monitor your improvement with detailed analytics and performance
                insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">Trusted by Industry Leaders</h2>
          <div className="testimonials-grid">
            <div className="testimonial">
              <div className="testimonial-content">
                <img
                  src={professionalImg1}
                  alt="Software Engineer"
                  className="avatar"
                />
                <blockquote>
                  "This platform transformed my interview preparation. The
                  questions are spot-on and the analytics help me focus on my
                  weak areas."
                </blockquote>
                <span className="name">Aarav, Senior Software Engineer</span>
              </div>
            </div>
            <div className="testimonial">
              <div className="testimonial-content">
                <img
                  src={professionalImg2}
                  alt="Data Analyst"
                  className="avatar"
                />
                <blockquote>
                  "Perfect for continuous learning. I use it daily to keep my
                  skills sharp and stay updated with industry trends."
                </blockquote>
                <span className="name">Diya, Lead Data Analyst</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Elevate Your Skills?</h2>
            <p>
              Join thousands of professionals who are already learning smarter.
            </p>
            <div className="cta-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/register")}
              >
                Start Free Today
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default UnAuthHomePage;
