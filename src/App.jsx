import { Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import BookConnection from "./pages/BookConnection";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Terms from "./pages/Terms";
import TermsConditions from "./pages/TermsConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import SLAPolicy from "./pages/SLAPolicy";

// Synchronous Protected Route (Prevents any UI blinking/flashing for unauthenticated users)
function ProtectedAdminRoute({ children }) {
  const isAdmin = typeof window !== "undefined" && sessionStorage.getItem("gsr_admin_logged_in") === "true";
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <div className="app">
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book-connection" element={<BookConnection />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedAdminRoute>
                <Dashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route path="/attendance" element={<Attendance />} />

          {/* Official Separate Policy & Legal Pages */}
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/terms-and-conditions" element={<TermsConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/cancellation-refund" element={<RefundPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/delivery-policy" element={<ShippingPolicy />} />
          <Route path="/sla" element={<SLAPolicy />} />
          <Route path="/sla-policy" element={<SLAPolicy />} />
          <Route path="/service-level-agreement" element={<SLAPolicy />} />
          
          {/* Unified Policy Hub */}
          <Route path="/policies" element={<Terms defaultTab="terms" />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;