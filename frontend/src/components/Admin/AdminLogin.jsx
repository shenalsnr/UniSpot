import { useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApi from "./adminApi";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const { data } = await adminApi.post("/admin/login", { email, password });
      localStorage.setItem("adminInfo", JSON.stringify(data));
      navigate("/admin-dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Admin login failed");
    }
  };

  return (
    <div className="student-page">
      <form className="student-login-card student-form" onSubmit={submitHandler}>
        <h2>Admin Login</h2>
        <p className="student-login-subtitle">
          Login to manage registered students.
        </p>

        {message && <p className="student-error">{message}</p>}

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login as Admin</button>
      </form>
    </div>
  );
};

export default AdminLogin;