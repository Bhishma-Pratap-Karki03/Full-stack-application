import React, { useState } from "react";
import PageTitle from "../components/PageTitle";
import "../styles/ContactPage.css";
import PhoneIcon from "../assets/images/telephone-call.png";
import LocationIcon from "../assets/images/location.png";
import EmailIcon from "../assets/images/email.png";
const API_BASE_URL = import.meta.env.VITE_API_URL;

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Special handling for phone number - only allow digits and limit to 10 characters
    if (name === "phone") {
      const phoneValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({
        ...formData,
        [name]: phoneValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const validateForm = () => {
    if (!formData.name.trim()) return false;
    if (!formData.email.trim()) return false;
    if (!formData.phone.trim()) return false;
    if (formData.phone.length !== 10) return false;
    if (!formData.message.trim()) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: "Message sent successfully! We'll get back to you soon.",
        });
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        const errorData = await response.json();
        setSubmitStatus({
          success: false,
          message: errorData.message || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageTitle title="Contact Us" />
      <div className="contact-container">
        <div className="contact-header">
          <h1>Contact SkillSync</h1>
          <p>Get in touch with our team for any inquiries</p>
        </div>

        <div className="contact-content">
          <div className="contact-info contact-left">
            <h2 className="contact-title">Contact Us</h2>
            <p className="contact-subtext">
              We will contact you as soon as you fill up the details or text us
              on <strong>+977-9823220990</strong> | <strong>skillsyncnep2025@gmail.com</strong>
            </p>

            <ul className="contact-list">
              <li className="contact-item">
                <span className="contact-item-icon">
                  <img src={PhoneIcon} alt="Phone" className="contact-icon" />
                </span>
                <span className="contact-item-text">+977- 9823220990</span>
              </li>
              <li className="contact-item">
                <span className="contact-item-icon">
                  <img src={EmailIcon} alt="Email" className="contact-icon" />
                </span>
                <span className="contact-item-text">skillsyncnep2025@gmail.com</span>
              </li>
              <li className="contact-item">
                <span className="contact-item-icon">
                  <img src={LocationIcon} alt="Location" className="contact-icon" />
                </span>
                <span className="contact-item-text">Kathmandu, Nepal</span>
              </li>
            </ul>
          </div>

          <div className="contact-form">
            <h2>Send us a Message</h2>

            {submitStatus && (
              <div className={`submit-message ${submitStatus.success ? "success" : "error"}`}>
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
                <small className="form-help">Enter exactly 10 digits (e.g., 9823209901)</small>
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject (optional)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Your message"
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>

        <div className="contact-map">
          <iframe
            title="SkillSync Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.456783724847!2d85.31677531506203!3d27.70388298279393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19a0a79d9e4f%3A0x4a9b3b1e1c1b1b1b!2sKamal%20Pokhari%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1620000000000!5m2!1sen!2snp"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </>
  );
}

export default ContactPage;
