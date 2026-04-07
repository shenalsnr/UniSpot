import { useEffect, useState } from "react";
import AdminNavbar from "./AdminNavbar";
import adminApi from "./adminApi";
import PageBackground from "../Shared/PageBackground";

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

      <PageBackground className="p-4 md:p-8">
        <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white rounded-[26px] p-6 md:p-8 shadow-xl shadow-blue-900/20 mb-6">
          <div>
            <h1 className="m-0 mb-2 text-3xl md:text-4xl font-extrabold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="m-0 leading-relaxed max-w-[700px] text-blue-50 opacity-95 text-lg">
              View and manage all registered students in the system.
            </p>
          </div>
        </div>

        {message && (
          <p className="bg-green-100 text-green-800 px-5 py-4 rounded-xl font-semibold mb-6 shadow-sm border border-green-200">
            {message}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-6 xl:grid-cols-2">
          <div className="bg-white rounded-[24px] p-6 shadow-md border border-slate-100">
            <h2 className="mt-0 mb-5 text-slate-800 text-2xl font-bold border-b border-slate-100 pb-3">
              Registered Students
            </h2>

            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
              {students.map((student) => (
                <div
                  key={student._id}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:bg-white flex flex-col items-start gap-1"
                >
                  <p className="m-0 text-slate-600">
                    <strong className="text-slate-900">Name:</strong> {student.name}
                  </p>
                  <p className="m-0 text-slate-600">
                    <strong className="text-slate-900">ID:</strong> {student.studentId}
                  </p>
                  <div className="flex gap-4 w-full">
                    <p className="m-0 text-slate-600">
                      <strong className="text-slate-900">Status:</strong>{" "}
                      <span
                        className={`font-semibold ${
                          student.status === "blocked" ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {student.status}
                      </span>
                    </p>
                    <p className="m-0 text-slate-600">
                      <strong className="text-slate-900">Marks:</strong>{" "}
                      <span className="font-semibold text-blue-700">
                        {student.marks}/10
                      </span>
                    </p>
                  </div>
                  <button
                    className="bg-[oklch(48.8%_0.243_264.376)] hover:opacity-90 text-white font-semibold py-2 px-5 rounded-xl transition-colors shadow-sm mt-3 w-full sm:w-auto"
                    onClick={() => viewStudentDetails(student._id)}
                  >
                    View Details
                  </button>
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-slate-500 italic">No students registered yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-md border border-slate-100 sticky top-24 self-start">
            <h2 className="mt-0 mb-5 text-slate-800 text-2xl font-bold border-b border-slate-100 pb-3">
              Student Details
            </h2>

            {selectedStudent ? (
              <div className="flex flex-col gap-2">
                <p className="m-0 text-slate-600 text-lg">
                  <strong className="text-slate-900">Name:</strong> {selectedStudent.name}
                </p>
                <p className="m-0 text-slate-600">
                  <strong className="text-slate-900">ID:</strong> {selectedStudent.studentId}
                </p>
                <p className="m-0 text-slate-600">
                  <strong className="text-slate-900">Faculty:</strong> {selectedStudent.faculty}
                </p>
                <p className="m-0 text-slate-600">
                  <strong className="text-slate-900">Phone:</strong> {selectedStudent.phone}
                </p>
                <p className="m-0 text-slate-600">
                  <strong className="text-slate-900">Address:</strong> {selectedStudent.address}
                </p>
                <p className="m-0 text-slate-600">
                  <strong className="text-slate-900">Email:</strong> {selectedStudent.email || "N/A"}
                </p>
                <p className="m-0 text-slate-600">
                  <strong className="text-slate-900">Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      selectedStudent.status === "blocked"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {selectedStudent.status}
                  </span>
                </p>
                <p className="m-0 text-slate-600">
                  <strong className="text-slate-900">Marks:</strong>{" "}
                  <span className="font-semibold text-blue-700">
                    {selectedStudent.marks}/10
                  </span>
                </p>
                <p className="m-0 text-slate-600">
                  <strong className="text-slate-900">Block Reason:</strong>{" "}
                  {selectedStudent.blockReason || "None"}
                </p>

                <div className="my-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {selectedStudent.vehicleRegistered && selectedStudent.vehicle ? (
                    <div className="flex flex-col gap-1">
                      <p className="m-0 text-slate-600">
                        <strong className="text-slate-900">Vehicle Model:</strong>{" "}
                        {selectedStudent.vehicle.model}
                      </p>
                      <p className="m-0 text-slate-600">
                        <strong className="text-slate-900">Vehicle Color:</strong>{" "}
                        {selectedStudent.vehicle.color}
                      </p>
                      <p className="m-0 text-slate-600">
                        <strong className="text-slate-900">Vehicle Number:</strong>{" "}
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                          {selectedStudent.vehicle.regLetters}-{selectedStudent.vehicle.regNumbers}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="m-0 text-slate-600">
                      <strong className="text-slate-900">Vehicle:</strong> No vehicle registered
                    </p>
                  )}
                </div>

                <img
                  src={`http://localhost:5000${selectedStudent.photo}`}
                  alt="Student"
                  className="w-40 h-40 object-cover rounded-2xl border-4 border-slate-100 shadow-sm mx-auto sm:mx-0"
                />

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors shadow-sm"
                    onClick={() => blockStudent(selectedStudent._id)}
                  >
                    Block
                  </button>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors shadow-sm"
                    onClick={() => unblockStudent(selectedStudent._id)}
                  >
                    Unblock
                  </button>
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors shadow-sm"
                    onClick={() => resetMarks(selectedStudent._id)}
                  >
                    Reset Marks
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center mt-4">
                <p className="text-slate-500 mb-0">
                  Select a student from the list to view detailed information and
                  modify parameters.
                </p>
              </div>
            )}
          </div>
        </div>
      </PageBackground>
    </>
  );
};

export default AdminDashboard;