import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  RotateCcw,
  Truck,
  Wifi,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  CreditCard,
  Send,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import "./Terms.css";

function Terms({ defaultTab }) {
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const queryTab = searchParams.get("tab");
  const path = location.pathname.toLowerCase();

  const routeTab = (() => {
    if (queryTab && ["terms", "privacy", "refund", "shipping", "sla"].includes(queryTab)) {
      return queryTab;
    }
    if (path.includes("privacy")) return "privacy";
    if (path.includes("refund") || path.includes("cancellation")) return "refund";
    if (path.includes("shipping") || path.includes("delivery")) return "shipping";
    if (path.includes("sla") || path.includes("fup")) return "sla";
    if (defaultTab) return defaultTab;
    return "terms";
  })();

  const [prevRoute, setPrevRoute] = useState(location.pathname + location.search);
  const [userSelectedTab, setUserSelectedTab] = useState(null);

  if (prevRoute !== location.pathname + location.search) {
    setPrevRoute(location.pathname + location.search);
    setUserSelectedTab(null);
  }

  // Active tab is user's explicit selection if made on current view, otherwise route-derived tab
  const activeTab = userSelectedTab || routeTab;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, location.search]);

  return (
    <div className="terms-page">
      {/* HERO SECTION */}
      <section className="terms-hero">
        <div className="terms-hero-badge">
          <Sparkles size={14} />
          OFFICIAL REGULATORY, SERVICE &amp; COMPLIANCE POLICIES
        </div>
        <h1>
          Legal &amp; <span>Policy Center</span>
        </h1>
        <p>
          Official customer policies, terms of service, privacy disclosures, and payment &amp; delivery
          guidelines for <strong>GSR Broadband</strong> services, high-speed optical fiber, and digital cable TV.
        </p>
        <div className="terms-meta-info">
          <span>Entity: GSR Broadband</span>
          <span>•</span>
          <span>Jurisdiction: Courts at Eluru, Andhra Pradesh</span>
          <span>•</span>
          <span>Office: 22C-11-21, CHUNDURI VARI CHOULTRY, POWERPET, ELURU - 534002</span>
        </div>
      </section>

      {/* POLICY NAVIGATION TABS */}
      <div className="terms-container">
        {/* Breadcrumb Strip */}
        <div className="policy-breadcrumbs-bar">
          <div className="policy-breadcrumbs">
            <Link to="/" className="breadcrumb-item">
              <span>Home</span>
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item active">Policy Center &amp; Legal Hub</span>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => window.print()}
              className="policy-print-btn"
              title="Print Policy"
            >
              Print Policy
            </button>
          </div>
        </div>

        {/* POLICY NAVIGATION TABS (Can view inline or navigate to dedicated page) */}
        <div className="terms-nav-tabs">
          <Link
            to="/terms"
            className={`terms-tab-btn policy-nav-link ${activeTab === "terms" ? "active" : ""}`}
          >
            <FileText size={18} />
            Terms &amp; Conditions
          </Link>
          <Link
            to="/privacy-policy"
            className={`terms-tab-btn policy-nav-link ${activeTab === "privacy" ? "active" : ""}`}
          >
            <ShieldCheck size={18} />
            Privacy Policy
          </Link>
          <Link
            to="/refund-policy"
            className={`terms-tab-btn policy-nav-link ${activeTab === "refund" ? "active" : ""}`}
          >
            <RotateCcw size={18} />
            Refund &amp; Cancellation
          </Link>
          <Link
            to="/shipping-policy"
            className={`terms-tab-btn policy-nav-link ${activeTab === "shipping" ? "active" : ""}`}
          >
            <Truck size={18} />
            Shipping &amp; Delivery
          </Link>
          <Link
            to="/sla-policy"
            className={`terms-tab-btn policy-nav-link ${activeTab === "sla" ? "active" : ""}`}
          >
            <Wifi size={18} />
            SLA &amp; FUP
          </Link>
        </div>

        {/* TAB CONTENTS */}
        <div className="terms-content-card">
          {/* =========================================================
              1. TERMS & CONDITIONS (GSR BROADBAND)
          ========================================================= */}
          {activeTab === "terms" && (
            <div className="terms-section-block">
              <div className="policy-header-badge">
                <span className="badge-company">GSR BROADBAND</span>
                <span className="badge-tag">Service Agreement</span>
              </div>

              <h2>Terms &amp; Conditions</h2>
              <div className="terms-notice-box">
                <AlertCircle size={20} />
                <p>
                  These terms apply to the cable TV, broadband and related services (&ldquo;Services&rdquo;) provided by{" "}
                  <strong>GSR Broadband</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;), and to payments made
                  through this website or through payment links sent by us.
                </p>
              </div>

              <h3>1. Services</h3>
              <p>
                We provide the Services at the customer&apos;s premises within our service area, according to
                the plan the customer chooses. Channel line-ups are set by the broadcasters under applicable
                TRAI regulations and may change from time to time.
              </p>

              <h3>2. Subscription and Billing</h3>
              <p>
                Services are billed each billing cycle as per the chosen plan. Prepaid plans must be paid
                before the service period starts. Postpaid plans are billed after the service period and must be
                paid by the due date on the bill. Prices are in <strong>INR</strong> and GST is charged as
                applicable.
              </p>

              <h3>3. Payments</h3>
              <p>
                Payments can be made online through the secure payment links we provide (UPI, debit or credit
                card, net banking, wallets) or at our office. Online payments are processed by authorised payment
                gateways. <strong>We do not store card or bank details.</strong>
              </p>

              <h3>4. Non-payment</h3>
              <p>
                If a bill is unpaid after the due date, the Services may be suspended until the dues are
                cleared. Reconnection may carry a charge, which we tell you about at the time.
              </p>

              <h3>5. Equipment</h3>
              <p>
                Set-top boxes, routers and other equipment we provide are subject to the terms agreed at
                installation. The customer is responsible for keeping them safe.
              </p>

              <h3>6. Customer Obligations</h3>
              <p>
                The customer must not redistribute the signal, tamper with equipment, or use the Services for
                any unlawful purpose.
              </p>

              <h3>7. Liability</h3>
              <p>
                We are not liable for interruptions caused by events beyond our reasonable control, including
                power failures, natural calamities, and broadcaster or upstream network outages.
              </p>

              <h3>8. Governing Law</h3>
              <div className="policy-jurisdiction-box">
                <Building2 size={20} />
                <div>
                  <strong>Legal Jurisdiction:</strong>
                  <p>
                    These terms are governed by the laws of India. Disputes are subject to the jurisdiction of the{" "}
                    <strong>courts at Eluru, Andhra Pradesh</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              2. PRIVACY POLICY (GSR BROADBAND)
          ========================================================= */}
          {activeTab === "privacy" && (
            <div className="terms-section-block">
              <div className="policy-header-badge">
                <span className="badge-company">GSR BROADBAND</span>
                <span className="badge-tag">Privacy Policy</span>
              </div>

              <h2>Privacy Policy</h2>
              <p className="policy-lead-text">
                <strong>GSR Broadband</strong> respects your privacy. This policy explains what information
                we collect and how we use it.
              </p>

              <h3>Information We Collect</h3>
              <p>
                We collect essential details to register, deliver, and maintain your connection:
              </p>
              <ul className="policy-bullet-list">
                <li>
                  <CheckCircle2 size={16} className="terms-check-icon" />
                  <strong>Personal Identity:</strong> Name, phone number, and email address.
                </li>
                <li>
                  <CheckCircle2 size={16} className="terms-check-icon" />
                  <strong>Service Details:</strong> Installation address, set-top box and connection details.
                </li>
                <li>
                  <CheckCircle2 size={16} className="terms-check-icon" />
                  <strong>Account Records:</strong> Selected plan, and billing and payment history.
                </li>
              </ul>

              <h3>How We Use It</h3>
              <p>
                To provide and activate the Services, generate bills, send bill and payment notifications by SMS
                or WhatsApp, process payments, and resolve complaints.
              </p>

              <h3>Payments</h3>
              <div className="terms-notice-box payment-secure-box">
                <CreditCard size={20} />
                <p>
                  Online payments are processed by authorised payment gateways. Card, UPI and bank credentials
                  are entered on the gateway&apos;s secure pages and are <strong>never stored by us</strong>.
                </p>
              </div>

              <h3>Sharing</h3>
              <p>
                We do not sell your information. We share it only with our service partners (broadcasters and
                upstream providers for activation, payment gateways, messaging providers and the{" "}
                <strong>CableWay billing platform</strong>) as far as needed to provide the Services, or when
                the law requires it.
              </p>

              <h3>Security and Retention</h3>
              <p>
                Information is stored on secured servers and kept for as long as the connection is active and as
                required under tax and telecom regulations.
              </p>

              <h3>Your Choices</h3>
              <div className="policy-choice-box">
                <Send size={18} />
                <p>
                  You can ask us to correct your details or to stop promotional messages by contacting us.
                </p>
              </div>
            </div>
          )}

          {/* =========================================================
              3. REFUND & CANCELLATION POLICY (GSR BROADBAND)
          ========================================================= */}
          {activeTab === "refund" && (
            <div className="terms-section-block">
              <div className="policy-header-badge">
                <span className="badge-company">GSR BROADBAND</span>
                <span className="badge-tag">Refund &amp; Cancellation Policy</span>
              </div>

              <h2>Refund &amp; Cancellation Policy</h2>

              <h3>Cancellation</h3>
              <p>
                You can ask us to disconnect the Services at any time. The service stays active until the end of
                the period already paid for, and billing stops from the next billing cycle after your request.
              </p>

              <h3>Refunds</h3>
              <p>
                Refund eligibility criteria and dispute handling are governed by the following rules:
              </p>
              <ul className="policy-bullet-list">
                <li>
                  <CheckCircle2 size={16} className="terms-check-icon" />
                  <strong>Duplicate or excess payment:</strong> Refunded in full, or adjusted against your
                  next bill if you prefer.
                </li>
                <li>
                  <CheckCircle2 size={16} className="terms-check-icon" />
                  <strong>Money debited but not received by us (failed transaction):</strong> Reversed
                  automatically by the bank or payment gateway, usually within 5-7 working days.
                </li>
                <li>
                  <CheckCircle2 size={16} className="terms-check-icon" />
                  <strong>Service not activated:</strong> If we cannot activate a paid plan, the full amount
                  is refunded.
                </li>
                <li>
                  <AlertCircle size={16} className="terms-alert-icon" />
                  <strong>Used active service:</strong> Amounts for a service period that has already been
                  activated and used are not refundable.
                </li>
              </ul>

              <h3>Refund Timeline</h3>
              <div className="terms-notice-box timeline-box">
                <Clock size={20} />
                <p>
                  Approved refunds are started within <strong>7 working days</strong> and credited to the
                  original payment method (UPI, card or bank account). Your bank may take a further 5-7 working
                  days to show the credit.
                </p>
              </div>

              <h3>How to Request a Refund</h3>
              <div className="refund-support-card">
                <h4>Contact Us for Refund Requests</h4>
                <p>
                  To request a refund, please contact us with your <strong>Customer ID</strong> and the{" "}
                  <strong>Payment Reference Number / Transaction ID</strong>:
                </p>
                <div className="refund-contact-details">
                  <div>
                    <strong>Phone / WhatsApp:</strong>
                    <span>+91 9133397709 / 08812-234567</span>
                  </div>
                  <div>
                    <strong>Email:</strong>
                    <span>manikantacablenet123@gmail.com</span>
                  </div>
                  <div>
                    <strong>Head Office:</strong>
                    <span>22C-11-21, CHUNDURI VARI CHOULTRY, POWERPET, ELURU, West Godavari, Andhra Pradesh - 534002</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              4. SHIPPING & SERVICE DELIVERY POLICY (GSR BROADBAND)
          ========================================================= */}
          {activeTab === "shipping" && (
            <div className="terms-section-block">
              <div className="policy-header-badge">
                <span className="badge-company">GSR BROADBAND</span>
                <span className="badge-tag">Shipping &amp; Service Delivery Policy</span>
              </div>

              <h2>Shipping &amp; Service Delivery Policy</h2>

              <div className="terms-notice-box delivery-intro-box">
                <Truck size={20} />
                <p>
                  <strong>GSR Broadband</strong> provides services, not physical goods sent by courier.{" "}
                  <strong>No shipping charges apply.</strong>
                </p>
              </div>

              <h3>New Connections</h3>
              <p>
                Our technician installs the connection at your premises within our service area, normally within{" "}
                <strong>2-3 working days</strong> of the request and payment.
              </p>

              <h3>Renewals and Online Payments</h3>
              <p>
                When a bill or renewal is paid online, the service is renewed or activated straight away, and
                always <strong>within 24 hours</strong> of the payment being confirmed. The receipt is sent by{" "}
                <strong>SMS or WhatsApp</strong>.
              </p>

              <h3>Equipment</h3>
              <p>
                Where a set-top box or router is needed, our technician brings it and installs it during the
                installation visit.
              </p>

              <h3>Service Area</h3>
              <div className="policy-office-box">
                <MapPin size={22} />
                <div>
                  <h4>Covered Operational Service Area:</h4>
                  <p>
                    Services are available in and around <strong>Eluru and West Godavari</strong>.
                  </p>
                  <div className="office-address-badge">
                    <strong>Office Address:</strong> 22C-11-21, CHUNDURI VARI CHOULTRY, POWERPET, ELURU, West Godavari, Andhra Pradesh - 534002
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              5. SLA & FAIR USAGE POLICY (NETWORK COMPLIANCE)
          ========================================================= */}
          {activeTab === "sla" && (
            <div className="terms-section-block">
              <div className="policy-header-badge">
                <span className="badge-company">GSR BROADBAND</span>
                <span className="badge-tag">Network SLA &amp; FUP Standards</span>
              </div>

              <h2>Service Level Agreement (SLA) &amp; Fair Usage Policy</h2>

              <h3>1. 99.9% Uptime Commitment</h3>
              <p>
                Our fiber rings, powered with Tier-1 peering partners (RailWire Express Network, BSNL Bharat
                Fiber, PolFiberNet, and Mani Kanta Star &amp; Cable Net), provide high reliability with 99.9%
                target network uptime.
              </p>

              <h3>2. True Unlimited High-Speed Fiber</h3>
              <p>
                Broadband fiber connections provide truly unlimited data across standard residential tiers
                without artificial daily download caps. 1:1 symmetric upload and download throughput is
                maintained for seamless streaming, gaming, and remote work.
              </p>

              <h3>3. Doorstep Fault Resolution</h3>
              <p>
                Fiber line interruptions or hardware issues reported to our control desk are assigned to
                on-ground field technicians for rapid local doorstep resolution within 2 to 4 working hours.
              </p>

              <div className="terms-support-grid">
                <div className="terms-support-box">
                  <strong>Service Support Desk:</strong>
                  <span>Mon - Sat: 9:00 AM - 8:00 PM</span>
                </div>
                <div className="terms-support-box">
                  <strong>Sunday Helpdesk:</strong>
                  <span>10:00 AM - 5:00 PM</span>
                </div>
                <div className="terms-support-box">
                  <strong>Helpline Number:</strong>
                  <span>+91 9133397709 / 08812-234567</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CALL TO ACTION BANNER */}
        <div className="terms-cta-banner">
          <div>
            <h3>Have Questions About Our Policies or Need Help?</h3>
            <p>
              Our customer service desk at 22C-11-21, CHUNDURI VARI CHOULTRY, POWERPET, ELURU is available to assist you
              with connection setups, billing receipts, and queries.
            </p>
          </div>
          <div className="terms-cta-buttons">
            <Link to="/book-connection" className="sp-btn-primary">
              Book Connection <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="sp-btn-secondary">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terms;
