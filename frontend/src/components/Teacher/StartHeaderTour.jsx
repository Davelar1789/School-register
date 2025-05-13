import { useEffect } from "react";
import { useTour } from "react-shepherd";
import jwtDecode from "jwt-decode";  // Make sure to install this if not yet
import api from "../api/axios"; // adjust if needed

const StartHeaderTour = () => {
  const tour = useTour();

  // Step 1: Decode the token and get the `seenTutorial` status
  const getTeacherData = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const decodedToken = jwtDecode(token);
      return {
        id: decodedToken?.id || null,
        seenTutorial: decodedToken?.seenTutorial || false,
      };
    } catch (error) {
      console.error("❌ Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    const teacherData = getTeacherData();

    if (!teacherData || teacherData.seenTutorial) return; // No tour if seen already

    // Step 2: Start the tour if not seen
    const notificationEl = document.querySelector(".notification-wrapper");

    if (notificationEl) {
      tour.start();

      // Step 3: Update backend and token after tour
      tour.on("complete", async () => {
        try {
          // Call your backend to mark tutorial as seen
          await api.put(`/mark-tutorial-seen/${teacherData.id}`);

          // Manually update the token (since it's localStorage)
          const updatedToken = jwtDecode(localStorage.getItem("token"));
          updatedToken.seenTutorial = true;
          localStorage.setItem("token", `Bearer ${JSON.stringify(updatedToken)}`); // Save the updated token

        } catch (err) {
          console.error("Error marking tutorial as seen:", err);
        }
      });
    }
  }, []);  // Empty dependency array ensures this runs only once

  return null;
};

export default StartHeaderTour;
