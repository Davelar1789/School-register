import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar2";
import AdminHeader from "../../../components/Teacher/TeacherHeader";
import { useEffect } from "react";
import { useUserContext } from "../../context/userContext";
import { Toaster } from "react-hot-toast";

function Teacher() {
  const { fetchUserDetails, currentUser } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDetails();
  }, []);

  if (currentUser?.role !== "teacher") {
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

export default Teacher;
