import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUserContext } from "../../context/userContext.jsx"; // ✅ Use the correct hook
import { Toaster } from "react-hot-toast";

function SuperAdmin() {
  const { fetchUserDetails, currentUser } = useUserContext(); // ✅ Correct way
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDetails();
  }, []);

  console.log("Current User:", currentUser); // ✅ Now this should log to the console

  useEffect(() => {
    if (currentUser && currentUser.role !== "superadmin") {
      navigate("/"); // Redirect if not superadmin
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return <p>Loading...</p>; // Show loading until user data is available
  }

  return (
    <div className="p-0">
      <div className="flex flex-row">
        <main className="flex-1">
          <Outlet />
          <Toaster />
        </main>
      </div>
    </div>
  );
}

export default SuperAdmin;
