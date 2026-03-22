import { Routes, Route } from "react-router-dom";
import AdminLockerMap from "./components/LockerManagement/AdminLockerMap";
import LockerMap from "./components/LockerManagement/LockerMap";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-200">
      <Routes>
        <Route path="/" element={<AdminLockerMap />} />
        <Route path="/AdminLockerMap" element={<AdminLockerMap />} />
        <Route path="/lockers" element={<LockerMap />} />
      </Routes>
    </div>
  );
};

export default App;