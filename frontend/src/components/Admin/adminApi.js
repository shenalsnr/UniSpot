import axios from "axios";

const adminApi = axios.create({
  baseURL: "http://localhost:5000/api",
});

adminApi.interceptors.request.use((config) => {
  const adminInfo = localStorage.getItem("adminInfo");

  if (adminInfo) {
    const parsed = JSON.parse(adminInfo);

    if (parsed.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`;
    }
  }

  return config;
});

export default adminApi;