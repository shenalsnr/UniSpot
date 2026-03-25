import { useState } from "react";
import PublicNavbar from "../Home/PublicNavbar";
import studentApi from "./studentApi";

const StudentForgotPassword = () => {
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");

  const requestOtpHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const { data } = await studentApi.post("/students/request-password-otp", {
        studentId: studentId.toUpperCase(),
        phone,
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
        studentId: studentId.toUpperCase(),
        phone,
        otp,
        newPassword,
      });

      setMessage(data.message);
      setStep(1);
      setOtp("");
      setNewPassword("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <>
      <PublicNavbar />
      <div className="student-page">
        <div className="student-login-card student-form fade-up">
          <h2>Forgot Password</h2>
          <p className="student-login-subtitle">
            Reset your password using OTP sent to your mobile number.
          </p>

          {message && <p className="student-success">{message}</p>}

          {step === 1 ? (
            <form className="student-form" onSubmit={requestOtpHandler}>
              <input
                type="text"
                placeholder="Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Registered Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <button type="submit">Send OTP</button>
            </form>
          ) : (
            <form className="student-form" onSubmit={resetPasswordHandler}>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit">Reset Password</button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentForgotPassword;