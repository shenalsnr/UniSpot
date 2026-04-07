import { useEffect, useState } from "react";
import StudentNavbar from "./StudentNavbar";
import studentApi from "./studentApi";
import PageBackground from "../Shared/PageBackground";

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [profileMessage, setProfileMessage] = useState("");
  const [vehicleMessage, setVehicleMessage] = useState("");

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
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const profileChangeHandler = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo") {
      setProfileData({ ...profileData, photo: files[0] });
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
  };

  const vehicleChangeHandler = (e) => {
    const { name, value } = e.target;
    setVehicleData({ ...vehicleData, [name]: value });
  };

  const updateProfileHandler = async (e) => {
    e.preventDefault();
    setProfileMessage("");

    try {
      const data = new FormData();
      data.append("name", profileData.name);
      data.append("phone", profileData.phone);
      data.append("address", profileData.address);
      data.append("faculty", profileData.faculty);
      data.append("email", profileData.email);

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

    if (
      !vehicleData.model ||
      !vehicleData.color ||
      !vehicleData.regLetters ||
      !vehicleData.regNumbers
    ) {
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
        model: vehicleData.model,
        color: vehicleData.color,
        regLetters: vehicleData.regLetters.toUpperCase(),
        regNumbers: vehicleData.regNumbers,
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
            <h2 className="mt-0 mb-5 text-slate-900 text-xl font-bold">
              Profile Details
            </h2>
            {profileMessage && (
              <p className="bg-green-100 text-green-800 px-4 py-3 rounded-xl font-semibold mb-4 text-center text-sm">
                {profileMessage}
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
              <input
                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 block file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                type="file"
                name="photo"
                onChange={profileChangeHandler}
              />
              <button
                type="submit"
                className="w-full mt-2 bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg shadow-blue-600/20 rounded-xl px-4 py-3 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/30 hover:opacity-90"
              >
                Update Profile
              </button>
            </form>
          </div>

          <div className="p-6 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <h2 className="mt-0 mb-5 text-slate-900 text-xl font-bold">
              Vehicle Details
            </h2>
            {vehicleMessage && (
              <p className="bg-green-100 text-green-800 px-4 py-3 rounded-xl font-semibold mb-4 text-center text-sm">
                {vehicleMessage}
              </p>
            )}

            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 text-sm font-bold border border-blue-200">
              {student.vehicleRegistered ? "Vehicle Registered" : "No Vehicle Registered"}
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
              />
              <input
                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                type="text"
                name="regNumbers"
                value={vehicleData.regNumbers}
                onChange={vehicleChangeHandler}
                placeholder="Numbers (4 digits)"
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
              <h2 className="mt-0 mb-4 text-slate-900 text-xl font-bold">
                Current Photo
              </h2>
              <img
                src={`http://localhost:5000${student.photo}`}
                alt="Student"
                className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-2xl mx-auto block border-4 border-white shadow-lg drop-shadow-sm"
              />
            </div>

            <div className="p-6 bg-white/80 backdrop-blur-md border border-white/65 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center">
              <h2 className="mt-0 mb-4 text-slate-900 text-xl font-bold">
                QR Code
              </h2>
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