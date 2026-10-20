import {
  CheckCircle,
  Users,
  Wifi,
  ShieldCheck,
  Headphones,
} from "lucide-react";

import aboutImage from "../assets/about.jpg";

function About() {
  return (
    <div className="page">

      <section className="page-banner">
        <div>
          <span>ABOUT US</span>
          <h1>About GSR Broadband</h1>
          <p>
            Reliable connectivity for a connected lifestyle.
          </p>
        </div>
      </section>

      <section className="about-page-section">

        <div className="about-image-box">
          <img
            src={aboutImage}
            alt="GSR Broadband"
          />
        </div>

        <div className="about-page-content">
          <span>WHO WE ARE</span>

          <h2>
            Your Trusted
            <br />
            Connectivity Partner
          </h2>

          <p>
            GSR Broadband is focused on providing fast,
            reliable and affordable internet connectivity
            to customers.
          </p>

          <p>
            We provide broadband and entertainment
            solutions designed for modern homes and
            businesses.
          </p>

          <div className="check-list">
            <div>
              <CheckCircle size={20} />
              <span>Fast internet connectivity</span>
            </div>

            <div>
              <CheckCircle size={20} />
              <span>Affordable packages</span>
            </div>

            <div>
              <CheckCircle size={20} />
              <span>Customer-focused service</span>
            </div>
          </div>
        </div>

      </section>

      <section className="section light-section">

        <div className="section-heading">
          <span>OUR VALUES</span>

          <h2>
            What We Focus On
          </h2>
        </div>

        <div className="value-grid">

          <div className="value-card">
            <Wifi size={35} />
            <h3>Reliable Network</h3>
            <p>
              Stable and dependable internet
              connectivity.
            </p>
          </div>

          <div className="value-card">
            <Users size={35} />
            <h3>Customer First</h3>
            <p>
              Customer satisfaction is at the
              centre of our service.
            </p>
          </div>

          <div className="value-card">
            <ShieldCheck size={35} />
            <h3>Secure Service</h3>
            <p>
              Safe and dependable connectivity
              solutions.
            </p>
          </div>

          <div className="value-card">
            <Headphones size={35} />
            <h3>Support</h3>
            <p>
              Dedicated assistance whenever
              customers need us.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}

export default About;