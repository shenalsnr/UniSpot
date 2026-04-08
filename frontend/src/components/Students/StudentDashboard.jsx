import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import studentApi from "./studentApi";
import StudentNavbar from "./StudentNavbar";

import { io } from "socket.io-client";

const DashboardNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const { data } = await studentApi.get("/notifications/");
            if (data.success) {
                setNotifications(data.data.slice(0, 5)); // Show only top 5
            }
        } catch (err) {
            console.error("Dashboard notification fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        // Socket.io for real-time
        const studentInfo = JSON.parse(localStorage.getItem("studentInfo") || "{}");
        const studentId = studentInfo.studentId;
        if (!studentId) return;

        const socket = io("http://localhost:5000");
        socket.on("connect", () => {
            console.log("[Dashboard Notification Socket] Connected for student:", studentId);
            socket.emit("join_student", studentId);
        });

        socket.on("new_notification", (notif) => {
            console.log("[Dashboard Notification Socket] New notification received:", notif);
            setNotifications(prev => {
                if (prev.some(n => n._id === notif._id)) return prev;
                return [notif, ...prev].slice(0, 5);
            });
        });

        return () => socket.disconnect();
    }, []);

    if (loading) return <div className="text-slate-400 py-4">Loading notifications...</div>;
    if (notifications.length === 0) return (
        <div className="flex flex-col items-center justify-center py-6 text-slate-400 italic text-sm">
            <span className="text-3xl mb-2 opacity-50">🔔</span>
            <p>No recent notifications.</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 gap-3">
            {notifications.map(n => (
                <div key={n._id} className={`p-4 rounded-2xl border flex gap-4 items-start translate-all duration-300 ${n.isRead ? 'bg-slate-50 border-slate-100 opacity-75' : 'bg-blue-50/50 border-blue-100 shadow-xs'}`}>
                    <div className="text-xl p-2 bg-white rounded-xl shadow-xs border border-slate-100 shrink-0">
                        {n.type === 'booking_success' ? '🚗' : n.type === 'booking_reminder' ? '⏰' : n.type === 'booking_expired' ? '⚠️' : '📌'}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className={`font-bold text-sm truncate ${n.isRead ? 'text-slate-600' : 'text-blue-900'}`}>{n.title}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap mt-1 flex flex-col items-end gap-1">
                        <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {!n.isRead && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                    </div>
                </div>
            ))}
        </div>
    );
};



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

    const link = document.createElement("a");
    link.href = student.qrCode;
    link.download = `${student.studentId}_QR_Code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

    return new Date(dateValue).toLocaleString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  if (errorMessage) {
    return (
      <>
        <StudentNavbar />
       
          <div className="bg-red-100 text-red-700 px-6 py-4 rounded-xl font-semibold shadow-sm">
            {errorMessage}
          </div>
       
      </>
    );
  }

  if (!student) {
    return (
      <>
        <StudentNavbar />
        
          <div className="p-8 text-center font-bold text-white text-lg bg-black/20 rounded-2xl backdrop-blur-sm">
            Loading dashboard...
          </div>
        
      </>
    );
  }

  return (
    <>
      <StudentNavbar />

     
        <div className="bg-linear-to-br from-blue-600 via-blue-700 to-blue-500 text-white rounded-[26px] p-6 md:p-8 shadow-xl shadow-blue-600/20 grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr] items-center gap-6 mb-6">
          <div className="flex flex-col gap-4">
            <h1 className="m-0 mb-1 text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome back, {student.name}
            </h1>
            <p className="m-0 leading-relaxed max-w-175 opacity-95 text-blue-50">
              Manage your profile, view QR code, update vehicle details, and
              access locker or parking booking options from your student dashboard.
            </p>

            <div className="flex gap-3.5 flex-wrap mt-2">
              <Link
                to="/lockers"
                className="inline-block rounded-xl px-5 py-3 font-bold transition-all duration-300 bg-blue-700 text-white shadow-lg shadow-blue-900/40 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:opacity-90 border border-blue-400"
              >
                Book Locker
              </Link>
              <Link
                to="/parking/zones"
                className="inline-block rounded-xl px-5 py-3 font-bold transition-all duration-300 bg-blue-700 hover:opacity-90 text-white shadow-lg shadow-blue-900/40 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl border border-blue-400"
              >
                Book Parking Slot
              </Link>
              <Link
                to="/parking/my-booking"
                className="inline-block rounded-xl px-5 py-3 font-bold transition-all duration-300 bg-blue-700 hover:opacity-90 text-white shadow-lg shadow-blue-900/40 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl border border-blue-400"
              >
                My Parking Booking
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end items-center">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full p-2.5 bg-linear-to-br from-white via-blue-100 to-blue-200 shadow-[0_15px_30px_rgba(15,23,42,0.18)] flex justify-center items-center">
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
            <h3 className="mt-0 mb-4 text-slate-900 text-xl font-bold">
              Student Information
            </h3>
            <div className="flex flex-col gap-2">
              <p className="m-0 leading-relaxed text-slate-700">
                <span className="font-bold text-slate-900">Name:</span> {student.name}
              </p>
              <p className="m-0 leading-relaxed text-slate-700">
                <span className="font-bold text-slate-900">Student ID:</span> {student.studentId}
              </p>
              <p className="m-0 leading-relaxed text-slate-700">
                <span className="font-bold text-slate-900">Faculty:</span> {student.faculty}
              </p>
              <p className="m-0 leading-relaxed text-slate-700">
                <span className="font-bold text-slate-900">Phone:</span> {student.phone}
              </p>
              <p className="m-0 leading-relaxed text-slate-700">
                <span className="font-bold text-slate-900">Address:</span> {student.address}
              </p>
              <p className="m-0 leading-relaxed text-slate-700">
                <span className="font-bold text-slate-900">Email:</span> {student.email || "Not added"}
              </p>
            </div>
          </div>

          <div className="p-6 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <h3 className="mt-0 mb-4 text-slate-900 text-xl font-bold">
              Account Overview
            </h3>
            <div className="flex flex-col gap-3">
              <p className="m-0 leading-relaxed text-slate-700">
                <span className="font-bold text-slate-900">Status:</span> {student.status}
              </p>
              <p className="m-0 leading-relaxed text-slate-700 flex items-center gap-2">
                <span className="font-bold text-slate-900">Marks:</span>{" "}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-white text-xs font-bold shadow-sm ${getMarksClass(student.marks)}`}
                >
                  {student.marks}/10
                </span>
              </p>
              <p className="m-0 leading-relaxed text-slate-700">
                <span className="font-bold text-slate-900">Vehicle Registered:</span>{" "}
                {student.vehicleRegistered ? "Yes" : "No"}
              </p>
              {student.blockReason && (
                <p className="m-0 leading-relaxed text-slate-700">
                  <span className="font-bold text-slate-900">Block Reason:</span>{" "}
                  {student.blockReason}
                </p>
              )}
            </div>
          </div>

          <div className="p-6 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <h3 className="mt-0 mb-4 text-slate-900 text-xl font-bold">
              Vehicle Details
            </h3>
            {student.vehicleRegistered && student.vehicle ? (
              <div className="flex flex-col gap-2">
                <p className="m-0 leading-relaxed text-slate-700">
                  <span className="font-bold text-slate-900">Model:</span> {student.vehicle.model}
                </p>
                <p className="m-0 leading-relaxed text-slate-700">
                  <span className="font-bold text-slate-900">Color:</span> {student.vehicle.color}
                </p>
                <p className="m-0 leading-relaxed text-slate-700">
                  <span className="font-bold text-slate-900">Registration:</span>{" "}
                  {student.vehicle.regLetters}-{student.vehicle.regNumbers}
                </p>
              </div>
            ) : (
              <div className="bg-linear-to-br from-blue-50 to-white border border-dashed border-blue-300 rounded-2xl p-4 text-slate-600 text-sm">
                <p className="m-0 mb-1 font-bold text-blue-900">
                  No vehicle registered yet.
                </p>
                <small>You can add one from your profile page.</small>
              </div>
            )}
          </div>

          <div className="p-6 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center">
            <h3 className="mt-0 mb-4 text-slate-900 text-xl font-bold text-left">QR Code</h3>
            <img src={student.qrCode} alt="QR Code" className="w-40 h-40 object-contain bg-white p-3 rounded-2xl border-4 border-white/75 shadow-md mx-auto" />
            <button
              onClick={downloadQRCode}
              className="mt-4 w-full bg-linear-to-br from-blue-600 to-blue-500 text-white rounded-xl px-4 py-3 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/30 hover:opacity-90 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download QR
            </button>
            <p className="mt-3 text-xs text-slate-500">This QR is generated based on your student ID.</p>
          </div>


          <div className="p-6 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:col-span-2">
            <h3 className="mt-0 mb-4 text-slate-900 text-xl font-bold">
              Personal Activity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-blue-50/70 border border-blue-100 px-4 py-4">
                <p className="m-0 text-xs font-bold uppercase tracking-wide text-blue-700 mb-1">
                  Account Created
                </p>
                <p className="m-0 text-slate-800 font-semibold">
                  {formatDate(student.createdAt)}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50/70 border border-blue-100 px-4 py-4">
                <p className="m-0 text-xs font-bold uppercase tracking-wide text-blue-700 mb-1">
                  Profile Last Updated
                </p>
                <p className="m-0 text-slate-800 font-semibold">
                  {formatDate(student.profileUpdatedAt)}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50/70 border border-blue-100 px-4 py-4">
                <p className="m-0 text-xs font-bold uppercase tracking-wide text-blue-700 mb-1">
                  Vehicle Last Updated
                </p>
                <p className="m-0 text-slate-800 font-semibold">
                  {formatDate(student.vehicleUpdatedAt)}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50/70 border border-blue-100 px-4 py-4">
                <p className="m-0 text-xs font-bold uppercase tracking-wide text-blue-700 mb-1">
                  Password Last Changed
                </p>
                <p className="m-0 text-slate-800 font-semibold">
                  {formatDate(student.passwordChangedAt)}
                </p>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-8">
          <Link
            to="/student-profile"
            className="inline-block rounded-xl px-5 py-3 font-bold transition-all duration-300 bg-linear-to-br from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-600/20 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
          >
            Manage Profile
          </Link>
        </div>
      
    </>
  );
};

export default StudentDashboard;