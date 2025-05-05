// utils/sessionManager.js
import fs from "fs/promises";
import path from "path";
import WhatsAppSession from "../models/WhatsappSession.model.js";

const VENOM_FOLDER = path.join(process.cwd(), ".venom");

export const saveSessionToDB = async () => {
  try {
    const files = await fs.readdir(VENOM_FOLDER);
    const data = {};

    for (const file of files) {
      const content = await fs.readFile(path.join(VENOM_FOLDER, file), { encoding: "base64" });
      data[file] = content;
    }

    await WhatsAppSession.findOneAndUpdate(
      { name: "default-session" },
      { data },
      { upsert: true }
    );
    console.log("WhatsApp session saved to DB.");
  } catch (err) {
    console.error("Error saving session to DB:", err);
  }
};

export const restoreSessionFromDB = async () => {
  try {
    const record = await WhatsAppSession.findOne({ name: "default-session" });
    if (!record) return false;

    await fs.mkdir(VENOM_FOLDER, { recursive: true });

    for (const [fileName, base64] of Object.entries(record.data)) {
      const buffer = Buffer.from(base64, "base64");
      await fs.writeFile(path.join(VENOM_FOLDER, fileName), buffer);
    }

    console.log("WhatsApp session restored from DB.");
    return true;
  } catch (err) {
    console.error("Error restoring session from DB:", err);
    return false;
  }
};
