import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

function DepartmentManagement() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const departmentOptions = [
    "General Medicine",
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Dermatology",
    "Gynecology",
    "ENT",
    "Ophthalmology",
    "Psychiatry",
    "Dental",
    "Emergency Medicine",
  ];

  const getAdminHeaders = () => {
    const adminToken = sessionStorage.getItem("admin_token");

    return {
      Authorization: `Bearer ${adminToken}`,
    };
  };

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const adminToken = sessionStorage.getItem("admin_token");

      if (!adminToken) {
        setError("Admin session expired. Please login again.");
        return;
      }

      const response = await api.get("/departments", {
        headers: getAdminHeaders(),
      });

      setDepartments(response.departments || []);
    } catch (err) {
      console.error("DEPARTMENT LOAD ERROR:", err);

      setError(err.message || "Unable to load departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleAddDepartment = async (e) => {
    e.preventDefault();

    if (!departmentName) {
      setError("Please select a department.");
      setSuccess("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const adminToken = sessionStorage.getItem("admin_token");

      if (!adminToken) {
        setError("Admin session expired. Please login again.");
        return;
      }

      await api.post(
        "/departments",
        {
          department_name: departmentName,
          description: description.trim(),
        },
        {
          headers: getAdminHeaders(),
        }
      );

      setSuccess(
        `${departmentName} department created successfully.`
      );

      setDepartmentName("");
      setDescription("");

      await loadDepartments();
    } catch (err) {
      console.error("DEPARTMENT CREATE ERROR:", err);

      setError(err.message || "Unable to create department.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      {/* HEADER */}
      <div className="admin-page-header">
        <div className="admin-page-title-wrap">
          <div className="admin-page-icon">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M4 21V5.5C4 4.67 4.67 4 5.5 4H18.5C19.33 4 20 4.67 20 5.5V21"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M2 21H22"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M8 8H10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M14 8H16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M8 12H10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M14 12H16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M10 21V16H14V21"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h1>Department Management</h1>
            <p>
              Create and manage hospital departments across MediQueue.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/admin/dashboard")}
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
          Back to Dashboard
        </button>
      </div>

      {/* ALERTS */}
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

      {/* ADD DEPARTMENT */}
      <div className="admin-card department-form-card">
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
          </div>

          <div>
            <h2>Add Department</h2>
            <p>
              Add a new department to the MediQueue hospital system.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddDepartment}>
          <div className="form-group">
            <label htmlFor="departmentName">
              Department Name
            </label>

            <select
              id="departmentName"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              disabled={loading}
            >
              <option value="">Select Department</option>

              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <span className="form-help">
              Choose the department you want to add.
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="departmentDescription">
              Description
              <span className="optional-label">Optional</span>
            </label>

            <textarea
              id="departmentDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a short description of this department..."
              maxLength={500}
              rows={4}
              disabled={loading}
            />

            <div className="character-count">
              {description.length}/500
            </div>
          </div>

          <div className="department-form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setDepartmentName("");
                setDescription("");
                setError("");
                setSuccess("");
              }}
              disabled={loading}
            >
              Clear
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Adding...
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
                  Add Department
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* DEPARTMENT LIST */}
      <div className="admin-card">
        <div className="admin-card-heading department-list-heading">
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
                d="M4 5H20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M4 10H20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M4 15H20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M4 20H20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <h2>Departments</h2>
            <p>
              {departments.length} department
              {departments.length === 1 ? "" : "s"} currently registered.
            </p>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={loadDepartments}
            disabled={loading}
            title="Refresh departments"
            aria-label="Refresh departments"
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
          </button>
        </div>

        {loading && departments.length === 0 ? (
          <div className="admin-loading-state">
            <span className="large-spinner"></span>
            <p>Loading departments...</p>
          </div>
        ) : departments.length === 0 ? (
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
                <path
                  d="M4 21V5.5C4 4.67 4.67 4 5.5 4H18.5C19.33 4 20 4.67 20 5.5V21"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M2 21H22"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M9 9H15"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M9 13H15"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h3>No departments found</h3>
            <p>
              Add your first hospital department using the form above.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Department Name</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                {departments.map((department) => (
                  <tr key={department.department_id}>
                    <td>
                      <span className="table-id">
                        #{department.department_id}
                      </span>
                    </td>

                    <td>
                      <div className="department-name-cell">
                        <div className="department-mini-icon">
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path
                              d="M4 21V5.5C4 4.67 4.67 4 5.5 4H18.5C19.33 4 20 4.67 20 5.5V21"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                            <path
                              d="M2 21H22"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                            <path
                              d="M9 9H15"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>

                        <strong>
                          {department.department_name}
                        </strong>
                      </div>
                    </td>

                    <td>
                      <span className="department-description">
                        {department.description || "No description provided"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DepartmentManagement;