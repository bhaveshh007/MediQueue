import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import PatientPortal from "./pages/PatientPortal";
import PatientDashboard from "./pages/PatientDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorManagement from "./pages/DoctorManagement";
import ScheduleManagement from "./pages/ScheduleManagement";
import AdminAppointments from "./pages/AdminAppointments";
import QueueManagement from "./pages/QueueManagement";
import AdminReports from "./pages/AdminReports";
import DepartmentManagement from "./pages/DepartmentManagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Home */}
        <Route path="/" element={<Home />} />
          <Route
  path="/admin/reports"
  element={<AdminReports />}
/>
<Route
  path="/admin/departments"
  element={<DepartmentManagement />}
/>
          <Route
  path="/admin/queue"
  element={<QueueManagement />}
/>
        {/* Patient Portal */}
        <Route path="/patient" element={<PatientPortal />} />
<Route
  path="/admin/appointments"
  element={<AdminAppointments />}
/>

        {/* Patient Dashboard */}
        <Route
          path="/patient/dashboard"
          element={<PatientDashboard />}
        />
        <Route
  path="/admin/doctors"
  element={<DoctorManagement />}
/>
<Route

  path="/admin/doctors/:doctorId/schedules"
  element={<ScheduleManagement />}
/>
        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Home />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;