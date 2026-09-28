import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./admin.css";

function QueueManagement() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [queueDate, setQueueDate] = useState("");
  const [queue, setQueue] = useState([]);

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [callingNext, setCallingNext] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const adminToken = sessionStorage.getItem("admin_token");

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }

    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      setError("");

      const response = await api.get("/doctors");

      setDoctors(response.doctors || []);
    } catch (err) {
      setError(err.message || "Unable to load doctors.");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const loadQueue = async () => {
    if (!selectedDoctor) {
      setError("Please select a doctor.");
      return;
    }

    try {
      setLoadingQueue(true);
      setError("");
      setSuccess("");

      const response = await api.get(
        `/queue/doctor/${selectedDoctor}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      let queueData = response.queue || [];

      if (queueDate) {
        queueData = queueData.filter(
          (entry) =>
            String(entry.appointment_date) ===
            String(queueDate)
        );
      }

      setQueue(queueData);
    } catch (err) {
      setError(err.message || "Unable to load queue.");
    } finally {
      setLoadingQueue(false);
    }
  };

  const callNextPatient = async () => {
    if (!selectedDoctor) {
      setError("Please select a doctor.");
      return;
    }

    if (!queueDate) {
      setError("Please select a queue date.");
      return;
    }

    try {
      setCallingNext(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        `/queue/doctor/${selectedDoctor}/call-next`,
        {
          appointment_date: queueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      setSuccess(
        `Token #${response.queue.token_number} called successfully.`
      );

      await loadQueue();
    } catch (err) {
      setError(
        err.message || "Unable to call next patient."
      );
    } finally {
      setCallingNext(false);
    }
  };

  const updateQueueStatus = async (
    queueId,
    status
  ) => {
    try {
      setError("");
      setSuccess("");

      const response = await api.put(
        `/queue/${queueId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      setSuccess(
        response.message ||
          "Queue status updated successfully."
      );

      await loadQueue();
    } catch (err) {
      setError(
        err.message ||
          "Unable to update queue status."
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
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

  const waitingCount = queue.filter(
    (entry) => entry.queue_status === "WAITING"
  ).length;

  const inProgressCount = queue.filter(
    (entry) => entry.queue_status === "IN_PROGRESS"
  ).length;

  const currentPatient = queue.find(
    (entry) =>
      entry.queue_status === "IN_PROGRESS"
  );

  return (
    <div className="admin-page queue-management-page">

      <div className="admin-header">

        <div>
          <h1>Queue Management</h1>
          <p>
            Manage doctor queues and patient flow.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate("/admin/dashboard")
          }
        >
          ← Dashboard
        </button>

      </div>

      <div className="admin-content">

        {error && (
          <div className="alert error-alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert success-alert">
            {success}
          </div>
        )}

        <div className="queue-control-card">

          <div className="queue-control-grid">

            <div className="form-group">
              <label>
                Doctor
              </label>

              <select
                value={selectedDoctor}
                onChange={(event) => {
                  setSelectedDoctor(
                    event.target.value
                  );
                  setQueue([]);
                  setSuccess("");
                  setError("");
                }}
                disabled={loadingDoctors}
              >
                <option value="">
                  Select Doctor
                </option>

                {doctors.map((doctor) => (
                  <option
                    key={doctor.doctor_id}
                    value={doctor.doctor_id}
                  >
                    {doctor.name} —{" "}
                    {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                Queue Date
              </label>

              <input
                type="date"
                value={queueDate}
                onChange={(event) => {
                  setQueueDate(
                    event.target.value
                  );
                  setQueue([]);
                  setSuccess("");
                  setError("");
                }}
              />
            </div>

            <div className="queue-actions">

              <button
                className="primary-button"
                onClick={loadQueue}
                disabled={loadingQueue}
              >
                {loadingQueue
                  ? "Loading..."
                  : "View Queue"}
              </button>

              <button
                className="success-button"
                onClick={callNextPatient}
                disabled={
                  callingNext ||
                  !selectedDoctor ||
                  !queueDate ||
                  inProgressCount > 0
                }
              >
                {callingNext
                  ? "Calling..."
                  : "📢 Call Next Patient"}
              </button>

            </div>

          </div>

        </div>

        <div className="queue-summary-grid">

          <div className="queue-summary-card">
            <span>Waiting</span>
            <strong>{waitingCount}</strong>
          </div>

          <div className="queue-summary-card">
            <span>In Progress</span>
            <strong>{inProgressCount}</strong>
          </div>

          <div className="queue-summary-card">
            <span>Current Token</span>
            <strong>
              {currentPatient
                ? `#${currentPatient.token_number}`
                : "—"}
            </strong>
          </div>

        </div>

        {currentPatient && (
          <div className="current-patient-card">

            <div>
              <span>
                CURRENTLY SERVING
              </span>

              <h2>
                Token #{currentPatient.token_number}
              </h2>

              <p>
                {currentPatient.patient_name}
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() =>
                updateQueueStatus(
                  currentPatient.queue_id,
                  "COMPLETED"
                )
              }
            >
              Complete Patient
            </button>

          </div>
        )}

        <div className="queue-table-card">

          <div className="section-heading">

            <div>
              <h2>
                Patient Queue
              </h2>

              <p>
                {queue.length} queue entries
              </p>
            </div>

          </div>

          {queue.length === 0 ? (

            <div className="empty-state">
              <div className="empty-icon">
                🏥
              </div>

              <h3>
                No active queue
              </h3>

              <p>
                Select a doctor and date,
                then click View Queue.
              </p>
            </div>

          ) : (

            <div className="table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Patient</th>
                    <th>Appointment Time</th>
                    <th>Status</th>
                    <th>Estimated Wait</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {queue.map((entry) => (

                    <tr key={entry.queue_id}>

                      <td>
                        <strong>
                          #{entry.token_number}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {entry.patient_name}
                        </strong>

                        <small>
                          {entry.patient_id}
                        </small>
                      </td>

                      <td>
                        {entry.appointment_time}
                      </td>

                      <td>
                        <span
                          className={getStatusClass(
                            entry.queue_status
                          )}
                        >
                          {entry.queue_status}
                        </span>
                      </td>

                      <td>
                        {entry.estimated_wait_minutes}{" "}
                        min
                      </td>

                      <td>

                        {entry.queue_status ===
                          "WAITING" && (
                          <button
                            className="small-button"
                            onClick={() =>
                              updateQueueStatus(
                                entry.queue_id,
                                "IN_PROGRESS"
                              )
                            }
                            disabled={
                              inProgressCount > 0
                            }
                          >
                            Start
                          </button>
                        )}

                        {entry.queue_status ===
                          "IN_PROGRESS" && (
                          <button
                            className="small-button"
                            onClick={() =>
                              updateQueueStatus(
                                entry.queue_id,
                                "COMPLETED"
                              )
                            }
                          >
                            Complete
                          </button>
                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default QueueManagement;