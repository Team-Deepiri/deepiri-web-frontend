import React from "react";
import "./Contact.css";

const Contact: React.FC = () => {
  return (
    <div className="contact-wrapper">
      <div className="contact-card">
        <h1 className="contact-title">Contact Us</h1>
        <p className="contact-subtext">
          Have a question, feedback, or issue? Send us a message and we’ll get back to you.
        </p>

        <form
          className="contact-form"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Your message has been sent!");
          }}
        >
          <div>
            <label>Name</label>
            <input type="text" placeholder="Your name" required />
          </div>

          <div>
            <label>Email</label>
            <input type="email" placeholder="you@example.com" required />
          </div>

          <div>
            <label>Topic</label>
            <select required>
              <option value="">Choose one...</option>
              <option value="support">Support</option>
              <option value="bug">Bug Report</option>
              <option value="feedback">Feedback</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label>Message</label>
            <textarea rows={5} placeholder="Write your message here..." required />
          </div>

          <button type="submit" className="contact-submit">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
