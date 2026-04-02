import axios from "axios";

const studentApi = axios.create({
  baseURL: "http://localhost:5000/api",
});

studentApi.interceptors.request.use((config) => {
  const studentInfo = localStorage.getItem("studentInfo");

  if (studentInfo) {
    const parsed = JSON.parse(studentInfo);

    if (parsed.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`;
    }
  }

  return config;
});

export default studentApi;