import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  PhoneCall,
  DollarSign,
} from "lucide-react";
import PolicyNav from "../components/PolicyNav";
import "./Terms.css";

export default function RefundPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Refund & Cancellation Policy | GSR Broadband Eluru";
  }, []);

  return (
    <div className="terms-page">
      {/* HERO SECTION */}
      <section className="terms-hero">
        <div className="terms-hero-badge">
          <Sparkles size={14} />
          CLEAR, TRANSPARENT BILLING &amp; DISPUTE RESOLUTION
        </div>
        <h1>
          Refund &amp; <span>Cancellation Policy</span>
        </h1>
        <p>
          Transparent guidelines regarding subscription cancellations, excess payment reversals,
          and failed transaction refunds for <strong>GSR Broadband</strong> customers.
        </p>
        <div className="terms-meta-info">
          <span>Entity: GSR Broadband</span>
          <span>•</span>
          <span>Settlement Window: 5 to 7 Working Days</span>
          <span>•</span>
          <span>Payment Mode: Original Payment Source</span>
        </div>
      </section>

      {/* POLICY CONTAINER */}
      <div className="terms-container">
        <PolicyNav activeKey="refund" title="Refund & Cancellation" />

        <div className="terms-content-card">
          <div className="terms-section-block">
            <div className="policy-header-badge">
              <span className="badge-company">GSR BROADBAND</span>
              <span className="badge-tag">Customer Billing Protection</span>
            </div>

            <h2>Cancellation &amp; Refund Guidelines</h2>
            <p className="policy-lead-text">
              At <strong>GSR Broadband</strong>, we strive to deliver high-speed optical fiber and digital cable
              services with absolute transparency. This policy sets forth the clear procedures and conditions governing
              subscription cancellations, payment disputes, and monetary refund settlements.
            </p>

            {/* THREE CORE PRINCIPLES */}
            <div className="policy-highlights-grid">
              <div className="policy-highlight-card">
                <RotateCcw size={20} className="highlight-icon" />
                <h4>Easy Disconnection</h4>
                <p>Request account cancellation at any time with no lock-in penalty fees.</p>
              </div>
              <div className="policy-highlight-card">
                <Clock size={20} className="highlight-icon" />
                <h4>Rapid Turnaround</h4>
                <p>Eligible refund claims are audited and initiated within 7 working business days.</p>
              </div>
              <div className="policy-highlight-card">
                <CreditCard size={20} className="highlight-icon" />
                <h4>Source Reimbursement</h4>
                <p>Refunds are credited directly back to the original bank account, card, or UPI VPA.</p>
              </div>
            </div>

            <h3>1. Service Cancellation Process</h3>
            <p>
              Subscribers may request disconnection of their broadband or cable TV service at any time:
            </p>
            <ul className="policy-bullet-list">
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Active Paid Cycle:</strong> The connection will remain operational until the last date of the
                  prepaid billing term already cleared by the customer.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Cessation of Billing:</strong> All future billing cycles are stopped immediately upon processing
                  the cancellation notice.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Return of Equipment:</strong> Our service technician will coordinate a doorstep pickup of any
                  company-provided Optical Network Terminal (ONT router) or set-top boxes in working condition.
                </span>
              </li>
            </ul>

            <h3>2. Refund Eligibility &amp; Dispute Scenarios</h3>
            <p>
              Refund applications are evaluated under the following defined scenarios:
            </p>
            <ul className="policy-bullet-list">
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Duplicate or Double Deduction:</strong> If a technical glitch results in your account being
                  charged twice for a single renewal, the excess payment is refunded in full to your source account,
                  or adjusted as future credit upon your written preference.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Failed Transactions:</strong> If your bank account or wallet is debited but the payment
                  fails to reflect on our system, the payment gateway or bank will automatically reverse the sum within
                  <strong> 5 to 7 working days</strong> under standard RBI payment gateway settlement norms.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Non-Feasibility or Non-Activation:</strong> If a customer applies for a new connection, makes
                  an initial payment, and our technical survey finds the customer location outside feasible optical fiber
                  reach, <strong>100% of the advance amount will be refunded promptly</strong>.
                </span>
              </li>
              <li>
                <AlertCircle size={16} className="terms-alert-icon" />
                <span>
                  <strong>Active / Consumed Service:</strong> Pro-rata refunds are not applicable for a service period that
                  has already commenced, been activated, and utilized by the subscriber.
                </span>
              </li>
            </ul>

            <h3>3. Refund Settlement Timeline</h3>
            <div className="terms-notice-box timeline-box">
              <Clock size={24} />
              <div>
                <strong>Standard Processing Window:</strong>
                <p>
                  Approved refunds are processed by our accounts department within <strong>7 working days</strong>.
                  Once released, credit transfer to your bank account or card statement depends on standard banking clearing
                  cycles (typically 3 to 7 additional bank working days).
                </p>
              </div>
            </div>

            <h3>4. Step-by-Step: How to Claim a Refund</h3>
            <p>
              To expedite your claim, follow these simple steps:
            </p>
            <ol className="policy-steps-list">
              <li>
                <strong>Step 1:</strong> Note your <strong>Customer ID / Registered Mobile Number</strong> and the
                <strong> Payment Transaction Reference (UTR / Order ID)</strong> from your bank SMS or receipt.
              </li>
              <li>
                <strong>Step 2:</strong> Send an email to <code>manikantacablenet123@gmail.com</code> with the subject
                <em>&ldquo;Refund Request - [Your Customer ID]&rdquo;</em> or message our official WhatsApp desk.
              </li>
              <li>
                <strong>Step 3:</strong> Our billing desk will verify the gateway log and issue an official refund
                acknowledgement number within 24-48 business hours.
              </li>
            </ol>

            {/* DIRECT SUPPORT CARD */}
            <div className="refund-support-card">
              <h4>Billing &amp; Refund Assistance Helpdesk</h4>
              <p>
                Our billing specialists are available in Powerpet, Eluru to verify payment logs and resolve issues:
              </p>
              <div className="refund-contact-details">
                <div>
                  <strong>Phone / WhatsApp:</strong>
                  <span>+91 9133397709 / 08812-234567</span>
                </div>
                <div>
                  <strong>Official Email:</strong>
                  <span>manikantacablenet123@gmail.com</span>
                </div>
                <div>
                  <strong>Working Hours:</strong>
                  <span>Monday - Saturday: 9:00 AM - 8:00 PM</span>
                </div>
                <div>
                  <strong>Desk Address:</strong>
                  <span>22C-11-21, CHUNDURI VARI CHOULTRY, POWERPET, ELURU - 534002</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA BANNER */}
        <div className="terms-cta-banner">
          <div>
            <h3>Need Help With a Recent Transaction or Payment?</h3>
            <p>
              Our local customer desk in Eluru will verify your transaction status immediately.
            </p>
          </div>
          <div className="terms-cta-buttons">
            <Link to="/contact" className="sp-btn-primary">
              Contact Billing Desk <ArrowRight size={16} />
            </Link>
            <Link to="/shipping-policy" className="sp-btn-secondary">
              Delivery Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
