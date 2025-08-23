import "./styles/App.css";
import { Outlet } from "react-router-dom";
import { Toaster as SonnerToaster, toast } from "sonner";
import { Toaster as HotToastToaster } from "react-hot-toast";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useUserContext } from "./context/userContext";  
import { useEffect, useState } from "react";

function App() {
  const { fetchUserDetails } = useUserContext();  
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);

  useEffect(() => {
    fetchUserDetails();

    const handleOffline = () => {
      setOfflineMode(true);
      toast("You are offline. Some features may be limited.");
    };
    const handleOnline = () => {
      setOfflineMode(false);
      toast.success("Back online!");
      window.location.reload()
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <>
      {offlineMode && (
        <div style={{backgroundColor:"#fcd34d", padding:"5px", textAlign:"center"}}>
          Offline Mode Enabled
        </div>
      )}
      <main className="min-h-[calc(100vh-120px)]">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Outlet />
        </LocalizationProvider>
        <SonnerToaster richColors position="top-right" />
        <HotToastToaster />
      </main>
    </>
  );
}

export default App;
