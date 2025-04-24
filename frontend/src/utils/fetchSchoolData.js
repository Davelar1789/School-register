import api from "../api/axios";
import { jwtDecode } from "jwt-decode";

const fetchSchoolData = async () => {
  const token = localStorage.getItem("token");

  if (!token) return null;

  const decoded = jwtDecode(token);
  const schoolId = decoded?.schoolId;

  try {
    const { data } = await api.get(`/api/school/${schoolId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Save to localStorage so it's accessible across pages
    localStorage.setItem("schoolData", JSON.stringify(data));

    return data;
  } catch (err) {
    console.error("Failed to fetch updated school data:", err);
    return null;
  }
};

export default fetchSchoolData;
