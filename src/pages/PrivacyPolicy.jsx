import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  CreditCard,
  EyeOff,
  Database,
  Send,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileKey,
  Shield,
} from "lucide-react";
import PolicyNav from "../components/PolicyNav";
import "./Terms.css";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Privacy Policy | GSR Broadband Eluru";
  }, []);

  return (
    <div className="terms-page">
      {/* HERO SECTION */}
      <section className="terms-hero">
        <div className="terms-hero-badge">
          <Sparkles size={14} />
          DATA PROTECTION &amp; PRIVACY COMPLIANCE
        </div>
        <h1>
          Privacy <span>Policy</span>
        </h1>
        <p>
          Learn how <strong>GSR Broadband</strong> collects, safeguards, and respects your personal
          information in accordance with Indian information technology laws.
        </p>
        <div className="terms-meta-info">
          <span>Entity: GSR Broadband</span>
          <span>•</span>
          <span>Compliance: Information Technology Act, 2000 &amp; SPDI Rules</span>
          <span>•</span>
          <span>Location: Eluru, Andhra Pradesh</span>
        </div>
      </section>

      {/* POLICY CONTAINER */}
      <div className="terms-container">
        <PolicyNav activeKey="privacy" title="Privacy Policy" />

        <div className="terms-content-card">
          <div className="terms-section-block">
            <div className="policy-header-badge">
              <span className="badge-company">GSR BROADBAND</span>
              <span className="badge-tag">Privacy &amp; Data Protection</span>
            </div>

            <h2>Privacy Policy &amp; Data Governance</h2>
            <p className="policy-lead-text">
              <strong>GSR Broadband</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is deeply committed to
              safeguarding the confidentiality and security of our subscribers&apos; personal information. This Privacy
              Policy outlines how we collect, process, manage, and protect your information when you subscribe to our optical
              fiber, digital cable TV, or use our digital platforms.
            </p>

            {/* PRIVACY PILLARS */}
            <div className="policy-highlights-grid">
              <div className="policy-highlight-card">
                <Lock size={20} className="highlight-icon" />
                <h4>Zero Data Selling</h4>
                <p>We never sell, rent, or trade your personal records to third-party telemarketers or advertisers.</p>
              </div>
              <div className="policy-highlight-card">
                <Shield size={20} className="highlight-icon" />
                <h4>Encrypted Storage</h4>
                <p>All subscriber records and connection parameters are preserved on secured, firewall-protected systems.</p>
              </div>
              <div className="policy-highlight-card">
                <CreditCard size={20} className="highlight-icon" />
                <h4>Safe Payment Processing</h4>
                <p>Zero card or banking detail storage; 100% tokenized transactions through verified payment gateways.</p>
              </div>
            </div>

            <h3>1. Information We Collect</h3>
            <p>
              To initiate, register, and maintain uninterrupted broadband and digital cable services, we collect only essential
              customer information:
            </p>
            <ul className="policy-bullet-list">
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Personal Identity:</strong> Full Name, verified mobile phone number, and email address.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Installation &amp; Location:</strong> Physical residential or business address in Eluru / West Godavari,
                  door number, street name, and GPS installation point for fiber terminal dispatch.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Technical &amp; Hardware Records:</strong> Optical Network Terminal (ONT) MAC address, router serial number,
                  assigned Set-Top Box (STB) identifier, and Customer ID.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Billing &amp; Payment History:</strong> Selected bandwidth tiers, renewal dates, transaction IDs,
                  and payment confirmation timestamps.
                </span>
              </li>
            </ul>

            <h3>2. Purpose &amp; How We Use Your Information</h3>
            <p>
              Your data is collected strictly for operational, regulatory, and communication needs:
            </p>
            <ul className="policy-bullet-list">
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>Provisioning, splicing, and activating optical fiber internet and digital television connections.</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>Generating official tax invoices and sending renewal reminders via automated SMS or official WhatsApp updates.</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>Processing online bill renewals securely via authorized payment gateways.</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>Dispatching field support engineers to resolve line faults, fiber breaks, or router configurations.</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>Complying with statutory reporting mandates mandated by the Department of Telecommunications (DoT) and TRAI.</span>
              </li>
            </ul>

            <h3>3. Payment Gateway Security &amp; Financial Information</h3>
            <div className="terms-notice-box payment-secure-box">
              <CreditCard size={24} />
              <p>
                All online payments on our website or payment links are routed directly through PCI-DSS certified,
                RBI-authorized payment processors. Credit card credentials, debit card CVVs, net banking credentials, and
                UPI PINs are entered solely within the encrypted sandbox of the payment gateway.{" "}
                <strong>GSR Broadband never accesses, records, or stores your financial passwords or card numbers.</strong>
              </p>
            </div>

            <h3>4. Information Sharing &amp; Third Parties</h3>
            <p>
              We do not sell, rent, or lease your personal information. Data is shared strictly on a need-to-know basis with:
            </p>
            <ul className="policy-bullet-list">
              <li>
                <EyeOff size={16} className="terms-check-icon" />
                <span>
                  <strong>Authorized Telecom &amp; Billing Partners:</strong> Upstream bandwidth providers (RailWire Express Network,
                  BSNL Bharat Fiber, PolFiberNet) and the <strong>CableWay billing platform</strong> solely for routing, activation,
                  and billing management.
                </span>
              </li>
              <li>
                <EyeOff size={16} className="terms-check-icon" />
                <span>
                  <strong>Legal Authorities:</strong> When formally subpoenaed or required by law enforcement under Indian statutory
                  regulations or court directives.
                </span>
              </li>
            </ul>

            <h3>5. Data Retention &amp; Security Standards</h3>
            <p>
              We implement industry-standard physical, organizational, and electronic measures to protect customer data
              against accidental loss, unauthorized access, alteration, or disclosure. Customer records are maintained throughout
              the active lifecycle of the subscriber account and for statutory durations mandated by telecom and tax retention laws.
            </p>

            <h3>6. Your Privacy Rights &amp; Preferences</h3>
            <div className="policy-choice-box">
              <Send size={20} color="#0284c7" />
              <div>
                <strong>Subscriber Preferences:</strong>
                <p>
                  You may contact our support office at any time to verify your account contact info, update an address, or opt
                  out of promotional SMS/WhatsApp alerts. Transactional billing receipts and urgent downtime alerts will remain active
                  for account maintenance.
                </p>
              </div>
            </div>

            {/* GRIEVANCE OFFICER BOX */}
            <div className="refund-support-card">
              <h4>Data Protection &amp; Privacy Officer</h4>
              <p>
                For questions regarding this policy or to request updates to your customer records, please reach out to:
              </p>
              <div className="refund-contact-details">
                <div>
                  <strong>Authority:</strong>
                  <span>GSR Privacy &amp; Data Compliance</span>
                </div>
                <div>
                  <strong>Phone / WhatsApp:</strong>
                  <span>+91 9133397709 / 08812-234567</span>
                </div>
                <div>
                  <strong>Email:</strong>
                  <span>manikantacablenet123@gmail.com</span>
                </div>
                <div>
                  <strong>Office:</strong>
                  <span>22C-11-21, CHUNDURI VARI CHOULTRY, POWERPET, ELURU - 534002</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA BANNER */}
        <div className="terms-cta-banner">
          <div>
            <h3>Have Questions About How We Protect Your Data?</h3>
            <p>
              Our team in Powerpet, Eluru is available to assist you with account privacy, credentials, and settings.
            </p>
          </div>
          <div className="terms-cta-buttons">
            <Link to="/contact" className="sp-btn-primary">
              Contact Support Desk <ArrowRight size={16} />
            </Link>
            <Link to="/terms" className="sp-btn-secondary">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
