import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUserContext } from "../../context/userContext";
import { Toaster } from "react-hot-toast";

function SuperAdmin() {
  const { fetchUserDetails, currentUser } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // ✅ Fix: Use useEffect for navigation to prevent infinite re-renders
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
