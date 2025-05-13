import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./router.jsx";
import { UserProvider } from "./context/userContext";
import { TourProvider } from "../src/components/Teacher/TourContext.jsx"; // adjust path


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
        <TourProvider>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
        </TourProvider>
  </React.StrictMode>
);
