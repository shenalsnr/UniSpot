import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../Home/PublicNavbar";
import studentApi from "./studentApi";
import PageBackground from "../Shared/PageBackground";

const StudentForgotPassword = () => {
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const navigate = useNavigate();

  const requestOtpHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const { data } = await studentApi.post("/students/request-password-otp", {
        studentId: studentId.toUpperCase().trim(),
        phone: phone.trim(),
      });

      setMessage(data.message);
      setStep(2);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const resetPasswordHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const { data } = await studentApi.post("/students/reset-password-with-otp", {
        studentId: studentId.toUpperCase().trim(),
        phone: phone.trim(),
        otp: otp.trim(),
        newPassword,
      });

      localStorage.setItem("studentInfo", JSON.stringify(data));
      navigate("/student-dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <>
      <PublicNavbar />
      <PageBackground className="flex justify-center items-center p-8">
        <div className="w-full max-w-[520px] p-8 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-xl flex flex-col gap-4">
          <h2 className="mb-2 text-3xl md:text-4xl text-center text-slate-900 font-extrabold">
            Forgot Password
          </h2>
          <p className="text-center text-slate-500 leading-relaxed font-medium">
            Reset your password using OTP sent to your registered phone number.
          </p>

          {message && (
            <p className="bg-green-100 text-green-700 px-4 py-3 rounded-xl font-semibold text-center">
              {message}
            </p>
          )}

          {step === 1 ? (
            <form className="flex flex-col gap-4" onSubmit={requestOtpHandler}>
              <input
                type="text"
                placeholder="Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
              />
              <input
                type="text"
                placeholder="Registered Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
              />
              <button
                type="submit"
                className="w-full bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg shadow-blue-600/20 rounded-xl px-4 py-3 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/30 hover:opacity-90"
              >
                Send OTP
              </button>
            </form>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={resetPasswordHandler}>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm tracking-[0.25em] text-center font-bold text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
              />

              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-20 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-600 hover:text-blue-800"
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg shadow-blue-600/20 rounded-xl px-4 py-3 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/30 hover:opacity-90"
              >
                Reset Password
              </button>
            </form>
          )}
        </div>
      </PageBackground>
    </>
  );
};

export default StudentForgotPassword;