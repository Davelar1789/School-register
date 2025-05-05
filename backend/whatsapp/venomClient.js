import { create } from "venom-bot";
import { restoreSessionFromDB, saveSessionToDB } from "../utils/sessionManager.js";

let whatsappClient;

export const initializeWhatsApp = async () => {
  if (whatsappClient) return whatsappClient;

  await restoreSessionFromDB(); // restore before creating client

  whatsappClient = await create({
    session: "session",
    multidevice: true,
    headless: false, // <--- This opens a visible browser window
    useChrome: true,
    logQR: true,     
  });

  // Save after QR scan or reconnect
  whatsappClient.onStateChange(async (state) => {
    if (state === "CONNECTED") {
      await saveSessionToDB();
    }
  });

  return whatsappClient;
};
