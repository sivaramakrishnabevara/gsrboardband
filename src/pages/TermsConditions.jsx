import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  AlertCircle,
  Building2,
  Scale,
  ShieldAlert,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import PolicyNav from "../components/PolicyNav";
import "./Terms.css";

export default function TermsConditions() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Terms & Conditions | GSR Broadband Eluru";
  }, []);

  return (
    <div className="terms-page">
      {/* HERO SECTION */}
      <section className="terms-hero">
        <div className="terms-hero-badge">
          <Sparkles size={14} />
          OFFICIAL REGULATORY & SERVICE AGREEMENT
        </div>
        <h1>
          Terms &amp; <span>Conditions</span>
        </h1>
        <p>
          Official customer agreement, subscription rules, and service regulations for{" "}
          <strong>GSR Broadband</strong> optical fiber, high-speed internet, and digital cable TV services.
        </p>
        <div className="terms-meta-info">
          <span>Entity: GSR Broadband</span>
          <span>•</span>
          <span>Jurisdiction: Courts at Eluru, Andhra Pradesh</span>
          <span>•</span>
          <span>Effective Date: 2026 Edition</span>
        </div>
      </section>

      {/* POLICY CONTAINER */}
      <div className="terms-container">
        <PolicyNav activeKey="terms" title="Terms & Conditions" />

        <div className="terms-content-card">
          <div className="terms-section-block">
            <div className="policy-header-badge">
              <span className="badge-company">GSR BROADBAND</span>
              <span className="badge-tag">Service Agreement</span>
            </div>

            <h2>Customer Terms of Service Agreement</h2>

            <div className="terms-notice-box">
              <AlertCircle size={22} />
              <p>
                These terms apply to the cable TV, broadband, and related services (&ldquo;Services&rdquo;) provided by{" "}
                <strong>GSR Broadband</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;), and to all payments made
                through this website, authorized payment gateways, or through payment links sent by us. By subscribing
                to or using our services, you agree to comply with and be bound by these terms.
              </p>
            </div>

            {/* KEY HIGHLIGHTS GRID */}
            <div className="policy-highlights-grid">
              <div className="policy-highlight-card">
                <Scale size={20} className="highlight-icon" />
                <h4>Legally Binding</h4>
                <p>Applies to all subscribers across Eluru and surrounding West Godavari service zones.</p>
              </div>
              <div className="policy-highlight-card">
                <Building2 size={20} className="highlight-icon" />
                <h4>TRAI Regulated</h4>
                <p>Governed in strict accordance with Telecom Regulatory Authority of India guidelines.</p>
              </div>
              <div className="policy-highlight-card">
                <ShieldAlert size={20} className="highlight-icon" />
                <h4>Fair Usage &amp; Security</h4>
                <p>Guaranteed 1:1 speed ratios for lawful private and commercial broadband use.</p>
              </div>
            </div>

            <h3>1. Provision of Services</h3>
            <p>
              We provide the Services at the customer&apos;s registered installation premises within our verified service area,
              in accordance with the specific plan selected by the customer. Channel line-ups for digital cable TV
              are established in coordination with content broadcasters under applicable TRAI regulations and may
              undergo periodic updates or revisions.
            </p>

            <h3>2. Subscription and Billing Cycle</h3>
            <p>
              Services are billed on a recurring billing cycle according to the customer&apos;s chosen plan:
            </p>
            <ul className="policy-bullet-list">
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Prepaid Plans:</strong> Must be renewed and paid prior to the commencement of the service cycle
                  to avoid automated service disruption.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Postpaid Plans:</strong> Invoiced at the conclusion of the billing cycle and payable on or before
                  the due date indicated on the official invoice.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Currency &amp; Taxes:</strong> All stated prices are in Indian Rupees (INR) and are subject to
                  Goods and Services Tax (GST) as applicable under Indian law.
                </span>
              </li>
            </ul>

            <h3>3. Payment Methods &amp; Gateway Security</h3>
            <p>
              Payments may be made online via secure payment links powered by authorized Reserve Bank of India (RBI)
              compliant payment gateways (UPI, credit/debit cards, net banking, registered digital wallets), or paid
              in person at our Eluru office. <strong>GSR Broadband never stores sensitive payment card numbers, CVVs, or net banking passwords on its servers.</strong>
            </p>

            <h3>4. Default &amp; Non-Payment</h3>
            <p>
              If an invoice remains outstanding past the stated due date, GSR Broadband reserves the right to suspend or
              temporarily deactivate the Services until all pending dues are resolved in full. Restoration of de-activated
              services may require a standard reconnection fee as notified at the time of restoration.
            </p>

            <h3>5. Customer Premises Equipment (CPE)</h3>
            <p>
              Any optical network terminal (ONT), fiber router, set-top box, or peripheral cabling supplied by GSR Broadband
              remains the property of the company unless purchased outright. The customer is responsible for maintaining the
              physical safety of the equipment and must return it upon termination or deactivation of the connection.
            </p>

            <h3>6. Customer Obligations &amp; Acceptable Use</h3>
            <p>
              Subscribers agree not to:
            </p>
            <ul className="policy-bullet-list">
              <li>
                <AlertCircle size={16} className="terms-alert-icon" />
                <span>Resell, retransmit, or redistribute the broadband or television signal to third parties without express written authorization.</span>
              </li>
              <li>
                <AlertCircle size={16} className="terms-alert-icon" />
                <span>Tamper with fiber optical lines, splitters, or terminal hardware.</span>
              </li>
              <li>
                <AlertCircle size={16} className="terms-alert-icon" />
                <span>Utilize the internet connection for any prohibited or unlawful purpose under the Information Technology Act, 2000.</span>
              </li>
            </ul>

            <h3>7. Limitation of Liability</h3>
            <p>
              GSR Broadband shall not be held liable for temporary interruptions, slowdowns, or service outages caused by
              force majeure events beyond our reasonable control, including municipal civil road work, power grid disruptions,
              extreme weather events, upstream tier-1 optical fiber cuts, or satellite broadcaster outages.
            </p>

            <h3>8. Governing Law &amp; Jurisdiction</h3>
            <div className="policy-jurisdiction-box">
              <Building2 size={24} color="#0284c7" />
              <div>
                <strong>Legal Jurisdiction &amp; Dispute Resolution:</strong>
                <p>
                  This agreement is governed in all respects by the laws of India. Any legal dispute, claim, or difference
                  arising under or in connection with this agreement shall be subject to the exclusive jurisdiction of the{" "}
                  <strong>competent courts at Eluru, West Godavari District, Andhra Pradesh</strong>.
                </p>
              </div>
            </div>

            {/* GRIEVANCE OFFICER BOX */}
            <div className="refund-support-card">
              <h4>Grievance Redressal &amp; Nodal Authority</h4>
              <p>
                In compliance with TRAI Quality of Service and Consumer Grievance Regulations, customers can contact our
                designated Nodal Desk:
              </p>
              <div className="refund-contact-details">
                <div>
                  <strong>Nodal Contact:</strong>
                  <span>GSR Customer Support Desk</span>
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
                  <strong>Registered Office:</strong>
                  <span>22C-11-21, CHUNDURI VARI CHOULTRY, POWERPET, ELURU - 534002</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA BANNER */}
        <div className="terms-cta-banner">
          <div>
            <h3>Ready to Experience High-Speed Optical Fiber?</h3>
            <p>
              Join thousands of connected homes and businesses in Eluru with 99.9% network reliability.
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
