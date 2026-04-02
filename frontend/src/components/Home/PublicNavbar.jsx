import { Link, useLocation } from "react-router-dom";

const PublicNavbar = () => {
  const location = useLocation();

  return (
    <nav className="public-navbar">
      <div className="public-navbar-brand">
        <h2>UniSpot</h2>
        <p>Vehicle Parking & Locker Management System</p>
      </div>

      <div className="public-navbar-links">
        <Link
          to="/"
          className={location.pathname === "/" ? "active-link" : ""}
        >
          Home
        </Link>

        <Link
          to="/student-register"
          className={location.pathname === "/student-register" ? "active-link" : ""}
        >
          Register
        </Link>

        <Link
          to="/student-login"
          className={location.pathname === "/student-login" ? "active-link" : ""}
        >
          Login
        </Link>

        <Link
          to="/about"
          className={location.pathname === "/about" ? "active-link" : ""}
        >
          About
        </Link>

        <Link
          to="/contact"
          className={location.pathname === "/contact" ? "active-link" : ""}
        >
          Contact
        </Link>
      </div>
    </nav>
  );
};

export default PublicNavbar;