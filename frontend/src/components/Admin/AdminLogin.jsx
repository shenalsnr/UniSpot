import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import adminApi from "./adminApi";
import PageBackground from "../Shared/PageBackground";
import PublicNavbar from "../Home/PublicNavbar";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const { data } = await adminApi.post("/admin/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      localStorage.setItem("adminInfo", JSON.stringify(data));
      navigate("/admin-dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Admin login failed");
    }
  };

  return (
    <>
      <PublicNavbar />

      <PageBackground className="relative overflow-hidden flex justify-center items-center p-6 md:p-8 min-h-[calc(100vh-80px)]">
        {/* Animated background shapes */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-16 right-10 w-52 h-52 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-28 h-28 bg-cyan-300/20 rounded-full blur-2xl animate-bounce"></div>

        <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
          {/* Left content */}
          <div className="hidden lg:flex flex-col gap-6 text-white animate-[fadeIn_0.8s_ease]">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-3 w-fit shadow-lg">
              <span className="text-2xl">🔐</span>
              <span className="font-bold tracking-wide">
                UniSpot Admin Portal
              </span>
            </div>

            <div>
              <h1 className="text-5xl font-extrabold leading-tight drop-shadow-lg">
                Welcome Back,
                <br />
                Admin
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-blue-50 max-w-[560px]">
                Access the student management dashboard to monitor registered
                students, review account details, block or unblock users, and
                manage student marks with ease.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
                <h3 className="text-lg font-bold mb-2">Student Control</h3>
                <p className="text-sm text-blue-50 leading-relaxed">
                  View full student details and manage account status securely.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
                <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
                <p className="text-sm text-blue-50 leading-relaxed">
                  Reset marks, block students, and keep the system under control.
                </p>
              </div>
            </div>
          </div>

          {/* Right login card */}
          <div className="w-full flex justify-center">
            <form
              onSubmit={submitHandler}
              className="w-full max-w-[520px] bg-white/85 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-2xl p-8 md:p-10 flex flex-col gap-5 transition-all duration-500 hover:shadow-[0_25px_60px_rgba(30,64,175,0.25)] animate-[fadeInUp_0.7s_ease]"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center text-white text-3xl shadow-xl mb-4 transition-transform duration-300 hover:scale-105">
                  🛡️
                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                  Admin Login
                </h2>

                <p className="mt-3 text-slate-500 leading-relaxed font-medium">
                  Login to manage registered students and control the admin
                  dashboard.
                </p>
              </div>

              {message && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-2xl font-semibold text-center shadow-sm">
                  {message}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">
                  Admin Email
                </label>
                <input
                  type="email"
                  placeholder="admin@unispot.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-blue-100 bg-blue-50/60 text-slate-900 outline-none transition-all duration-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 hover:bg-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">
                  Admin Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-blue-100 bg-blue-50/60 text-slate-900 outline-none transition-all duration-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 hover:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg shadow-blue-600/25 rounded-2xl px-4 py-3.5 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/30 hover:opacity-90"
              >
                Login as Admin
              </button>

              <Link
                to="/"
                className="w-full text-center bg-white text-blue-600 border-2 border-blue-100 shadow-sm rounded-2xl px-4 py-3 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md hover:border-blue-300"
              >
                Back to Home
              </Link>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Protected access only. Use your authorized admin email and
                  password to continue.
                </p>
              </div>
            </form>
          </div>
        </div>

        <style>
          {`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(35px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
      </PageBackground>
    </>
  );
};

export default AdminLogin;