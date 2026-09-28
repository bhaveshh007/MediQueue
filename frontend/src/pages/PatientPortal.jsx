import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./patient.css";

function PatientPortal() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("home"); // "home" | "register" | "login"

  const [registerForm, setRegisterForm] = useState({
    name: "",
    mobile: "",
    email: "",
  });

  const [loginForm, setLoginForm] = useState({
    patient_id: "",
    mobile: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredPatient, setRegisteredPatient] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setError("");
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setError("");
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");

    if (!registerForm.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[0-9]{10}$/.test(registerForm.mobile)) {
      setError("Mobile number must contain exactly 10 digits.");
      return;
    }

    if (
      registerForm.email &&
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(registerForm.email)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/patients/register", {
        name: registerForm.name.trim(),
        mobile: registerForm.mobile.trim(),
        email: registerForm.email.trim(),
      });

      setRegisteredPatient(response.patient);
      // Pre-fill the login form with newly generated credentials for seamless follow-through
      setLoginForm({
        patient_id: response.patient.patient_id,
        mobile: registerForm.mobile.trim(),
      });
      setMode("home");
    } catch (err) {
      setError(err.message || "Failed to register patient profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePatientLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!loginForm.patient_id.trim()) {
      setError("Please enter your Patient ID.");
      return;
    }

    if (!/^[0-9]{10,15}$/.test(loginForm.mobile)) {
      setError("Mobile number must contain 10 to 15 digits.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/patients/verify", {
        patient_id: loginForm.patient_id.trim().toUpperCase(),
        mobile: loginForm.mobile.trim(),
      });

      // Store authentication data needed by patient session
      sessionStorage.setItem("patient_token", response.token);
      sessionStorage.setItem("patient_data", JSON.stringify(response.patient));

      navigate("/patient/dashboard");
    } catch (err) {
      setError(err.message || "Unable to verify credentials. Please check your Patient ID and Mobile number.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPatientId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetPortal = () => {
    setMode("home");
    setError("");
    setRegisteredPatient(null);
    setCopied(false);

    setRegisterForm({
      name: "",
      mobile: "",
      email: "",
    });

    setLoginForm({
      patient_id: "",
      mobile: "",
    });
  };

  return (
    <div className="patient-page">
      {/* Top Navigation */}
      <header className="patient-header">
        <Link to="/" className="patient-brand">
          <div className="patient-brand-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6v12M6 12h12" />
              <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.4" />
            </svg>
          </div>
          <div className="patient-brand-text">
            <strong>Medi<span className="brand-highlight">Queue</span></strong>
            <span className="patient-brand-tagline">Smart Healthcare System</span>
          </div>
        </Link>

        <Link to="/" className="back-home-link">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Home
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="patient-main">
        {/* Left Side: Healthcare Intro */}
        <section className="patient-intro">
          <div className="patient-badge">
            <span className="pulse-indicator"></span>
            PATIENT ACCESS PORTAL
          </div>

          <h1>
            Your Healthcare Journey,
            <span className="gradient-highlight"> Simplified.</span>
          </h1>

          <p className="patient-intro-text">
            Access certified doctor schedules, book exact consultation slots, and track your live queue token from anywhere without waiting in crowded clinic lobbies.
          </p>

          <div className="patient-benefits">
            <div className="benefit-item">
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
              <div className="benefit-text">
                <strong>Fast Self-Service Access</strong>
                <span>Generate a unique Patient ID or verify with your mobile number</span>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="benefit-text">
                <strong>Live Queue & Token Status</strong>
                <span>Know exactly how many patients are ahead and your estimated wait</span>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="benefit-text">
                <strong>Secure Patient Privacy</strong>
                <span>Protected by JWT session authentication and encrypted parameters</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Access Card */}
        <section className="patient-access-card">

          {/* MODE: HOME (Selection) */}
          {mode === "home" && !registeredPatient && (
            <div className="access-card-content">
              <div className="access-card-header">
                <div className="access-icon-badge">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <span className="access-card-eyebrow">PATIENT IDENTIFICATION</span>
                  <h2>Choose Access Mode</h2>
                </div>
              </div>

              <p className="access-card-subtitle">
                Please select how you would like to proceed with your MediQueue patient portal.
              </p>

              <div className="access-options">
                <button
                  type="button"
                  className="access-option-card"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                >
                  <div className="option-icon-box new-patient-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                  </div>

                  <div className="option-info">
                    <strong>New Patient</strong>
                    <span>Register profile and generate your unique Patient ID</span>
                  </div>

                  <span className="option-arrow">→</span>
                </button>

                <button
                  type="button"
                  className="access-option-card"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                >
                  <div className="option-icon-box returning-patient-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>

                  <div className="option-info">
                    <strong>Returning Patient</strong>
                    <span>Verify with your Patient ID and registered mobile number</span>
                  </div>

                  <span className="option-arrow">→</span>
                </button>
              </div>

              {error && (
                <div className="alert alert-error">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="portal-security-footer">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <p>
                  No password required. Authentication uses verified Patient ID + Mobile credentials.
                </p>
              </div>
            </div>
          )}

          {/* MODE: REGISTER */}
          {mode === "register" && !registeredPatient && (
            <form className="patient-form" onSubmit={handleRegister}>
              <button
                type="button"
                className="form-back-btn"
                onClick={resetPortal}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back to options
              </button>

              <div className="access-card-header">
                <div className="access-icon-badge">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </div>
                <div>
                  <span className="access-card-eyebrow">NEW REGISTRATION</span>
                  <h2>Create Patient Profile</h2>
                </div>
              </div>

              <p className="access-card-subtitle">
                Enter your details to generate your unique MediQueue Patient ID.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    className="form-control"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    placeholder="e.g. John Doe"
                    maxLength="100"
                    autoComplete="name"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-with-counter">
                  <label className="form-label" htmlFor="mobile">
                    Mobile Number <span className="required">*</span>
                  </label>
                  <span className={`char-counter ${registerForm.mobile.length === 10 ? "valid" : ""}`}>
                    {registerForm.mobile.length}/10 digits
                  </span>
                </div>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <input
                    id="mobile"
                    type="tel"
                    name="mobile"
                    className="form-control"
                    value={registerForm.mobile}
                    onChange={(event) =>
                      setRegisterForm((previous) => ({
                        ...previous,
                        mobile: event.target.value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                    autoComplete="tel"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address <span className="optional-tag">(Optional)</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="form-control"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    placeholder="e.g. name@domain.com"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner spinner-sm"></span>
                    Creating Profile...
                  </>
                ) : (
                  <>
                    Register Patient
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              <div className="portal-security-footer">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <p>Profile information is safely recorded in the private MediQueue database.</p>
              </div>
            </form>
          )}

          {/* MODE: REGISTRATION SUCCESS */}
          {mode === "home" && registeredPatient && (
            <div className="registration-success-card">
              <div className="success-icon-badge">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <span className="badge badge-completed">REGISTRATION SUCCESSFUL</span>

              <h2>Welcome, {registeredPatient.name}!</h2>
              <p className="success-desc">
                Your MediQueue patient account has been created. Use the generated Patient ID below to access your appointments and live queues.
              </p>

              <div className="patient-id-display-box">
                <span className="id-box-label">OFFICIAL PATIENT ID</span>
                <div className="id-row">
                  <strong className="id-code">{registeredPatient.patient_id}</strong>
                  <button
                    type="button"
                    className="copy-id-btn"
                    onClick={() => handleCopyPatientId(registeredPatient.patient_id)}
                    title="Copy Patient ID"
                  >
                    {copied ? (
                      <>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy ID
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="alert alert-warning note-box">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <strong>Important: Save your Patient ID</strong>
                  <p>You will need this Patient ID together with your mobile number whenever accessing the portal.</p>
                </div>
              </div>

              <div className="success-action-group">
                <button
                  type="button"
                  className="btn btn-primary btn-lg submit-btn"
                  onClick={() => {
                    setRegisteredPatient(null);
                    setMode("login");
                  }}
                >
                  Proceed to Verify & Enter Portal
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="btn btn-outline btn-sm reset-link-btn"
                  onClick={resetPortal}
                >
                  Return to Portal Home
                </button>
              </div>
            </div>
          )}

          {/* MODE: LOGIN (RETURNING PATIENT VERIFICATION) */}
          {mode === "login" && (
            <form className="patient-form" onSubmit={handlePatientLogin}>
              <button
                type="button"
                className="form-back-btn"
                onClick={resetPortal}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back to options
              </button>

              <div className="access-card-header">
                <div className="access-icon-badge">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <span className="access-card-eyebrow">RETURNING PATIENT</span>
                  <h2>Secure Verification</h2>
                </div>
              </div>

              <p className="access-card-subtitle">
                Enter your Patient ID and registered mobile number to access your appointments and live queue.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="patient_id">
                  Patient ID <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </span>
                  <input
                    id="patient_id"
                    type="text"
                    name="patient_id"
                    className="form-control"
                    value={loginForm.patient_id}
                    onChange={handleLoginChange}
                    placeholder="e.g. PAT-A1B2C3D4"
                    maxLength="25"
                    autoComplete="off"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-with-counter">
                  <label className="form-label" htmlFor="login_mobile">
                    Registered Mobile Number <span className="required">*</span>
                  </label>
                  <span className={`char-counter ${loginForm.mobile.length >= 10 ? "valid" : ""}`}>
                    {loginForm.mobile.length} digits
                  </span>
                </div>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <input
                    id="login_mobile"
                    type="tel"
                    name="mobile"
                    className="form-control"
                    value={loginForm.mobile}
                    onChange={(event) =>
                      setLoginForm((previous) => ({
                        ...previous,
                        mobile: event.target.value.replace(/\D/g, "").slice(0, 15),
                      }))
                    }
                    placeholder="Enter registered mobile number"
                    maxLength="15"
                    autoComplete="tel"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner spinner-sm"></span>
                    Verifying Credentials...
                  </>
                ) : (
                  <>
                    Verify & Access Dashboard
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              <div className="portal-security-footer">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <p>Authentication token is securely created with a 30-minute validity.</p>
              </div>
            </form>
          )}

        </section>
      </main>

      {/* Clean Portal Footer */}
      <footer className="patient-portal-footer">
        <div className="footer-content">
          <strong>MediQueue</strong>
          <span>Smart Healthcare Queue & Appointment System</span>
        </div>
      </footer>
    </div>
  );
}

export default PatientPortal;