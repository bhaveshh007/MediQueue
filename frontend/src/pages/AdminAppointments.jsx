import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./admin.css";

function AdminAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const adminToken = sessionStorage.getItem("admin_token");

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }

    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/appointments/admin", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      setAppointments(response.appointments || []);
    } catch (err) {
      console.error("ADMIN APPOINTMENTS ERROR:", err);

      if (
        err.message?.toLowerCase().includes("unauthorized") ||
        err.message?.toLowerCase().includes("token")
      ) {
        sessionStorage.removeItem("admin_token");
        sessionStorage.removeItem("admin_data");
        navigate("/admin/login");
        return;
      }

      setError(err.message || "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId, newStatus) => {
    try {
      setError("");
      setSuccess("");

      await api.put(
        `/appointments/${appointmentId}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      setSuccess(
        `Appointment ${appointmentId} updated to ${formatStatus(
          newStatus
        )}.`
      );

      await loadAppointments();
    } catch (err) {
      console.error("UPDATE APPOINTMENT STATUS ERROR:", err);

      setError(
        err.message || "Unable to update appointment status."
      );
    }
  };

  const viewHistory = async (appointment) => {
    try {
      setError("");
      setSuccess("");
      setHistoryLoading(true);

      const response = await api.get(
        `/appointments/${appointment.appointment_id}/history`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      setSelectedAppointment(appointment);
      setHistory(response.history || []);
    } catch (err) {
      console.error("APPOINTMENT HISTORY ERROR:", err);

      setError(
        err.message || "Unable to load appointment history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const getNextStatus = (status) => {
    const nextStatuses = {
      BOOKED: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["WAITING", "CANCELLED"],
      WAITING: ["IN_PROGRESS"],
      IN_PROGRESS: ["COMPLETED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    return nextStatuses[status] || [];
  };

  const filteredAppointments =
    filterStatus === "ALL"
      ? appointments
      : appointments.filter(
          (appointment) => appointment.status === filterStatus
        );

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "-";

    const cleanTime = time.substring(0, 5);
    const [hours, minutes] = cleanTime.split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatStatus = (status) => {
    return status
      ?.toLowerCase()
      .split("_")
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "BOOKED":
        return (
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        );

      case "CONFIRMED":
        return (
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        );

      case "WAITING":
        return (
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        );

      case "IN_PROGRESS":
        return (
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M10 8l6 4-6 4V8Z" />
          </svg>
        );

      case "COMPLETED":
        return (
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m8 12 2.5 2.5L16 9" />
          </svg>
        );

      case "CANCELLED":
        return (
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m9 9 6 6M15 9l-6 6" />
          </svg>
        );

      default:
        return null;
    }
  };

  const getActionLabel = (status) => {
    const labels = {
      CONFIRMED: "Confirm",
      WAITING: "Waiting",
      IN_PROGRESS: "Start",
      COMPLETED: "Complete",
      CANCELLED: "Cancel",
    };

    return labels[status] || formatStatus(status);
  };

  const getActionClass = (status) => {
    if (status === "CANCELLED") {
      return "appointment-action-button danger";
    }

    if (status === "COMPLETED") {
      return "appointment-action-button success";
    }

    if (status === "IN_PROGRESS") {
      return "appointment-action-button primary";
    }

    if (status === "CONFIRMED") {
      return "appointment-action-button confirm";
    }

    return "appointment-action-button";
  };

  const stats = {
    total: appointments.length,
    booked: appointments.filter(
      (item) => item.status === "BOOKED"
    ).length,
    confirmed: appointments.filter(
      (item) => item.status === "CONFIRMED"
    ).length,
    waiting: appointments.filter(
      (item) => item.status === "WAITING"
    ).length,
    inProgress: appointments.filter(
      (item) => item.status === "IN_PROGRESS"
    ).length,
    completed: appointments.filter(
      (item) => item.status === "COMPLETED"
    ).length,
  };

  return (
    <div className="admin-page appointments-page">

      {/* PAGE HEADER */}
      <div className="admin-header appointments-header">

        <div className="admin-title-section">

          <div className="admin-title-icon">
            <svg
              viewBox="0 0 24 24"
              width="25"
              height="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="4" width="18" height="17" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
              <path d="M8 14h2M14 14h2M8 18h2M14 18h2" />
            </svg>
          </div>

          <div>
            <h1>Appointment Management</h1>
            <p>
              Manage, monitor and update patient appointments.
            </p>
          </div>

        </div>

        <div className="admin-header-actions">

          <button
            type="button"
            className="admin-action-button secondary"
            onClick={loadAppointments}
            disabled={loading}
          >
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 11a8.1 8.1 0 0 0-15.5-3M4 5v4h4" />
              <path d="M4 13a8.1 8.1 0 0 0 15.5 3M20 19v-4h-4" />
            </svg>
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            className="admin-action-button"
            onClick={() => navigate("/admin/dashboard")}
          >
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>

        </div>

      </div>

      {/* ALERTS */}
      {success && (
        <div className="admin-success appointment-alert">

          <svg
            viewBox="0 0 24 24"
            width="19"
            height="19"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m8 12 2.5 2.5L16 9" />
          </svg>

          <span>{success}</span>

        </div>
      )}

      {error && (
        <div className="admin-error appointment-alert">

          <svg
            viewBox="0 0 24 24"
            width="19"
            height="19"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m9 9 6 6M15 9l-6 6" />
          </svg>

          <span>{error}</span>

        </div>
      )}

      {/* SUMMARY STATS */}
      <div className="appointment-stat-grid">

        <div className="appointment-stat-card">

          <div className="appointment-stat-icon blue">
            <svg
              viewBox="0 0 24 24"
              width="21"
              height="21"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="4" width="18" height="17" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>

          <div>
            <span>Total</span>
            <strong>{stats.total}</strong>
          </div>

        </div>

        <div className="appointment-stat-card">

          <div className="appointment-stat-icon amber">
            <svg
              viewBox="0 0 24 24"
              width="21"
              height="21"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </div>

          <div>
            <span>Booked</span>
            <strong>{stats.booked}</strong>
          </div>

        </div>

        <div className="appointment-stat-card">

          <div className="appointment-stat-icon teal">
            <svg
              viewBox="0 0 24 24"
              width="21"
              height="21"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="m8 12 2.5 2.5L16 9" />
            </svg>
          </div>

          <div>
            <span>Confirmed</span>
            <strong>{stats.confirmed}</strong>
          </div>

        </div>

        <div className="appointment-stat-card">

          <div className="appointment-stat-icon orange">
            <svg
              viewBox="0 0 24 24"
              width="21"
              height="21"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </div>

          <div>
            <span>Waiting</span>
            <strong>{stats.waiting}</strong>
          </div>

        </div>

        <div className="appointment-stat-card">

          <div className="appointment-stat-icon purple">
            <svg
              viewBox="0 0 24 24"
              width="21"
              height="21"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M10 8l6 4-6 4V8Z" />
            </svg>
          </div>

          <div>
            <span>In Progress</span>
            <strong>{stats.inProgress}</strong>
          </div>

        </div>

        <div className="appointment-stat-card">

          <div className="appointment-stat-icon green">
            <svg
              viewBox="0 0 24 24"
              width="21"
              height="21"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="m8 12 2.5 2.5L16 9" />
            </svg>
          </div>

          <div>
            <span>Completed</span>
            <strong>{stats.completed}</strong>
          </div>

        </div>

      </div>

      {/* MAIN APPOINTMENT CARD */}
      <div className="admin-card appointments-main-card">

        <div className="admin-card-header appointments-card-header">

          <div>
            <div className="section-heading-row">

              <div className="section-heading-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="19"
                  height="19"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>

              <h2>All Appointments</h2>

            </div>

            <p>
              Showing {filteredAppointments.length} of{" "}
              {appointments.length} appointments
            </p>
          </div>

          <div className="admin-filter appointment-filter">

            <label htmlFor="appointment-status-filter">
              Filter by status
            </label>

            <div className="filter-select-wrapper">

              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>

              <select
                id="appointment-status-filter"
                value={filterStatus}
                onChange={(event) =>
                  setFilterStatus(event.target.value)
                }
              >
                <option value="ALL">All Appointments</option>
                <option value="BOOKED">Booked</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="WAITING">Waiting</option>
                <option value="IN_PROGRESS">
                  In Progress
                </option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

            </div>

          </div>

        </div>

        {loading ? (
          <div className="admin-loading appointment-loading">

            <div className="admin-spinner"></div>

            <strong>Loading appointments</strong>

            <span>
              Please wait while appointment records are loaded.
            </span>

          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="admin-empty appointment-empty">

            <div className="appointment-empty-icon">
              <svg
                viewBox="0 0 24 24"
                width="34"
                height="34"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>

            <h3>No appointments found</h3>

            <p>
              There are no appointments matching the selected
              status filter.
            </p>

          </div>
        ) : (
          <div className="admin-table-wrapper appointments-table-wrapper">

            <table className="admin-table appointments-table">

              <thead>
                <tr>
                  <th>Appointment</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredAppointments.map((appointment) => {

                  const nextStatuses = getNextStatus(
                    appointment.status
                  );

                  return (
                    <tr
                      key={appointment.appointment_id}
                    >

                      <td>
                        <div className="appointment-id-cell">

                          <div className="appointment-id-icon">
                            <svg
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <rect
                                x="3"
                                y="4"
                                width="18"
                                height="17"
                                rx="2"
                              />
                              <path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                          </div>

                          <strong>
                            {appointment.appointment_id}
                          </strong>

                        </div>
                      </td>

                      <td>
                        <div className="appointment-person-cell">

                          <div className="appointment-avatar patient">
                            {appointment.patient_name
                              ?.charAt(0)
                              ?.toUpperCase() || "P"}
                          </div>

                          <div>
                            <strong>
                              {appointment.patient_name}
                            </strong>

                            <small>
                              {appointment.patient_mobile}
                            </small>
                          </div>

                        </div>
                      </td>

                      <td>
                        <div className="appointment-person-cell">

                          <div className="appointment-avatar doctor">
                            <svg
                              viewBox="0 0 24 24"
                              width="17"
                              height="17"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <circle cx="12" cy="7" r="3" />
                              <path d="M5 21a7 7 0 0 1 14 0" />
                            </svg>
                          </div>

                          <div>
                            <strong>
                              Dr. {appointment.doctor_name}
                            </strong>

                            <small>
                              {appointment.specialization}
                            </small>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="appointment-department">
                          {appointment.department_name || "-"}
                        </span>
                      </td>

                      <td>
                        <span className="appointment-date">
                          {formatDate(
                            appointment.appointment_date
                          )}
                        </span>
                      </td>

                      <td>
                        <span className="appointment-time">
                          {formatTime(
                            appointment.appointment_time
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`appointment-status status-${appointment.status.toLowerCase()}`}
                        >
                          {getStatusIcon(appointment.status)}
                          {formatStatus(appointment.status)}
                        </span>
                      </td>

                      <td>

                        <div className="appointment-actions">

                          <button
                            type="button"
                            className="appointment-view-button"
                            onClick={() =>
                              viewHistory(appointment)
                            }
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="15"
                              height="15"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                              <circle cx="12" cy="12" r="2.5" />
                            </svg>
                            View
                          </button>

                          {nextStatuses.map((status) => (
                            <button
                              type="button"
                              key={status}
                              className={getActionClass(status)}
                              onClick={() =>
                                updateStatus(
                                  appointment.appointment_id,
                                  status
                                )
                              }
                            >
                              {getStatusIcon(status)}
                              {getActionLabel(status)}
                            </button>
                          ))}

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* APPOINTMENT DETAILS MODAL */}
      {selectedAppointment && (
        <div
          className="appointment-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedAppointment(null);
            }
          }}
        >

          <div className="appointment-modal">

            <div className="appointment-modal-header">

              <div className="modal-title-group">

                <div className="modal-title-icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="17"
                      rx="2"
                    />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>

                <div>
                  <h2>Appointment Details</h2>

                  <p>
                    {selectedAppointment.appointment_id}
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={() =>
                  setSelectedAppointment(null)
                }
                aria-label="Close appointment details"
              >
                ×
              </button>

            </div>

            <div className="appointment-modal-status">

              <span>Current status</span>

              <span
                className={`appointment-status status-${selectedAppointment.status.toLowerCase()}`}
              >
                {getStatusIcon(selectedAppointment.status)}
                {formatStatus(selectedAppointment.status)}
              </span>

            </div>

            <div className="appointment-details-section">

              <div className="modal-section-title">
                <span className="modal-section-line"></span>
                <h3>Appointment Information</h3>
              </div>

              <div className="appointment-details-grid">

                <div className="appointment-detail-item">
                  <strong>Patient</strong>
                  <span>
                    {selectedAppointment.patient_name}
                  </span>
                </div>

                <div className="appointment-detail-item">
                  <strong>Mobile</strong>
                  <span>
                    {selectedAppointment.patient_mobile}
                  </span>
                </div>

                <div className="appointment-detail-item">
                  <strong>Doctor</strong>
                  <span>
                    Dr. {selectedAppointment.doctor_name}
                  </span>
                </div>

                <div className="appointment-detail-item">
                  <strong>Specialization</strong>
                  <span>
                    {selectedAppointment.specialization}
                  </span>
                </div>

                <div className="appointment-detail-item">
                  <strong>Department</strong>
                  <span>
                    {selectedAppointment.department_name || "-"}
                  </span>
                </div>

                <div className="appointment-detail-item">
                  <strong>Date</strong>
                  <span>
                    {formatDate(
                      selectedAppointment.appointment_date
                    )}
                  </span>
                </div>

                <div className="appointment-detail-item">
                  <strong>Time</strong>
                  <span>
                    {formatTime(
                      selectedAppointment.appointment_time
                    )}
                  </span>
                </div>

                <div className="appointment-detail-item">
                  <strong>Appointment ID</strong>
                  <span>
                    {selectedAppointment.appointment_id}
                  </span>
                </div>

              </div>

            </div>

            <div className="appointment-history-section">

              <div className="modal-section-title">
                <span className="modal-section-line"></span>
                <h3>Status History</h3>
              </div>

              {historyLoading ? (
                <div className="history-loading">

                  <div className="admin-spinner"></div>

                  <span>Loading status history...</span>

                </div>
              ) : history.length === 0 ? (
                <div className="history-empty">

                  <svg
                    viewBox="0 0 24 24"
                    width="25"
                    height="25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>

                  <span>No status history available.</span>

                </div>
              ) : (
                <div className="history-list">

                  {history.map((item, index) => (
                    <div
                      className="history-item"
                      key={item.history_id}
                    >

                      <div className="history-timeline">

                        <div className="history-dot">
                          {index + 1}
                        </div>

                        {index !== history.length - 1 && (
                          <div className="history-line"></div>
                        )}

                      </div>

                      <div className="history-content">

                        <div className="history-status">

                          <span>
                            {formatStatus(
                              item.old_status || "NEW"
                            )}
                          </span>

                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M5 12h13M13 6l6 6-6 6" />
                          </svg>

                          <strong>
                            {formatStatus(item.new_status)}
                          </strong>

                        </div>

                        <div className="history-info">

                          <span>
                            Changed by: {item.changed_by}
                          </span>

                          {item.remark && (
                            <span>
                              Remark: {item.remark}
                            </span>
                          )}

                          <span>
                            {item.changed_at}
                          </span>

                        </div>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

            <div className="appointment-modal-footer">

              <button
                type="button"
                className="admin-action-button secondary"
                onClick={() =>
                  setSelectedAppointment(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminAppointments;