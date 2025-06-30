import "./styles/App.css";
import { Outlet } from "react-router-dom";
import { Toaster as SonnerToaster, toast } from "sonner";
import { Toaster as HotToastToaster } from "react-hot-toast";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useUserContext } from "./context/userContext";  
import { useEffect } from "react";

function App() {
  const { fetchUserDetails } = useUserContext();  

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <>
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