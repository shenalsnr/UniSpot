import { Link, useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("adminInfo");
    navigate("/admin-login");
  };

  return (
    <nav className="student-navbar">
      <div className="student-navbar-brand">
        <h2>UniSpot Admin Portal</h2>
        <p>Student Management & Profile Control</p>
      </div>

      <div className="student-navbar-links">
        <Link to="/admin-dashboard">Dashboard</Link>
        <button onClick={logoutHandler}>Logout</button>
      </div>
    </nav>
  );
};

export default AdminNavbar;