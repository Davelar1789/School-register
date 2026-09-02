import mongoose from "mongoose";
import TermSession from "../models/TermSession.model.js"; // adjust path to your actual model file

// 🔧 Paste your MongoDB connection string here manually
const MONGO_URI = "mongodb+srv://Codewhiz:fu28IUFjk5ZxVshN@cluster0.xiy0lld.mongodb.net/";

const syncActiveTermFlags = async (schoolId) => {
  const now = new Date();

  await TermSession.updateMany(
    { schoolId },
    { $set: { isActive: false } }
  );

  await TermSession.updateOne(
    { schoolId, startDate: { $lte: now }, endDate: { $gte: now } },
    { $set: { isActive: true } }
  );
};

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const schoolIds = await TermSession.distinct("schoolId");

    for (const schoolId of schoolIds) {
      await syncActiveTermFlags(schoolId);
      console.log(`Synced terms for school: ${schoolId}`);
    }

    console.log("Done.");
    process.exit(0);
  } catch (err) {
    console.error("Error syncing terms:", err);
    process.exit(1);
  }
};

run();