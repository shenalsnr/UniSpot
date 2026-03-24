import { Routes, Route, Link, useLocation } from "react-router-dom";
import AdminLockerMap from "./components/LockerManagement/AdminLockerMap";
import LockerMap from "./components/LockerManagement/LockerMap";
// New Multi-page Parking Components
import CampusMap from "./components/ParkingManagement/CampusMap";
import ParkingMap from "./components/ParkingManagement/ParkingMap";
import ParkingBookingForm from "./components/ParkingManagement/ParkingBookingForm";
import AdminParkingRecords from "./components/ParkingManagement/AdminParkingRecords";

const App = () => {
  const location = useLocation();
  const isParkingFlow = location.pathname.startsWith('/parking');

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Temporary Navigation Header just for testing Parking Flow */}
      {isParkingFlow && (
        <nav className="bg-blue-700 text-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-wider">UniSpot</span>
                <span className="bg-blue-800 text-blue-100 text-xs px-2 py-1 rounded-md font-bold uppercase">Parking</span>
              </div>
              <div className="flex space-x-6">
                <Link to="/parking/map" className="hover:text-blue-200 hover:bg-blue-800 px-3 py-2 rounded-md font-semibold transition-colors">
                  Interactive Map
                </Link>
                <Link to="/parking/book" className="hover:text-blue-200 hover:bg-blue-800 px-3 py-2 rounded-md font-semibold transition-colors">
                  Book Spot
                </Link>
                <Link to="/parking/admin" className="hover:text-blue-200 hover:bg-blue-800 px-3 py-2 rounded-md font-semibold transition-colors">
                  Admin Records
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
        
        {/* New Multi-page routes */}
        <Route path="/parking" element={<CampusMap />} />
        <Route path="/parking/zones" element={<CampusMap />} />
        <Route path="/parking/map" element={<ParkingMap />} />
        <Route path="/parking/book/:spotId" element={<ParkingBookingForm />} />
        <Route path="/parking/book" element={<ParkingBookingForm />} />
        <Route path="/parking/admin" element={<AdminParkingRecords />} />
      </Routes>
    </div>
  );
};

export default App;