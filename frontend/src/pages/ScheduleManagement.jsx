import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import "./admin.css";

function ScheduleManagement() {
  const navigate = useNavigate();
  const { doctorId } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [schedules, setSchedules] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [scheduleDate, setScheduleDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotDuration, setSlotDuration] = useState("15");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = sessionStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    loadData();
  }, [doctorId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const doctorResponse = await api.get("/doctors");

      const doctors = doctorResponse.doctors || [];

      const selectedDoctor = doctors.find(
        (item) => String(item.doctor_id) === String(doctorId)
      );

      if (!selectedDoctor) {
        setError("Doctor not found.");
        setLoading(false);
        return;
      }

      setDoctor(selectedDoctor);

      const scheduleResponse = await api.get(
        `/schedules/doctor/${doctorId}`
      );

      setSchedules(scheduleResponse.schedules || []);
    } catch (err) {
      console.error("SCHEDULE LOAD ERROR:", err);

      setError(err.message || "Unable to load schedules.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setScheduleDate("");
    setStartTime("");
    setEndTime("");
    setSlotDuration("15");
  };

  const handleCreateSchedule = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!scheduleDate) {
      setError("Please select a schedule date.");
      return;
    }

    if (!startTime) {
      setError("Please select a start time.");
      return;
    }

    if (!endTime) {
      setError("Please select an end time.");
      return;
    }

    if (startTime >= endTime) {
      setError("End time must be after start time.");
      return;
    }

    if (!slotDuration) {
      setError("Please select slot duration.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.post(
        "/schedules",
        {
          doctor_id: Number(doctorId),
          schedule_date: scheduleDate,
          start_time: startTime,
          end_time: endTime,
          slot_duration: Number(slotDuration),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        response.message || "Schedule created successfully."
      );

      resetForm();
      setShowForm(false);

      await loadData();
    } catch (err) {
      console.error("CREATE SCHEDULE ERROR:", err);

      setError(err.message || "Unable to create schedule.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page schedule-page">
      {/* PAGE HEADER */}
      <div className="admin-page-header">
        <div className="admin-page-title-wrap">
          <div className="admin-page-icon schedule-page-icon">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
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
                d="M7 3V7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M17 3V7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M3 10H21"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M8 14H10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M14 14H16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M8 17H10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M14 17H16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <span className="admin-section-label">
              SCHEDULE MANAGEMENT
            </span>

            <h1>
              {doctor ? `Dr. ${doctor.name}` : "Doctor Schedule"}
            </h1>

            {doctor && (
              <p>
                {doctor.specialization}
                <span className="header-separator">•</span>
                {doctor.department_name}
              </p>
            )}
          </div>
        </div>

        <div className="schedule-page-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/admin/doctors")}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M19 12H5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M11 18L5 12L11 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Doctors
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={loadData}
            disabled={loading}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M20 11A8.1 8.1 0 0 0 5.5 6.5L4 8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 4V8H8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 13A8.1 8.1 0 0 0 18.5 17.5L20 16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 20V16H16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Refresh
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => {
              resetForm();
              setError("");
              setSuccess("");
              setShowForm(true);
            }}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 5V19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Add Schedule
          </button>
        </div>
      </div>

      {/* ALERTS */}
      {success && (
        <div className="success-message" role="status">
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M8 12.5L10.7 15L16 9.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M12 8V12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle
              cx="12"
              cy="16"
              r="1"
              fill="currentColor"
            />
          </svg>

          <span>{error}</span>
        </div>
      )}

      {/* DOCTOR INFORMATION */}
      {doctor && (
        <div className="schedule-doctor-banner">
          <div className="schedule-doctor-avatar">
            <svg
              width="27"
              height="27"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="8"
                r="3.2"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M5.5 20C5.9 16.7 8.3 14.8 12 14.8C15.7 14.8 18.1 16.7 18.5 20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M16.8 6.5H20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M18.4 4.9V8.1"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="schedule-doctor-info">
            <span>Managing schedule for</span>
            <strong>Dr. {doctor.name}</strong>
            <small>
              {doctor.specialization} · {doctor.department_name}
            </small>
          </div>

          <div className="schedule-summary">
            <span>Schedules</span>
            <strong>{schedules.length}</strong>
          </div>
        </div>
      )}

      {/* CREATE SCHEDULE FORM */}
      {showForm && (
        <section className="admin-card schedule-form-card">
          <div className="admin-card-heading">
            <div className="admin-card-heading-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M7 3V7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M17 3V7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
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
                  d="M3 10H21"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 13V17"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M10 15H14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <h2>Add Doctor Schedule</h2>
              <p>
                Define the consultation date, working hours and appointment
                slot duration.
              </p>
            </div>

            <button
              type="button"
              className="icon-button schedule-close-button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              disabled={saving}
              title="Close"
              aria-label="Close schedule form"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleCreateSchedule}>
            <div className="schedule-form-grid">
              <div className="form-group">
                <label htmlFor="scheduleDate">
                  Schedule Date
                </label>

                <input
                  id="scheduleDate"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  disabled={saving}
                />

                <span className="form-help">
                  Select the day this doctor will be available.
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="startTime">
                  Start Time
                </label>

                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="endTime">
                  End Time
                </label>

                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="slotDuration">
                  Slot Duration
                </label>

                <select
                  id="slotDuration"
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(e.target.value)}
                  disabled={saving}
                >
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>

                <span className="form-help">
                  Determines the appointment interval.
                </span>
              </div>
            </div>

            <div className="schedule-form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="button-spinner"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 5V19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M5 12H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Create Schedule
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* SCHEDULE LIST */}
      <section className="admin-card">
        <div className="admin-card-heading schedule-list-heading">
          <div className="admin-card-heading-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
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
                d="M7 3V7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M17 3V7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M3 10H21"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </div>

          <div>
            <h2>Doctor Schedules</h2>
            <p>
              Active consultation schedules available for appointment
              booking.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading-state">
            <span className="large-spinner"></span>
            <p>Loading schedules...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="16"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M7 3V7"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M17 3V7"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M3 10H21"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
            </div>

            <h3>No schedules found</h3>

            <p>
              Add a schedule to make appointment slots available to patients.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                resetForm();
                setError("");
                setSuccess("");
                setShowForm(true);
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 5V19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Add Schedule
            </button>
          </div>
        ) : (
          <div className="schedule-grid">
            {schedules.map((schedule) => (
              <div
                className="schedule-card"
                key={schedule.schedule_id}
              >
                <div className="schedule-card-header">
                  <div className="schedule-card-icon">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
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
                        d="M7 3V7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M17 3V7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M3 10H21"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </div>

                  <span className="schedule-status">
                    ACTIVE
                  </span>
                </div>

                <div className="schedule-card-body">
                  <span className="schedule-date-label">
                    Consultation Date
                  </span>

                  <h3>{schedule.schedule_date}</h3>

                  <div className="schedule-time-row">
                    <div className="schedule-time-item">
                      <span>Start</span>
                      <strong>
                        {schedule.start_time?.slice(0, 5)}
                      </strong>
                    </div>

                    <div className="schedule-time-divider">
                      <span></span>
                    </div>

                    <div className="schedule-time-item">
                      <span>End</span>
                      <strong>
                        {schedule.end_time?.slice(0, 5)}
                      </strong>
                    </div>
                  </div>

                  <div className="schedule-card-details">
                    <div>
                      <span>Schedule ID</span>
                      <strong>#{schedule.schedule_id}</strong>
                    </div>

                    <div>
                      <span>Slot Duration</span>
                      <strong>
                        {schedule.slot_duration} min
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ScheduleManagement;