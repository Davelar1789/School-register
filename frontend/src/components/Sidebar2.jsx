import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import dashboardIcon from "../assets/images/dashboard-icon.png";
import productStockIcon from "../assets/images/product-stock-icon.png";
import axios from "axios";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation().pathname;

  const handleNavigation = (path) => {
    if (path === "teacher/logout") {
      axios
        .get("/api/auth/logout", { withCredentials: true })
        .then(() => {
          toast.success("Logged Out");
          navigate("/");
          navigate(0);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Something went wrong");
        });
    } else {
      navigate(`/${path}`);
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: dashboardIcon, path: "" },
    {
      name: "My Students",
      icon: productStockIcon,
      path: "manage-students",
    },
    { name: "Edit Grades", icon: dashboardIcon, path: "edit-grades" },
    { name: "Grade Book", icon: dashboardIcon, path: "grade-book" },
    { name: "Attendance", icon: dashboardIcon, path: "attendance" },
  ];

  return (
    <aside className="">
      <div className="flex flex-col gap-4">
        {menuItems.map((item, index) => {
          return (
            <div key={index}>
              <div
                className={`pl-3 pr-2 sm:px-[20px] sm:py-1 flex gap-2 items-center cursor-pointer ${
                  location === `/teacher/${item.path}` && "bg-blue-600"
                } ${
                  item.name === `Dashboard` &&
                  location === "/teacher" &&
                  "bg-blue-600"
                } text-black`}
                onClick={() => handleNavigation(`teacher/${item.path}`)}
              >
                <img
                  className="w-[40px] h-[40px] p-2"
                  src={item.icon}
                  alt={item.name}
                />
                <span className="hidden sm:block" style={{ color: 'black' }}>{t(item.name)}</span>
              </div>
              {item.border && <hr />}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
