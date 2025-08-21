import "../styles/AboutUs.css";
import aboutProf1 from "../assets/images/About Professioanl 1.jpg";
import aboutProf2 from "../assets/images/About Professioanl 2.jpg";
import aboutProf3 from "../assets/images/About Professioanl 3.jpg";
import aboutProf4 from "../assets/images/About Professioanl 4.jpg";
import focusedIcon from "../assets/images/Focused.png";
import secureIcon from "../assets/images/secure-reliable.png";
import innovationIcon from "../assets/images/innovation-driven.png";
import ourMission1 from "../assets/images/Our Mission 1.jpg";
import ourMission2 from "../assets/images/Our Mission 2.jpg";
import ourMission3 from "../assets/images/Our Mission 3.jpg";
import ourMission4 from "../assets/images/Our Mission 4.jpg";
import verifiedProfessionals from "../assets/images/Verified Professional.png";
import smartSearch from "../assets/images/Smart Search.png";
import secureConnections from "../assets/images/Secure Connections.png";
import performanceTracking from "../assets/images/Performance Tracking.png";

function AboutUsPage() {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="hero-content">
          <h1 className="hero-title">About Search the Professionals</h1>
          <p className="hero-subtitle">
            Connecting clients with top professionals in every field through
            innovative technology and trusted relationships
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Professionals</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Happy Clients</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Satisfaction Rate</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="human-profile human-1">
            <img
              src={aboutProf1}
              alt="Professional Person 1"
              className="human-image"
            />
          </div>
          <div className="human-profile human-2">
            <img
              src={aboutProf2}
              alt="Professional Person 2"
              className="human-image"
            />
          </div>
          <div className="human-profile human-3">
            <img
              src={aboutProf3}
              alt="Professional Person 3"
              className="human-image"
            />
          </div>
          <div className="human-profile human-4">
            <img
              src={aboutProf4}
              alt="Professional Person 4"
              className="human-image"
            />
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2 className="section-title">Our Mission</h2>
              <p className="mission-description">
                At Search the Professionals, we're dedicated to revolutionizing
                how people find and connect with professional service providers.
                Our platform bridges the gap between clients seeking expertise
                and professionals looking to showcase their skills in a trusted
                environment.
              </p>
              <div className="mission-highlights">
                <div className="highlight-item">
                  <img
                    src={focusedIcon}
                    alt="Quality Focused"
                    className="highlight-icon-img"
                  />
                  <span>Quality-focused matching</span>
                </div>
                <div className="highlight-item">
                  <img
                    src={secureIcon}
                    alt="Secure & Reliable"
                    className="highlight-icon-img"
                  />
                  <span>Secure & reliable platform</span>
                </div>
                <div className="highlight-item">
                  <img
                    src={innovationIcon}
                    alt="Innovation Driven"
                    className="highlight-icon-img"
                  />
                  <span>Innovation-driven solutions</span>
                </div>
              </div>
            </div>
            <div className="mission-visual">
              <div className="mission-image-grid">
                <img
                  src={ourMission1}
                  alt="Professional 1"
                  className="mission-grid-image"
                />
                <img
                  src={ourMission2}
                  alt="Professional 2"
                  className="mission-grid-image"
                />
                <img
                  src={ourMission3}
                  alt="Professional 3"
                  className="mission-grid-image"
                />
                <img
                  src={ourMission4}
                  alt="Professional 4"
                  className="mission-grid-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-header">
            <h2 className="section-title">Why Choose Us</h2>
            <p className="features-subtitle">
              Discover what makes us the preferred choice for professional
              connections
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src={verifiedProfessionals}
                  alt="Verified Professionals"
                  className="feature-image"
                />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Verified Professionals</h3>
                <p className="feature-description">
                  All professionals on our platform undergo strict verification
                  to ensure quality and reliability. We verify credentials,
                  experience, and background checks.
                </p>
                <div className="feature-benefits">
                  <span className="benefit-tag">Background Checked</span>
                  <span className="benefit-tag">Credential Verified</span>
                </div>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src={smartSearch}
                  alt="Smart Search"
                  className="feature-image"
                />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Smart Search</h3>
                <p className="feature-description">
                  Our advanced search algorithms help you find the perfect match
                  for your specific needs. AI-powered recommendations and
                  filters.
                </p>
                <div className="feature-benefits">
                  <span className="benefit-tag">AI-Powered</span>
                  <span className="benefit-tag">Advanced Filters</span>
                </div>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src={secureConnections}
                  alt="Secure Connections"
                  className="feature-image"
                />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Secure Connections</h3>
                <p className="feature-description">
                  Built-in messaging and secure payment options for safe
                  transactions. End-to-end encryption and secure protocols.
                </p>
                <div className="feature-benefits">
                  <span className="benefit-tag">End-to-End Encrypted</span>
                  <span className="benefit-tag">Secure Payments</span>
                </div>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src={performanceTracking}
                  alt="Performance Tracking"
                  className="feature-image"
                />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">Performance Tracking</h3>
                <p className="feature-description">
                  Review system and performance metrics help you make informed
                  decisions. Real-time analytics and detailed insights.
                </p>
                <div className="feature-benefits">
                  <span className="benefit-tag">Real-time Analytics</span>
                  <span className="benefit-tag">Detailed Insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUsPage;
