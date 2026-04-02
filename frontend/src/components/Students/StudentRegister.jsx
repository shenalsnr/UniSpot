import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../Home/PublicNavbar";
import studentApi from "./studentApi";
import PageBackground from "../Shared/PageBackground";

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
      <PageBackground className="flex justify-center items-center p-8">
        <form className="w-full max-w-130 p-8 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-xl flex flex-col gap-4 animate-fade-in transition-all duration-300 relative z-10 mx-auto my-8" onSubmit={submitHandler}>
          <h2 className="mb-2 text-3xl md:text-4xl text-center text-slate-900 font-extrabold">Create Student Account</h2>
          <p className="mb-5 text-center text-slate-500 leading-relaxed font-medium">
            Register your profile to manage lockers, parking, vehicle details, and QR access.
          </p>

          {message && <p className="bg-red-100 text-red-700 px-4 py-3 rounded-xl font-semibold text-center">{message}</p>}

          <input className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10" type="text" name="name" placeholder="Full Name" onChange={changeHandler} required />
          <input className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10" type="text" name="studentId" placeholder="Student ID (IT12345678)" onChange={changeHandler} required />
          <input className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10" type="text" name="phone" placeholder="Phone Number" onChange={changeHandler} required />
          <input className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10" type="text" name="address" placeholder="Address" onChange={changeHandler} required />

          <select className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10" name="faculty" onChange={changeHandler} required>
            <option value="">Select Faculty</option>
            <option value="Faculty of Computing">Faculty of Computing</option>
            <option value="Faculty of Business">Faculty of Business</option>
            <option value="Faculty of Engineering">Faculty of Engineering</option>
            <option value="Faculty of Humanities & Sciences">Faculty of Humanities & Sciences</option>
          </select>

          <input className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10" type="email" name="email" placeholder="Email (Optional)" onChange={changeHandler} />
          <input className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10" type="password" name="password" placeholder="Password" onChange={changeHandler} required />
          <input className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10" type="password" name="confirmPassword" placeholder="Confirm Password" onChange={changeHandler} required />
          <input className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10" type="file" name="photo" accept="image/*" onChange={changeHandler} required />

          {preview && <img src={preview} alt="Preview" className="w-44 h-44 object-cover rounded-2xl block mt-3 border-4 border-white/75 shadow-lg mx-auto" />}

          <button type="submit" className="w-full bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg shadow-blue-600/20 rounded-xl px-4 py-3 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/30 hover:opacity-90">Register Now</button>
        </form>
      </PageBackground>
    </>
  );
};

export default StudentRegister;