import express from "express";
import { initializeWhatsApp } from "./venomClient.js";

const router = express.Router();

router.post("/send-whatsapp-receipt", async (req, res) => {
  const { phoneNumber, studentName, amount, date } = req.body;

  if (!phoneNumber || !studentName || !amount || !date) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const formattedPhone = phoneNumber.replace(/^\+/, "").replace(/^0/, "233");

  const message = `Hello, this is a receipt for ${studentName}. GHC ${amount} was paid on ${date}. Thank you!`;

  try {
    const client = await initializeWhatsApp();
    await client.sendText(`${formattedPhone}@c.us`, message);
    res.status(200).json({ success: true, message: "Receipt sent successfully." });
  } catch (err) {
    console.error("WhatsApp send error:", err);
    res.status(500).json({ error: "Failed to send WhatsApp message." });
  }
});

export default router;
