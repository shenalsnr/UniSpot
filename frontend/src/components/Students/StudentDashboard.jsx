import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import studentApi from "./studentApi";
import StudentNavbar from "./StudentNavbar";

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await studentApi.get("/students/profile");
        setStudent(data);
      } catch (error) {
        setErrorMessage("Failed to load student data");
        localStorage.removeItem("studentInfo");
        setTimeout(() => {
          navigate("/student-login");
        }, 1500);
      }
    };

    fetchProfile();
  }, [navigate]);

  const getMarksClass = (marks) => {
    if (marks >= 7) return "marks-good";
    if (marks >= 4) return "marks-medium";
    return "marks-danger";
  };

  if (errorMessage) {
    return (
      <>
        <StudentNavbar />
        <div className="student-dashboard-page">
          <div className="student-alert-error">{errorMessage}</div>
        </div>
      </>
    );
  }

  if (!student) {
    return (
      <>
        <StudentNavbar />
        <div className="student-dashboard-page">
          <div className="student-loading-box">Loading dashboard...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <StudentNavbar />

      <div className="student-dashboard-page">
        <div className="student-hero-card">
          <div>
            <h1>Welcome back, {student.name}</h1>
            <p>
              Here you can check your profile, QR code, vehicle details,
              account status, and marks.
            </p>
          </div>

          <div className={`student-status-badge ${student.status === "blocked" ? "status-blocked" : "status-active"}`}>
            {student.status}
          </div>
        </div>

        <div className="student-summary-grid">
          <div className="student-summary-card">
            <h3>Student Information</h3>
            <div className="student-info-list">
              <p><span>Name:</span> {student.name}</p>
              <p><span>Student ID:</span> {student.studentId}</p>
              <p><span>Faculty:</span> {student.faculty}</p>
              <p><span>Phone:</span> {student.phone}</p>
              <p><span>Address:</span> {student.address}</p>
              <p><span>Email:</span> {student.email || "Not added"}</p>
            </div>
          </div>

          <div className="student-summary-card">
            <h3>Account Overview</h3>
            <div className="student-info-list">
              <p><span>Status:</span> {student.status}</p>
              <p>
                <span>Marks:</span>{" "}
                <span className={`student-marks-pill ${getMarksClass(student.marks)}`}>
                  {student.marks}/10
                </span>
              </p>
              <p><span>Vehicle Registered:</span> {student.vehicleRegistered ? "Yes" : "No"}</p>
              {student.blockReason && (
                <p><span>Block Reason:</span> {student.blockReason}</p>
              )}
            </div>
          </div>

          <div className="student-summary-card">
            <h3>Vehicle Details</h3>
            {student.vehicleRegistered && student.vehicle ? (
              <div className="student-info-list">
                <p><span>Model:</span> {student.vehicle.model}</p>
                <p><span>Color:</span> {student.vehicle.color}</p>
                <p>
                  <span>Registration:</span>{" "}
                  {student.vehicle.regLetters}-{student.vehicle.regNumbers}
                </p>
              </div>
            ) : (
              <div className="student-empty-box">
                <p>No vehicle registered yet.</p>
                <small>You can add one from your profile page.</small>
              </div>
            )}
          </div>

          <div className="student-summary-card student-photo-card">
            <h3>Student Photo</h3>
            <img
              src={`http://localhost:5000${student.photo}`}
              alt="Student"
              className="student-profile-image"
            />
          </div>

          <div className="student-summary-card student-qr-card">
            <h3>QR Code</h3>
            <img src={student.qrCode} alt="QR Code" className="student-qr-image" />
            <small>This QR is generated based on your student ID.</small>
          </div>
        </div>

        <div className="student-dashboard-actions">
          <Link to="/student-profile" className="student-btn-link">
            Manage Profile
          </Link>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;