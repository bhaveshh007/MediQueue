import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="status-dot"></span>
          Smart Healthcare Queue & Appointment System
        </div>

        <h1>
          Smarter Healthcare.
          <span className="hero-gradient-text"> Simpler Queues.</span>
        </h1>

        <p className="hero-description">
          Book doctor appointments, manage your visits, and track your live queue position with instant token updates — designed for a stress-free hospital experience.
        </p>

        <div className="hero-actions">
          <Link to="/patient" className="btn btn-primary btn-lg hero-btn-primary">
            Book Appointment
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <Link to="/admin/login" className="btn btn-outline btn-lg hero-btn-secondary">
            Admin Portal
          </Link>
        </div>

        <div className="trust-row">
          <div className="trust-item">
            <div className="trust-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <strong>Instant</strong>
              <span>Queue Tokens</span>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <strong>Live</strong>
              <span>Wait Times</span>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <strong>Verified</strong>
              <span>Patient Access</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="medical-orbit orbit-one"></div>
        <div className="medical-orbit orbit-two"></div>

        {/* Main Live Queue Status Card */}
        <div className="medical-card main-medical-card">
          <div className="medical-card-header">
            <div className="clinic-info">
              <span className="clinic-dept">Cardiology OPD</span>
              <strong className="clinic-doctor">Dr. Sharma</strong>
            </div>
            <span className="live-label">
              <span className="pulse-indicator"></span> LIVE QUEUE
            </span>
          </div>

          <div className="token-display">
            <small>Currently Serving</small>
            <div className="token-number-wrap">
              <span className="token-prefix">Token</span>
              <strong className="token-number">A-08</strong>
            </div>
          </div>

          <div className="queue-details">
            <div className="queue-stat">
              <span>Patients Ahead</span>
              <strong>02</strong>
            </div>

            <div className="queue-stat">
              <span>Estimated Wait</span>
              <strong>~15 min</strong>
            </div>
          </div>

          <div className="queue-progress-bar">
            <div className="queue-progress-fill"></div>
          </div>

          <div className="queue-status-footer">
            <span className="queue-dot"></span>
            <span>Consultation in progress • On schedule</span>
          </div>
        </div>

        {/* Floating Confirmed Card */}
        <div className="floating-card appointment-floating">
          <div className="floating-icon check-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <strong>Appointment Confirmed</strong>
            <span>Today • 10:30 AM Slot</span>
          </div>
        </div>

        {/* Floating Token Ready Card */}
        <div className="floating-card secure-floating">
          <div className="floating-icon token-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <strong>Queue Position Synced</strong>
            <span>Token #A-09 is next</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;