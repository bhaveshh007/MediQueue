
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./admin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/admin/login", {
        username: username.trim(),
        password,
      });

      if (!response.token) {
        throw new Error("Login token was not received.");
      }

      sessionStorage.setItem("admin_token", response.token);

      if (response.admin) {
        sessionStorage.setItem(
          "admin_data",
          JSON.stringify(response.admin)
        );
      }

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("ADMIN LOGIN ERROR:", err);
      setError(err.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-background" aria-hidden="true">
        <div className="admin-glow admin-glow-one"></div>
        <div className="admin-glow admin-glow-two"></div>
      </div>

      <main className="admin-login-container">
        <div className="admin-login-brand">
          <div className="admin-brand-icon" aria-hidden="true">
            <svg
              viewBox="0 0 48 48"
              width="30"
              height="30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="5"
                y="5"
                width="38"
                height="38"
                rx="12"
                fill="currentColor"
              />
              <path
                d="M24 13V35M13 24H35"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <h1>MediQueue</h1>
            <p>Smart Healthcare System</p>
          </div>
        </div>

        <section className="admin-login-card">
          <div className="admin-login-heading">
            <span className="admin-login-badge">
              <span className="admin-badge-dot"></span>
              ADMIN PORTAL
            </span>

            <h2>Welcome Back</h2>

            <p>
              Sign in securely to manage patients, doctors,
              appointments and queues.
            </p>
          </div>

          <form onSubmit={handleLogin} noValidate>
            <div className="admin-form-group">
              <label htmlFor="admin-username">
                Username
              </label>

              <div className="admin-input-wrapper">
                <span className="admin-input-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="19"
                    height="19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 21C20 17.686 17.314 15 14 15H10C6.686 15 4 17.686 4 21"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>

                <input
                  id="admin-username"
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-password">
                Password
              </label>

              <div className="admin-input-wrapper">
                <span className="admin-input-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="19"
                    height="19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="10"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M8 10V7.5C8 5.015 9.791 3 12 3C14.209 3 16 5.015 16 7.5V10"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="12"
                      cy="15"
                      r="1.2"
                      fill="currentColor"
                    />
                  </svg>
                </span>

                <input
                  id="admin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div
                className="admin-login-error"
                role="alert"
              >
                <span aria-hidden="true">!</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="admin-login-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          <div className="admin-login-footer">
            <span className="admin-security-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 3L19 6V11.5C19 16.1 16.1 19.45 12 21C7.9 19.45 5 16.1 5 11.5V6L12 3Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.5 12L11.2 13.7L14.8 10.1"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <span>Secure administrator access</span>
          </div>
        </section>

        <button
          type="button"
          className="admin-back-button"
          onClick={() => navigate("/")}
        >
          <span aria-hidden="true">←</span>
          Back to MediQueue
        </button>

        <p className="admin-login-copyright">
          MediQueue • Smart Healthcare Queue Management
        </p>
      </main>
    </div>
  );
}

export default AdminLogin;
