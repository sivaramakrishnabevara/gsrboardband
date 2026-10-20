import {
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

import { useState } from "react";

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page">

      <section className="page-banner">
        <div>
          <span>CONTACT US</span>
          <h1>Get In Touch</h1>
          <p>
            We are here to help you.
          </p>
        </div>
      </section>

      <section className="section">

        <div className="contact-grid">

          <div className="contact-info">

            <span className="section-label">
              CONTACT DETAILS
            </span>

            <h2>
              Let's Talk
            </h2>

            <p>
              Have questions about our plans or
              services? Contact our team.
            </p>

            <div className="contact-detail">
              <MapPin size={25} />
              <div>
                <h4>Address</h4>
                <p>
                  22C-11-21, CHUNDURI VARI CHOULTRY,
                  <br />
                  POWERPET, ELURU, West Godavari,
                  <br />
                  Andhra Pradesh, 534002
                </p>
              </div>
            </div>

            <div className="contact-detail">
              <Phone size={25} />
              <div>
                <h4>Phone</h4>
                <p>+91 9133397709 / 08812-234567</p>
              </div>
            </div>

            <div className="contact-detail">
              <Mail size={25} />
              <div>
                <h4>Email</h4>
                <p>manikantacablenet123@gmail.com</p>
              </div>
            </div>

            <div className="contact-detail">
              <Clock size={25} />
              <div>
                <h4>Service Hours</h4>
                <p>
                  Monday - Saturday
                  <br />
                  9:00 AM - 8:00 PM
                </p>
              </div>
            </div>

          </div>

          <div className="contact-form-card">

            {submitted ? (
              <div className="success-message">
                <h2>Thank You!</h2>

                <p>
                  Your message has been submitted
                  successfully.
                </p>

                <button
                  onClick={() => setSubmitted(false)}
                  className="primary-button"
                >
                  SEND ANOTHER MESSAGE
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>

                <div className="form-row">

                  <div className="form-group">
                    <label>Name</label>

                    <input
                      type="text"
                      placeholder="Your Name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone</label>

                    <input
                      type="tel"
                      placeholder="Your Phone"
                      required
                    />
                  </div>

                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    placeholder="Your Email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message</label>

                  <textarea
                    rows="6"
                    placeholder="Write your message..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="primary-button"
                >
                  SEND MESSAGE
                </button>

              </form>
            )}

          </div>

        </div>

      </section>

    </div>
  );
}

export default Contact;