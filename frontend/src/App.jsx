import { Routes, Route, Navigate } from "react-router-dom";
import AdminLockerMap from "./components/LockerManagement/AdminLockerMap";
import LockerMap from "./components/LockerManagement/LockerMap";

import StudentRegister from "./components/Students/StudentRegister";
import StudentLogin from "./components/Students/StudentLogin";
import StudentDashboard from "./components/Students/StudentDashboard";
import StudentProfile from "./components/Students/StudentProfile";

import AdminLogin from "./components/Admin/AdminLogin";
import AdminDashboard from "./components/Admin/AdminDashboard";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/student-register" />} />

        <Route path="/AdminLockerMap" element={<AdminLockerMap />} />
        <Route path="/lockers" element={<LockerMap />} />

        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-profile" element={<StudentProfile />} />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
};

export default App;