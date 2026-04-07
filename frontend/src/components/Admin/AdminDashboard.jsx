import { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import adminApi from "./adminApi";


// 🎨 Points color
const getPointsColor = (points) => {
  if (points >= 7) return "bg-green-500";
  if (points >= 4) return "bg-yellow-500";
  return "bg-red-500";
};

// 🚦 Status badge
const getStatusBadge = (status) => {
  if (status === "Blocked") {
    return (
      <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-600 rounded-full">
        🚫 Blocked
      </span>
    );
  }
  return (
    <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-600 rounded-full">
      ✓ Active
    </span>
  );
};

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState("");

  // 🔄 Load students
  const fetchStudents = async () => {
    try {
      const { data } = await adminApi.get("/admin/students");
      setStudents(data);
    } catch {
      setMessage("Failed to load students");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 👁 View details
  const viewStudentDetails = async (id) => {
    try {
      const { data } = await adminApi.get(`/admin/students/${id}`);
      setSelectedStudent(data);
    } catch {
      setMessage("Failed to load student");
    }
  };

  // 🚫 Block
  const blockStudent = async (id) => {
    const reason = prompt("Enter block reason:");
    if (!reason) return;

    try {
      const { data } = await adminApi.put(`/admin/students/block/${id}`, {
        blockReason: reason,
      });
      setMessage(data.message);
      fetchStudents();
    } catch {
      setMessage("Block failed");
    }
  };

  // ✅ Unblock
  const unblockStudent = async (id) => {
    try {
      const { data } = await adminApi.put(`/admin/students/unblock/${id}`);
      setMessage(data.message);
      fetchStudents();
    } catch {
      setMessage("Unblock failed");
    }
  };

  // 🔄 Restore Parking Points
  const restoreParkingPoints = async (id) => {
    const points = prompt("Enter number of points to restore (1-10):");
    if (!points) return;

    const restoreAmount = parseInt(points, 10);
    if (isNaN(restoreAmount) || restoreAmount < 1 || restoreAmount > 10) {
      setMessage("Invalid amount. Please enter a number between 1 and 10");
      return;
    }

    try {
      const { data } = await adminApi.put(
        `/admin/students/restore-points/${id}`,
        { points: restoreAmount }
      );
      setMessage(data.message);
      viewStudentDetails(id); // Refresh selected student
      fetchStudents();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to restore points"
      );
    }
  };

  // 🔄 Reset Parking Points
  const resetParkingPoints = async (id) => {
    if (!window.confirm("Reset parking points to 10/10 and unblock student?")) {
      return;
    }

    try {
      const { data } = await adminApi.put(
        `/admin/students/reset-points/${id}`
      );
      setMessage(data.message);
      viewStudentDetails(id); // Refresh selected student
      fetchStudents();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset points");
    }
  };

  return (
    <>
      <AdminNavbar />

      <PageBackground className="p-6">
        {/* 🔵 Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6 rounded-2xl mb-6 shadow-lg">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p>Manage students and monitor parking access</p>
        </div>

        {/* 📢 Message */}
        {message && (
          <p className="bg-green-100 text-green-700 p-3 rounded mb-4">
            {message}
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* 📋 Student List */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Students</h2>

            {students.map((student) => (
              <div
                key={student._id}
                className="border p-4 rounded-xl mb-3 hover:shadow-md transition"
              >
                <p><strong>{student.name}</strong></p>
                <p>ID: {student.studentId}</p>
                <p>Status: {getStatusBadge(student.status)}</p>

                <button
                  onClick={() => viewStudentDetails(student._id)}
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
                >
                  View
                </button>
              </div>
            ))}
          </div>

          {/* 👤 Student Details */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Details</h2>

            {selectedStudent ? (
              <>
                <p><strong>Name:</strong> {selectedStudent.name}</p>
                <p><strong>ID:</strong> {selectedStudent.studentId}</p>
                <p><strong>Email:</strong> {selectedStudent.email}</p>
                <p><strong>Phone:</strong> {selectedStudent.phone}</p>

                <p className="mt-2">
                  <strong>Status:</strong>{" "}
                  {getStatusBadge(selectedStudent.status)}
                </p>

                <p className="mt-2">
                  <strong>Points:</strong>{" "}
                  <span
                    className={`px-3 py-1 text-white rounded ${getPointsColor(
                      selectedStudent.marks
                    )}`}
                  >
                    {selectedStudent.marks}/10
                  </span>
                </p>

                {/* 🚗 Vehicle */}
                <div className="mt-4">
                  <h3 className="font-semibold">Vehicle</h3>
                  {selectedStudent.vehicle ? (
                    <>
                      <p>{selectedStudent.vehicle.model}</p>
                      <p>{selectedStudent.vehicle.color}</p>
                    </>
                  ) : (
                    <p>No vehicle</p>
                  )}
                </div>

                {/* 🖼 Photo */}
                <img
                  src={`http://localhost:5000${selectedStudent.photo}`}
                  alt="student"
                  className="w-32 h-32 object-cover mt-4 rounded"
                />

                {/* ⚙ Actions */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => blockStudent(selectedStudent._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Block
                  </button>

                  <button
                    onClick={() => unblockStudent(selectedStudent._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Unblock
                  </button>

                  <button
                    onClick={() => restoreParkingPoints(selectedStudent._id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Restore Points
                  </button>

                  <button
                    onClick={() => resetParkingPoints(selectedStudent._id)}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    Reset Points
                  </button>
                </div>
              </>
            ) : (
              <p>Select a student to view details</p>
            )}
          </div>
        </div>
      </PageBackground>
    </>
  );
};

export default AdminDashboard;