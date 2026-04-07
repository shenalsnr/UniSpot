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

      <PageBackground className="p-4 md:p-8 md:px-12 lg:px-24">
        <div className="mb-6 relative z-10">
          <h1 className="m-0 text-3xl md:text-4xl text-white font-extrabold tracking-tight drop-shadow-md">
            My Profile
          </h1>
          <p className="mt-2 text-blue-50 font-medium text-lg drop-shadow-sm">
            Update your profile details and manage your vehicle information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          <div className="p-6 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <h2 className="mt-0 mb-5 text-slate-900 text-xl font-bold">Profile Details</h2>

            {profileMessage && (
              <p className="bg-green-100 text-green-800 px-4 py-3 rounded-xl font-semibold mb-4 text-center text-sm">
                {profileMessage}
              </p>
            )}

            {photoError && (
              <p className="bg-red-100 text-red-700 px-4 py-3 rounded-xl font-semibold mb-4 text-center text-sm">
                {photoError}
              </p>
            )}

            <form className="flex flex-col gap-4" onSubmit={updateProfileHandler}>
              <input
                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                type="text"
                name="name"
                value={profileData.name}
                onChange={profileChangeHandler}
                placeholder="Name"
              />
              <input
                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                type="text"
                name="phone"
                value={profileData.phone}
                onChange={profileChangeHandler}
                placeholder="Phone"
              />
              <input
                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                type="text"
                name="address"
                value={profileData.address}
                onChange={profileChangeHandler}
                placeholder="Address"
              />
              <input
                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                type="text"
                name="faculty"
                value={profileData.faculty}
                onChange={profileChangeHandler}
                placeholder="Faculty"
              />
              <input
                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                type="email"
                name="email"
                value={profileData.email}
                onChange={profileChangeHandler}
                placeholder="Email"
              />

              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Change Photo
                </label>

                <input
                  key={fileInputKey}
                  className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-white text-sm text-slate-900 outline-none"
                  type="file"
                  name="photo"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={profileChangeHandler}
                />

                <p className="mt-2 text-xs text-slate-500">
                  Allowed: JPG, JPEG, PNG | Maximum size: 5MB
                </p>

                {photoPreview && (
                  <div className="mt-4 flex flex-col items-center gap-3">
                    <img
                      src={photoPreview}
                      alt="Student Preview"
                      className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-2xl mx-auto block border-4 border-white shadow-lg drop-shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={removeSelectedPhoto}
                      className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200 transition-all"
                    >
                      Remove Selected Change
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg shadow-blue-600/20 rounded-xl px-4 py-3 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/30 hover:opacity-90"
              >
                Update Profile
              </button>
            </form>
          </div>

          <div className="p-6 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <h2 className="mt-0 mb-5 text-slate-900 text-xl font-bold">Vehicle Details</h2>

            {vehicleMessage && (
              <p className="bg-green-100 text-green-800 px-4 py-3 rounded-xl font-semibold mb-4 text-center text-sm">
                {vehicleMessage}
              </p>
            )}

            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 text-sm font-bold border border-blue-200">
              {student.vehicleRegistered ? "Vehicle Registered" : "No Vehicle Registered"}
            </div>

            <div className="mb-4 rounded-2xl border border-dashed border-blue-300 bg-blue-50/70 px-4 py-3">
              <p className="m-0 text-xs font-bold uppercase tracking-wide text-blue-700 mb-1">
                Live Vehicle Number Preview
              </p>
              <p className="m-0 text-lg font-extrabold tracking-[0.18em] text-slate-900">
                {vehiclePreview}
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={saveVehicleHandler}>
              <input
                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                type="text"
                name="model"
                value={vehicleData.model}
                onChange={vehicleChangeHandler}
                placeholder="Vehicle Model"
              />
              <input
                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                type="text"
                name="color"
                value={vehicleData.color}
                onChange={vehicleChangeHandler}
                placeholder="Vehicle Color"
              />
              <input
                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                type="text"
                name="regLetters"
                value={vehicleData.regLetters}
                onChange={vehicleChangeHandler}
                placeholder="Letters (2-3)"
                maxLength={3}
              />
              <input
                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                type="text"
                name="regNumbers"
                value={vehicleData.regNumbers}
                onChange={vehicleChangeHandler}
                placeholder="Numbers (4 digits)"
                maxLength={4}
              />
              <button
                type="submit"
                className="w-full mt-2 bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg shadow-blue-600/20 rounded-xl px-4 py-3 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/30 hover:opacity-90"
              >
                {student.vehicleRegistered ? "Update Vehicle" : "Add Vehicle"}
              </button>
            </form>

            {student.vehicleRegistered && (
              <button
                className="mt-4 w-full bg-gradient-to-br from-red-600 to-red-500 text-white shadow-lg shadow-red-600/20 rounded-xl px-4 py-3 font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-red-700"
                onClick={removeVehicleHandler}
              >
                Remove Vehicle
              </button>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="p-6 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center">
              <h2 className="mt-0 mb-4 text-slate-900 text-xl font-bold">Current Photo</h2>
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Student"
                  className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-2xl mx-auto block border-4 border-white shadow-lg drop-shadow-sm"
                />
              ) : (
                <p className="text-slate-500">No photo available</p>
              )}
            </div>

            <div className="p-6 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center">
              <h2 className="mt-0 mb-4 text-slate-900 text-xl font-bold">QR Code</h2>
              <img
                src={student.qrCode}
                alt="QR Code"
                className="w-[180px] h-[180px] object-contain bg-white p-3 rounded-2xl mx-auto border-4 border-white shadow-lg drop-shadow-sm"
              />
              <button
                type="button"
                onClick={downloadQrHandler}
                className="mt-4 w-full bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg shadow-blue-600/20 rounded-xl px-4 py-3 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/30 hover:opacity-90"
              >
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      </PageBackground>
    </>
  );
};

export default StudentProfile;