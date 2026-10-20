import { Link } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  RotateCcw,
  Truck,
  Wifi,
  Printer,
  ChevronRight,
  Home,
} from "lucide-react";

export default function PolicyNav({ activeKey, title }) {
  const policies = [
    { key: "terms", name: "Terms & Conditions", path: "/terms", icon: FileText },
    { key: "privacy", name: "Privacy Policy", path: "/privacy-policy", icon: ShieldCheck },
    { key: "refund", name: "Refund & Cancellation", path: "/refund-policy", icon: RotateCcw },
    { key: "shipping", name: "Shipping & Delivery", path: "/shipping-policy", icon: Truck },
    { key: "sla", name: "SLA & FUP", path: "/sla-policy", icon: Wifi },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="policy-nav-wrapper">
      {/* Breadcrumb Strip */}
      <div className="policy-breadcrumbs-bar">
        <div className="policy-breadcrumbs">
          <Link to="/" className="breadcrumb-item">
            <Home size={14} />
            <span>Home</span>
          </Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <Link to="/policies" className="breadcrumb-item">
            <span>Policies</span>
          </Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-item active">{title}</span>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="policy-print-btn"
          title="Print or Save as PDF"
        >
          <Printer size={15} />
          <span>Print Policy</span>
        </button>
      </div>

      {/* Main Separate Pages Navigation Bar */}
      <nav className="terms-nav-tabs" aria-label="Policy Navigation">
        {policies.map((p) => {
          const Icon = p.icon;
          const isActive = activeKey === p.key;
          return (
            <Link
              key={p.key}
              to={p.path}
              className={`terms-tab-btn policy-nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{p.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
