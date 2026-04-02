import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../Home/PublicNavbar";
import studentApi from "./studentApi";

const StudentRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    phone: "",
    address: "",
    faculty: "",
    email: "",
    password: "",
    confirmPassword: "",
    photo: null,
  });

  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");

  const changeHandler = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo") {
      const file = files[0];
      setFormData({ ...formData, photo: file });
      if (file) {
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const studentIdPattern = /^(IT|BM)\d{8}$/;
    const phonePattern = /^0\d{9}$/;
    const namePattern = /^[A-Za-z\s]{3,}$/;

    if (!namePattern.test(formData.name.trim())) {
      return "Name must contain at least 3 letters and only letters/spaces";
    }

    if (!studentIdPattern.test(formData.studentId.toUpperCase())) {
      return "Student ID must start with IT or BM and contain 8 digits";
    }

    if (!phonePattern.test(formData.phone)) {
      return "Phone number must contain 10 digits and start with 0";
    }

    if (formData.address.trim().length < 5) {
      return "Address is too short";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }

    if (!formData.photo) {
      return "Please upload a student photo";
    }

    return "";
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage("");

    const error = validateForm();
    if (error) {
      setMessage(error);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("studentId", formData.studentId.toUpperCase());
      data.append("phone", formData.phone);
      data.append("address", formData.address);
      data.append("faculty", formData.faculty);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("photo", formData.photo);

      const res = await studentApi.post("/students/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      localStorage.setItem("studentInfo", JSON.stringify(res.data));
      navigate("/student-dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <>
      <PublicNavbar />
      <div className="student-page">
        <form className="student-register-card student-form fade-up" onSubmit={submitHandler}>
          <h2>Create Student Account</h2>
          <p className="student-register-subtitle">
            Register your profile to manage lockers, parking, vehicle details, and QR access.
          </p>

          {message && <p className="student-error">{message}</p>}

          <input type="text" name="name" placeholder="Full Name" onChange={changeHandler} required />
          <input type="text" name="studentId" placeholder="Student ID (IT12345678)" onChange={changeHandler} required />
          <input type="text" name="phone" placeholder="Phone Number" onChange={changeHandler} required />
          <input type="text" name="address" placeholder="Address" onChange={changeHandler} required />

          <select name="faculty" onChange={changeHandler} required>
            <option value="">Select Faculty</option>
            <option value="Faculty of Computing">Faculty of Computing</option>
            <option value="Faculty of Business">Faculty of Business</option>
            <option value="Faculty of Engineering">Faculty of Engineering</option>
            <option value="Faculty of Humanities & Sciences">Faculty of Humanities & Sciences</option>
          </select>

          <input type="email" name="email" placeholder="Email (Optional)" onChange={changeHandler} />
          <input type="password" name="password" placeholder="Password" onChange={changeHandler} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={changeHandler} required />
          <input type="file" name="photo" accept="image/*" onChange={changeHandler} required />

          {preview && <img src={preview} alt="Preview" className="student-preview" />}

          <button type="submit">Register Now</button>
        </form>
      </div>
    </>
  );
};

export default StudentRegister;