import { Link, useNavigate } from "react-router-dom";

const StudentNavbar = () => {
  const navigate = useNavigate();
  const studentInfo = JSON.parse(localStorage.getItem("studentInfo"));

  const logoutHandler = () => {
    localStorage.removeItem("studentInfo");
    navigate("/student-login");
  };

  return (
    <nav className="student-navbar">
      <div className="student-navbar-left">
        <h2>UNISPOT Student</h2>
      </div>

      <div className="student-navbar-right">
        <Link to="/student-register">Register</Link>
        <Link to="/student-login">Login</Link>

        {studentInfo && (
          <>
            <Link to="/student-dashboard">Dashboard</Link>
            <Link to="/student-profile">Profile</Link>
            <button onClick={logoutHandler}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default StudentNavbar;