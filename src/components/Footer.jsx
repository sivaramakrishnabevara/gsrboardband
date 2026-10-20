import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  X,
  Sparkles,
  RotateCcw,
  Truck,
  Wifi,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import railwireLogo from "../assets/partners/railwire.png";
import bsnlLogo from "../assets/partners/bsnl.png";
import polfibernetLogo from "../assets/partners/polfibernet.png";
import manikantaLogo from "../assets/partners/manikanta.svg";

function Footer() {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [modalTab, setModalTab] = useState("terms"); // 'terms' | 'privacy' | 'refund' | 'shipping' | 'sla'

  return (
    <footer className="footer">
      {/* =========================================================
          PARTNERS HIGHLIGHT STRIP (RAILWIRE, BSNL, POLFIBERNET)
      ========================================================= */}
      <div className="footer-partners-section">
        <div className="footer-partners-container">
          <div className="footer-partners-header">
            <span className="footer-partner-badge">
              <Sparkles size={13} />
              AUTHORIZED TELECOM & NETWORK INFRASTRUCTURE
            </span>
            <h2>
              Authorized <span>Network & Telecom Partners</span>
            </h2>
            <p>
              High-speed gigabit fiber connectivity powered in partnership with
              India's premier telecommunication & optical fiber networks.
            </p>
          </div>

          <div className="footer-partners-grid">
            {/* 1. RAILWIRE (EXPRESS NETWORK) */}
            <div className="partner-card railtel-card">
              <div className="partner-card-glow"></div>
              <div className="partner-logo-box-img">
                <img
                  src={railwireLogo}
                  alt="RailWire Express Network"
                  className="partner-img-logo"
                />
              </div>

              <div className="partner-details">
                <span className="partner-type-tag railtel-tag">RAILTEL ENTERPRISE NETWORK</span>
                <h3 className="partner-name">RailWire</h3>
                <p className="partner-desc">
                  Retail broadband initiative of RailTel Corporation of India (Ministry of Railways)
                  providing robust tier-1 nationwide optical fiber routing and low-latency peering.
                </p>
                <div className="partner-metrics">
                  <span>✦ Express Network</span>
                  <span>✦ 61,000+ KM Fiber</span>
                </div>
              </div>
            </div>

            {/* 2. BSNL */}
            <div className="partner-card bsnl-card">
              <div className="partner-card-glow"></div>
              <div className="partner-logo-box-img">
                <img
                  src={bsnlLogo}
                  alt="BSNL"
                  className="partner-img-logo"
                />
              </div>

              <div className="partner-details">
                <span className="partner-type-tag bsnl-tag">NATIONAL TELECOM OPERATOR</span>
                <h3 className="partner-name">BSNL</h3>
                <p className="partner-desc">
                  Bharat Sanchar Nigam Limited FTTH partnership delivering widespread nationwide fiber
                  infrastructure, direct NIXI peering, and high network redundancy.
                </p>
                <div className="partner-metrics">
                  <span>✦ Pan-India Peering</span>
                  <span>✦ Bharat Fiber</span>
                </div>
              </div>
            </div>

            {/* 3. POLFIBERNET */}
            <div className="partner-card polfiber-card">
              <div className="partner-card-glow"></div>
              <div className="partner-logo-box-img">
                <img
                  src={polfibernetLogo}
                  alt="PolFiberNet - TV + OTT + WiFi + Phone"
                  className="partner-img-logo"
                />
              </div>

              <div className="partner-details">
                <span className="partner-type-tag polfiber-tag">TV + OTT + WIFI + PHONE</span>
                <h3 className="partner-name">PolFiberNet</h3>
                <p className="partner-desc">
                  Andhra Pradesh's licensed quad-play fiber network offering seamless all-in-one
                  bundled TV, OTT entertainment apps, high-speed Wi-Fi, and digital landline phone.
                </p>
                <div className="partner-metrics">
                  <span>✦ TV + OTT + WiFi + Phone</span>
                  <span>✦ Pure Optical FTTH</span>
                </div>
              </div>
            </div>

            {/* 4. MANI KANTA STAR & CABLE NET */}
            <div className="partner-card manikanta-card">
              <div className="partner-card-glow"></div>
              <div className="partner-logo-box-img">
                <img
                  src={manikantaLogo}
                  alt="Mani Kanta Star & Cable Net"
                  className="partner-img-logo"
                />
              </div>

              <div className="partner-details">
                <span className="partner-type-tag manikanta-tag">DIGITAL CABLE TV & BROADBAND</span>
                <h3 className="partner-name">Mani Kanta Star & Cable Net</h3>
                <p className="partner-desc">
                  Premier regional digital cable TV and optical fiber distribution partner delivering
                  high-definition television channels, direct local loops, and high-speed broadband in Eluru.
                </p>
                <div className="partner-metrics">
                  <span>✦ Digital Cable TV</span>
                  <span>✦ Optical Local Loop</span>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK LOGO SHOWCASE STRIP */}
          <div className="footer-logos-showcase">
            <span className="logos-showcase-label">Official Telecom & Infrastructure Partners:</span>
            <div className="logos-showcase-pills">
              <div className="showcase-pill railtel-pill">
                <span className="pill-dot railtel-dot"></span>
                <strong>RailWire</strong> Express Network
              </div>
              <div className="showcase-pill bsnl-pill">
                <span className="pill-dot bsnl-dot"></span>
                <strong>BSNL</strong> Telecom
              </div>
              <div className="showcase-pill gsr-pill">
                <span className="pill-dot polfiber-dot"></span>
                <strong>PolFiberNet</strong> TV + OTT + WiFi + Phone
              </div>
              <div className="showcase-pill manikanta-pill">
                <span className="pill-dot manikanta-dot"></span>
                <strong>Mani Kanta Star & Cable Net</strong> Partner
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN FOOTER COLUMNS
      ========================================================= */}
      <div className="footer-container">
        {/* Brand & Mission */}
        <div className="footer-column footer-company">
          <Link to="/" className="footer-brand-box">
            <img src={logo} alt="GSR Broadband" className="footer-logo" />
          </Link>

          <p>
            Fast, reliable, and affordable pure fiber broadband & digital cable TV
            connectivity designed for modern homes and growing enterprises in Eluru.
          </p>

        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/about">About GSR</Link>
          <Link to="/services">Services & Plans</Link>
          <Link to="/services#broadband">Broadband Plans</Link>
          <Link to="/services#tv">Digital TV Plans</Link>
          <Link to="/book-connection">Book Your Connection</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/contact">Contact Support</Link>
        </div>

        {/* Legal & Policies */}
        <div className="footer-column">
          <h3>Legal & Policies</h3>
          <Link to="/terms" className="footer-policy-link-highlight">
            <FileText size={15} />
            Terms &amp; Conditions
          </Link>

          <Link to="/privacy-policy" className="footer-policy-link-highlight">
            <ShieldCheck size={15} />
            Privacy Policy
          </Link>

          <Link to="/refund-policy" className="footer-policy-link-highlight">
            <RotateCcw size={15} />
            Refund &amp; Cancellation
          </Link>

          <Link to="/shipping-policy" className="footer-policy-link-highlight">
            <Truck size={15} />
            Shipping &amp; Delivery Policy
          </Link>

          <Link to="/sla-policy" className="footer-policy-link-highlight">
            <Wifi size={15} />
            SLA &amp; FUP Standards
          </Link>

          <button
            type="button"
            className="footer-policy-btn"
            onClick={() => {
              setModalTab("terms");
              setShowTermsModal(true);
            }}
          >
            <Sparkles size={15} />
            Quick Policy Center (Modal)
          </button>
        </div>

        {/* Contact Info */}
        <div className="footer-column">
          <h3>Head Office</h3>

          <div className="footer-contact">
            <MapPin size={18} />
            <span>
              22C-11-21, CHUNDURI VARI CHOULTRY,
              <br />
              POWERPET, ELURU, West Godavari,
              <br />
              Andhra Pradesh - 534002
            </span>
          </div>

          <div className="footer-contact">
            <Phone size={18} />
            <span>+91 9133397709 / 08812-234567</span>
          </div>

          <div className="footer-contact">
            <Mail size={18} />
            <span>manikantacablenet123@gmail.com</span>
          </div>

          <div className="footer-hours">
            <h4>Support Hours:</h4>
            <p>Mon - Sat: 9:00 AM - 8:00 PM</p>
            <p>Sun: 10:00 AM - 5:00 PM</p>
          </div>
        </div>
      </div>

      {/* =========================================================
          FOOTER BOTTOM COPYRIGHT & POLICY LINKS
      ========================================================= */}
      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <span>© 2026 GSR Broadband &amp; Cable Network. All Rights Reserved.</span>
        </div>

        <div className="footer-bottom-links">
          <Link to="/terms">Terms &amp; Conditions</Link>
          <span>•</span>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <span>•</span>
          <Link to="/refund-policy">Refund Policy</Link>
          <span>•</span>
          <Link to="/shipping-policy">Shipping &amp; Delivery</Link>
          <span>•</span>
          <Link to="/sla-policy">SLA &amp; FUP</Link>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              setModalTab("terms");
              setShowTermsModal(true);
            }}
          >
            Quick View
          </button>
          <span>•</span>
          <Link to="/contact">Support</Link>
        </div>
      </div>

      {/* =========================================================
          INTERACTIVE TERMS & CONDITIONS MODAL
      ========================================================= */}
      {showTermsModal && (
        <div
          className="policy-modal-overlay"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="policy-modal-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="policy-modal-header">
              <div className="policy-modal-title">
                <FileText size={22} color="#0284c7" />
                <h3>
                  {modalTab === "terms" && "GSR Broadband - Terms & Conditions"}
                  {modalTab === "privacy" && "GSR Broadband - Privacy Policy"}
                  {modalTab === "refund" && "GSR Broadband - Refund & Cancellation Policy"}
                  {modalTab === "shipping" && "GSR Broadband - Shipping & Service Delivery Policy"}
                  {modalTab === "sla" && "Service Level Agreement (SLA) & Network Standards"}
                </h3>
              </div>
              <button
                className="policy-modal-close"
                onClick={() => setShowTermsModal(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="policy-modal-nav">
              <button
                className={modalTab === "terms" ? "active" : ""}
                onClick={() => setModalTab("terms")}
              >
                Terms &amp; Conditions
              </button>
              <button
                className={modalTab === "privacy" ? "active" : ""}
                onClick={() => setModalTab("privacy")}
              >
                Privacy Policy
              </button>
              <button
                className={modalTab === "refund" ? "active" : ""}
                onClick={() => setModalTab("refund")}
              >
                Refund &amp; Cancellation
              </button>
              <button
                className={modalTab === "shipping" ? "active" : ""}
                onClick={() => setModalTab("shipping")}
              >
                Shipping &amp; Delivery
              </button>
              <button
                className={modalTab === "sla" ? "active" : ""}
                onClick={() => setModalTab("sla")}
              >
                Service SLA
              </button>
            </div>

            <div className="policy-modal-body">
              {modalTab === "terms" && (
                <div className="policy-text-section">
                  <h4>GSR Broadband</h4>
                  <p>
                    These terms apply to the cable TV, broadband and related services (&ldquo;Services&rdquo;) provided by{" "}
                    <strong>GSR Broadband</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;), and to payments made
                    through this website or through payment links sent by us.
                  </p>

                  <h4>1. Services</h4>
                  <p>
                    We provide the Services at the customer&apos;s premises within our service area, according to the
                    plan the customer chooses. Channel line-ups are set by the broadcasters under applicable TRAI
                    regulations and may change from time to time.
                  </p>

                  <h4>2. Subscription and billing</h4>
                  <p>
                    Services are billed each billing cycle as per the chosen plan. Prepaid plans must be paid
                    before the service period starts. Postpaid plans are billed after the service period and must be
                    paid by the due date on the bill. Prices are in INR and GST is charged as applicable.
                  </p>

                  <h4>3. Payments</h4>
                  <p>
                    Payments can be made online through the secure payment links we provide (UPI, debit or credit
                    card, net banking, wallets) or at our office. Online payments are processed by authorised payment
                    gateways. We do not store card or bank details.
                  </p>

                  <h4>4. Non-payment</h4>
                  <p>
                    If a bill is unpaid after the due date, the Services may be suspended until the dues are cleared.
                    Reconnection may carry a charge, which we tell you about at the time.
                  </p>

                  <h4>5. Equipment</h4>
                  <p>
                    Set-top boxes, routers and other equipment we provide are subject to the terms agreed at
                    installation. The customer is responsible for keeping them safe.
                  </p>

                  <h4>6. Customer obligations</h4>
                  <p>
                    The customer must not redistribute the signal, tamper with equipment, or use the Services for
                    any unlawful purpose.
                  </p>

                  <h4>7. Liability</h4>
                  <p>
                    We are not liable for interruptions caused by events beyond our reasonable control, including
                    power failures, natural calamities, and broadcaster or upstream network outages.
                  </p>

                  <h4>8. Governing law</h4>
                  <p>
                    These terms are governed by the laws of India. Disputes are subject to the jurisdiction of the{" "}
                    <strong>courts at Eluru, Andhra Pradesh</strong>.
                  </p>
                </div>
              )}

              {modalTab === "privacy" && (
                <div className="policy-text-section">
                  <h4>GSR Broadband</h4>
                  <p>
                    GSR Broadband respects your privacy. This policy explains what information we collect and how we use it.
                  </p>

                  <h4>Information we collect</h4>
                  <p>
                    Name, phone number, email address, installation address, set-top box and connection details, plan,
                    and billing and payment history.
                  </p>

                  <h4>How we use it</h4>
                  <p>
                    To provide and activate the Services, generate bills, send bill and payment notifications by SMS
                    or WhatsApp, process payments, and resolve complaints.
                  </p>

                  <h4>Payments</h4>
                  <p>
                    Online payments are processed by authorised payment gateways. Card, UPI and bank credentials are
                    entered on the gateway&apos;s secure pages and are <strong>never stored by us</strong>.
                  </p>

                  <h4>Sharing</h4>
                  <p>
                    We do not sell your information. We share it only with our service partners (broadcasters and
                    upstream providers for activation, payment gateways, messaging providers and the{" "}
                    <strong>CableWay billing platform</strong>) as far as needed to provide the Services, or when the
                    law requires it.
                  </p>

                  <h4>Security and retention</h4>
                  <p>
                    Information is stored on secured servers and kept for as long as the connection is active and as
                    required under tax and telecom regulations.
                  </p>

                  <h4>Your choices</h4>
                  <p>
                    You can ask us to correct your details or to stop promotional messages by contacting us.
                  </p>
                </div>
              )}

              {modalTab === "refund" && (
                <div className="policy-text-section">
                  <h4>GSR Broadband</h4>

                  <h4>Cancellation</h4>
                  <p>
                    You can ask us to disconnect the Services at any time. The service stays active until the end of
                    the period already paid for, and billing stops from the next billing cycle after your request.
                  </p>

                  <h4>Refunds</h4>
                  <p>
                    • <strong>Duplicate or excess payment:</strong> refunded in full, or adjusted against your next
                    bill if you prefer.
                    <br />
                    • <strong>Money debited but not received by us (failed transaction):</strong> reversed
                    automatically by the bank or payment gateway, usually within 5-7 working days.
                    <br />
                    • <strong>Service not activated:</strong> if we cannot activate a paid plan, the full amount is
                    refunded.
                    <br />
                    • <strong>Amounts for a service period that has already been activated and used</strong> are not
                    refundable.
                  </p>

                  <h4>Refund timeline</h4>
                  <p>
                    Approved refunds are started within <strong>7 working days</strong> and credited to the original
                    payment method (UPI, card or bank account). Your bank may take a further 5-7 working days to show
                    the credit.
                  </p>

                  <h4>How to request a refund</h4>
                  <p>
                    Contact us with your customer ID and the payment reference number at{" "}
                    <strong>manikantacablenet123@gmail.com</strong> or{" "}
                    <strong>+91 9133397709 / 08812-234567</strong>.
                  </p>
                </div>
              )}

              {modalTab === "shipping" && (
                <div className="policy-text-section">
                  <h4>GSR Broadband</h4>
                  <p>
                    GSR Broadband provides services, not physical goods sent by courier.{" "}
                    <strong>No shipping charges apply.</strong>
                  </p>

                  <h4>New connections</h4>
                  <p>
                    Our technician installs the connection at your premises within our service area, normally within{" "}
                    <strong>2-3 working days</strong> of the request and payment.
                  </p>

                  <h4>Renewals and online payments</h4>
                  <p>
                    When a bill or renewal is paid online, the service is renewed or activated straight away, and
                    always within 24 hours of the payment being confirmed. The receipt is sent by SMS or WhatsApp.
                  </p>

                  <h4>Equipment</h4>
                  <p>
                    Where a set-top box or router is needed, our technician brings it and installs it during the
                    installation visit.
                  </p>

                  <h4>Service area</h4>
                  <p>
                    Services are available in and around <strong>Eluru and West Godavari</strong> (office: 22C-11-21,
                    CHUNDURI VARI CHOULTRY, POWERPET, ELURU, West Godavari, Andhra Pradesh, 534002).
                  </p>
                </div>
              )}

              {modalTab === "sla" && (
                <div className="policy-text-section">
                  <h4>Service Level Agreement (SLA) &amp; Support</h4>
                  <p>
                    Our optical fiber backbone provides 99.9% network uptime commitment backed by redundant upstream
                    connections from RailWire and BSNL.
                  </p>
                  <h4>Support Hours:</h4>
                  <p>
                    Mon - Sat: 9:00 AM - 8:00 PM | Sun: 10:00 AM - 5:00 PM
                    <br />
                    Helpline: +91 9133397709 / 08812-234567
                  </p>
                </div>
              )}
            </div>

            <div className="policy-modal-footer">
              <button
                className="sp-btn-primary"
                onClick={() => setShowTermsModal(false)}
              >
                I UNDERSTAND &amp; AGREE
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

export default Footer;