import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import AdminHeader from "../../components/AdminHeader";
import { useEffect } from "react";
import { useUserContext } from "../../context/userContext";
import { Toaster } from "react-hot-toast";

function Admin() {
  const { fetchUserDetails, currentUser } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDetails();
  }, []);

  if (currentUser?.role !== "admin") {
    return navigate("/");
  }

  return (
    <div className="p-0">
      <AdminHeader />
      <div className="flex flex-row">
  
        <main className="flex-1">
          <Outlet />
          <Toaster />
        </main>
      </div>
    </div>
  );
}

export default Admin;
