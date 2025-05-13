import { io } from "socket.io-client";

const socket = io("https://school-register-a2bx.onrender.com", { transports: ["websocket"], reconnection: true });

export default socket; // ✅ Export socket instance for reuse