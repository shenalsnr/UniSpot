import { useEffect, useState } from "react";
import StudentNavbar from "./StudentNavbar";
import studentApi from "./studentApi";

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
      fetchProfile();
    } catch (error) {
      setVehicleMessage(error.response?.data?.message || "Vehicle remove failed");
    }
  };

  if (!student) {
    return <h3 className="student-loading">Loading...</h3>;
  }

  return (
    <>
      <StudentNavbar />

      <div className="student-profile-page">
        <div className="student-section">
          <h2>Profile Details</h2>
          {profileMessage && <p className="student-success">{profileMessage}</p>}

          <form className="student-form" onSubmit={updateProfileHandler}>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={profileChangeHandler}
              placeholder="Name"
            />
            <input
              type="text"
              name="phone"
              value={profileData.phone}
              onChange={profileChangeHandler}
              placeholder="Phone"
            />
            <input
              type="text"
              name="address"
              value={profileData.address}
              onChange={profileChangeHandler}
              placeholder="Address"
            />
            <input
              type="text"
              name="faculty"
              value={profileData.faculty}
              onChange={profileChangeHandler}
              placeholder="Faculty"
            />
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={profileChangeHandler}
              placeholder="Email"
            />
            <input
              type="file"
              name="photo"
              onChange={profileChangeHandler}
            />
            <button type="submit">Update Profile</button>
          </form>
        </div>

        <div className="student-section">
          <h2>Vehicle Details</h2>
          {vehicleMessage && <p className="student-success">{vehicleMessage}</p>}

          <form className="student-form" onSubmit={saveVehicleHandler}>
            <input
              type="text"
              name="model"
              value={vehicleData.model}
              onChange={vehicleChangeHandler}
              placeholder="Vehicle Model"
            />
            <input
              type="text"
              name="color"
              value={vehicleData.color}
              onChange={vehicleChangeHandler}
              placeholder="Vehicle Color"
            />
            <input
              type="text"
              name="regLetters"
              value={vehicleData.regLetters}
              onChange={vehicleChangeHandler}
              placeholder="Letters (2-3)"
            />
            <input
              type="text"
              name="regNumbers"
              value={vehicleData.regNumbers}
              onChange={vehicleChangeHandler}
              placeholder="Numbers (4 digits)"
            />
            <button type="submit">Save Vehicle</button>
          </form>

          {student.vehicleRegistered && (
            <button className="student-delete-btn" onClick={removeVehicleHandler}>
              Remove Vehicle
            </button>
          )}
        </div>

        <div className="student-section">
          <h2>Student QR Code</h2>
          <img src={student.qrCode} alt="QR Code" className="student-qr-image" />
        </div>

        <div className="student-section">
          <h2>Current Photo</h2>
          <img
            src={`http://localhost:5000${student.photo}`}
            alt="Student"
            className="student-profile-image"
          />
        </div>
      </div>
    </>
  );
};

export default StudentProfile;