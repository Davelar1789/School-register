import mongoose from "mongoose";
import dotenv from "dotenv";
import TermSession from "../models/TermSession.model.js"; // adjust path

dotenv.config();

const syncActiveTermFlags = async (schoolId) => {
  const now = new Date();
  await TermSession.updateMany({ schoolId }, { $set: { isActive: false } });
  await TermSession.updateOne(
    { schoolId, startDate: { $lte: now }, endDate: { $gte: now } },
    { $set: { isActive: true } }
  );
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Get all distinct schoolIds that have terms
  const schoolIds = await TermSession.distinct("schoolId");

  for (const schoolId of schoolIds) {
    await syncActiveTermFlags(schoolId);
    console.log(`Synced terms for school: ${schoolId}`);
  }

  console.log("Done.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});