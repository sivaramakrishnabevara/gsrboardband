import { useState } from "react";
import {
  MapPin,
  Mail,
  UserRound,
  Menu,
  X,
  Plus,
  ArrowRight,
  Camera,
} from "lucide-react";

import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const closeMenu = () => {
    setMobileOpen(false);
    setServicesOpen(false);
  };

  return (
    <header className="site-header">
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="top-info">
          <div className="top-item">
            <MapPin size={16} />
            <span>22C-11-21,CHUNDURI VARI CHOULTRY,
              POWERPET, ELURU, West Godavari,Andhra Pradesh, 534002</span>
          </div>

          <div className="top-divider"></div>

          <div className="top-item">
            <Mail size={16} />
            <span>manikantacablenet123@gmail.com</span>
          </div>
        </div>
        <Link to="/login" className="top-login">
          <UserRound size={17} />
          Login
        </Link>
      </div>

      {/* NAVBAR */}
      <nav className="navbar">
        <Link to="/" className="brand" onClick={closeMenu}>
          <img
            src={logo}
            alt="GSR Broadband"
            className="real-logo"
          />
        </Link>

        <div className="desktop-nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            HOME
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            ABOUT
          </NavLink>

          <div
            className="nav-dropdown-wrapper"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              className="nav-dropdown-button"
              onClick={() => setServicesOpen(!servicesOpen)}
            >
              SERVICES & PLANS
              <Plus size={16} />
            </button>

            {servicesOpen && (
              <div className="nav-dropdown">
                <Link to="/services#broadband" onClick={closeMenu}>
                  Broadband Plans
                </Link>

                <Link to="/services#tv" onClick={closeMenu}>
                  TV Plans
                </Link>

                <Link to="/services#ott" onClick={closeMenu}>
                  OTT Plans
                </Link>

                <Link to="/services#phone" onClick={closeMenu}>
                  Phone Services
                </Link>
              </div>
            )}
          </div>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            CONTACTS
          </NavLink>
        </div>

        <Link
          to="/book-connection"
          className="nav-book-button"
        >
          BOOK YOUR CONNECTION
          <ArrowRight size={18} />
        </Link>

        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={27} /> : <Menu size={27} />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={closeMenu}>
            HOME
          </Link>

          <Link to="/about" onClick={closeMenu}>
            ABOUT
          </Link>

          <Link to="/services" onClick={closeMenu}>
            SERVICES & PLANS
          </Link>

          <Link to="/contact" onClick={closeMenu}>
            CONTACTS
          </Link>

          <Link
            to="/book-connection"
            className="mobile-book"
            onClick={closeMenu}
          >
            BOOK YOUR CONNECTION
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/attendance"
            className="mobile-attendance"
            onClick={closeMenu}
          >
            <Camera size={17} />
            ATTENDANCE
          </Link>

          <Link
            to="/login"
            className="mobile-login"
            onClick={closeMenu}
          >
            <UserRound size={17} />
            LOGIN
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;