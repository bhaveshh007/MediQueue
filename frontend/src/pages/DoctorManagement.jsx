
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./admin.css";

function DoctorManagement() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSpecialization, setEditSpecialization] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState("");
  const [updating, setUpdating] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const token = sessionStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    loadDoctors();
    loadDepartments();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/doctors");
      setDoctors(response.doctors || []);
    } catch (err) {
      console.error("DOCTORS ERROR:", err);
      setError(err.message || "Unable to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await api.get("/departments");
      setDepartments(response.departments || []);
    } catch (err) {
      console.error("DEPARTMENTS ERROR:", err);
      setError(err.message || "Unable to load departments.");
    }
  };

  const resetForm = () => {
    setName("");
    setSpecialization("");
    setDepartmentId("");
    setError("");
    setSuccess("");
  };

  const handleAddDoctor = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Doctor name is required.");
      return;
    }

    if (!specialization.trim()) {
      setError("Specialization is required.");
      return;
    }

    if (!departmentId) {
      setError("Please select a department.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.post(
        "/doctors",
        {
          name: name.trim(),
          specialization: specialization.trim(),
          department_id: Number(departmentId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        response.message || "Doctor created successfully."
      );

      resetForm();
      setShowForm(false);
      await loadDoctors();
    } catch (err) {
      console.error("CREATE DOCTOR ERROR:", err);
      setError(err.message || "Unable to create doctor.");
    } finally {
      setSaving(false);
    }
  };

  const startEditDoctor = (doctor) => {
    setError("");
    setSuccess("");
    setShowForm(false);

    setEditingDoctor(doctor);
    setEditName(doctor.name || "");
    setEditSpecialization(doctor.specialization || "");
    setEditDepartmentId(String(doctor.department_id || ""));
  };

  const cancelEditDoctor = () => {
    setEditingDoctor(null);
    setEditName("");
    setEditSpecialization("");
    setEditDepartmentId("");
  };

  const handleUpdateDoctor = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!editName.trim()) {
      setError("Doctor name is required.");
      return;
    }

    if (!editSpecialization.trim()) {
      setError("Specialization is required.");
      return;
    }

    if (!editDepartmentId) {
      setError("Please select a department.");
      return;
    }

    try {
      setUpdating(true);

      const response = await api.put(
        `/doctors/${editingDoctor.doctor_id}`,
        {
          name: editName.trim(),
          specialization: editSpecialization.trim(),
          department_id: Number(editDepartmentId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        response.message || "Doctor updated successfully."
      );

      cancelEditDoctor();
      await loadDoctors();
    } catch (err) {
      console.error("UPDATE DOCTOR ERROR:", err);
      setError(err.message || "Unable to update doctor.");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (doctor) => {
    const newStatus =
      doctor.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      setStatusUpdating(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        `/doctors/${doctor.doctor_id}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        response.message ||
          `Doctor status changed to ${newStatus}.`
      );

      await loadDoctors();
    } catch (err) {
      console.error("UPDATE DOCTOR STATUS ERROR:", err);
      setError(
        err.message || "Unable to update doctor status."
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  const openAddForm = () => {
    cancelEditDoctor();
    resetForm();
    setShowForm(true);
  };

  const closeAddForm = () => {
    setShowForm(false);
    resetForm();
  };

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

        <button
          type="button"
          className="admin-back-button"
          onClick={() => navigate("/admin/dashboard")}
        >
          <span aria-hidden="true">←</span>
          Dashboard
        </button>
      </header>

      <main className="admin-dashboard-content">
        <div className="admin-dashboard-title">
          <div>
            <span className="admin-section-label">
              DOCTOR MANAGEMENT
            </span>

            <h2>Doctors</h2>

            <p>
              Manage doctors, specializations and department assignments.
            </p>
          </div>

          <div className="doctor-page-actions">
            <button
              type="button"
              className="admin-refresh-button"
              onClick={loadDoctors}
              disabled={loading}
            >
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="none"
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

            <button
              type="button"
              className="doctor-add-button"
              onClick={openAddForm}
            >
              <span>+</span>
              Add Doctor
            </button>
          </div>
        </div>

        {success && (
          <div className="admin-success-message" role="status">
            <span>✓</span>
            {success}
          </div>
        )}

        {error && (
          <div className="admin-dashboard-error" role="alert">
            <span>!</span>
            {error}
          </div>
        )}

        {showForm && (
          <section className="doctor-form-card">
            <div className="doctor-form-header">
              <div>
                <span className="admin-section-label">
                  NEW DOCTOR
                </span>

                <h2>Add Doctor</h2>

                <p>
                  Add a healthcare professional to MediQueue.
                </p>
              </div>

              <button
                type="button"
                className="doctor-form-close"
                onClick={closeAddForm}
                aria-label="Close add doctor form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddDoctor}>
              <div className="doctor-form-grid">
                <div className="admin-form-group">
                  <label htmlFor="doctor-name">
                    Doctor Name
                  </label>

                  <input
                    id="doctor-name"
                    type="text"
                    placeholder="Enter doctor name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    disabled={saving}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="doctor-specialization">
                    Specialization
                  </label>

                  <input
                    id="doctor-specialization"
                    type="text"
                    placeholder="e.g. Cardiologist"
                    value={specialization}
                    onChange={(e) =>
                      setSpecialization(e.target.value)
                    }
                    maxLength={100}
                    disabled={saving}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="doctor-department">
                    Department
                  </label>

                  <select
                    id="doctor-department"
                    value={departmentId}
                    onChange={(e) =>
                      setDepartmentId(e.target.value)
                    }
                    disabled={saving}
                  >
                    <option value="">
                      Select Department
                    </option>

                    {departments.map((department) => (
                      <option
                        key={department.department_id}
                        value={department.department_id}
                      >
                        {department.department_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="doctor-form-actions">
                <button
                  type="button"
                  className="doctor-cancel-button"
                  onClick={closeAddForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="doctor-save-button"
                  disabled={saving}
                >
                  {saving ? "Creating Doctor..." : "Create Doctor"}
                </button>
              </div>
            </form>
          </section>
        )}

        {editingDoctor && (
          <section className="doctor-form-card">
            <div className="doctor-form-header">
              <div>
                <span className="admin-section-label">
                  EDIT DOCTOR
                </span>

                <h2>
                  Edit Dr. {editingDoctor.name}
                </h2>

                <p>
                  Update doctor information and department assignment.
                </p>
              </div>

              <button
                type="button"
                className="doctor-form-close"
                onClick={cancelEditDoctor}
                aria-label="Close edit doctor form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateDoctor}>
              <div className="doctor-form-grid">
                <div className="admin-form-group">
                  <label htmlFor="edit-doctor-name">
                    Doctor Name
                  </label>

                  <input
                    id="edit-doctor-name"
                    type="text"
                    value={editName}
                    onChange={(e) =>
                      setEditName(e.target.value)
                    }
                    maxLength={100}
                    disabled={updating}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="edit-doctor-specialization">
                    Specialization
                  </label>

                  <input
                    id="edit-doctor-specialization"
                    type="text"
                    value={editSpecialization}
                    onChange={(e) =>
                      setEditSpecialization(e.target.value)
                    }
                    maxLength={100}
                    disabled={updating}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="edit-doctor-department">
                    Department
                  </label>

                  <select
                    id="edit-doctor-department"
                    value={editDepartmentId}
                    onChange={(e) =>
                      setEditDepartmentId(e.target.value)
                    }
                    disabled={updating}
                  >
                    <option value="">
                      Select Department
                    </option>

                    {departments.map((department) => (
                      <option
                        key={department.department_id}
                        value={department.department_id}
                      >
                        {department.department_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="doctor-form-actions">
                <button
                  type="button"
                  className="doctor-cancel-button"
                  onClick={cancelEditDoctor}
                  disabled={updating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="doctor-save-button"
                  disabled={updating}
                >
                  {updating ? "Updating Doctor..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        )}

        {loading ? (
          <div className="admin-loading-card">
            <div className="admin-spinner"></div>
            <p>Loading doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="admin-loading-card">
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 16px",
                borderRadius: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#EBF3FA",
                color: "#0F4C81",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="34"
                height="34"
                fill="none"
              >
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
            </div>

            <h3>No doctors found</h3>

            <p>
              Add a doctor to make them available to patients.
            </p>
          </div>
        ) : (
          <div className="doctor-management-grid">
            {doctors.map((doctor) => (
              <article
                className="doctor-management-card"
                key={doctor.doctor_id || doctor.id}
              >
                <div className="doctor-card-top">
                  <div className="doctor-avatar" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      width="28"
                      height="28"
                      fill="none"
                    >
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
                  </div>

                  <span
                    className={
                      doctor.status === "ACTIVE"
                        ? "doctor-status active"
                        : "doctor-status inactive"
                    }
                  >
                    <span></span>
                    {doctor.status || "ACTIVE"}
                  </span>
                </div>

                <div className="doctor-card-body">
                  <h3>Dr. {doctor.name}</h3>

                  <p className="doctor-specialization">
                    {doctor.specialization}
                  </p>

                  <div className="doctor-details">
                    <div>
                      <span>Doctor ID</span>
                      <strong>{doctor.doctor_id}</strong>
                    </div>

                    <div>
                      <span>Department</span>
                      <strong>
                        {doctor.department_name || "Not assigned"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="doctor-card-actions">
                  <button
                    type="button"
                    className="doctor-action-button"
                    onClick={() => startEditDoctor(doctor)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="doctor-action-button secondary"
                    onClick={() =>
                      navigate(
                        `/admin/doctors/${doctor.doctor_id}/schedules`
                      )
                    }
                  >
                    Schedule
                  </button>

                  <button
                    type="button"
                    className="doctor-action-button danger"
                    onClick={() => handleStatusChange(doctor)}
                    disabled={statusUpdating}
                  >
                    {doctor.status === "ACTIVE"
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default DoctorManagement;