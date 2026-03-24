import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import studentApi from "./studentApi";
import StudentNavbar from "./StudentNavbar";

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await studentApi.get("/students/profile");
        setStudent(data);
      } catch (error) {
        localStorage.removeItem("studentInfo");
        navigate("/student-login");
      }
    };

    fetchProfile();
  }, [navigate]);

  if (!student) {
    return <h3 className="student-loading">Loading...</h3>;
  }

  return (
    <>
      <StudentNavbar />

      <div className="student-dashboard">
        <h1>Welcome, {student.name}</h1>

        <div className="student-card-grid">
          <div className="student-card">
            <h3>Student Details</h3>
            <p><strong>ID:</strong> {student.studentId}</p>
            <p><strong>Faculty:</strong> {student.faculty}</p>
            <p><strong>Phone:</strong> {student.phone}</p>
            <p><strong>Address:</strong> {student.address}</p>
          </div>

          <div className="student-card">
            <h3>Account Status</h3>
            <p><strong>Marks:</strong> {student.marks}/10</p>
            <p><strong>Status:</strong> {student.status}</p>
            {student.blockReason && (
              <p><strong>Reason:</strong> {student.blockReason}</p>
            )}
          </div>

          <div className="student-card">
            <h3>Vehicle Details</h3>
            {student.vehicleRegistered && student.vehicle ? (
              <>
                <p><strong>Model:</strong> {student.vehicle.model}</p>
                <p><strong>Color:</strong> {student.vehicle.color}</p>
                <p>
                  <strong>Reg No:</strong>{" "}
                  {student.vehicle.regLetters}-{student.vehicle.regNumbers}
                </p>
              </>
            ) : (
              <p>No vehicle registered</p>
            )}
          </div>

          <div className="student-card student-qr-card">
            <h3>QR Code</h3>
            <img src={student.qrCode} alt="QR Code" className="student-qr-image" />
          </div>

          <div className="student-card">
            <h3>Student Photo</h3>
            <img
              src={`http://localhost:5000${student.photo}`}
              alt="Student"
              className="student-profile-image"
            />
          </div>
        </div>

        <div className="student-dashboard-actions">
          <Link to="/student-profile" className="student-btn-link">
            Go to Profile
          </Link>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;