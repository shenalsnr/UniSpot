import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import HomePage from "./components/Home/HomePage";

import StudentRegister from "./components/Students/StudentRegister";
import StudentLogin from "./components/Students/StudentLogin";
import StudentDashboard from "./components/Students/StudentDashboard";
import StudentProfile from "./components/Students/StudentProfile";

import AdminLogin from "./components/Admin/AdminLogin";
import AdminDashboard from "./components/Admin/AdminDashboard";

import AdminLockerMap from "./components/LockerManagement/AdminLockerMap";
import LockerMap from "./components/LockerManagement/LockerMap";
import BookLockersStatus from "./components/LockerManagement/BookLockersStatus";

import CampusMap from "./components/ParkingManagement/CampusMap";
import ParkingMap from "./components/ParkingManagement/ParkingMap";
import ParkingBookingForm from "./components/ParkingManagement/ParkingBookingForm";
import AdminParkingRecords from "./components/ParkingManagement/AdminParkingRecords";
import MyParkingBooking from "./components/ParkingManagement/MyParkingBooking";
import SecurityPortal from "./components/SecurityPortal/SecurityPortal";
import QRScanner from "./components/SecurityPortal/QRScanner";
import UnifiedNavbar from "./components/Shared/UnifiedNavbar";
import LockerMaintenance from "./components/LockerManagement/LockerMaintenance";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isParkingFlow = location.pathname.startsWith("/parking");
  const isSecurityFlow = location.pathname.startsWith("/security");

  const studentInfo = localStorage.getItem("studentInfo");
  const isStudent = studentInfo !== null;
  const isParkingPage = location.pathname.includes("/parking");
  const isAdminPage = location.pathname.toLowerCase().includes("admin");
  const showDashboardButton =
    isParkingPage &&
    isStudent &&
    !isAdminPage &&
    location.pathname !== "/student-dashboard";

  return (
    <div className="min-h-screen bg-gray-200">
      {isParkingFlow && (
        <UnifiedNavbar
          moduleName="Parking"
          links={[
            { to: "/parking/zones", label: "Select Zone" },
            { to: "/parking/admin", label: "Admin Records" },
          ]}
          rightActions={
            showDashboardButton ? (
              <button
                onClick={() => navigate("/student-dashboard")}
                className="flex items-center gap-2 px-5 py-2 bg-white/20 text-white font-bold rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:bg-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] border border-white/50 transition-all hover:scale-105 backdrop-blur-md mr-2"
              >
                &larr; Dashboard
              </button>
            ) : null
          }
        />
      )}

      {isSecurityFlow && (
        <UnifiedNavbar
          moduleName="Security"
          links={[
            { to: "/security", label: "Staff Management" },
            { to: "/security/scan", label: "QR Scanner" },
          ]}
        />
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />

        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-profile" element={<StudentProfile />} />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route path="/AdminLockerMap" element={<AdminLockerMap />} />
        <Route path="/lockers" element={<LockerMap />} />
        <Route path="/BookLockersStatus" element={<BookLockersStatus />} />
        <Route path="/LockerMaintenance" element={<LockerMaintenance />} />
        <Route path="/admin/locker-maintenance" element={<LockerMaintenance />} />

        <Route path="/parking" element={<CampusMap />} />
        <Route path="/parking/zones" element={<CampusMap />} />
        <Route path="/parking/map" element={<ParkingMap />} />
        <Route path="/parking/book/:spotId" element={<ParkingBookingForm />} />
        <Route path="/parking/admin" element={<AdminParkingRecords />} />
        <Route path="/parking/my-booking" element={<MyParkingBooking />} />

        <Route path="/security" element={<SecurityPortal />} />
        <Route path="/security/scan" element={<QRScanner />} />
      </Routes>
    </div>
  );
};

export default App;