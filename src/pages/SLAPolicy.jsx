import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wifi,
  Activity,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Headphones,
  Sparkles,
  ArrowRight,
  Server,
  Layers,
} from "lucide-react";
import PolicyNav from "../components/PolicyNav";
import "./Terms.css";

export default function SLAPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Network SLA & FUP Standards | GSR Broadband Eluru";
  }, []);

  return (
    <div className="terms-page">
      {/* HERO SECTION */}
      <section className="terms-hero">
        <div className="terms-hero-badge">
          <Sparkles size={14} />
          NETWORK PERFORMANCE, UPTIME &amp; COMPLIANCE
        </div>
        <h1>
          Service Level Agreement <span>&amp; FUP</span>
        </h1>
        <p>
          Uptime commitments, speed integrity, and fair usage network standards powering{" "}
          <strong>GSR Broadband</strong> Gigabit fiber connectivity in Eluru.
        </p>
        <div className="terms-meta-info">
          <span>Target Network Uptime: 99.9%</span>
          <span>•</span>
          <span>Peering: RailWire &amp; BSNL Fiber Backbone</span>
          <span>•</span>
          <span>Turnaround: 2-4 Hours On-Ground Resolution</span>
        </div>
      </section>

      {/* POLICY CONTAINER */}
      <div className="terms-container">
        <PolicyNav activeKey="sla" title="SLA & FUP Standards" />

        <div className="terms-content-card">
          <div className="terms-section-block">
            <div className="policy-header-badge">
              <span className="badge-company">GSR BROADBAND</span>
              <span className="badge-tag">Network Reliability Standards</span>
            </div>

            <h2>Service Level Agreement (SLA) &amp; Fair Usage Policy</h2>
            <p className="policy-lead-text">
              <strong>GSR Broadband</strong> is built on an enterprise-grade pure optical fiber architecture.
              Our Service Level Agreement outlines our guaranteed commitments regarding uptime, throughput delivery,
              packet latency, and on-ground fault rectification for both residential and commercial subscribers.
            </p>

            {/* SLA PILLARS */}
            <div className="policy-highlights-grid">
              <div className="policy-highlight-card">
                <Activity size={20} className="highlight-icon" />
                <h4>99.9% Network Uptime</h4>
                <p>Dual-redundant upstream loops ensure virtually uninterrupted 24/7 internet connectivity.</p>
              </div>
              <div className="policy-highlight-card">
                <Zap size={20} className="highlight-icon" />
                <h4>Symmetric 1:1 Bandwidth</h4>
                <p>Equal upload and download speeds designed for heavy video calls, streaming, and gaming.</p>
              </div>
              <div className="policy-highlight-card">
                <Clock size={20} className="highlight-icon" />
                <h4>2-4 Hr Doorstep Response</h4>
                <p>Local field engineers stationed across Eluru for swift on-site fiber cut restoration.</p>
              </div>
            </div>

            <h3>1. 99.9% Uptime Commitment &amp; Tier-1 Upstream Peering</h3>
            <p>
              Our fiber infrastructure maintains high availability through direct peering with India&apos;s leading national
              telecommunication and railway network providers:
            </p>
            <ul className="policy-bullet-list">
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>RailWire Express Network:</strong> Powered by RailTel Corporation of India over 61,000+ KM
                  of nationwide optical fiber routing, ensuring ultra-low ping and direct peering.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>BSNL Bharat Fiber:</strong> National telecom backbone integration delivering pan-India routing
                  and direct NIXI (National Internet Exchange of India) interconnects.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>PolFiberNet &amp; Mani Kanta Star:</strong> High-bandwidth local distribution loops and pure
                  digital cable TV headends in West Godavari.
                </span>
              </li>
            </ul>

            <h3>2. Truly Unlimited Broadband (Zero Daily Throttling)</h3>
            <p>
              Unlike legacy mobile broadband or restricted connections:
            </p>
            <ul className="policy-bullet-list">
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>No Daily Data Caps:</strong> Our residential fiber packages are truly unlimited with no artificial
                  daily reset quotas (e.g. no 2GB/day or 5GB/day throttles).
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} className="terms-check-icon" />
                <span>
                  <strong>Unrestricted Streaming &amp; Gaming:</strong> Optimized traffic paths for YouTube, Netflix, Hotstar,
                  Prime Video, and online gaming servers to maintain low jitter and zero buffering.
                </span>
              </li>
            </ul>

            <h3>3. Fair Usage Policy (FUP) &amp; Commercial Safeguards</h3>
            <p>
              To maintain optimal quality of service for all users across the shared optical neighborhood node:
            </p>
            <ul className="policy-bullet-list">
              <li>
                <AlertCircle size={16} className="terms-alert-icon" />
                <span>
                  <strong>Lawful Use Only:</strong> Residential connections are intended for legitimate household entertainment,
                  remote work, and family use. Unauthorized commercial resale or ISP re-distribution is strictly forbidden.
                </span>
              </li>
              <li>
                <AlertCircle size={16} className="terms-alert-icon" />
                <span>
                  <strong>Anti-Abuse Safeguards:</strong> Activities that severely compromise network security (such as running
                  unauthorized public open proxies, launching DDoS attacks, or spreading malware) are subject to automated port
                  filtering or temporary circuit suspension.
                </span>
              </li>
            </ul>

            <h3>4. Fault Reporting &amp; Rapid Field Resolution Protocol</h3>
            <p>
              In the unlikely event of physical fiber severance caused by road works or hardware failure:
            </p>
            <div className="terms-support-grid">
              <div className="terms-support-box">
                <strong>First-Response Triage:</strong>
                <span>Within 15 to 30 Minutes</span>
              </div>
              <div className="terms-support-box">
                <strong>Field Technician Dispatch:</strong>
                <span>Within 1 to 2 Hours</span>
              </div>
              <div className="terms-support-box">
                <strong>Optical Splicing Target:</strong>
                <span>2 to 4 Working Hours</span>
              </div>
            </div>

            {/* HELPDESK HOURS & ESCALATION CARD */}
            <div className="refund-support-card">
              <h4>24/7 Network Operations &amp; Support Escalation</h4>
              <p>
                Our control room monitors fiber node signals continuously. Contact our helpline anytime:
              </p>
              <div className="refund-contact-details">
                <div>
                  <strong>NOC Helpdesk:</strong>
                  <span>+91 9133397709 / 08812-234567</span>
                </div>
                <div>
                  <strong>Support Hours:</strong>
                  <span>Mon - Sat: 9:00 AM - 8:00 PM | Sun: 10:00 AM - 5:00 PM</span>
                </div>
                <div>
                  <strong>Email Escalation:</strong>
                  <span>manikantacablenet123@gmail.com</span>
                </div>
                <div>
                  <strong>Control Station:</strong>
                  <span>22C-11-21, CHUNDURI VARI CHOULTRY, POWERPET, ELURU - 534002</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA BANNER */}
        <div className="terms-cta-banner">
          <div>
            <h3>Experience Guaranteed Gigabit Optical Speeds</h3>
            <p>
              Switch to GSR Broadband today and enjoy unmatched uptime, symmetric bandwidth, and prompt local support.
            </p>
          </div>
          <div className="terms-cta-buttons">
            <Link to="/book-connection" className="sp-btn-primary">
              Book Connection Now <ArrowRight size={16} />
            </Link>
            <Link to="/services" className="sp-btn-secondary">
              Explore Fiber Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
