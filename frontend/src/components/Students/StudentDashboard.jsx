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
    if (marks >= 7) return "bg-gradient-to-br from-green-600 to-green-500";
    if (marks >= 4) return "bg-gradient-to-br from-yellow-500 to-yellow-400";
    return "bg-gradient-to-br from-red-600 to-red-500";
  };

  const downloadQRCode = () => {
    if (!student?.qrCode) return;
    
    const link = document.createElement('a');
    link.href = student.qrCode;
    link.download = `${student.studentId}_QR_Code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (errorMessage) {
    return (
      <>
        <StudentNavbar />
        
          <div className="bg-red-100 text-red-700 px-6 py-4 rounded-xl font-semibold shadow-sm">{errorMessage}</div>
        
      </>
    );
  }

  if (!student) {
    return (
      <>
        <StudentNavbar />
        
          <div className="p-8 text-center font-bold text-white text-lg bg-black/20 rounded-2xl backdrop-blur-sm">Loading dashboard...</div>
        
      </>
    );
  }

  return (
    <>
      <StudentNavbar />

      
        <div className="bg-linear-to-br from-blue-600 via-blue-700 to-blue-500 text-white rounded-[26px] p-6 md:p-8 shadow-xl shadow-blue-600/20 grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr] items-center gap-6 mb-6">
          <div className="flex flex-col gap-4">
            <h1 className="m-0 mb-1 text-3xl md:text-4xl font-extrabold tracking-tight">Welcome back, {student.name}</h1>
            <p className="m-0 leading-relaxed max-w-[700px] opacity-95 text-blue-50">
              Manage your profile, view QR code, update vehicle details, and
              access locker or parking booking options from your student dashboard.
            </p>

            <div className="flex gap-3.5 flex-wrap mt-2">
              <Link to="/lockers" className="inline-block rounded-xl px-5 py-3 font-bold transition-all duration-300 bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg shadow-blue-900/40 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:opacity-90 border border-blue-400">
                Book Locker
              </Link>
              <Link to="/parking/zones" className="inline-block rounded-xl px-5 py-3 font-bold transition-all duration-300 bg-[oklch(48.8%_0.243_264.376)] hover:opacity-90 text-white shadow-lg shadow-blue-900/40 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl border border-blue-400">
                Book Parking Slot
              </Link>
              <Link to="/parking/my-booking" className="inline-block rounded-xl px-5 py-3 font-bold transition-all duration-300 bg-[oklch(48.8%_0.243_264.376)] hover:opacity-90 text-white shadow-lg shadow-blue-900/40 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl border border-blue-400">
                My Booking park
              </Link>

               <Link to="/MYbookLocker" className="inline-block rounded-xl px-5 py-3 font-bold transition-all duration-300 bg-[oklch(48.8%_0.243_264.376)] hover:opacity-90 text-white shadow-lg shadow-blue-900/40 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl border border-blue-400">
                My Booking locker
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end items-center">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full p-2.5 bg-gradient-to-br from-white via-blue-100 to-blue-200 shadow-[0_15px_30px_rgba(15,23,42,0.18)] flex justify-center items-center">
              <img
                src={`http://localhost:5000${student.photo}`}
                alt="Student"
                className="w-full h-full rounded-full object-cover border-[6px] border-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          <div className="p-6 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <h3 className="mt-0 mb-4 text-slate-900 text-xl font-bold">Student Information</h3>
            <div className="flex flex-col gap-2">
              <p className="m-0 leading-relaxed text-slate-700"><span className="font-bold text-slate-900">Name:</span> {student.name}</p>
              <p className="m-0 leading-relaxed text-slate-700"><span className="font-bold text-slate-900">Student ID:</span> {student.studentId}</p>
              <p className="m-0 leading-relaxed text-slate-700"><span className="font-bold text-slate-900">Faculty:</span> {student.faculty}</p>
              <p className="m-0 leading-relaxed text-slate-700"><span className="font-bold text-slate-900">Phone:</span> {student.phone}</p>
              <p className="m-0 leading-relaxed text-slate-700"><span className="font-bold text-slate-900">Address:</span> {student.address}</p>
              <p className="m-0 leading-relaxed text-slate-700"><span className="font-bold text-slate-900">Email:</span> {student.email || "Not added"}</p>
            </div>
          </div>

          <div className="p-6 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <h3 className="mt-0 mb-4 text-slate-900 text-xl font-bold">Account Overview</h3>
            <div className="flex flex-col gap-3">
              <p className="m-0 leading-relaxed text-slate-700">
                <span className="font-bold text-slate-900">Status:</span>{" "}
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${student.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {student.status === 'blocked' ? '🚫 Blocked' : '✓ Active'}
                </span>
              </p>
              <p className="m-0 leading-relaxed text-slate-700 flex items-center gap-2">
                <span className="font-bold text-slate-900">Parking Points:</span>{" "}
                <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-bold shadow-sm ${getMarksClass(student.marks)}`}>
                  {student.marks ?? 10}/10
                </span>
              </p>
              {student.status === 'blocked' && (
                <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs font-bold text-red-700 mb-1">🚫 Parking Access Suspended</p>
                  <p className="text-xs text-red-600">{student.blockReason || 'Contact administration to restore access.'}</p>
                </div>
              )}
              <p className="m-0 leading-relaxed text-slate-700"><span className="font-bold text-slate-900">Vehicle Registered:</span> {student.vehicleRegistered ? "Yes" : "No"}</p>
            </div>
          </div>

          <div className="p-6 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <h3 className="mt-0 mb-4 text-slate-900 text-xl font-bold">Vehicle Details</h3>
            {student.vehicleRegistered && student.vehicle ? (
              <div className="flex flex-col gap-2">
                <p className="m-0 leading-relaxed text-slate-700"><span className="font-bold text-slate-900">Model:</span> {student.vehicle.model}</p>
                <p className="m-0 leading-relaxed text-slate-700"><span className="font-bold text-slate-900">Color:</span> {student.vehicle.color}</p>
                <p className="m-0 leading-relaxed text-slate-700">
                  <span className="font-bold text-slate-900">Registration:</span>{" "}
                  {student.vehicle.regLetters}-{student.vehicle.regNumbers}
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-white border border-dashed border-blue-300 rounded-2xl p-4 text-slate-600 text-sm">
                <p className="m-0 mb-1 font-bold text-blue-900">No vehicle registered yet.</p>
                <small>You can add one from your profile page.</small>
              </div>
            )}
          </div>

          <div className="p-6 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center">
            <h3 className="mt-0 mb-4 text-slate-900 text-xl font-bold text-left">QR Code</h3>
            <img src={student.qrCode} alt="QR Code" className="w-[160px] h-[160px] object-contain bg-white p-3 rounded-2xl border-4 border-white/75 shadow-md mx-auto" />
            <button
              onClick={downloadQRCode}
              className="mt-4 w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-xl px-4 py-3 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/30 hover:opacity-90 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download QR
            </button>
            <p className="mt-3 text-xs text-slate-500">This QR is generated based on your student ID.</p>
          </div>
        </div>

        <div className="mt-8">
          <Link to="/student-profile" className="inline-block rounded-xl px-5 py-3 font-bold transition-all duration-300 bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-600/20 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
            Manage Profile
          </Link>
        </div>
      
    </>
  );
};

export default StudentDashboard;