import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Zap,
} from "lucide-react";
import PolicyNav from "../components/PolicyNav";
import "./Terms.css";

export default function ShippingPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Shipping & Delivery Policy | GSR Broadband Eluru";
  }, []);

  return (
    <div className="terms-page">
      {/* HERO SECTION */}
      <section className="terms-hero">
        <div className="terms-hero-badge">
          <Sparkles size={14} />
          DOORSTEP SERVICE FULFILLMENT &amp; ACTIVATION
        </div>
        <h1>
          Shipping &amp; <span>Service Delivery</span>
        </h1>
        <p>
          Information on fiber activation timelines, doorstep technician installation,
          and instant digital delivery of <strong>GSR Broadband</strong> services.
        </p>
        <div className="terms-meta-info">
          <span>Entity: GSR Broadband</span>
          <span>•</span>
          <span>Shipping Charges: ₹0 (Zero Courier / Delivery Fees)</span>
          <span>•</span>
          <span>Operational Hub: Eluru, West Godavari</span>
        </div>
      </section>

      {/* POLICY CONTAINER */}
      <div className="terms-container">
        <PolicyNav activeKey="shipping" title="Shipping & Delivery" />

        <div className="terms-content-card">
          <div className="terms-section-block">
            <div className="policy-header-badge">
              <span className="badge-company">GSR BROADBAND</span>
              <span className="badge-tag">Service Fulfillment Standard</span>
            </div>

            <h2>Shipping &amp; Service Delivery Policy</h2>

            <div className="terms-notice-box delivery-intro-box">
              <Truck size={24} />
              <div>
                <strong>Service-Based Delivery Model:</strong>
                <p>
                  <strong>GSR Broadband</strong> provides high-speed telecommunications, optical fiber internet,
                  and digital cable television services. We do not dispatch retail parcels or merchandise via third-party
                  postal couriers. All installations and hardware deployments are performed directly at the subscriber&apos;s
                  doorstep by authorized field technicians. <strong>Zero shipping or postal courier charges apply.</strong>
                </p>
              </div>
            </div>

            {/* THREE DELIVERY TIERS */}
            <div className="policy-highlights-grid">
              <div className="policy-highlight-card">
                <Wrench size={20} className="highlight-icon" />
                <h4>New Installations</h4>
                <p>Doorstep fiber laying and router configuration executed within 2 to 3 business days.</p>
              </div>
              <div className="policy-highlight-card">
                <Zap size={20} className="highlight-icon" />
                <h4>Instant Plan Renewals</h4>
                <p>Prepaid online renewals are activated instantaneously or within 24 hours maximum.</p>
              </div>
              <div className="policy-highlight-card">
                <MapPin size={20} className="highlight-icon" />
                <h4>Local Field Fleet</h4>
                <p>Dedicated on-ground technical staff stationed in Eluru for prompt local dispatches.</p>
              </div>
            </div>

            <h3>1. New Connection Onboarding &amp; Installation</h3>
            <p>
              When a prospective customer books a new broadband or digital cable TV connection:
            </p>
            <ul className="policy-bullet-list">
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Feasibility Check &amp; Fiber Splicing:</strong> Our optical engineer conducts a line check
                  from the nearest fiber distribution hub (FDH) or optical node to your premises.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Installation Window:</strong> Standard residential and commercial setups are fulfilled within
                  <strong> 2 to 3 working days</strong> following application verification and payment confirmation.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Quality Speed Test:</strong> The technician executes a live throughput test on-site to verify
                  symmetrical download/upload speeds before handing over credentials.
                </span>
              </li>
            </ul>

            <h3>2. Equipment Delivery (ONT Routers &amp; Set-Top Boxes)</h3>
            <p>
              Necessary equipment (such as Optical Network Terminals / Gigabit Wi-Fi routers, patch cords, and digital
              set-top boxes) is carried directly by our technician at the scheduled appointment time. Subscribers are not
              required to purchase or receive hardware through external shipping companies.
            </p>

            <h3>3. Online Renewals &amp; Digital Fulfillment</h3>
            <p>
              For existing subscribers renewing their ongoing monthly or annual subscriptions online:
            </p>
            <ul className="policy-bullet-list">
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Immediate Restoration:</strong> Subscriptions renewed through our official payment links or
                  gateway are renewed automatically on our radius servers in real-time.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Maximum Window:</strong> Under any upstream synchronization delay, renewal activation takes
                  place strictly within <strong>24 hours</strong> of transaction authorization.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Digital Invoices &amp; Receipts:</strong> Official GST billing receipts and confirmation alerts
                  are delivered electronically to your registered mobile number via SMS and WhatsApp.
                </span>
              </li>
            </ul>

            <h3>4. Operational Coverage &amp; Service Zones</h3>
            <div className="policy-office-box">
              <MapPin size={26} color="#0284c7" />
              <div>
                <h4>Verified Service Areas:</h4>
                <p>
                  GSR Broadband operates extensive pure optical fiber networks across Eluru municipal limits and surrounding
                  villages in West Godavari district, Andhra Pradesh. Key active zones include:
                </p>
                <div className="policy-zones-chips">
                  <span>Powerpet</span>
                  <span>Chunduri Vari Choultry</span>
                  <span>R.R. Pet</span>
                  <span>Sanivarapupeta</span>
                  <span>Tangellamudi</span>
                  <span>Vangayagudem</span>
                  <span>Ashok Nagar</span>
                  <span>Eluru Town &amp; Rural Environs</span>
                </div>
                <div className="office-address-badge">
                  <strong>Central Network Operations Hub:</strong> 22C-11-21, CHUNDURI VARI CHOULTRY, POWERPET, ELURU,
                  West Godavari, Andhra Pradesh - 534002
                </div>
              </div>
            </div>

            {/* FIELD SUPPORT CONTACT CARD */}
            <div className="refund-support-card">
              <h4>Dispatch &amp; Installation Coordination Desk</h4>
              <p>
                To check line feasibility at your street or schedule an installation appointment, reach out to our team:
              </p>
              <div className="refund-contact-details">
                <div>
                  <strong>Dispatch Hotline:</strong>
                  <span>+91 9133397709 / 08812-234567</span>
                </div>
                <div>
                  <strong>Support Email:</strong>
                  <span>manikantacablenet123@gmail.com</span>
                </div>
                <div>
                  <strong>Field Hours:</strong>
                  <span>Mon - Sat: 9:00 AM - 8:00 PM | Sun: 10:00 AM - 5:00 PM</span>
                </div>
                <div>
                  <strong>Base Station:</strong>
                  <span>Powerpet Control Office, Eluru</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA BANNER */}
        <div className="terms-cta-banner">
          <div>
            <h3>Want High-Speed Fiber Installed at Your Doorstep?</h3>
            <p>
              Book an appointment today. Our team will verify connection feasibility and connect your home in 48 hours.
            </p>
          </div>
          <div className="terms-cta-buttons">
            <Link to="/book-connection" className="sp-btn-primary">
              Book Connection Today <ArrowRight size={16} />
            </Link>
            <Link to="/sla-policy" className="sp-btn-secondary">
              Network SLA Standards
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
