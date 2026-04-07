import { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import adminApi from "./adminApi";


// ── Parking points colour helper ─────────────────────────────────────────────
const getPointsColor = (points) => {
  if (points >= 7) return "bg-gradient-to-br from-green-600 to-green-500";
  if (points >= 4) return "bg-gradient-to-br from-yellow-500 to-yellow-400";
  return "bg-gradient-to-br from-red-600 to-red-500";
};

const getStatusBadge = (status) => {
  if (status === "blocked") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
        🚫 Blocked
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
      ✓ Active
    </span>
  );
};

// ── Restore Points Modal ──────────────────────────────────────────────────────
const RestoreModal = ({ student, onClose, onSuccess }) => {
  const [mode, setMode] = useState(null); // 'quick' | 'custom' | 'reset'
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const current = student?.marks ?? 0;
  const remaining = 10 - current;

  const doRestore = async (points) => {
    if (!points || points < 1) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await adminApi.put(
        `/admin/students/restore-points/${student._id}`,
        { points }
      );
      onSuccess(data.message, data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to restore points");
    } finally {
      setLoading(false);
    }
  };

  const doReset = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await adminApi.put(
        `/admin/students/reset-points/${student._id}`
      );
      onSuccess(data.message, data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset points");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h3 className="text-xl font-extrabold mb-0.5">Restore Parking Points</h3>
          <p className="text-blue-100 text-sm">{student?.name} — {student?.studentId}</p>
        </div>

        <div className="p-6">
          {/* Current State */}
          <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Current Points</p>
              <div className="flex items-center gap-2">
                <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-bold shadow-sm ${getPointsColor(current)}`}>
                  {current}/10
                </span>
                {getStatusBadge(student?.status)}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Can Restore</p>
              <p className="text-2xl font-black text-slate-800">+{remaining}</p>
            </div>
          </div>

          {error && (
            <p className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl">
              ⚠️ {error}
            </p>
          )}

          {/* Action selection */}
          {!mode && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-700 mb-3">Choose restore action:</p>

              <button
                onClick={() => setMode("quick")}
                className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 text-blue-800 font-bold rounded-xl transition-all text-left"
              >
                ⚡ Quick Restore — preset amounts
              </button>

              <button
                onClick={() => setMode("custom")}
                className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 hover:border-indigo-400 text-indigo-800 font-bold rounded-xl transition-all text-left"
              >
                ✏️ Custom Amount — enter specific points
              </button>

              {remaining > 0 && (
                <button
                  onClick={() => setMode("reset")}
                  className="w-full py-3 px-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 text-green-800 font-bold rounded-xl transition-all text-left"
                >
                  🔄 Reset to Full — restore to 10/10
                </button>
              )}
            </div>
          )}

          {/* Quick Restore */}
          {mode === "quick" && (
            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">Select restore amount:</p>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[1, 2, 3, 5].filter(n => n <= remaining).map((n) => (
                  <button
                    key={n}
                    onClick={() => doRestore(n)}
                    disabled={loading}
                    className="py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-lg rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    +{n}
                  </button>
                ))}
              </div>
              {remaining === 0 && (
                <p className="text-center text-emerald-700 font-bold text-sm">Points are already at maximum (10/10)</p>
              )}
              <button onClick={() => setMode(null)} className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors">
                ← Back
              </button>
            </div>
          )}

          {/* Custom Amount */}
          {mode === "custom" && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Points to restore (1–{remaining}):
              </label>
              <input
                type="number"
                min={1}
                max={remaining}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={`Enter 1 to ${remaining}`}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold text-lg mb-4"
              />
              <button
                onClick={() => doRestore(parseInt(customAmount, 10))}
                disabled={loading || !customAmount || parseInt(customAmount) < 1 || parseInt(customAmount) > remaining}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl transition-all mb-3"
              >
                {loading ? "Restoring..." : `Restore +${customAmount || "?"} Points`}
              </button>
              <button onClick={() => setMode(null)} className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors">
                ← Back
              </button>
            </div>
          )}

          {/* Full Reset confirmation */}
          {mode === "reset" && (
            <div>
              <div className="text-center mb-5 p-4 bg-green-50 border border-green-200 rounded-2xl">
                <p className="text-4xl mb-2">🔄</p>
                <p className="text-green-800 font-bold">Reset to 10/10 points?</p>
                <p className="text-green-700 text-xs mt-1">
                  This will restore full points{student?.status === "blocked" ? " and automatically unblock the student" : ""}.
                </p>
              </div>
              <button
                onClick={doReset}
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all mb-3"
              >
                {loading ? "Resetting..." : "Confirm Reset to 10/10"}
              </button>
              <button onClick={() => setMode(null)} className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors">
                ← Back
              </button>
            </div>
          )}

          {/* Cancel */}
          {!mode && (
            <button
              onClick={onClose}
              className="w-full mt-4 py-2.5 border-2 border-slate-200 hover:border-slate-400 text-slate-600 font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // 'success' | 'error'
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const showMsg = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const fetchStudents = async () => {
    try {
      const { data } = await adminApi.get("/admin/students");
      setStudents(data);
    } catch (error) {
      showMsg("Failed to load students", "error");
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
      showMsg("Failed to load student details", "error");
    }
  };

  const blockStudent = async (id) => {
    const reason = prompt("Enter block reason:");
    if (!reason) return;
    try {
      const { data } = await adminApi.put(`/admin/students/block/${id}`, { blockReason: reason });
      showMsg(data.message);
      fetchStudents();
      if (selectedStudent?._id === id) viewStudentDetails(id);
    } catch {
      showMsg("Failed to block student", "error");
    }
  };

  const unblockStudent = async (id) => {
    try {
      const { data } = await adminApi.put(`/admin/students/unblock/${id}`);
      showMsg(data.message);
      fetchStudents();
      if (selectedStudent?._id === id) viewStudentDetails(id);
    } catch {
      showMsg("Failed to unblock student", "error");
    }
  };

  const handleRestoreSuccess = (msg) => {
    showMsg(msg);
    setShowRestoreModal(false);
    fetchStudents();
    if (selectedStudent) viewStudentDetails(selectedStudent._id);
  };

  // Filter students
  const filteredStudents = students.filter((s) =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <AdminNavbar />

      {/* Restore Points Modal */}
      {showRestoreModal && selectedStudent && (
        <RestoreModal
          student={selectedStudent}
          onClose={() => setShowRestoreModal(false)}
          onSuccess={handleRestoreSuccess}
        />
      )}

      <PageBackground className="p-4 md:p-8">
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
                    onClick={() => setShowRestoreModal(true)}
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
      </PageBackground>
    </>
  );
};

export default AdminDashboard;