import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PublicNavbar from "../Home/PublicNavbar";
import studentApi from "./studentApi";

const StudentLogin = () => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await studentApi.post("/students/login", {
        studentId: studentId.toUpperCase(),
        password,
      });

      localStorage.setItem("studentInfo", JSON.stringify(res.data));
      navigate("/student-dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <>
      <PublicNavbar links={[{ to: "/", label: "Home" }]} hideLogin={true} />
      
      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-6 bg-linear-to-br from-slate-50 via-blue-50 to-white relative overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl"></div>

        <form className="w-full max-w-lg p-10 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-[32px] flex flex-col gap-5 animate-fade-in transition-all duration-300 relative z-10" onSubmit={submitHandler}>
          <div className="text-center mb-4">
            <h2 className="text-4xl text-slate-900 font-black tracking-tight mb-3">Student Login</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Access your UniSpot profile and dashboard
            </p>
          </div>

          {message && <p className="bg-red-50 text-red-700 border border-red-100 px-4 py-3 rounded-2xl font-bold text-center animate-shake">{message}</p>}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Student ID</label>
              <input
                type="text"
                placeholder="e.g. ST12345"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-base text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-4 pr-14 rounded-2xl border border-slate-200 bg-slate-50/50 text-base text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 20.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full mt-4 bg-[oklch(48.8%_0.243_264.376)] text-white shadow-xl shadow-blue-600/20 rounded-2xl px-4 py-4 font-black text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:opacity-95">Login Now</button>

          <div className="flex flex-col gap-4 mt-2">
            <Link to="/student-register" className="w-full bg-slate-50 text-slate-700 border border-slate-200 shadow-sm rounded-2xl px-4 py-4 font-bold text-center transition-all duration-300 hover:bg-slate-100 hover:text-slate-900 leading-none">
              Register New Account
            </Link>
            <div className="text-center">
              <Link to="/student-forgot-password" className="text-blue-600 font-bold transition-colors duration-200 hover:text-blue-800">
                Forgot Password?
              </Link>
            </div>
          </div>
        </form>
      </div>
      
    </>
  );
};

export default StudentLogin;