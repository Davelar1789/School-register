import "./styles/App.css";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useUserContext } from "./context/userContext";  // ✅ Use the correct hook
import { useEffect } from "react";

function App() {
  const { fetchUserDetails } = useUserContext();  // ✅ Use the hook here

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <>
      <main className="min-h-[calc(100vh-120px)]">
        <Outlet />
        <Toaster />
      </main>
    </>
  );
}

export default App;
