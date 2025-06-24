import { io } from "socket.io-client";

const socket = io("https://school-register6.onrender.com", {
    transports: ["websocket"], // ✅ Force WebSocket transport
    reconnection: true, // ✅ Automatically reconnect
    reconnectionAttempts: 10, // ✅ Retry if disconnected
    reconnectionDelay: 5000, // ✅ Wait 5 seconds before retrying
});

export default socket;