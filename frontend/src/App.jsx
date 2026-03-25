import { Routes, Route } from "react-router-dom";
import AdminLockerMap from "./components/LockerManagement/AdminLockerMap";
import LockerMap from "./components/LockerManagement/LockerMap";

import HomePage from "./components/Home/HomePage";
import AboutPage from "./components/Home/AboutPage";
import ContactPage from "./components/Home/ContactPage";

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
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-profile" element={<StudentProfile />} />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route path="/AdminLockerMap" element={<AdminLockerMap />} />
        <Route path="/lockers" element={<LockerMap />} />
      </Routes>
    </div>
  );
};

export default App;