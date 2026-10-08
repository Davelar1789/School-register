import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "https://school-register6.onrender.com";

let instance = null;

/** One lazily-created, shared socket for the whole app. */
export const getSocket = () => {
  if (!instance) {
    instance = io(SOCKET_URL, {
      transports: ["websocket"],
      // sent on every (re)connect so an expired token is replaced by the latest one
      auth: (cb) => cb({ token: localStorage.getItem("token") }),
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 5000,
      autoConnect: true,
    });
  }
  return instance;
};

export default getSocket;
