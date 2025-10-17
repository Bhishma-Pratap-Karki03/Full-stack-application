import { useNavigate } from "react-router-dom";
import "../../styles/UnAuthHomePage.css";

// images
import logo from "../../assets/images/SkillSync Logo Design.png";
import hero1 from "../../assets/images/hero1.jpg";
import hero2 from "../../assets/images/hero2.jpg";
import hero3 from "../../assets/images/hero3.jpg";
import quizImg from "../../assets/images/Quiz.webp";
import analyticsImg from "../../assets/images/Tracking.jpg";
import communityImg from "../../assets/images/Community.png";
import user1 from "../../assets/images/Professional 1.jpg";
import user2 from "../../assets/images/Diya.jpg";

function UnAuthHomePage() {
  const navigate = useNavigate();

  return (
    <div className="unauth-home">
      {/* HERO SECTION */}
      <section className="hero colorful-hero">
        <div className="hero-text">
          <img src={logo} alt="SkillSync Logo" className="hero-logo" />
          <h1>
            Upskill with <span className="accent-text">Confidence</span>
          </h1>
          <p>
            Build and validate your professional skills with expert-crafted
            quizzes, smart insights, and a thriving learning community.
          </p>
          <div className="hero-actions">
            <button
              className="btn primary"
              onClick={() => navigate("/register")}
            >
              Get Started Free
            </button>
            <button
              className="btn secondary"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          </div>
        </div>

        <div className="hero-gallery">
          <img src={hero1} alt="Professional team" className="hero-main" />
          <img
            src={hero2}
            alt="Team collaboration"
            className="hero-side left"
          />
          <img src={hero3} alt="Learning success" className="hero-side right" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <h2 className="features-heading">
          Everything You Need to Learn Smarter
        </h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-left">
              <img
                src={quizImg}
                alt="Curated Quizzes"
                className="feature-img"
              />
              <h3>Curated Quizzes</h3>
            </div>
            <div className="feature-right">
              <p>
                Expert-crafted challenges designed to sharpen your practical
                knowledge, strengthen decision-making skills, and make learning
                more engaging.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-left">
              <img
                src={analyticsImg}
                alt="Smart Analytics"
                className="feature-img"
              />
              <h3>Smart Analytics</h3>
            </div>
            <div className="feature-right">
              <p>
                Gain insights through powerful analytics that track your
                learning progress, highlight areas for improvement, and help you
                stay focused on goals.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-left">
              <img
                src={communityImg}
                alt="Professional Network"
                className="feature-img"
              />
              <h3>Professional Network</h3>
            </div>
            <div className="feature-right">
              <p>
                Connect with experts, mentors, and peers from around the world.
                Build meaningful relationships and grow your network through a
                thriving learning community.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-left">
              <img
                src={hero3}
                alt="Continuous Growth"
                className="feature-img"
              />
              <h3>Continuous Growth</h3>
            </div>
            <div className="feature-right">
              <p>
                Stay ahead with continuous learning resources, personalized
                recommendations, and new challenges that keep your skills sharp
                and relevant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <h2>What Professionals Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial">
            <img src={user1} alt="User 1" className="testimonial-img" />
            <p>
              “SkillSync gave me the structure I needed to grow my technical
              skills efficiently.”
            </p>
            <span>- Aarav, Software Engineer</span>
          </div>
          <div className="testimonial">
            <img src={user2} alt="User 2" className="testimonial-img" />
            <p>
              “The platform feels modern, intuitive, and motivating. The
              analytics really help me stay on track.”
            </p>
            <span>- Diya, Data Analyst</span>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <h2>Start Building Skills That Matter</h2>
        <p>Join professionals leveling up every day with SkillSync.</p>
        <button className="btn primary" onClick={() => navigate("/register")}>
          Get Started Free
        </button>
      </section>
    </div>
  );
}

export default UnAuthHomePage;
