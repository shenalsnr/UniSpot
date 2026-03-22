import { Routes, Route } from "react-router-dom";
import SideBar from "./components/Locker Mnagement/SideBar";
import LockerMap from "./components/Locker Mnagement/LockerMap";
import AdminLockerMap from "./components/Locker Mnagement/AdminLockerMap";

const App = () => {
  return (
    <div className="flex min-h-screen bg-gray-200">
      <SideBar />
      <div className="flex-1 p-10">
        <Routes>
          {/*  <Route path="/lockers" element={<LockerMap />} />  */}

          
        </Routes>
      </div>
    </div>
  );
};

export default App;