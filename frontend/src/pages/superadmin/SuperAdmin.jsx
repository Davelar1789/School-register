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

  if (currentUser?.role !== "superadmin") {
    return navigate("/");
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
