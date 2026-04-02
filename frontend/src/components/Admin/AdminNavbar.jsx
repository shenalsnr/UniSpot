import { useNavigate } from "react-router-dom";
import UnifiedNavbar from "../Shared/UnifiedNavbar";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("adminInfo");
    navigate("/admin-login");
  };

  return (
    <UnifiedNavbar
      moduleName="Student Management & Profile Control"
      title="UniSpot Admin"
      links={[
        { to: "/admin-dashboard", label: "Dashboard" }
      ]}
      rightActions={
        <button
          onClick={logoutHandler}
          className="px-6 py-2 bg-[oklch(48.8%_0.243_264.376)] hover:opacity-90 text-white font-bold rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] border border-white/50 transition-all hover:scale-105"
        >
          Logout
        </button>
      }
    />
  );
};

export default AdminNavbar;