import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [messageType, setMessageType] = useState("success");

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

  // 🔍 Filter students by search query
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white rounded-[26px] p-6 md:p-8 shadow-xl shadow-blue-900/20 mb-6">
        <h1 className="m-0 mb-2 text-3xl md:text-4xl font-extrabold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="m-0 text-blue-50 opacity-95 text-lg">
          View and manage registered students, parking points, and access.
        </p>
      </div>

      {/* Status message */}
      {message && (
        <p className={`px-5 py-4 rounded-xl font-semibold mb-6 shadow-sm border ${messageType === "error"
          ? "bg-red-50 text-red-800 border-red-200"
          : "bg-green-100 text-green-800 border-green-200"
          }`}>
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Student List ── */}
        <div className="bg-white rounded-[24px] p-6 shadow-md border border-slate-100">
          <h2 className="mt-0 mb-4 text-slate-800 text-2xl font-bold border-b border-slate-100 pb-3">
            Registered Students
          </h2>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or ID..."
            className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm font-medium mb-4 transition-colors"
          />

          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className={`p-4 rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col gap-2 ${selectedStudent?._id === student._id
                  ? "bg-blue-50 border-blue-300"
                  : "bg-slate-50 border-slate-100 hover:bg-white"
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="m-0 font-bold text-slate-900">{student.name}</p>
                    <p className="m-0 text-slate-500 text-xs font-mono">{student.studentId}</p>
                  </div>
                  {getStatusBadge(student.status)}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-semibold">Parking Points:</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-white text-xs font-bold shadow-sm ${getPointsColor(student.marks ?? 10)}`}>
                    {student.marks ?? 10}/10
                  </span>
                </div>

                <button
                  className="bg-[oklch(48.8%_0.243_264.376)] hover:opacity-90 text-white font-semibold py-2 px-5 rounded-xl transition-all shadow-sm mt-1 w-full sm:w-auto text-sm"
                  onClick={() => viewStudentDetails(student._id)}
                >
                  View Details
                </button>
              </div>
            ))}
            {filteredStudents.length === 0 && (
              <p className="text-slate-500 italic text-sm">No students found.</p>
            )}
          </div>
        </div>

        {/* ── Student Detail Panel ── */}
        <div className="bg-white rounded-[24px] p-6 shadow-md border border-slate-100 sticky top-24 self-start">
          <h2 className="mt-0 mb-4 text-slate-800 text-2xl font-bold border-b border-slate-100 pb-3">
            Student Details
          </h2>

          {selectedStudent ? (
            <div className="flex flex-col gap-3">
              {/* Basic info */}
              <p className="m-0 text-slate-600 text-lg"><strong className="text-slate-900">Name:</strong> {selectedStudent.name}</p>
              <p className="m-0 text-slate-600"><strong className="text-slate-900">ID:</strong> <span className="font-mono">{selectedStudent.studentId}</span></p>
              <p className="m-0 text-slate-600"><strong className="text-slate-900">Faculty:</strong> {selectedStudent.faculty}</p>
              <p className="m-0 text-slate-600"><strong className="text-slate-900">Phone:</strong> {selectedStudent.phone}</p>
              <p className="m-0 text-slate-600"><strong className="text-slate-900">Email:</strong> {selectedStudent.email || "N/A"}</p>

              {/* Parking status section */}
              <div className="my-1 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2.5">
                <p className="m-0 text-xs font-black text-slate-500 uppercase tracking-wider">Parking Status</p>

                <div className="flex items-center gap-3">
                  <span className="text-slate-700 font-semibold text-sm">Access:</span>
                  {getStatusBadge(selectedStudent.status)}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-700 font-semibold text-sm">Points:</span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-bold shadow-sm ${getPointsColor(selectedStudent.marks ?? 10)}`}>
                      {selectedStudent.marks ?? 10}/10
                    </span>
                    {/* Visual bar */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-4 rounded-sm ${i < (selectedStudent.marks ?? 10)
                            ? i < 4 ? "bg-red-400" : i < 7 ? "bg-yellow-400" : "bg-green-400"
                            : "bg-slate-200"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {selectedStudent.status === "blocked" && (
                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs font-bold text-red-700 mb-0.5">🚫 Block Reason</p>
                    <p className="text-xs text-red-600 m-0">{selectedStudent.blockReason || "No reason provided"}</p>
                  </div>
                )}
              </div>

              {/* Vehicle info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="m-0 text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Vehicle</p>
                {selectedStudent.vehicleRegistered && selectedStudent.vehicle ? (
                  <div className="flex flex-col gap-1">
                    <p className="m-0 text-slate-600 text-sm"><strong className="text-slate-900">Model:</strong> {selectedStudent.vehicle.model}</p>
                    <p className="m-0 text-slate-600 text-sm"><strong className="text-slate-900">Color:</strong> {selectedStudent.vehicle.color}</p>
                    <p className="m-0 text-slate-600 text-sm">
                      <strong className="text-slate-900">Reg:</strong>{" "}
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">{selectedStudent.vehicle.regLetters}-{selectedStudent.vehicle.regNumbers}</span>
                    </p>
                  </div>
                ) : (
                  <p className="m-0 text-slate-500 text-sm italic">No vehicle registered</p>
                )}
              </div>

              {/* Student photo */}
              <img
                src={`http://localhost:5000${selectedStudent.photo}`}
                alt="Student"
                className="w-36 h-36 object-cover rounded-2xl border-4 border-slate-100 shadow-sm"
              />

              {/* Action buttons */}
              <div className="mt-2 flex flex-col gap-3">
                {/* Primary: Restore Points */}
                <button
                  onClick={() => restoreParkingPoints(selectedStudent._id)}
                  disabled={(selectedStudent.marks ?? 10) >= 10}
                  className="w-full py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  {(selectedStudent.marks ?? 10) >= 10
                    ? "✓ Points at Maximum (10/10)"
                    : "🎯 Restore Parking Points"}
                </button>

                {/* Secondary actions */}
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.status !== "blocked" ? (
                    <button
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-sm text-sm"
                      onClick={() => blockStudent(selectedStudent._id)}
                    >
                      🚫 Block Student
                    </button>
                  ) : (
                    <button
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-sm text-sm"
                      onClick={() => unblockStudent(selectedStudent._id)}
                    >
                      ✓ Unblock Student
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center mt-4">
              <p className="text-4xl mb-3">👆</p>
              <p className="text-slate-500 mb-0 text-sm">Select a student from the list to view details and manage parking access.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;