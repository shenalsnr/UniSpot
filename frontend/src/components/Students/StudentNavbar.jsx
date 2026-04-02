import { Link, useLocation, useNavigate } from "react-router-dom";

const StudentNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const logoutHandler = () => {
    localStorage.removeItem("studentInfo");
    navigate("/student-login");
  };

  return (
    <nav className="student-navbar">
      <div className="student-navbar-brand">
        <h2>UniSpot Student Portal</h2>
        <p>Student Dashboard & Profile Management</p>
      </div>

      <div className="student-navbar-links">
        <Link
          to="/"
          className={location.pathname === "/" ? "active-link" : ""}
        >
          Home
        </Link>

        <Link
          to="/student-dashboard"
          className={location.pathname === "/student-dashboard" ? "active-link" : ""}
        >
          Dashboard
        </Link>

        <Link
          to="/student-profile"
          className={location.pathname === "/student-profile" ? "active-link" : ""}
        >
          Profile
        </Link>

        <button onClick={logoutHandler}>Logout</button>
      </div>
    </nav>
  );
};

export default StudentNavbar;