import { useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApi from "./adminApi";
import PublicNavbar from "../Home/PublicNavbar";


const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const { data } = await adminApi.post("/admin/login", { 
        email: email.toLowerCase(), 
        password 
      });
      localStorage.setItem("adminInfo", JSON.stringify(data));
      navigate("/admin-dashboard");
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Admin login failed");
    }
  };

  return (
    <>
      <PublicNavbar />
      
        <form 
          className="w-full max-w-[500px] p-8 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-xl flex flex-col gap-4 animate-fade-in relative z-10" 
          onSubmit={submitHandler}
        >
          <div className="text-center mb-4">
            <div className="inline-block p-4 bg-blue-100 rounded-2xl mb-4 text-3xl">
              🔑
            </div>
            <h2 className="text-3xl md:text-4xl text-slate-900 font-extrabold tracking-tight">Admin Portal</h2>
            <p className="mt-2 text-slate-500 font-medium">
              Manage student accounts, parking points, and system access.
            </p>
          </div>

          {message && (
            <p className={`px-4 py-3 rounded-xl font-semibold text-center border ${
              messageType === "error" 
                ? "bg-red-50 text-red-700 border-red-200" 
                : "bg-green-50 text-green-700 border-green-200"
            }`}>
              {message}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Admin Email</label>
            <input
              type="email"
              placeholder="admin@unispot.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-2 bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg shadow-blue-600/20 rounded-xl px-4 py-3.5 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-600/30 hover:opacity-90"
          >
            Login to Dashboard
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Authorized personnel only. Access is monitored.
            </p>
          </div>
        </form>
      
    </>
  );
};

export default AdminLogin;