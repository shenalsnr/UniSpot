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
  const [photoError, setPhotoError] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailValid, setEmailValid] = useState(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const validatePhotoFile = (file) => {
    if (!file) return "Please upload a student photo";

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return "Only JPG, JPEG, and PNG images are allowed";
    }

    if (file.size > 5 * 1024 * 1024) {
      return "Photo size must be 5MB or less";
    }

    return "";
  };

  const validateEmailUniqueness = async (email) => {
    if (!email.trim()) {
      setEmailError("");
      setEmailValid(null);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailPattern.test(email.trim())) {
      setEmailError("❌ Please enter a valid email address");
      setEmailValid(false);
      return;
    }

    setIsCheckingEmail(true);
    try {
      const res = await studentApi.post("/students/check-email", {
        email: email.trim().toLowerCase(),
      });

      if (res.data.exists) {
        setEmailError("❌ Email already registered");
        setEmailValid(false);
      } else {
        setEmailError("✅ Email is available");
        setEmailValid(true);
      }
    } catch (error) {
      setEmailError("⚠️ Could not verify email, will check on submit");
      setEmailValid(null);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const changeHandler = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo") {
      const file = files[0];
      const error = validatePhotoFile(file);

      if (error) {
        setPhotoError(error);
        setFormData((prev) => ({ ...prev, photo: null }));
        setPreview("");
        return;
      }

      setPhotoError("");
      setFormData((prev) => ({ ...prev, photo: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }

    if (name === "email") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      validateEmailUniqueness(value);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const removeSelectedPhoto = () => {
    setFormData((prev) => ({ ...prev, photo: null }));
    setPreview("");
    setPhotoError("");
    setFileInputKey((prev) => prev + 1);
  };

  const validateForm = () => {
    const studentIdPattern = /^(IT|BM)\d{8}$/;
    const phonePattern = /^0\d{9}$/;
    const namePattern = /^[A-Za-z\s]{3,}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

    if (formData.email.trim()) {
      if (emailValid === false) {
        return "Please use a valid and available email address";
      }
      if (!emailPattern.test(formData.email.trim())) {
        return "Please enter a valid email address";
      }
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }

    const photoValidationError = validatePhotoFile(formData.photo);
    if (photoValidationError) {
      return photoValidationError;
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
      data.append("name", formData.name.trim());
      data.append("studentId", formData.studentId.toUpperCase().trim());
      data.append("phone", formData.phone.trim());
      data.append("address", formData.address.trim());
      data.append("faculty", formData.faculty);
      data.append("email", formData.email.trim().toLowerCase());
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
        <form
          className="w-full max-w-130 p-8 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-xl flex flex-col gap-4 animate-fade-in transition-all duration-300 relative z-10 mx-auto my-8"
          onSubmit={submitHandler}
        >
          <h2 className="mb-2 text-3xl md:text-4xl text-center text-slate-900 font-extrabold">
            Create Student Account
          </h2>
          <p className="mb-5 text-center text-slate-500 leading-relaxed font-medium">
            Register your profile to manage lockers, parking, vehicle details, and QR access.
          </p>

          {message && (
            <p className="bg-red-100 text-red-700 px-4 py-3 rounded-xl font-semibold text-center">
              {message}
            </p>
          )}

          {photoError && (
            <p className="bg-red-100 text-red-700 px-4 py-3 rounded-xl font-semibold text-center">
              {photoError}
            </p>
          )}

          <input
            className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={changeHandler}
            required
          />

          <input
            className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
            type="text"
            name="studentId"
            placeholder="Student ID (IT12345678)"
            onChange={changeHandler}
            required
          />

          <input
            className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
            type="text"
            name="phone"
            placeholder="Phone Number"
            onChange={changeHandler}
            required
          />

          <input
            className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
            type="text"
            name="address"
            placeholder="Address"
            onChange={changeHandler}
            required
          />

          <select
            className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
            name="faculty"
            onChange={changeHandler}
            required
          >
            <option value="">Select Faculty</option>
            <option value="Faculty of Computing">Faculty of Computing</option>
            <option value="Faculty of Business">Faculty of Business</option>
            <option value="Faculty of Engineering">Faculty of Engineering</option>
            <option value="Faculty of Humanities & Sciences">Faculty of Humanities & Sciences</option>
          </select>

          <div>
            <div className="relative">
              <input
                className={`w-full px-4 py-3 rounded-xl border-2 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:bg-white focus:ring-4 ${emailValid === true ? "border-green-500 focus:border-green-600 focus:ring-green-500/10" : emailValid === false ? "border-red-500 focus:border-red-600 focus:ring-red-500/10" : "border-blue-100 focus:border-blue-600 focus:ring-blue-600/10"}`}
                type="email"
                name="email"
                placeholder="Email (Optional)"
                value={formData.email}
                onChange={changeHandler}
              />
              {isCheckingEmail && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold">🔄</span>}
              {emailValid === true && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 font-bold">✓</span>}
              {emailValid === false && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 font-bold">✕</span>}
            </div>
            {emailError && (
              <p className={`mt-2 text-xs font-semibold px-3 py-1 rounded-lg ${emailValid === true ? "bg-green-100 text-green-700" : emailValid === false ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                {emailError}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              className="w-full px-4 py-3 pr-20 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={changeHandler}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-600 hover:text-blue-800"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="relative">
            <input
              className="w-full px-4 py-3 pr-20 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={changeHandler}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-600 hover:text-blue-800"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Student Photo
            </label>

            <input
              key={fileInputKey}
              className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-white text-sm text-slate-900 outline-none"
              type="file"
              name="photo"
              accept="image/png,image/jpeg,image/jpg"
              onChange={changeHandler}
              required={!preview}
            />

            <p className="mt-2 text-xs text-slate-500">
              Allowed: JPG, JPEG, PNG | Maximum size: 5MB
            </p>

            {preview && (
              <div className="mt-4 flex flex-col items-center gap-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-44 h-44 object-cover rounded-2xl block border-4 border-white/75 shadow-lg"
                />
                <button
                  type="button"
                  onClick={removeSelectedPhoto}
                  className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200 transition-all"
                >
                  Remove Selected Photo
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg shadow-blue-600/20 rounded-xl px-4 py-3 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/30 hover:opacity-90"
          >
            Register Now
          </button>
        </form>
      </PageBackground>
    </>
  );
};

export default StudentRegister;