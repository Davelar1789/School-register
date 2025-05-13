import { useEffect, useContext } from "react";
import jwtDecode from "jwt-decode"; // Make sure to install this if not yet
import api from "../../api/axios"; // Adjust if needed
import { ShepherdTourContext } from "react-shepherd"; // Import the ShepherdTourContext to manage the tour flow

const StartHeaderTour = () => {
  const { tour } = useContext(ShepherdTourContext);  // Access the tour context to start the tour

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

    if (notificationEl && tour) {
      tour.start(); // Start the tour when the notification element is found

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
  }, [tour]);  // Empty dependency array ensures this runs only once

  return null;
};

export default StartHeaderTour;
