import { create } from "venom-bot";
import { restoreSessionFromDB, saveSessionToDB } from "../utils/sessionManager.js";

let whatsappClient;

export const initializeWhatsApp = async () => {
  if (whatsappClient) return whatsappClient;

  await restoreSessionFromDB(); // restore before creating client

  whatsappClient = await create({
    session: "session", // uses .venom/session.json
    multidevice: true,
    headless: true,
  });

  // Save after QR scan or reconnect
  whatsappClient.onStateChange(async (state) => {
    if (state === "CONNECTED") {
      await saveSessionToDB();
    }
  });

  return whatsappClient;
};
