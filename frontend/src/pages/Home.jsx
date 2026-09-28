import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";
import { Link } from "react-router-dom";
import "./home.css";

function Home() {
  return (
    <div className="home-page">
      <Navbar />

      <main>
        <Hero />

        {/* Live Hospital Metrics Banner */}
        <section className="stats-banner">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-number">15 min</span>
                <span className="stat-label">Average Consultation Time</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">100%</span>
                <span className="stat-label">Real-Time Queue Sync</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">0 Lines</span>
                <span className="stat-label">Physical Waiting Overcrowd</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">AWS Cloud</span>
                <span className="stat-label">High-Reliability Architecture</span>
              </div>
            </div>
          </div>
        </section>

        {/* Services & Capabilities Section */}
        <section id="services" className="services-section">
          <div className="container">
            <div className="section-heading centered">
              <span className="section-eyebrow">SMART HEALTHCARE PLATFORM</span>
              <h2>Comprehensive Queue & Appointment Management</h2>
              <p>
                MediQueue unifies patient self-service booking, dynamic time-slot scheduling, and automated OPD queue coordination into one dependable platform.
              </p>
            </div>

            <div className="features-grid">
              <FeatureCard
                icon={
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
                title="Easy Appointment Booking"
                description="Browse active medical departments and doctor schedules, then secure an exact consultation time slot in seconds."
                tag="Self-Service"
              />

              <FeatureCard
                icon={
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                }
                title="Smart Token & Queue Tracking"
                description="Automated token generation with live calculations of current serving token, patients ahead, and estimated wait duration."
                tag="Real-Time"
              />

              <FeatureCard
                icon={
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                }
                title="Secure Patient Access"
                description="Unique Patient ID verification paired with 10-digit mobile verification protects medical data and visit history."
                tag="Secure"
              />

              <FeatureCard
                icon={
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <polyline points="17 11 19 13 23 9" />
                  </svg>
                }
                title="Doctor & Department Directory"
                description="Complete visibility into departmental specialties, doctor status, working days, and slot configurations."
                tag="Hospital Ops"
              />

              <FeatureCard
                icon={
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                }
                title="Live Queue Lifecycle"
                description="Synchronized status progression: BOOKED → CONFIRMED → WAITING → IN_PROGRESS → COMPLETED."
                tag="Synced"
              />

              <FeatureCard
                icon={
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                }
                title="Administrative Reports & Audits"
                description="Consolidated overview of appointment volumes, department throughput, and consultation completion analytics."
                tag="Analytics"
              />
            </div>
          </div>
        </section>

        {/* Workflow Section (How It Works) */}
        <section id="how-it-works" className="workflow-section">
          <div className="container">
            <div className="section-heading centered">
              <span className="section-eyebrow">PATIENT EXPERIENCE</span>
              <h2>How MediQueue Works in 4 Simple Steps</h2>
              <p>Designed to save patient time and reduce clinical waiting room congestion.</p>
            </div>

            <div className="workflow">
              <div className="workflow-step">
                <div className="step-number">01</div>
                <h3>Register or Verify</h3>
                <p>Register as a new patient or enter your Patient ID and registered mobile number.</p>
              </div>

              <div className="workflow-line"></div>

              <div className="workflow-step">
                <div className="step-number">02</div>
                <h3>Choose Doctor & Slot</h3>
                <p>Select your preferred department, doctor, and convenient consultation time slot.</p>
              </div>

              <div className="workflow-line"></div>

              <div className="workflow-step">
                <div className="step-number">03</div>
                <h3>Get Live Token</h3>
                <p>Receive your automated token and track real-time queue movement from anywhere.</p>
              </div>

              <div className="workflow-line"></div>

              <div className="workflow-step">
                <div className="step-number">04</div>
                <h3>Attend Consultation</h3>
                <p>Arrive when called and complete your consultation without sitting in long lines.</p>
              </div>
            </div>

            <div className="workflow-cta text-center">
              <Link to="/patient" className="btn btn-primary btn-lg">
                Start by Booking an Appointment
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about-section">
          <div className="container">
            <div className="about-grid">
              <div className="about-text-col">
                <span className="section-eyebrow">ABOUT MEDIQUEUE</span>
                <h2>Transforming Healthcare Facility Operations</h2>
                <p>
                  MediQueue was architected to bridge the gap between patient expectations and busy clinical workflows. By converting manual paper queues and crowded waiting rooms into a synchronized digital queue, healthcare providers can improve patient satisfaction and optimize staff scheduling.
                </p>
                <div className="about-features-list">
                  <div className="about-feature-item">
                    <span className="about-check">✓</span>
                    <span>No unorganized waiting lines — live token notifications keep patients informed.</span>
                  </div>
                  <div className="about-feature-item">
                    <span className="about-check">✓</span>
                    <span>Secure role-based access for both patients and healthcare administrators.</span>
                  </div>
                  <div className="about-feature-item">
                    <span className="about-check">✓</span>
                    <span>Enterprise AWS deployment with ALB, EC2, and private RDS MySQL.</span>
                  </div>
                </div>
              </div>

              <div className="about-card-col">
                <div className="security-card">
                  <div className="security-icon">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <h3>Enterprise Security Hardening</h3>
                  <p>
                    Strict JWT authentication, parameter validation, private RDS subnets, and CORS restrictions protect all patient appointment records.
                  </p>
                  <div className="security-badge-row">
                    <span className="badge badge-confirmed">JWT Protected</span>
                    <span className="badge badge-booked">AWS ALB</span>
                    <span className="badge badge-active">MySQL RDS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Medical Footer */}
      <footer className="footer">
        <div className="container footer-container">
          <div className="footer-brand-col">
            <div className="brand footer-brand">
              <div className="brand-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 6v12M6 12h12" />
                  <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.4" />
                </svg>
              </div>
              <div className="brand-text">
                <strong className="text-white">Medi<span className="brand-highlight">Queue</span></strong>
                <span className="brand-tagline">Smart Healthcare System</span>
              </div>
            </div>
            <p className="footer-desc">
              Smart healthcare appointment and live queue management system built for high-throughput OPD clinics and hospital facilities.
            </p>
          </div>

          <div className="footer-links-col">
            <h4>Quick Links</h4>
            <div className="footer-links-list">
              <Link to="/patient">Patient Portal</Link>
              <Link to="/admin/login">Admin Login</Link>
              <a href="/#services">Services</a>
              <a href="/#how-it-works">How It Works</a>
            </div>
          </div>

          <div className="footer-system-col">
            <h4>Cloud Architecture</h4>
            <div className="footer-status-pill">
              <span className="status-dot"></span>
              <span>API Gateway: Healthy</span>
            </div>
            <p className="footer-cloud-meta">AWS EC2 • RDS MySQL • ALB • S3</p>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <p>© {new Date().getFullYear()} MediQueue. Smart Healthcare Queue & Appointment System.</p>
            <div className="footer-bottom-links">
              <span>Privacy & Security</span>
              <span>•</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;