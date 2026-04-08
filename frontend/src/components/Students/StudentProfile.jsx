import { useEffect, useMemo, useState } from "react";
import StudentNavbar from "./StudentNavbar";
import studentApi from "./studentApi";
import PageBackground from "../Shared/PageBackground";

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [profileMessage, setProfileMessage] = useState("");
  const [vehicleMessage, setVehicleMessage] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [photoPreview, setPhotoPreview] = useState("");

  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    address: "",
    faculty: "",
    email: "",
    photo: null,
  });

  const [vehicleData, setVehicleData] = useState({
    model: "",
    color: "",
    regLetters: "",
    regNumbers: "",
  });

  const fetchProfile = async () => {
    try {
      const { data } = await studentApi.get("/students/profile");
      setStudent(data);

      setProfileData({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        faculty: data.faculty || "",
        email: data.email || "",
        photo: null,
      });

      setVehicleData({
        model: data.vehicle?.model || "",
        color: data.vehicle?.color || "",
        regLetters: data.vehicle?.regLetters || "",
        regNumbers: data.vehicle?.regNumbers || "",
      });

      setPhotoPreview(data.photo ? `http://localhost:5000${data.photo}` : "");
      setPhotoError("");
      setFileInputKey((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const validatePhotoFile = (file) => {
    if (!file) return "";

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return "Only JPG, JPEG, and PNG images are allowed";
    }

    if (file.size > 5 * 1024 * 1024) {
      return "Photo size must be 5MB or less";
    }

    return "";
  };

  const profileChangeHandler = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo") {
      const file = files[0];
      const error = validatePhotoFile(file);

      if (error) {
        setPhotoError(error);
        setProfileData((prev) => ({ ...prev, photo: null }));
        return;
      }

      if (file) {
        setPhotoError("");
        setProfileData((prev) => ({ ...prev, photo: file }));
        setPhotoPreview(URL.createObjectURL(file));
      }
      return;
    }

    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const removeSelectedPhoto = () => {
    setProfileData((prev) => ({ ...prev, photo: null }));
    setPhotoPreview(student?.photo ? `http://localhost:5000${student.photo}` : "");
    setPhotoError("");
    setFileInputKey((prev) => prev + 1);
  };

  const vehicleChangeHandler = (e) => {
    const { name, value } = e.target;
    setVehicleData((prev) => ({ ...prev, [name]: value }));
  };

  const updateProfileHandler = async (e) => {
    e.preventDefault();
    setProfileMessage("");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (profileData.email.trim() && !emailPattern.test(profileData.email.trim())) {
      setProfileMessage("Please enter a valid email address");
      return;
    }

    if (photoError) {
      setProfileMessage(photoError);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", profileData.name.trim());
      data.append("phone", profileData.phone.trim());
      data.append("address", profileData.address.trim());
      data.append("faculty", profileData.faculty);
      data.append("email", profileData.email.trim().toLowerCase());

      if (profileData.photo) {
        data.append("photo", profileData.photo);
      }

      const res = await studentApi.put("/students/profile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProfileMessage(res.data.message);
      fetchProfile();
    } catch (error) {
      setProfileMessage(error.response?.data?.message || "Profile update failed");
    }
  };

  const saveVehicleHandler = async (e) => {
    e.preventDefault();
    setVehicleMessage("");

    const lettersPattern = /^[A-Z]{2,3}$/;
    const numberPattern = /^\d{4}$/;

    if (!vehicleData.model || !vehicleData.color || !vehicleData.regLetters || !vehicleData.regNumbers) {
      setVehicleMessage("Please fill all vehicle fields");
      return;
    }

    if (!lettersPattern.test(vehicleData.regLetters.toUpperCase())) {
      setVehicleMessage("Vehicle letters must contain 2 or 3 English letters only");
      return;
    }

    if (!numberPattern.test(vehicleData.regNumbers)) {
      setVehicleMessage("Vehicle numbers must contain exactly 4 digits");
      return;
    }

    try {
      const res = await studentApi.put("/students/vehicle", {
        model: vehicleData.model.trim(),
        color: vehicleData.color.trim(),
        regLetters: vehicleData.regLetters.toUpperCase().trim(),
        regNumbers: vehicleData.regNumbers.trim(),
      });

      setVehicleMessage(res.data.message);
      fetchProfile();
    } catch (error) {
      setVehicleMessage(error.response?.data?.message || "Vehicle save failed");
    }
  };

  const removeVehicleHandler = async () => {
    try {
      const res = await studentApi.delete("/students/vehicle");
      setVehicleMessage(res.data.message);
      setVehicleData({
        model: "",
        color: "",
        regLetters: "",
        regNumbers: "",
      });
      fetchProfile();
    } catch (error) {
      setVehicleMessage(error.response?.data?.message || "Vehicle remove failed");
    }
  };

  const deleteProfileHandler = async () => {
    const confirmed = window.confirm(
      "⚠️ WARNING: This will permanently delete your profile and all associated data. This action cannot be undone. Are you sure?"
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      "This is your last chance! Your profile will be permanently deleted. Continue?"
    );

    if (!doubleConfirm) return;

    try {
      await studentApi.delete("/students/profile");
      localStorage.removeItem("studentInfo");
      window.location.href = "/";
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete profile");
    }
  };

  const downloadQrHandler = () => {
    if (!student?.qrCode) return;

    const link = document.createElement("a");
    link.href = student.qrCode;
    link.download = `${student.studentId}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const vehiclePreview = useMemo(() => {
    const letters = (vehicleData.regLetters || "").toUpperCase();
    const numbers = vehicleData.regNumbers || "";
    return letters || numbers ? `${letters}${letters && numbers ? "-" : ""}${numbers}` : "ABC-1234";
  }, [vehicleData.regLetters, vehicleData.regNumbers]);

  if (!student) {
    return (
      <>
        <StudentNavbar />
        <PageBackground className="flex justify-center items-center p-4 md:p-8">
          <div className="p-8 text-center font-bold text-white text-lg bg-black/20 rounded-2xl backdrop-blur-sm">
            Loading profile...
          </div>
        </PageBackground>
      </>
    );
  }

  return (
    <>
      <StudentNavbar />

      <PageBackground className="p-4 md:p-8 md:px-12 lg:px-24 min-h-screen">
        <div className="mb-8 relative z-10 p-6 md:p-8 rounded-2xl bg-black/40 border-2 border-cyan-400/80 backdrop-blur-xl shadow-2xl shadow-cyan-500/40">
          <div className="inline-block mb-4 px-4 py-2 rounded-full bg-black/80 border border-cyan-400/60 backdrop-blur-lg">
            <p className="m-0 text-xs font-bold uppercase tracking-widest text-cyan-300 drop-shadow-lg">
              ⚡ Student Dashboard
            </p>
          </div>
          <h1 className="m-0 text-4xl md:text-5xl text-cyan-400 font-extrabold tracking-tight drop-shadow-lg" style={{textShadow: '0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3)'}}>
            My Profile
          </h1>
          <p className="mt-4 text-cyan-200 font-medium text-base max-w-2xl drop-shadow-lg">
            📝 Manage your personal information, vehicle details, and security credentials
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
          {/* Profile Details Card */}
          <div className="p-7 bg-gradient-to-br from-blue-50/95 to-indigo-50/95 backdrop-blur-xl border border-blue-200/60 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-300/80 group">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-lg">👤</span>
              </div>
              <h2 className="m-0 text-slate-900 text-xl font-extrabold">Profile Details</h2>
            </div>

            {profileMessage && (
              <p className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-3 rounded-xl font-semibold mb-4 text-center text-sm border border-green-300/50 shadow-md">
                ✅ {profileMessage}
              </p>
            )}

            {photoError && (
              <p className="bg-gradient-to-r from-red-100 to-pink-100 text-red-700 px-4 py-3 rounded-xl font-semibold mb-4 text-center text-sm border border-red-300/50 shadow-md">
                ⚠️ {photoError}
              </p>
            )}

            <form className="flex flex-col gap-4" onSubmit={updateProfileHandler}>
              {/* Name Input */}
              <div className="group">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1.5 block">Full Name</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-blue-50 focus:ring-4 focus:ring-blue-500/20 group-hover:border-blue-300"
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={profileChangeHandler}
                  placeholder="Your full name"
                />
              </div>

              {/* Phone Input */}
              <div className="group">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1.5 block">📱 Phone</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-blue-50 focus:ring-4 focus:ring-blue-500/20 group-hover:border-blue-300"
                  type="text"
                  name="phone"
                  value={profileData.phone}
                  onChange={profileChangeHandler}
                  placeholder="Contact number"
                />
              </div>

              {/* Address Input */}
              <div className="group">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1.5 block">🏠 Address</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-blue-50 focus:ring-4 focus:ring-blue-500/20 group-hover:border-blue-300"
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={profileChangeHandler}
                  placeholder="Your address"
                />
              </div>

              {/* Faculty Input */}
              <div className="group">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1.5 block">🎓 Faculty</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-blue-50 focus:ring-4 focus:ring-blue-500/20 group-hover:border-blue-300"
                  type="text"
                  name="faculty"
                  value={profileData.faculty}
                  onChange={profileChangeHandler}
                  placeholder="Your faculty"
                />
              </div>

              {/* Email Input */}
              <div className="group">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1.5 block">📧 Email</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-blue-50 focus:ring-4 focus:ring-blue-500/20 group-hover:border-blue-300"
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={profileChangeHandler}
                  placeholder="Your email"
                />
              </div>

              {/* Photo Upload */}
              <div className="rounded-xl border-2 border-dashed border-blue-300/60 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 p-4 transition-all duration-200 hover:border-blue-400 hover:from-blue-50 hover:to-indigo-50">
                <label className="block text-sm font-bold text-slate-700 mb-2.5">📸 Change Photo</label>

                <input
                  key={fileInputKey}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-blue-200 bg-white text-sm text-slate-900 outline-none transition-all cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-blue-500 file:to-indigo-600 file:text-white file:px-4 file:py-1.5 file:font-bold file:cursor-pointer hover:border-blue-400"
                  type="file"
                  name="photo"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={profileChangeHandler}
                />

                <p className="mt-2 text-xs text-slate-500 font-medium">
                  ✓ JPG, JPEG, PNG | Max: 5MB
                </p>

                {photoPreview && (
                  <div className="mt-4 flex flex-col items-center gap-3 p-4 bg-white/60 rounded-xl border border-blue-200/50">
                    <img
                      src={photoPreview}
                      alt="Student Preview"
                      className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-xl border-3 border-white shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={removeSelectedPhoto}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold text-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Update Button */}
              <button
                type="submit"
                className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 rounded-xl px-4 py-3.5 font-bold text-lg transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/50 active:scale-95 border border-blue-500/50"
              >
                ✔ Update Profile
              </button>
            </form>
          </div>

          {/* Vehicle Details Card */}
          <div className="p-7 bg-gradient-to-br from-purple-50/95 to-pink-50/95 backdrop-blur-xl border border-purple-200/60 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-purple-300/80 group">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <span className="text-white text-lg">🚗</span>
              </div>
              <h2 className="m-0 text-slate-900 text-xl font-extrabold">Vehicle Details</h2>
            </div>

            {vehicleMessage && (
              <p className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-3 rounded-xl font-semibold mb-4 text-center text-sm border border-green-300/50 shadow-md">
                ✅ {vehicleMessage}
              </p>
            )}

            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-bold border border-purple-200/50 shadow-sm">
              {student.vehicleRegistered ? "🚗 Vehicle Registered" : "❌ No Vehicle Registered"}
            </div>

            <div className="mb-5 rounded-xl border-2 border-dashed border-purple-300/60 bg-gradient-to-br from-purple-50/60 to-pink-50/60 px-4 py-3 transition-all duration-200">
              <p className="m-0 text-xs font-bold uppercase tracking-wider text-purple-700 mb-1.5">
                📋 License Plate Preview
              </p>
              <p className="m-0 text-2xl font-extrabold tracking-[0.2em] text-slate-900 font-mono drop-shadow">
                {vehiclePreview}
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={saveVehicleHandler}>
              {/* Model Input */}
              <div className="group">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1.5 block">🏭 Vehicle Model</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-purple-600 focus:bg-purple-50 focus:ring-4 focus:ring-purple-500/20 group-hover:border-purple-300"
                  type="text"
                  name="model"
                  value={vehicleData.model}
                  onChange={vehicleChangeHandler}
                  placeholder="e.g., Toyota Prius"
                />
              </div>

              {/* Color Input */}
              <div className="group">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1.5 block">🎨 Vehicle Color</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-purple-600 focus:bg-purple-50 focus:ring-4 focus:ring-purple-500/20 group-hover:border-purple-300"
                  type="text"
                  name="color"
                  value={vehicleData.color}
                  onChange={vehicleChangeHandler}
                  placeholder="e.g., Silver, Blue"
                />
              </div>

              {/* Registration Letters */}
              <div className="group">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1.5 block">📝 Letter Plate</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-purple-600 focus:bg-purple-50 focus:ring-4 focus:ring-purple-500/20 group-hover:border-purple-300 uppercase tracking-widest font-mono"
                  type="text"
                  name="regLetters"
                  value={vehicleData.regLetters}
                  onChange={vehicleChangeHandler}
                  placeholder="e.g., ABC"
                  maxLength={3}
                />
              </div>

              {/* Registration Numbers */}
              <div className="group">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide ml-1 mb-1.5 block">🔢 Number Plate</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-purple-600 focus:bg-purple-50 focus:ring-4 focus:ring-purple-500/20 group-hover:border-purple-300 tracking-[0.3em] font-mono"
                  type="text"
                  name="regNumbers"
                  value={vehicleData.regNumbers}
                  onChange={vehicleChangeHandler}
                  placeholder="e.g., 1234"
                  maxLength={4}
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 rounded-xl px-4 py-3.5 font-bold text-lg transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-600/50 active:scale-95 border border-purple-500/50"
              >
                {student.vehicleRegistered ? "🔄 Update Vehicle" : "➕ Add Vehicle"}
              </button>
            </form>

            {student.vehicleRegistered && (
              <button
                className="mt-4 w-full bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-600/30 rounded-xl px-4 py-3 font-bold transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl hover:shadow-red-600/50 active:scale-95 border border-red-400/50"
                onClick={removeVehicleHandler}
              >
                🗑️ Remove Vehicle
              </button>
            )}
          </div>

          {/* QR Code Card Only */}
          <div className="p-7 bg-gradient-to-br from-amber-50/95 to-yellow-50/95 backdrop-blur-xl border border-amber-200/60 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-amber-300/80 text-center group">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                <span className="text-white text-lg">🔐</span>
              </div>
              <h2 className="m-0 text-slate-900 text-xl font-extrabold">Security QR Code</h2>
            </div>

            <p className="m-0 text-xs text-slate-600 font-medium mb-4">Your unique identity code for parking security</p>
            <div className="flex justify-center p-6 bg-white rounded-xl border border-amber-200/50">
              <img
                src={student.qrCode}
                alt="QR Code"
                className="w-[160px] h-[160px] object-contain drop-shadow-lg"
              />
            </div>

            <button
              type="button"
              onClick={downloadQrHandler}
              className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg shadow-amber-600/30 rounded-xl px-4 py-3.5 font-bold text-lg transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-600/50 active:scale-95 border border-amber-500/50"
            >
              ⬇️ Download QR Code
            </button>
          </div>
        </div>

        {/* Delete Profile Section */}
        <div className="mt-10 p-6 md:p-8 rounded-2xl bg-black/40 border-2 border-red-500/70 backdrop-blur-xl shadow-2xl shadow-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
              <span className="text-white text-lg">🗑️</span>
            </div>
            <h2 className="m-0 text-red-400 text-xl font-extrabold">Danger Zone</h2>
          </div>
          
          <p className="m-0 text-red-200 font-medium text-sm mb-4">
            ⚠️ Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          <button
            type="button"
            onClick={deleteProfileHandler}
            className="w-full bg-gradient-to-r from-red-700 to-red-900 text-white shadow-lg shadow-red-600/50 rounded-xl px-4 py-4 font-bold text-lg transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl hover:shadow-red-600/70 active:scale-95 border-2 border-red-500/60"
          >
            🚨 Delete My Account Permanently
          </button>
        </div>
      </PageBackground>
    </>
  );
};

export default StudentProfile;