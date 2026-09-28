import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./patient.css";

function PatientDashboard() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [queueSummary, setQueueSummary] = useState(null);
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueError, setQueueError] = useState("");

  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

  const token = sessionStorage.getItem("patient_token");
  const storedPatient = sessionStorage.getItem("patient_data");

  // ============================================================
  // LOAD QUEUE SUMMARY (RETURNS BOOLEAN FOR CALLER)
  // ============================================================

  const loadQueueSummary = async (appointmentId) => {
    if (!appointmentId) {
      return false;
    }

    try {
      setQueueLoading(true);
      setQueueError("");

      const patientToken =
        sessionStorage.getItem("patient_token");

      const response = await api.get(
        `/queue/${appointmentId}/summary`,
        {
          headers: {
            Authorization: `Bearer ${patientToken}`,
          },
        }
      );

      setQueueSummary(response);
      return true;
    } catch (err) {
      console.error(
        "NO QUEUE ENTRY FOR:",
        appointmentId
      );

      return false;
    } finally {
      setQueueLoading(false);
    }
  };

  // ============================================================
  // JOIN QUEUE
  // ============================================================

  const handleJoinQueue = async (appointmentId) => {
    try {
      setQueueLoading(true);
      setQueueError("");

      const patientToken =
        sessionStorage.getItem("patient_token");

      const response = await api.post(
        `/queue/${appointmentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${patientToken}`,
          },
        }
      );

      console.log("JOIN QUEUE RESPONSE:", response);

      await loadQueueSummary(appointmentId);
      if (patient?.patient_id) {
        await loadAppointments(patient.patient_id);
      }
    } catch (err) {
      console.error("JOIN QUEUE ERROR:", err);

      setQueueError(
        err.message || "Unable to join the queue."
      );
    } finally {
      setQueueLoading(false);
    }
  };

  // ============================================================
  // QUEUE LIVE AUTO-POLLING (EVERY 30 SECONDS)
  // ============================================================

  useEffect(() => {
    if (!queueSummary?.appointment_id) {
      return;
    }

    const interval = setInterval(() => {
      loadQueueSummary(
        queueSummary.appointment_id
      );
    }, 30000);

    return () => clearInterval(interval);
  }, [queueSummary?.appointment_id]);

  useEffect(() => {
    if (!token || !storedPatient) {
      navigate("/patient");
      return;
    }

    try {
      const patientData = JSON.parse(storedPatient);
      setPatient(patientData);
      loadAppointments(patientData.patient_id);
      loadDoctors();
    } catch {
      sessionStorage.removeItem("patient_token");
      sessionStorage.removeItem("patient_data");
      navigate("/patient");
    }
  }, []);

  // ============================================================
  // LOAD PATIENT APPOINTMENTS & FIND ACTIVE QUEUE ENTRY
  // ============================================================

  const loadAppointments = async (patientId = null) => {
    try {
      setLoading(true);
      setError("");

      const id =
        patientId ||
        JSON.parse(sessionStorage.getItem("patient_data")).patient_id;

      const response = await api.get(
        `/appointments/patient/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const appointmentList = response.appointments || [];
      setAppointments(appointmentList);

      // Find candidates for queue tracking
      const queueCandidates = appointmentList.filter(
        (appointment) =>
          appointment.status === "CONFIRMED" ||
          appointment.status === "WAITING" ||
          appointment.status === "IN_PROGRESS"
      );

      let queueLoaded = false;

      for (const appointment of queueCandidates) {
        const loaded = await loadQueueSummary(
          appointment.appointment_id
        );

        if (loaded) {
          queueLoaded = true;
          break;
        } else {
          console.log(
            "No queue entry for appointment:",
            appointment.appointment_id
          );
        }
      }

      if (!queueLoaded) {
        setQueueSummary(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD DOCTORS
  // ============================================================

  const loadDoctors = async () => {
    try {
      const response = await api.get("/doctors");

      setDoctors(response.doctors || []);
    } catch (err) {
      console.error("DOCTORS ERROR:", err);
      setError(err.message || "Unable to load doctors.");
    }
  };

  // ============================================================
  // LOAD SCHEDULES (WITH CONSOLE LOGGING)
  // ============================================================

  const loadSchedules = async (doctorId) => {
    try {
      setSchedules([]);
      setSelectedSchedule("");
      setSelectedTime("");
      setAvailableTimes([]);
      setError("");

      if (!doctorId) {
        return;
      }

      console.log("Loading schedules for doctor:", doctorId);

      const response = await api.get(
        `/schedules/doctor/${doctorId}`
      );

      console.log("Schedule API response:", response);

      const scheduleList = response.schedules || [];

      setSchedules(scheduleList);

      if (scheduleList.length === 0) {
        setError("No schedules available for this doctor.");
      }
    } catch (err) {
      console.error("SCHEDULE ERROR:", err);
      setError(
        err.message || "Unable to load doctor schedules."
      );
    }
  };

  // ============================================================
  // GENERATE TIME SLOTS
  // ============================================================

  const generateTimeSlots = (schedule) => {
    if (!schedule) return [];

    const start = schedule.start_time;
    const end = schedule.end_time;
    const duration = Number(schedule.slot_duration) || 15;

    if (!start || !end || !duration) return [];

    const slots = [];

    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    while (currentMinutes + duration <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;

      const formattedTime =
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}`;

      slots.push(formattedTime);

      currentMinutes += duration;
    }

    return slots;
  };

  // ============================================================
  // BOOK APPOINTMENT
  // ============================================================

  const bookAppointment = async (event) => {
    event.preventDefault();

    setBookingMessage("");
    setError("");

    if (!selectedDoctor) {
      setError("Please select a doctor.");
      return;
    }

    if (!selectedSchedule) {
      setError("Please select a schedule.");
      return;
    }

    if (!selectedTime) {
      setError("Please select an appointment time.");
      return;
    }

    try {
      setBooking(true);

      const response = await api.post(
        "/appointments",
        {
          patient_id: patient.patient_id,
          doctor_id: Number(selectedDoctor),
          schedule_id: Number(selectedSchedule),
          appointment_time: selectedTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const appointmentId =
        response.appointment?.appointment_id ||
        response.appointment?.id ||
        response.appointment_id ||
        "";

      setBookingMessage(
        `Appointment booked successfully.${appointmentId ? ` Appointment ID: ${appointmentId}` : ""}`
      );

      setSelectedDoctor("");
      setSelectedSchedule("");
      setSelectedTime("");
      setSchedules([]);
      setAvailableTimes([]);

      await loadAppointments(patient.patient_id);
    } catch (err) {
      console.error("BOOKING ERROR:", err);
      setError(err.message || "Unable to book appointment.");
    } finally {
      setBooking(false);
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {
    sessionStorage.removeItem("patient_token");
    sessionStorage.removeItem("patient_data");

    navigate("/patient");
  };

  if (!patient) {
    return (
      <div className="patient-dashboard-loading">
        Loading patient portal...
      </div>
    );
  }

  return (
    <div className="patient-dashboard">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="patient-dashboard-header">

        <div>
          <p className="dashboard-label">
            MEDIQUEUE PATIENT PORTAL
          </p>

          <h1>
            Welcome, {patient.name}
          </h1>

          <p>
            Patient ID:{" "}
            <strong>{patient.patient_id}</strong>
          </p>
        </div>

        <button
          className="patient-logout-btn"
          onClick={logout}
        >
          Logout
        </button>

      </header>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <main className="patient-dashboard-content">

        {/* PROFILE */}

        <section className="patient-profile-card">

          <div className="profile-icon">
            👤
          </div>

          <div>

            <h2>{patient.name}</h2>

            <p>
              Patient ID: {patient.patient_id}
            </p>

            <p>
              Mobile: {patient.mobile}
            </p>

            {patient.email && (
              <p>
                Email: {patient.email}
              </p>
            )}

          </div>

        </section>


        {/* ==================================================
            BOOK APPOINTMENT
        ================================================== */}

        <section className="patient-dashboard-section">

          <div className="section-heading">

            <div>

              <p className="dashboard-label">
                APPOINTMENT SERVICES
              </p>

              <h2>
                Book an Appointment
              </h2>

            </div>

          </div>

          {/* Form matching .booking-card styling */}
          <form className="booking-card" onSubmit={bookAppointment}>

            {/* Doctor Selection */}
            <div className="booking-field">
              <label htmlFor="doctor-select">Select Doctor</label>
              <select
                id="doctor-select"
                value={selectedDoctor}
                onChange={(e) => {
                  const doctorId = e.target.value;
                  setSelectedDoctor(doctorId);
                  loadSchedules(doctorId);
                }}
                required
              >
                <option value="">-- Choose a Doctor --</option>
                {doctors.map((doc) => (
                  <option
                    key={doc.doctor_id || doc.id}
                    value={doc.doctor_id || doc.id}
                  >
                    Dr. {doc.name} {doc.specialization ? `(${doc.specialization})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Schedule Selection */}
            <div className="booking-field">
              <label htmlFor="schedule-select">Select Schedule</label>
              <select
                id="schedule-select"
                value={selectedSchedule}
                onChange={(e) => {
                  const scheduleId = e.target.value;
                  setSelectedSchedule(scheduleId);
                  setSelectedTime("");

                  const selectedScheduleData = schedules.find(
                    (sch) =>
                      String(sch.schedule_id || sch.id) === String(scheduleId)
                  );

                  setAvailableTimes(
                    generateTimeSlots(selectedScheduleData)
                  );
                }}
                disabled={!selectedDoctor || schedules.length === 0}
                required
              >
                <option value="">
                  {!selectedDoctor
                    ? "-- Select a doctor first --"
                    : schedules.length === 0
                    ? "-- No schedules available --"
                    : "-- Choose a Schedule --"}
                </option>
                {schedules.map((sch) => (
                  <option
                    key={sch.schedule_id || sch.id}
                    value={sch.schedule_id || sch.id}
                  >
                    {sch.schedule_date || sch.available_date || sch.day_of_week || "Schedule"}{" "}
                    {sch.start_time && sch.end_time
                      ? `(${String(sch.start_time).slice(0, 5)} - ${String(sch.end_time).slice(0, 5)})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Time Selection */}
            <div className="booking-field">
              <label htmlFor="appointment-time">Appointment Time</label>
              <select
                id="appointment-time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                disabled={!selectedSchedule || availableTimes.length === 0}
                required
              >
                <option value="">
                  {!selectedSchedule
                    ? "-- Select a schedule first --"
                    : availableTimes.length === 0
                    ? "-- No time slots available --"
                    : "-- Choose Appointment Time --"}
                </option>

                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="booking-button"
              disabled={booking}
            >
              {booking ? "Booking Appointment..." : "Book Appointment"}
            </button>

          </form>

          {/* SUCCESS */}

          {bookingMessage && (
            <div className="booking-success">
              ✓ {bookingMessage}
            </div>
          )}


          {/* ERROR */}

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

        </section>


        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <section className="patient-dashboard-section">

          <div className="section-heading">

            <div>

              <p className="dashboard-label">
                PATIENT SERVICES
              </p>

              <h2>
                Quick Actions
              </h2>

            </div>

          </div>


          <div className="patient-action-grid">

            <button
              className="patient-action-card"
              onClick={() =>
                document
                  .querySelector(".booking-card")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              <span>📅</span>

              <h3>
                Book Appointment
              </h3>

              <p>
                Find a doctor and book an available slot.
              </p>

            </button>


            <button
              className="patient-action-card"
              onClick={() =>
                document
                  .querySelector(".appointments-list")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              <span>📋</span>

              <h3>
                My Appointments
              </h3>

              <p>
                View your upcoming and previous appointments.
              </p>

            </button>


            <button
              className="patient-action-card"
              onClick={() =>
                document
                  .querySelector(".patient-queue-section")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              <span>🎫</span>

              <h3>
                Queue Status
              </h3>

              <p>
                View your token and current queue position.
              </p>

            </button>


            <button
              className="patient-action-card"
              onClick={() =>
                loadAppointments(patient.patient_id)
              }
            >

              <span>🔄</span>

              <h3>
                Refresh
              </h3>

              <p>
                Refresh your appointment information.
              </p>

            </button>

          </div>

        </section>


        {/* ==================================================
            LIVE QUEUE STATUS
        ================================================== */}

        {queueSummary && (
          <section className="patient-queue-section">

            <div className="patient-section-header">
              <div>
                <h2>Live Queue Status</h2>
                <p>
                  Track your position for today's appointment.
                </p>
              </div>

              <button
                className="queue-refresh-button"
                onClick={() =>
                  loadQueueSummary(
                    queueSummary.appointment_id
                  )
                }
                disabled={queueLoading}
              >
                {queueLoading ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>

            {queueError && (
              <div className="patient-queue-error">
                {queueError}
              </div>
            )}

            <div className="patient-queue-grid">

              <div className="patient-queue-card token-card">
                <span>Your Token</span>

                <strong>
                  #{queueSummary.token_number}
                </strong>
              </div>

              <div className="patient-queue-card">
                <span>Current Token</span>

                <strong>
                  {queueSummary.current_token
                    ? `#${queueSummary.current_token}`
                    : "—"}
                </strong>
              </div>

              <div className="patient-queue-card">
                <span>Patients Ahead</span>

                <strong>
                  {queueSummary.patients_ahead}
                </strong>
              </div>

              <div className="patient-queue-card">
                <span>Estimated Wait</span>

                <strong>
                  {queueSummary.estimated_wait_minutes} min
                </strong>
              </div>

            </div>

            <div className="patient-queue-details">

              <div>
                <span>Doctor</span>
                <strong>
                  {queueSummary.doctor_name}
                </strong>
              </div>

              <div>
                <span>Specialization</span>
                <strong>
                  {queueSummary.specialization}
                </strong>
              </div>

              <div>
                <span>Appointment Date</span>
                <strong>
                  {queueSummary.appointment_date}
                </strong>
              </div>

              <div>
                <span>Appointment Time</span>
                <strong>
                  {queueSummary.appointment_time}
                </strong>
              </div>

            </div>

            <div className="patient-queue-status">

              <span>Status</span>

              <strong>
                {queueSummary.queue_status}
              </strong>

            </div>

          </section>
        )}


        {/* ==================================================
            APPOINTMENTS
        ================================================== */}

        <section className="patient-dashboard-section">

          <div className="section-heading">

            <div>

              <p className="dashboard-label">
                YOUR APPOINTMENTS
              </p>

              <h2>
                Appointments
              </h2>

            </div>

            <button
              className="refresh-btn"
              onClick={() =>
                loadAppointments(patient.patient_id)
              }
            >
              Refresh
            </button>

          </div>


          {loading && (
            <div className="dashboard-message">
              Loading appointments...
            </div>
          )}


          {!loading &&
            !error &&
            appointments.length === 0 && (

              <div className="dashboard-empty">

                <div className="empty-icon">
                  📅
                </div>

                <h3>
                  No appointments yet
                </h3>

                <p>
                  Use the booking form above to schedule
                  your first appointment.
                </p>

              </div>

            )}


          {!loading &&
            appointments.length > 0 && (

              <div className="appointments-list">

                {appointments.map((appointment) => (

                  <div
                    className="appointment-card"
                    key={appointment.appointment_id}
                  >

                    <div className="appointment-main">

                      <div className="appointment-icon">
                        🩺
                      </div>

                      <div>

                        <h3>
                          {appointment.name ||
                            "Doctor"}
                        </h3>

                        {appointment.specialization && (
                          <p>
                            {appointment.specialization}
                          </p>
                        )}

                        <p>
                          Appointment ID:{" "}
                          {appointment.appointment_id}
                        </p>

                        <p>
                          Date:{" "}
                          {appointment.appointment_date}
                        </p>

                        <p>
                          Time:{" "}
                          {appointment.appointment_time}
                        </p>

                      </div>

                    </div>


                    <div className="appointment-status">

                      <span>
                        {appointment.status}
                      </span>

                    </div>

                    {appointment.status === "CONFIRMED" && (
                      <button
                        className="queue-join-button"
                        onClick={() =>
                          handleJoinQueue(
                            appointment.appointment_id
                          )
                        }
                        disabled={queueLoading}
                      >
                        {queueLoading
                          ? "Joining..."
                          : "Join Queue"}
                      </button>
                    )}

                  </div>

                ))}

              </div>

            )}

        </section>

      </main>

    </div>
  );
}

export default PatientDashboard;