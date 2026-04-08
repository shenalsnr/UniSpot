import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import adminApi from "./adminApi";




import PublicNavbar from "../Home/PublicNavbar";



const AdminLogin = () => {
  const [activeTab, setActiveTab] = useState("admin");
  
  // Admin form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Staff form states
  const [staffID, setStaffID] = useState("");
  const [fullName, setFullName] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      if (activeTab === "admin") {
        // Admin Login
        const { data } = await adminApi.post("/admin/login", { 
          email: email.toLowerCase(), 
          password 
        });
        localStorage.setItem("adminInfo", JSON.stringify(data));
        navigate("/admin-dashboard");
      } else {
        // Staff Login
        const { data } = await adminApi.post("/security/login", {
          staffID,
          name: fullName,
          nic: nicNumber
        });
        localStorage.setItem("staffInfo", JSON.stringify(data));
        navigate("/staff-dashboard");
      }
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || `${activeTab === "admin" ? "Admin" : "Staff"} login failed`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PublicNavbar links={[]} hideLogin={true} />
      
      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-6 bg-linear-to-br from-slate-50 via-slate-100 to-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl"></div>
        <form 
          className="w-full max-w-[500px] bg-white/95 backdrop-blur-md border border-slate-200 rounded-[32px] shadow-2xl flex flex-col gap-0 animate-fade-in relative z-10 overflow-hidden" 
          onSubmit={submitHandler}
        >
          {/* Header Section with Tabs */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-10 pt-10 pb-0">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-4 bg-white/20 text-white rounded-3xl mb-4 text-4xl shadow-sm border border-white/30">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h2 className="text-3xl text-white font-black tracking-tight">UniSpot Portal</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/20">
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className={`flex-1 py-3 px-4 font-bold text-sm transition-all duration-200 border-b-2 ${
                  activeTab === "admin"
                    ? "border-white text-white bg-white/10"
                    : "border-transparent text-white/60 hover:text-white/80"
                }`}
              >
                Admin Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("staff")}
                className={`flex-1 py-3 px-4 font-bold text-sm transition-all duration-200 border-b-2 ${
                  activeTab === "staff"
                    ? "border-white text-white bg-white/10"
                    : "border-transparent text-white/60 hover:text-white/80"
                }`}
              >
                Staff Login
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-10 flex flex-col gap-6">
            {/* Tab Description */}
            <p className="text-slate-500 font-medium leading-relaxed text-center text-sm">
              {activeTab === "admin"
                ? "Authorized access for system administration and management."
                : "Access the Scanner Portal for security operations."}
            </p>

            {message && (
              <p className={`px-4 py-3.5 rounded-2xl font-bold text-center border animate-shake ${
                messageType === "error" 
                  ? "bg-red-50 text-red-700 border-red-100" 
                  : "bg-green-50 text-green-700 border-green-100"
              }`}>
                {message}
              </p>
            )}

            {/* Admin Login Form */}
            {activeTab === "admin" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
                  <input
                    type="email"
                    placeholder="admin@unispot.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-base text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-base text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Staff Login Form */}
            {activeTab === "staff" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Staff ID</label>
                  <input
                    type="text"
                    placeholder="ST-1001"
                    value={staffID}
                    onChange={(e) => setStaffID(e.target.value.toUpperCase())}
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-base text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-base text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">NIC Number</label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    value={nicNumber}
                    onChange={(e) => setNicNumber(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-base text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-slate-900 text-white shadow-xl shadow-slate-900/10 rounded-2xl px-4 py-4 font-black transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:bg-slate-800 text-lg flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? "Authenticating..." : "Access Dashboard"}</span>
              {!isLoading && <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
            </button>
            
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
                Authorized Personnel Only • Access Logged
              </p>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminLogin;