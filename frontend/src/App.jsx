import { Routes, Route } from "react-router-dom";
import AdminLockerMap from "./components/LockerManagement/AdminLockerMap";
import LockerMap from "./components/LockerManagement/LockerMap";
import BookLockersStatus from "./components/LockerManagement/BookLockersStatus";

const App = () => {
  return (
    <div >
      <Routes>
        <Route path="/" element={<AdminLockerMap />} />
        <Route path="/AdminLockerMap" element={<AdminLockerMap />} />
        <Route path="/lockers" element={<LockerMap />} />
        <Route path="/BookLockersStatus" element={<BookLockersStatus />} />

      </Routes>
    </div>
  );
};

export default App;

