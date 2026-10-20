import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react";

function BookConnection() {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  useEffect(() => {
    const planParam = searchParams.get("plan");
    if (planParam) {
      setSelectedPlan(planParam);
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="page">
        <section className="booking-success">
          <div className="success-icon">
            <CheckCircle size={44} />
          </div>

          <h1>Booking Request Submitted!</h1>

          <p>
            Thank you for choosing GSR Broadband.
            Our team will contact you shortly.
          </p>

          <button
            className="primary-button"
            onClick={() => setSubmitted(false)}
          >
            BOOK ANOTHER CONNECTION
          </button>

        </section>

      </div>
    );
  }

  return (
    <div className="page">

      <section className="page-banner">
        <div>
          <span>GET CONNECTED</span>
          <h1>Book Your Connection</h1>
          <p>
            Fill the form and our team will contact you.
          </p>
        </div>
      </section>

      <section className="section">

        <div className="booking-container">

          <div className="booking-info">

            <span className="section-label">
              QUICK & EASY
            </span>

            <h2>
              Get Connected
              <br />
              With GSR Broadband
            </h2>

            <p>
              Submit your details and preferred
              installation time.
            </p>

            <div className="booking-points">

              <div>
                <Calendar size={22} />
                <span>
                  Choose your preferred date
                </span>
              </div>

              <div>
                <Clock size={22} />
                <span>
                  Choose your preferred time
                </span>
              </div>

              <div>
                <Phone size={22} />
                <span>
                  Our team will contact you
                </span>
              </div>

            </div>

          </div>

          <div className="booking-form-card">

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label>
                  <User size={16} />
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Phone size={16} />
                  Phone Number
                </label>

                <input
                  type="tel"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Mail size={16} />
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <MapPin size={16} />
                  Address
                </label>

                <textarea
                  rows="4"
                  placeholder="Enter installation address"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>Select Plan</label>

                <select
                  required
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                >
                  <option value="">-- Choose a Fiber or TV Plan --</option>
                  <optgroup label="Fiber Broadband Plans">
                    <option value="silver-50">Silver Starter - 50 Mbps (₹499/mo)</option>
                    <option value="gold-100">Gold Streamer - 100 Mbps + 6 OTTs (₹699/mo) [Most Popular]</option>
                    <option value="diamond-200">Diamond Ultra - 200 Mbps + 12 OTTs (₹999/mo)</option>
                    <option value="platinum-300">Platinum Giga - 300 Mbps + 16 OTTs (₹1,499/mo)</option>
                  </optgroup>
                  <optgroup label="All-In-One Entertainment Bundles">
                    <option value="ultimate-899">Ultimate Pack - 100 Mbps + 250+ TV Channels + OTT (₹899/mo)</option>
                  </optgroup>
                  <optgroup label="Digital Cable TV Packs">
                    <option value="tv-basic">TV Starter Pack - 150+ Channels (₹199/mo)</option>
                    <option value="tv-gold">TV Gold HD Pack - 250+ Channels (₹299/mo)</option>
                    <option value="tv-platinum">TV Platinum Mega Pack - 350+ Channels (₹399/mo)</option>
                  </optgroup>
                </select>
              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>
                    <Calendar size={16} />
                    Preferred Date
                  </label>

                  <input
                    type="date"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Clock size={16} />
                    Preferred Time
                  </label>

                  <input
                    type="time"
                    required
                  />
                </div>

              </div>

              <button
                type="submit"
                className="primary-button full-button"
              >
                BOOK CONNECTION
              </button>

            </form>

          </div>

        </div>

      </section>

    </div>
  );
}

export default BookConnection;