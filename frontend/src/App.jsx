import "./styles/App.css";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect } from "react";

const toastOptions = {
  duration: 4000,
  style: {
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: ".9rem",
    color: "var(--dark)",
    background: "#fff",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    boxShadow: "0 12px 36px rgba(14,42,38,.16)",
    padding: ".7rem 1rem",
  },
  success: { iconTheme: { primary: "#1a8c7a", secondary: "#fff" } },
  error: { iconTheme: { primary: "#dc4c3c", secondary: "#fff" } },
};

function App() {
  /* announce connectivity changes once, without reloading the page under the user */
  useEffect(() => {
    const off = () => toast("You are offline. Some features are limited.", { icon: "📡", id: "net" });
    const on = () => toast.success("Back online", { id: "net" });
    window.addEventListener("offline", off);
    window.addEventListener("online", on);
    return () => {
      window.removeEventListener("offline", off);
      window.removeEventListener("online", on);
    };
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Outlet />
      <ScrollRestoration />
      <Toaster position="top-right" toastOptions={toastOptions} containerClassName="toast-root" />
    </LocalizationProvider>
  );
}

export default App;
