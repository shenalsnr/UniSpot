import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showAlert } from "../Shared/BeautifulAlert";

const StaffLogin = () => {
  const [formData, setFormData] = useState({
    staffId: "",
    name: "",
    nic: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.staffId.trim() || !formData.name.trim() || !formData.nic.trim()) {
      setMessage("Please fill in all fields");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:5000/api/staff/login", {
        staffId: formData.staffId.toUpperCase(),
        name: formData.name,
        nic: formData.nic
      });

      localStorage.setItem("staffInfo", JSON.stringify(data));
      setMessage("Login successful! Redirecting...");
      setMessageType("success");
      
      setTimeout(() => {
        navigate("/staff/dashboard");
      }, 1500);
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Staff login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-slate-100 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl"></div>

      <form 
        className="w-full max-w-[500px] p-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-[32px] shadow-2xl flex flex-col gap-6 animate-fade-in relative z-10" 
        onSubmit={submitHandler}
      >
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-3xl mb-6 text-4xl shadow-sm border border-blue-100">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-4xl text-slate-900 font-black tracking-tight">Security Staff</h2>
          <p className="mt-3 text-slate-500 font-medium leading-relaxed">
            Entry Scanner Access Portal
          </p>
        </div>

        {message && (
          <p className={`px-4 py-3.5 rounded-2xl font-bold text-center border animate-shake ${
            messageType === "error" 
              ? "bg-red-50 text-red-700 border-red-100" 
              : "bg-green-50 text-green-700 border-green-100"
          }`}>
            {message}
          </p>
        )}

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Staff ID</label>
            <input
              type="text"
              name="staffId"
              placeholder="e.g., ST-1001"
              value={formData.staffId}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-base text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-base text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">NIC Number</label>
            <input
              type="text"
              name="nic"
              placeholder="e.g., 200131104116"
              value={formData.nic}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-base text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 placeholder:text-slate-400"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-2 bg-slate-900 text-white shadow-xl shadow-slate-900/10 rounded-2xl px-4 py-4 font-black transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:bg-slate-800 text-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <span>{loading ? "Verifying..." : "Access Portal"}</span>
          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
        
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
            Authorized Personnel Only • Access Logged
          </p>
        </div>
      </form>
    </div>
  );
};

export default StaffLogin;
