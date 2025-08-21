import React, { useState } from "react";
import "../styles/ContactPage.css";
import PhoneIcon from "../assets/images/telephone-call.png";
import LocationIcon from "../assets/images/location.png";
import EmailIcon from "../assets/images/email.png";
import axios from "axios";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/contact",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setSubmitStatus({
        success: true,
        message: response.data.message,
      });

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to submit form";

      setSubmitStatus({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact Nissan</h1>
        <p>Get in touch with our team for any inquiries</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <div className="contact-card">
            <h2>Contact Information</h2>
            <div className="contact-detail">
              <img src={PhoneIcon} alt="Phone" className="contact-icon" />
              <span>+977 982320990</span>
            </div>
            <div className="contact-detail">
              <img src={LocationIcon} alt="Location" className="contact-icon" />
              <span>Kamal Pokhari, Kathmandu, Nepal</span>
            </div>
            <div className="contact-detail">
              <img src={EmailIcon} alt="Email" className="contact-icon" />
              <span>info@nissan.com.np</span>
            </div>
          </div>

          <div className="contact-hours">
            <h3>Business Hours</h3>
            <div className="contact-detail">
              <div>
                <p>Sunday - Friday: 9:00 AM - 5:00 PM</p>
                <p>Saturday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form">
          <h2>Send us a Message</h2>

          {submitStatus && (
            <div
              className={`submit-message ${
                submitStatus.success ? "success" : "error"
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
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
              <label htmlFor="email">Email</label>
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
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
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
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>

      <div className="contact-map">
        <iframe
          title="Nissan Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.456783724847!2d85.31677531506203!3d27.70388298279393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19a0a79d9e4f%3A0x4a9b3b1e1c1b1b1b!2sKamal%20Pokhari%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1620000000000!5m2!1sen!2snp"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default ContactPage;
