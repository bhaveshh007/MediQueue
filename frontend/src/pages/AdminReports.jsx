import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./admin.css";

function AdminReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState({
    appointment_status: [],
    department_report: [],
    doctor_report: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const adminToken = sessionStorage.getItem("admin_token");

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }

    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/reports/summary",
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      setReports(
        response.reports || {
          appointment_status: [],
          department_report: [],
          doctor_report: [],
        }
      );
    } catch (err) {
      console.error("REPORT ERROR:", err);

      setError(
        err.message ||
          "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "BOOKED":
        return "status-badge status-booked";

      case "CONFIRMED":
        return "status-badge status-confirmed";

      case "WAITING":
        return "status-badge status-waiting";

      case "IN_PROGRESS":
        return "status-badge status-progress";

      case "COMPLETED":
        return "status-badge status-completed";

      case "CANCELLED":
        return "status-badge status-cancelled";

      default:
        return "status-badge";
    }
  };

  const totalAppointments =
    reports.appointment_status.reduce(
      (sum, item) =>
        sum + Number(item.total || 0),
      0
    );

  return (
   <div className="admin-page reports-page">

      <div className="admin-header">

        <div>
          <h1>Reports & Analytics</h1>

          <p>
            View appointment and healthcare
            operations reports.
          </p>
        </div>

        <div className="admin-header-actions">

          <button
            className="secondary-button"
            onClick={loadReports}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            ← Dashboard
          </button>

        </div>

      </div>

      <div className="admin-content">

        {error && (
          <div className="alert error-alert">
            {error}
          </div>
        )}

        {loading ? (

          <div className="loading-state">
            Loading reports...
          </div>

        ) : (

          <>
            {/* =========================================
                REPORT OVERVIEW
            ========================================= */}

            <div className="report-overview-card">

              <div>
                <span>
                  TOTAL APPOINTMENTS
                </span>

                <strong>
                  {totalAppointments}
                </strong>
              </div>

              <div>
                <span>
                  STATUS TYPES
                </span>

                <strong>
                  {reports.appointment_status.length}
                </strong>
              </div>

              <div>
                <span>
                  DEPARTMENTS
                </span>

                <strong>
                  {reports.department_report.length}
                </strong>
              </div>

              <div>
                <span>
                  ACTIVE DOCTORS
                </span>

                <strong>
                  {reports.doctor_report.length}
                </strong>
              </div>

            </div>


            {/* =========================================
                APPOINTMENT STATUS
            ========================================= */}

            <div className="report-card">

              <div className="report-card-header">

                <div>
                  <h2>
                    Appointment Status
                  </h2>

                  <p>
                    Current appointment distribution.
                  </p>
                </div>

              </div>

              {reports.appointment_status.length ===
              0 ? (

                <div className="empty-state">
                  No appointment data available.
                </div>

              ) : (

                <div className="report-status-grid">

                  {reports.appointment_status.map(
                    (item) => (

                      <div
                        className="report-status-item"
                        key={item.status}
                      >

                        <span
                          className={getStatusClass(
                            item.status
                          )}
                        >
                          {item.status}
                        </span>

                        <strong>
                          {item.total}
                        </strong>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            {/* =========================================
                DEPARTMENT REPORT
            ========================================= */}

            <div className="report-card">

              <div className="report-card-header">

                <div>
                  <h2>
                    Department-wise Appointments
                  </h2>

                  <p>
                    Appointment distribution by
                    department.
                  </p>
                </div>

              </div>

              {reports.department_report.length ===
              0 ? (

                <div className="empty-state">
                  No department data available.
                </div>

              ) : (

                <div className="report-list">

                  {reports.department_report.map(
                    (item) => (

                      <div
                        className="report-list-item"
                        key={item.department_name}
                      >

                        <div>
                          <strong>
                            {item.department_name}
                          </strong>

                          <span>
                            Appointments
                          </span>
                        </div>

                        <strong className="report-number">
                          {item.total}
                        </strong>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            {/* =========================================
                DOCTOR REPORT
            ========================================= */}

            <div className="report-card">

              <div className="report-card-header">

                <div>
                  <h2>
                    Doctor-wise Appointments
                  </h2>

                  <p>
                    Appointment workload by doctor.
                  </p>
                </div>

              </div>

              {reports.doctor_report.length ===
              0 ? (

                <div className="empty-state">
                  No doctor data available.
                </div>

              ) : (

                <div className="table-wrapper">

                  <table className="admin-table">

                    <thead>
                      <tr>
                        <th>
                          Doctor
                        </th>

                        <th>
                          Specialization
                        </th>

                        <th>
                          Appointments
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {reports.doctor_report.map(
                        (doctor) => (

                          <tr
                            key={doctor.doctor_id}
                          >

                            <td>
                              <strong>
                                {doctor.doctor_name}
                              </strong>
                            </td>

                            <td>
                              {doctor.specialization}
                            </td>

                            <td>
                              <strong>
                                {doctor.total}
                              </strong>
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </>
        )}

      </div>

    </div>
  );
}

export default AdminReports;