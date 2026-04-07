import { Routes, Route, Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import HomePage from "./components/Home/HomePage";

import StudentRegister from "./components/Students/StudentRegister";
import StudentLogin from "./components/Students/StudentLogin";
import StudentDashboard from "./components/Students/StudentDashboard";
import StudentProfile from "./components/Students/StudentProfile";

import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminLogin from "./components/Admin/AdminLogin";
import AdminStaffModule from "./components/Admin/AdminStaffModule";

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
import StaffLayout from "./components/Staff/StaffLayout";
import StaffDashboard from "./components/Staff/StaffDashboard";
import UnifiedNavbar from "./components/Shared/UnifiedNavbar";
import LockerMaintenance from "./components/LockerManagement/LockerMaintenance";
import MyBookLocker from "./components/LockerManagement/MyBookLocker";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isParkingFlow = location.pathname.startsWith("/parking");
  const isSecurityFlow = location.pathname.startsWith("/security");

  const studentInfo = localStorage.getItem("studentInfo");
  const isStudent = studentInfo !== null;
  const isParkingPage = location.pathname.includes("/parking");
  const isAdminPage = location.pathname.toLowerCase().includes("admin");
  const showDashboardButton = isParkingPage && isStudent && !isAdminPage && location.pathname !== "/student-dashboard";

  return (
    <div className="min-h-screen bg-gray-200">
      {isParkingFlow && !isAdminPage && (
        <UnifiedNavbar 
          moduleName="Parking"
          links={[
            { to: "/parking/zones", label: "Select Zone" },
            { to: "/parking/admin", label: "Admin Records" }
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
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Staff Portal - Nested Routes */}
        <Route path="/staff-dashboard" element={<StaffLayout />}>
          <Route index element={<StaffDashboard />} />
          <Route path="scanner" element={<QRScanner />} />
        </Route>

        {/* Locker Management */}
        <Route path="/AdminLockerMap" element={<AdminLockerMap />} />
        <Route path="/lockers" element={<LockerMap />} />
        <Route path="/BookLockersStatus" element={<BookLockersStatus />} />
        <Route path="/LockerMaintenance" element={<LockerMaintenance />} />
        <Route path="/admin/locker-maintenance" element={<LockerMaintenance />} />
         <Route path="/MyBookLocker" element={<MyBookLocker/>} />

        {/* Parking flow */}
        <Route path="/parking" element={<CampusMap />} />
        <Route path="/parking/zones" element={<CampusMap />} />
        <Route path="/parking/map" element={<ParkingMap />} />
        <Route path="/parking/book/:spotId" element={<ParkingBookingForm />} />
        <Route path="/parking/admin" element={<AdminParkingRecords />} />
        <Route path="/parking/admin/staff" element={<AdminStaffModule />} />
        <Route path="/parking/my-booking" element={<MyParkingBooking />} />

        {/* Security Portal */}
        <Route path="/security" element={<SecurityPortal />} />
        <Route path="/security/scan" element={<QRScanner />} />

        {/*home*/}
        <Route path="/home" element={<HomePage />} />

      </Routes>
    </div>
  );
};

export default App;
