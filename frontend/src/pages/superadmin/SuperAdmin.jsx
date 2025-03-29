import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUserContext } from "../../context/userContext";
import { Toaster } from "react-hot-toast";

function SuperAdmin() {
  const { fetchUserDetails, currentUser } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDetails(); // Fetch user details when the component mounts
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.role !== "superadmin") {
      navigate("/"); // Navigate away only when user data is fully loaded
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return <div>Loading...</div>; // Prevents rendering before user data is available
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
