import { Routes, Route, Link, useLocation } from "react-router-dom";
import AdminLockerMap from "./components/LockerManagement/AdminLockerMap";
import LockerMap from "./components/LockerManagement/LockerMap";

import CampusMap from "./components/ParkingManagement/CampusMap";
import ParkingMap from "./components/ParkingManagement/ParkingMap";
import ParkingBookingForm from "./components/ParkingManagement/ParkingBookingForm";
import AdminParkingRecords from "./components/ParkingManagement/AdminParkingRecords";
import SecurityPortal from "./components/SecurityPortal/SecurityPortal";
import QRScanner from "./components/SecurityPortal/QRScanner";

const App = () => {
  const location = useLocation();
  const isParkingFlow = location.pathname.startsWith("/parking");
  const isSecurityFlow = location.pathname.startsWith("/security");

  return (
    <div className="min-h-screen bg-gray-200">
      {isParkingFlow && (
        <nav className="bg-blue-700 text-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-wider">
                  UniSpot
                </span>
                <span className="bg-blue-800 text-blue-100 text-xs px-2 py-1 rounded-md font-bold uppercase">
                  Parking
                </span>
              </div>

              <div className="flex space-x-6">
                <Link
                  to="/parking/zones"
                  className="hover:text-blue-200 hover:bg-blue-800 px-3 py-2 rounded-md font-semibold transition-colors"
                >
                  Select Zone
                </Link>

                <Link
                  to="/parking/map"
                  className="hover:text-blue-200 hover:bg-blue-800 px-3 py-2 rounded-md font-semibold transition-colors"
                >
                  Parking Slots
                </Link>

                <Link
                  to="/parking/admin"
                  className="hover:text-blue-200 hover:bg-blue-800 px-3 py-2 rounded-md font-semibold transition-colors"
                >
                  Admin Records
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      {isSecurityFlow && (
        <nav className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-wider">
                  UniSpot
                </span>
                <span className="bg-blue-800 text-blue-100 text-xs px-2 py-1 rounded-md font-bold uppercase">
                  Security
                </span>
              </div>

              <div className="flex space-x-6">
                <Link
                  to="/security"
                  className="hover:text-blue-200 hover:bg-blue-800 px-3 py-2 rounded-md font-semibold transition-colors"
                >
                  Staff Management
                </Link>

                <Link
                  to="/security/scan"
                  className="hover:text-blue-200 hover:bg-blue-800 px-3 py-2 rounded-md font-semibold transition-colors"
                >
                  QR Scanner
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<AdminLockerMap />} />
        <Route path="/AdminLockerMap" element={<AdminLockerMap />} />
        <Route path="/lockers" element={<LockerMap />} />

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