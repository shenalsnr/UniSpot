import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import studentApi from "./studentApi";
import StudentNavbar from "./StudentNavbar";
import PageBackground from "../Shared/PageBackground";

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
    if (marks >= 7) return "bg-green-600";
    if (marks >= 4) return "bg-yellow-500";
    return "bg-red-600";
  };

  const downloadQrHandler = () => {
    if (!student?.qrCode) return;

    const link = document.createElement("a");
    link.href = student.qrCode;
    link.download = `${student.studentId}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

    return new Date(dateValue).toLocaleString("en-LK");
  };

  if (errorMessage) {
    return (
      <>
        <StudentNavbar />
        <PageBackground className="flex justify-center items-center p-4">
          <div className="bg-red-100 text-red-700 px-6 py-4 rounded-xl">
            {errorMessage}
          </div>
        </PageBackground>
      </>
    );
  }

  if (!student) {
    return (
      <>
        <StudentNavbar />
        <PageBackground className="flex justify-center items-center p-4">
          <div className="text-white">Loading...</div>
        </PageBackground>
      </>
    );
  }

  return (
    <>
      <StudentNavbar />

      <PageBackground className="p-6">
        <h1 className="text-3xl font-bold text-white mb-6">
          Welcome, {student.name}
        </h1>

        {/* ACCOUNT OVERVIEW */}
        <div className="bg-white p-6 rounded-xl mb-6">
          <h2 className="text-xl font-bold mb-3">Account Overview</h2>

          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`px-2 py-1 rounded text-white ${
                student.status === "Blocked" ? "bg-red-500" : "bg-green-500"
              }`}
            >
              {student.status}
            </span>
          </p>

          <p>
            <strong>Marks:</strong>{" "}
            <span
              className={`px-2 py-1 rounded text-white ${getMarksClass(
                student.marks
              )}`}
            >
              {student.marks}/10
            </span>
          </p>

          <p>
            <strong>Vehicle Registered:</strong>{" "}
            {student.vehicleRegistered ? "Yes" : "No"}
          </p>

          {student.blockReason && (
            <div className="mt-3 p-3 bg-red-100 rounded">
              <p className="text-red-700 font-bold">🚫 Blocked</p>
              <p className="text-red-600 text-sm">
                {student.blockReason}
              </p>
            </div>
          )}
        </div>

        {/* QR CODE */}
        <div className="bg-white p-6 rounded-xl text-center mb-6">
          <h2 className="text-xl font-bold mb-3">QR Code</h2>

          <img
            src={student.qrCode}
            alt="QR"
            className="w-40 h-40 mx-auto"
          />

          <button
            onClick={downloadQrHandler}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Download QR Code
          </button>
        </div>

        {/* PERSONAL ACTIVITY */}
        <div className="bg-white p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-3">Activity</h2>

          <p><strong>Created:</strong> {formatDate(student.createdAt)}</p>
          <p><strong>Profile Updated:</strong> {formatDate(student.profileUpdatedAt)}</p>
          <p><strong>Password Changed:</strong> {formatDate(student.passwordChangedAt)}</p>
        </div>

        <Link
          to="/student-profile"
          className="inline-block mt-6 bg-black text-white px-4 py-2 rounded"
        >
          Manage Profile
        </Link>
      </PageBackground>
    </>
  );
};

export default StudentDashboard;