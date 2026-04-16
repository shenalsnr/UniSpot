import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import studentApi from "./studentApi";
import StudentNavbar from "./StudentNavbar";
const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data } = await studentApi.get("/students/profile");
        setStudent(data);
      } catch (error) {
        console.error("Error fetching student profile:", error);
        navigate("/student-login");
      }
    };
    fetchStudent();
  }, [navigate]);

  const downloadQRCode = () => {
    if (!student?.qrCode) return;
    const link = document.createElement("a");
    link.href = student.qrCode;
    link.download = `${student.studentId}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <StudentNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[2rem] bg-indigo-900 mb-8 border border-white/10 shadow-2xl shadow-indigo-200/50">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 lg:items-center gap-8 p-8 md:p-12">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-100 text-xs font-bold uppercase tracking-wider text-left">
                <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
                <span>Active Portal</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight text-left">
                Welcome back, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">
                  {student.name}
                </span>
              </h1>
              
              <p className="max-w-md text-lg text-indigo-100/80 font-medium leading-relaxed text-left">
                Streamline your campus experience. Quick access to your bookings, 
                security credentials, and personal records.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/lockers" className="px-6 py-3.5 bg-white text-indigo-900 font-bold rounded-2xl shadow-xl shadow-black/10 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                  Book Locker
                </Link>
                <Link to="/parking/zones" className="px-6 py-3.5 bg-indigo-600/50 text-white font-bold rounded-2xl border border-white/20 backdrop-blur-md hover:bg-indigo-600/70 hover:-translate-y-1 transition-all duration-300">
                  Reserve Parking
                </Link>


                
                <Link to="/MyBookLocker" className="px-6 py-3.5 bg-white text-indigo-900 font-bold rounded-2xl shadow-xl shadow-black/10 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                  My Locker
                </Link>
                <Link to="/my-booking" className="px-6 py-3.5 bg-indigo-600/50 text-white font-bold rounded-2xl border border-white/20 backdrop-blur-md hover:bg-indigo-600/70 hover:-translate-y-1 transition-all duration-300">
                  My Parking
                </Link>






              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Photo ring effect */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-400 to-indigo-600 rounded-full opacity-30 blur-xl animate-pulse"></div>
                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full p-2 bg-white/10 backdrop-blur-xs border border-white/20">
                  <img
                    src={`http://localhost:5000${student.photo}`}
                    alt="Student"
                    className="w-full h-full rounded-full object-cover shadow-2xl ring-4 ring-white/10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Information Card */}
          <div className="group p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">My Profile</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm font-semibold text-slate-500">Student ID</span>
                <span className="text-sm font-bold text-slate-900">{student.studentId}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm font-semibold text-slate-500">Faculty</span>
                <span className="text-sm font-bold text-slate-900">{student.faculty}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm font-semibold text-slate-500">Contact</span>
                <span className="text-sm font-bold text-slate-900">{student.phone}</span>
              </div>
            </div>
          </div>

          {/* Account Status Card */}
          <div className="group p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Account Overview</h3>
            </div>
            
            <div className="space-y-6 text-left">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-500">Parking Points</span>
                  <span className="text-sm font-bold text-slate-900">{student.marks ?? 10}/10</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 text-left">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${student.marks >= 7 ? 'bg-green-500' : student.marks >= 4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${(student.marks ?? 10) * 10}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-bold text-slate-700">Account status</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase ${student.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {student.status === 'blocked' ? 'Suspended' : 'Verified'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions / QR Card */}
          <div className="group p-6 bg-gray-400 rounded-3xl border  shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/20 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Security Access</h3>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                <img src={student.qrCode} alt="Security QR" className="w-32 h-32 object-contain" />
              </div>
              <button
                onClick={downloadQRCode}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-colors"
              >
                <svg className="w-5 h-5 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download QR
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle Info */}
          <div className="lg:col-span-1 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 text-left">
              <span className="p-2 rounded-xl bg-slate-50 text-slate-600">🚗</span>
              Vehicle Details
            </h3>
            
            {student.vehicleRegistered && student.vehicle ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-2">Registration No</div>
                  <div className="text-xl font-black text-indigo-900 tracking-wider">
                    {student.vehicle.regLetters} <span className="text-slate-300">|</span> {student.vehicle.regNumbers}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Model</div>
                    <div className="text-sm font-bold text-slate-700">{student.vehicle.model}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Color</div>
                    <div className="text-sm font-bold text-slate-700">{student.vehicle.color}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-6 border-2 border-dashed border-slate-100 rounded-2xl">
                <div className="text-3xl mb-4 grayscale opacity-30">🚙</div>
                <p className="text-sm font-bold text-slate-400">No vehicle registered</p>
                <Link to="/student-profile" className="mt-4 text-xs font-black text-blue-600 hover:underline inline-block">Add Vehicle &rarr;</Link>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-2 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 text-left">
              <span className="p-2 rounded-xl bg-slate-50 text-slate-600">📊</span>
              Activity Summary
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Member Since', value: formatDate(student.createdAt), icon: '📅' },
                { label: 'Profile Updated', value: formatDate(student.profileUpdatedAt), icon: '✏️' },
                { label: 'Vehicle Updated', value: formatDate(student.vehicleUpdatedAt), icon: '🚘' },
                { label: 'Security Updated', value: formatDate(student.passwordChangedAt), icon: '🔐' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all duration-300 group">
                  <div className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">{item.label}</p>
                    <p className="text-sm font-bold text-indigo-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
