import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand" onClick={closeMenu}>
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6v12M6 12h12" />
              <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.4" />
            </svg>
          </div>
          <div className="brand-text">
            <strong>Medi<span className="brand-highlight">Queue</span></strong>
            <span className="brand-tagline">Smart Healthcare System</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive("/") ? "active" : ""}`}
          >
            Home
          </Link>
          <a href="/#services" className="nav-link">
            Services
          </a>
          <a href="/#how-it-works" className="nav-link">
            How It Works
          </a>
          <Link 
            to="/patient" 
            className={`nav-link nav-patient-link ${isActive("/patient") ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Patient Portal
          </Link>
          <Link 
            to="/admin/login" 
            className="btn btn-outline btn-sm admin-link"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Admin Portal
          </Link>
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <button 
          className={`hamburger-btn ${mobileMenuOpen ? "open" : ""}`} 
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <nav className="mobile-nav-links">
          <Link 
            to="/" 
            className={`mobile-nav-link ${isActive("/") ? "active" : ""}`}
            onClick={closeMenu}
          >
            Home
          </Link>
          <a 
            href="/#services" 
            className="mobile-nav-link"
            onClick={closeMenu}
          >
            Services
          </a>
          <a 
            href="/#how-it-works" 
            className="mobile-nav-link"
            onClick={closeMenu}
          >
            How It Works
          </a>
          <Link 
            to="/patient" 
            className={`mobile-nav-link patient-mobile ${isActive("/patient") ? "active" : ""}`}
            onClick={closeMenu}
          >
            Patient Portal
          </Link>
          <div className="mobile-admin-wrap">
            <Link 
              to="/admin/login" 
              className="btn btn-primary mobile-admin-btn"
              onClick={closeMenu}
            >
              Admin Portal
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;