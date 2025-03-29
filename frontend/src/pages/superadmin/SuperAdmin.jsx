import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { UserProvider } from "../../context/userContext.jsx";
import { Toaster } from "react-hot-toast";

function SuperAdmin() {
  const { fetchUserDetails, currentUser } = UserProvider();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // ✅ Fix: Use useEffect for navigation to prevent infinite re-renders
  useEffect(() => {
    if (currentUser && currentUser.role !== "superadmin") {
        console.log("Current User:", currentUser);
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
