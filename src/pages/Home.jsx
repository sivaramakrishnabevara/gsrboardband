import {
  ArrowRight,
  CheckCircle,
  Wifi,
  Tv,
  Smartphone,
  Headphones,
} from "lucide-react";

import { Link } from "react-router-dom";

// Main images
import heroImage from "../assets/hero.png";
import aboutImage from "../assets/about.jpg";

// Service images
import broadbandImage from "../assets/broadband.png";
import tvImage from "../assets/tv.png";
import ottImage from "../assets/ott-entertainment.png";
import communicationImage from "../assets/communication.png";

function Home() {
  return (
    <div className="page">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className="hero-section">

        <img
          src={heroImage}
          alt="GSR Broadband"
          className="hero-image"
        />

        <div className="hero-overlay"></div>

        <div className="hero-content">

          <span className="hero-small">
            CONNECT. STREAM. ENJOY.
          </span>

          <h1>
            Fast Internet.
            <br />
            Better Life.
          </h1>

          <p>
            Experience high-speed broadband connectivity
            designed for homes, businesses and entertainment.
          </p>

          <div className="hero-buttons">

            <Link
              to="/book-connection"
              className="primary-button"
            >
              BOOK YOUR CONNECTION
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/services"
              className="secondary-button"
            >
              VIEW PLANS
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURES SECTION
      ===================================================== */}
      <section className="features-section">

        <div className="feature-box">

          <Wifi size={35} />

          <div>
            <h3>High Speed</h3>

            <p>
              Fast and reliable internet.
            </p>
          </div>

        </div>


        <div className="feature-box">

          <Tv size={35} />

          <div>
            <h3>Entertainment</h3>

            <p>
              TV and OTT entertainment.
            </p>
          </div>

        </div>


        <div className="feature-box">

          <Smartphone size={35} />

          <div>
            <h3>Always Connected</h3>

            <p>
              Stay connected everywhere.
            </p>
          </div>

        </div>


        <div className="feature-box">

          <Headphones size={35} />

          <div>
            <h3>Support</h3>

            <p>
              Friendly customer support.
            </p>
          </div>

        </div>

      </section>


      {/* =====================================================
          SERVICES SECTION
      ===================================================== */}
      <section className="section">

        <div className="section-heading">

          <span>
            OUR SERVICES
          </span>

          <h2>
            Everything You Need
            <br />
            In One Connection
          </h2>

          <p>
            Choose from broadband, television, OTT
            and communication services.
          </p>

        </div>


        {/* SERVICE CARDS */}

        <div className="service-grid">


          {/* =================================================
              BROADBAND CARD
          ================================================= */}
          <div className="service-card">

            <div className="service-image">

              <img
                src={broadbandImage}
                alt="Broadband"
              />

            </div>

            <div className="service-content">

              <Wifi size={28} />

              <h3>
                Broadband
              </h3>

              <p>
                High-speed internet plans for everyday
                browsing, work and entertainment.
              </p>

              <Link to="/services">
                Explore Plans
                <ArrowRight size={16} />
              </Link>

            </div>

          </div>


          {/* =================================================
              DIGITAL TV CARD
          ================================================= */}
          <div className="service-card">

            <div className="service-image">

              <img
                src={tvImage}
                alt="Digital TV"
              />

            </div>

            <div className="service-content">

              <Tv size={28} />

              <h3>
                Digital TV
              </h3>

              <p>
                Enjoy entertainment with a wide range
                of television channels.
              </p>

              <Link to="/services">
                Explore Plans
                <ArrowRight size={16} />
              </Link>

            </div>

          </div>


          {/* =================================================
              OTT ENTERTAINMENT CARD
          ================================================= */}
          <div className="service-card">

            <div className="service-image">

              <img
                src={ottImage}
                alt="OTT Entertainment"
              />

            </div>

            <div className="service-content">

              <Smartphone size={28} />

              <h3>
                OTT Entertainment
              </h3>

              <p>
                Stream your favourite movies and
                entertainment content.
              </p>

              <Link to="/services">
                Explore Plans
                <ArrowRight size={16} />
              </Link>

            </div>

          </div>


          {/* =================================================
              COMMUNICATION CARD
          ================================================= */}
          <div className="service-card">

            <div className="service-image">

              <img
                src={communicationImage}
                alt="Communication"
              />

            </div>

            <div className="service-content">

              <Headphones size={28} />

              <h3>
                Communication
              </h3>

              <p>
                Reliable communication services for
                homes and businesses.
              </p>

              <Link to="/services">
                Explore Plans
                <ArrowRight size={16} />
              </Link>

            </div>

          </div>


        </div>

      </section>


      {/* =====================================================
          ABOUT SECTION
      ===================================================== */}
      <section className="about-home">

        <div className="about-image-box">

          <img
            src={aboutImage}
            alt="About GSR Broadband"
          />

        </div>


        <div className="about-home-content">

          <span>
            WHY GSR BROADBAND?
          </span>

          <h2>
            Connecting People
            <br />
            With Better Internet
          </h2>

          <p>
            GSR Broadband provides reliable and affordable
            connectivity solutions for customers.
          </p>

          <p>
            We provide broadband and entertainment
            solutions designed for modern homes and
            businesses.
          </p>


          {/* CHECK LIST */}

          <div className="check-list">

            <div>
              <CheckCircle size={20} />

              <span>
                Reliable connectivity
              </span>
            </div>

            <div>
              <CheckCircle size={20} />

              <span>
                Affordable plans
              </span>
            </div>

            <div>
              <CheckCircle size={20} />

              <span>
                Fast customer support
              </span>
            </div>

            <div>
              <CheckCircle size={20} />

              <span>
                Quality service
              </span>
            </div>

          </div>


          <Link
            to="/about"
            className="primary-button dark-button"
          >
            KNOW MORE
            <ArrowRight size={18} />
          </Link>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA SECTION
      ===================================================== */}
      <section className="green-cta">

        <div>

          <span>
            READY TO CONNECT?
          </span>

          <h2>
            Get Your Broadband
            <br />
            Connection Today
          </h2>

        </div>


        <Link
          to="/book-connection"
          className="white-button"
        >
          BOOK NOW
          <ArrowRight size={18} />
        </Link>

      </section>

    </div>
  );
}

export default Home;