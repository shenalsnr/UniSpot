import { Routes, Route, Link, useLocation } from "react-router-dom";
import HomePage from "./components/Home/HomePage";

import StudentRegister from "./components/Students/StudentRegister";
import StudentLogin from "./components/Students/StudentLogin";
import StudentDashboard from "./components/Students/StudentDashboard";
import StudentProfile from "./components/Students/StudentProfile";

import AdminDashboard from "./components/Admin/AdminDashboard";

import AdminLockerMap from "./components/LockerManagement/AdminLockerMap";
import LockerMap from "./components/LockerManagement/LockerMap";
import BookLockersStatus from "./components/LockerManagement/BookLockersStatus";

import CampusMap from "./components/ParkingManagement/CampusMap";
import ParkingMap from "./components/ParkingManagement/ParkingMap";
import ParkingBookingForm from "./components/ParkingManagement/ParkingBookingForm";
import AdminParkingRecords from "./components/ParkingManagement/AdminParkingRecords";
import SecurityPortal from "./components/SecurityPortal/SecurityPortal";
import QRScanner from "./components/SecurityPortal/QRScanner";
import UnifiedNavbar from "./components/Shared/UnifiedNavbar";

const App = () => {
  const location = useLocation();
  const isParkingFlow = location.pathname.startsWith("/parking");
  const isSecurityFlow = location.pathname.startsWith("/security");

  return (
    <div className="min-h-screen bg-gray-200">
      {isParkingFlow && (
        <UnifiedNavbar 
          moduleName="Parking"
          links={[
            { to: "/parking/zones", label: "Select Zone" },
            { to: "/parking/map", label: "Parking Slots" },
            { to: "/parking/admin", label: "Admin Records" }
          ]}
        />
      )}

      {isSecurityFlow && (
        <UnifiedNavbar 
          moduleName="Security"
          links={[
            { to: "/security", label: "Staff Management" },
            { to: "/security/scan", label: "QR Scanner" }
          ]}
        />
      )}

      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<HomePage />} />

        {/* Student Portal */}
        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        
        {/* Admin Portal */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Locker Management */}
        <Route path="/AdminLockerMap" element={<AdminLockerMap />} />
        <Route path="/lockers" element={<LockerMap />} />
        <Route path="/BookLockersStatus" element={<BookLockersStatus />} />

        {/* Parking flow */}
        <Route path="/parking" element={<CampusMap />} />
        <Route path="/parking/zones" element={<CampusMap />} />
        <Route path="/parking/map" element={<ParkingMap />} />
        <Route path="/parking/book/:spotId" element={<ParkingBookingForm />} />
        <Route path="/parking/admin" element={<AdminParkingRecords />} />

        {/* Security Portal */}
        <Route path="/security" element={<SecurityPortal />} />
        <Route path="/security/scan" element={<QRScanner />} />
      </Routes>
    </div>
  );
};

export default App;
