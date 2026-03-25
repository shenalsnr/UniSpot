import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../Home/PublicNavbar";
import studentApi from "./studentApi";

const StudentLogin = () => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await studentApi.post("/students/login", {
        studentId: studentId.toUpperCase(),
        password,
      });

      localStorage.setItem("studentInfo", JSON.stringify(res.data));
      navigate("/student-dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <>
      <PublicNavbar />
      <div className="student-page">
        <form className="student-login-card student-form fade-up" onSubmit={submitHandler}>
          <h2>Student Login</h2>
          <p className="student-login-subtitle">
            Access your profile, QR code, and vehicle management dashboard.
          </p>

          {message && <p className="student-error">{message}</p>}

          <input
            type="text"
            placeholder="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </>
  );
};

export default StudentLogin;