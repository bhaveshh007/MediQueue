
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./admin.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("admin_token");
  const adminData = sessionStorage.getItem("admin_data");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/reports/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(response.dashboard || response);
    } catch (err) {
      console.error("DASHBOARD ERROR:", err);

      if (
        err.message?.toLowerCase().includes("token") ||
        err.message?.toLowerCase().includes("unauthorized")
      ) {
        sessionStorage.removeItem("admin_token");
        sessionStorage.removeItem("admin_data");
        navigate("/admin/login");
        return;
      }

      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_data");
    navigate("/admin/login");
  };

  const admin = adminData ? JSON.parse(adminData) : null;

  const statCards = [
    {
      label: "Total Patients",
      value: stats?.total_patients ?? 0,
      type: "patients",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M16 21V19C16 16.791 14.209 15 12 15H6C3.791 15 2 16.791 2 19V21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle
            cx="9"
            cy="7"
            r="4"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M19 8V14M16 11H22"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: "Total Doctors",
      value: stats?.total_doctors ?? 0,
      type: "doctors",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <circle
            cx="9"
            cy="7"
            r="4"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M2 21C2 17.686 5.134 15 9 15C12.866 15 16 17.686 16 21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M19 8V14M16 11H22"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: "Departments",
      value: stats?.total_departments ?? 0,
      type: "departments",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M4 21V6.5L12 3L20 6.5V21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 21V16H15V21M8 9H8.01M12 9H12.01M16 9H16.01"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: "Total Appointments",
      value: stats?.total_appointments ?? 0,
      type: "appointments",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="5"
            width="18"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8 3V7M16 3V7M3 10H21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M8 14H8.01M12 14H12.01M16 14H16.01M8 18H8.01M12 18H12.01"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: "Completed",
      value: stats?.completed_appointments ?? 0,
      type: "completed",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8 12L10.7 14.7L16 9.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Pending",
      value: stats?.pending_appointments ?? 0,
      type: "pending",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M12 7V12L15 14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  const managementCards = [
    {
      title: "Doctors",
      description: "Add, edit and manage doctors.",
      className: "doctors",
      path: "/admin/doctors",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <circle
            cx="9"
            cy="7"
            r="4"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M2 21C2 17.686 5.134 15 9 15C12.866 15 16 17.686 16 21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M19 8V14M16 11H22"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      title: "Departments",
      description: "Manage hospital departments.",
      className: "departments",
      path: "/admin/departments",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M4 21V6.5L12 3L20 6.5V21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 21V16H15V21M8 9H8.01M12 9H12.01M16 9H16.01"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      title: "Appointments",
      description: "View and manage appointments.",
      className: "appointments",
      path: "/admin/appointments",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="5"
            width="18"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8 3V7M16 3V7M3 10H21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M8 14H8.01M12 14H12.01M16 14H16.01"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      title: "Queue Management",
      description: "Manage queues and call the next patient.",
      className: "queue",
      path: "/admin/queue",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M7 8H17M7 12H14M7 16H11"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M17 15L20 18L17 21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Reports & Analytics",
      description: "View appointment, department and doctor reports.",
      className: "reports",
      path: "/admin/reports",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M4 20V10M10 20V4M16 20V13M22 20V7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <div className="admin-dashboard-brand">
          <div className="admin-dashboard-logo" aria-hidden="true">
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
            <p>Administration Panel</p>
          </div>
        </div>

        <div className="admin-header-right">
          <div className="admin-user-info">
            <div className="admin-user-avatar" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="21"
                height="21"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M4 21C4 16.9 7.582 14 12 14C16.418 14 20 16.9 20 21"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <strong>{admin?.username || "Administrator"}</strong>
              <span>ADMIN</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={logout}
          >
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
            >
              <path
                d="M10 17L15 12L10 7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 12H3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M20 4V20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            Logout
          </button>
        </div>
      </header>

      <main className="admin-dashboard-content">
        <div className="admin-dashboard-title">
          <div>
            <span className="admin-section-label">
              SYSTEM OVERVIEW
            </span>

            <h2>Dashboard</h2>

            <p>
              Monitor MediQueue operations and healthcare appointments.
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={loadDashboard}
            disabled={loading}
          >
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              className={loading ? "admin-refresh-icon spinning" : ""}
            >
              <path
                d="M20 11A8.1 8.1 0 0 0 5.3 6.3L3 8.5M4 4V8.5H8.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 13A8.1 8.1 0 0 0 18.7 17.7L21 15.5M20 20V15.5H15.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="admin-dashboard-error" role="alert">
            <span>!</span>
            {error}
          </div>
        )}

        {loading ? (
          <div className="admin-loading-card">
            <div className="admin-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <div className="admin-stat-grid">
            {statCards.map((card) => (
              <div
                className={`admin-stat-card admin-stat-${card.type}`}
                key={card.label}
              >
                <div className="admin-stat-icon">
                  {card.icon}
                </div>

                <div className="admin-stat-content">
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                </div>
              </div>
            ))}
          </div>
        )}

        <section className="admin-management-section">
          <div className="admin-section-heading">
            <div>
              <span className="admin-section-label">
                MANAGEMENT
              </span>

              <h2>Administration</h2>

              <p>
                Manage the core MediQueue healthcare operations.
              </p>
            </div>
          </div>

          <div className="admin-management-grid">
            {managementCards.map((card) => (
              <button
                type="button"
                className={`admin-management-card ${card.className}`}
                key={card.title}
                onClick={() => navigate(card.path)}
              >
                <div className="management-icon">
                  {card.icon}
                </div>

                <div className="management-content">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>

                <span className="management-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="admin-system-section">
          <div>
            <span className="admin-section-label">
              SYSTEM STATUS
            </span>

            <h2>MediQueue Services</h2>
          </div>

          <div className="admin-system-status">
            <div className="admin-service-status">
              <span className="status-dot"></span>

              <div>
                <span>Backend API</span>
                <strong>Online</strong>
              </div>
            </div>

            <div className="admin-service-status">
              <span className="status-dot"></span>

              <div>
                <span>Database</span>
                <strong>Connected</strong>
              </div>
            </div>

            <div className="admin-service-status">
              <span className="status-dot"></span>

              <div>
                <span>Authentication</span>
                <strong>Active</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
