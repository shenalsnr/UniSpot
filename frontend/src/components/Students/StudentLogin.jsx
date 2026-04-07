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
      <PublicNavbar />
      
        <form className="w-full max-w-130 p-8 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-xl flex flex-col gap-4 animate-fade-in transition-all duration-300 relative z-10" onSubmit={submitHandler}>
          <h2 className="mb-2 text-3xl md:text-4xl text-center text-slate-900 font-extrabold">Student Login</h2>
          <p className="mb-5 text-center text-slate-500 leading-relaxed font-medium">
            Access your profile, QR code, and vehicle management dashboard.
          </p>

          {message && <p className="bg-red-100 text-red-700 px-4 py-3 rounded-xl font-semibold text-center">{message}</p>}

          <input
            type="text"
            placeholder="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 pr-12 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <button type="submit" className="w-full bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg shadow-blue-600/20 rounded-xl px-4 py-3 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/30 hover:opacity-90">Login</button>

          <Link to="/student-register" className="w-full bg-white text-blue-600 border-2 border-blue-100 shadow-sm rounded-xl px-4 py-3 font-bold text-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md hover:border-blue-300">
            Register New Account
          </Link>

          <div className="text-center mt-3">
            <Link to="/student-forgot-password" className="text-blue-600 font-bold transition-colors duration-200 hover:text-blue-800 hover:underline">
              Forgot Password?
            </Link>
          </div>
        </form>
      
    </>
  );
};

export default StudentLogin;