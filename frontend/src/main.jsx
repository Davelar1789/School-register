import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./styles/theme.css";
import "./components/layout/AppShell.css";
import { RouterProvider } from "react-router-dom";
import router from "./router.jsx";
import { UserProvider } from "./context/userContext";

// 👇 import before rendering root
import "../pwa.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </React.StrictMode>
);
