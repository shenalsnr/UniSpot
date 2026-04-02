import { useEffect, useState } from "react";
import AdminNavbar from "./AdminNavbar";
import adminApi from "./adminApi";

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState("");

  const fetchStudents = async () => {
    try {
      const { data } = await adminApi.get("/admin/students");
      setStudents(data);
    } catch (error) {
      setMessage("Failed to load students");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const viewStudentDetails = async (id) => {
    try {
      const { data } = await adminApi.get(`/admin/students/${id}`);
      setSelectedStudent(data);
    } catch (error) {
      setMessage("Failed to load student details");
    }
  };

  const blockStudent = async (id) => {
    const reason = prompt("Enter block reason:");
    if (!reason) return;

    try {
      const { data } = await adminApi.put(`/admin/students/block/${id}`, {
        blockReason: reason,
      });
      setMessage(data.message);
      fetchStudents();
      if (selectedStudent && selectedStudent._id === id) {
        viewStudentDetails(id);
      }
    } catch (error) {
      setMessage("Failed to block student");
    }
  };

  const unblockStudent = async (id) => {
    try {
      const { data } = await adminApi.put(`/admin/students/unblock/${id}`);
      setMessage(data.message);
      fetchStudents();
      if (selectedStudent && selectedStudent._id === id) {
        viewStudentDetails(id);
      }
    } catch (error) {
      setMessage("Failed to unblock student");
    }
  };

  const resetMarks = async (id) => {
    try {
      const { data } = await adminApi.put(`/admin/students/reset-marks/${id}`);
      setMessage(data.message);
      fetchStudents();
      if (selectedStudent && selectedStudent._id === id) {
        viewStudentDetails(id);
      }
    } catch (error) {
      setMessage("Failed to reset marks");
    }
  };

  return (
    <>
      <AdminNavbar />

      <div className="student-dashboard-page">
        <div className="student-hero-card">
          <div>
            <h1>Admin Dashboard</h1>
            <p>View and manage all registered students in the system.</p>
          </div>
        </div>

        {message && <p className="student-success">{message}</p>}

        <div className="student-profile-grid">
          <div className="student-section">
            <h2>Registered Students</h2>

            {students.map((student) => (
              <div key={student._id} className="student-summary-card" style={{ marginBottom: "12px" }}>
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>ID:</strong> {student.studentId}</p>
                <p><strong>Status:</strong> {student.status}</p>
                <p><strong>Marks:</strong> {student.marks}</p>
                <button onClick={() => viewStudentDetails(student._id)}>View Details</button>
              </div>
            ))}
          </div>

          <div className="student-section">
            <h2>Student Details</h2>

            {selectedStudent ? (
              <>
                <p><strong>Name:</strong> {selectedStudent.name}</p>
                <p><strong>ID:</strong> {selectedStudent.studentId}</p>
                <p><strong>Faculty:</strong> {selectedStudent.faculty}</p>
                <p><strong>Phone:</strong> {selectedStudent.phone}</p>
                <p><strong>Address:</strong> {selectedStudent.address}</p>
                <p><strong>Email:</strong> {selectedStudent.email}</p>
                <p><strong>Status:</strong> {selectedStudent.status}</p>
                <p><strong>Marks:</strong> {selectedStudent.marks}</p>
                <p><strong>Block Reason:</strong> {selectedStudent.blockReason || "None"}</p>

                {selectedStudent.vehicleRegistered && selectedStudent.vehicle ? (
                  <>
                    <p><strong>Vehicle Model:</strong> {selectedStudent.vehicle.model}</p>
                    <p><strong>Vehicle Color:</strong> {selectedStudent.vehicle.color}</p>
                    <p>
                      <strong>Vehicle Number:</strong>{" "}
                      {selectedStudent.vehicle.regLetters}-{selectedStudent.vehicle.regNumbers}
                    </p>
                  </>
                ) : (
                  <p><strong>Vehicle:</strong> No vehicle registered</p>
                )}

                <img
                  src={`http://localhost:5000${selectedStudent.photo}`}
                  alt="Student"
                  className="student-profile-image"
                />

                <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button onClick={() => blockStudent(selectedStudent._id)}>Block</button>
                  <button onClick={() => unblockStudent(selectedStudent._id)}>Unblock</button>
                  <button onClick={() => resetMarks(selectedStudent._id)}>Reset Marks</button>
                </div>
              </>
            ) : (
              <p>Select a student to view details.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;