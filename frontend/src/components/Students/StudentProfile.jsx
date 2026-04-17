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
    <div className="min-h-screen bg-[#f8fafc]">
      <StudentNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400"></span>
            <span>Account Settings</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight text-left">My Profile</h1>
          <p className="mt-2 text-slate-500 font-medium text-left">Manage your personal identity, vehicle details, and security credentials.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Identity Card */}
            <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Identity Details</h3>
                </div>
              </div>

              <div className="p-8">
                {profileMessage && (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px]">✓</span>
                    {profileMessage}
                  </div>
                )}
                
                <form onSubmit={updateProfileHandler} className="space-y-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={profileChangeHandler}
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={profileChangeHandler}
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={profileData.phone}
                        onChange={profileChangeHandler}
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                        placeholder="+94 ..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Faculty</label>
                      <input
                        type="text"
                        name="faculty"
                        value={profileData.faculty}
                        onChange={profileChangeHandler}
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                        placeholder="e.g. Computing"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Residential Address</label>
                    <input
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={profileChangeHandler}
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                      placeholder="Street, City"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
                    >
                      Update Identity
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* Vehicle Section */}
            <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden text-left">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Vehicle Profile</h3>
                </div>
                {!student.vehicleRegistered && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-full border border-amber-100">Pending Registration</span>
                )}
              </div>

              <div className="p-8">
                {vehicleMessage && (
                  <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white text-[10px]">✓</span>
                    {vehicleMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <form onSubmit={saveVehicleHandler} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Make / Model</label>
                        <input
                          type="text"
                          name="model"
                          value={vehicleData.model}
                          onChange={vehicleChangeHandler}
                          className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold focus:bg-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Color</label>
                        <input
                          type="text"
                          name="color"
                          value={vehicleData.color}
                          onChange={vehicleChangeHandler}
                          className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold focus:bg-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Plate Letters</label>
                          <input
                            type="text"
                            name="regLetters"
                            value={vehicleData.regLetters}
                            onChange={vehicleChangeHandler}
                            maxLength={3}
                            className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-black uppercase tracking-widest text-center focus:bg-white outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Plate Numbers</label>
                          <input
                            type="text"
                            name="regNumbers"
                            value={vehicleData.regNumbers}
                            onChange={vehicleChangeHandler}
                            maxLength={4}
                            className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-black tracking-[0.2em] text-center focus:bg-white outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <button type="submit" className="w-full py-3.5 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all">
                          {student.vehicleRegistered ? "Update Vehicle" : "Add Vehicle"}
                        </button>
                      </div>
                    </form>

                    {student.vehicleRegistered && (
                      <button onClick={removeVehicleHandler} className="w-full text-xs font-black text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest">
                        Remove Vehicle Data
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">License Plate Preview</p>
                    <div className="w-64 h-32 bg-slate-100 rounded-2xl border-4 border-slate-800 flex items-center justify-center relative shadow-inner">
                      <div className="absolute top-2 left-2 text-[8px] font-black text-slate-400 uppercase tracking-tighter">UNISPOT PARKING</div>
                      <div className="text-4xl font-black text-slate-900 tracking-widest font-mono">
                        {vehiclePreview}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 italic text-center px-4">This info is used for automatic gate detection.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            {/* Profile Photo Card */}
            <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 text-center">
              <div className="relative inline-block group">
                <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-50 mx-auto">
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="absolute bottom-1 right-1 h-10 w-10 bg-indigo-600 text-white rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-indigo-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <input key={fileInputKey} type="file" name="photo" className="hidden" accept="image/*" onChange={profileChangeHandler} />
                </label>
              </div>

              <div className="mt-6 space-y-1">
                <h4 className="text-xl font-black text-slate-800">{student.name}</h4>
                <p className="text-sm font-bold text-slate-400">{student.studentId}</p>
              </div>

              {photoError && (
                <div className="mt-4 p-2.5 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-lg border border-red-100 italic">
                  {photoError}
                </div>
              )}

              {profileData.photo && (
                <div className="mt-6 pt-6 border-t border-slate-50 flex gap-2">
                   <button onClick={updateProfileHandler} className="flex-1 py-3 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-all">Save Photo</button>
                   <button onClick={removeSelectedPhoto} className="px-4 py-3 bg-slate-100 text-slate-600 text-xs font-black rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                </div>
              )}
            </section>

            {/* Security Pass Card */}
            <section className="bg-indigo-900 rounded-[2rem] p-8 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-200/50">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
               <div className="relative z-10 space-y-6">
                  <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl">
                    <img src={student.qrCode} alt="QR Code" className="w-32 h-32 object-contain" />
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-lg font-black tracking-tight">Digital Security ID</h5>
                    <p className="text-xs text-indigo-200 font-medium">Use this at security checkpoints for <br/> verification and parking access.</p>
                  </div>
                  <button onClick={downloadQrHandler} className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download ID Pass
                  </button>
               </div>
            </section>

            {/* Danger Zone */}
            <section className="bg-red-50/50 rounded-[2rem] p-8 border border-red-100">
               <h5 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                 Termination Zone
               </h5>
               <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">Permanently delete your identity records and all booking history. This cannot be undone.</p>
               <button onClick={deleteProfileHandler} className="w-full py-4 bg-white text-red-600 border border-red-200 rounded-2xl text-sm font-black hover:bg-red-600 hover:text-white transition-all shadow-sm">
                 Delete Student Profile
               </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;