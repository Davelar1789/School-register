// renameTicks.js

import mongoose from "mongoose";
import EarlyYearsReport from "../models/EarlyYearsReport.model.js"; // Adjust path if needed

const MONGO_URI = "mongodb+srv://Codewhiz:fu28IUFjk5ZxVshN@cluster0.xiy0lld.mongodb.net/";

async function renameTickKeys() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const reports = await EarlyYearsReport.find();

    let updatedCount = 0;

    for (const report of reports) {
      const ticks = report.ticks;

      if (!ticks || ticks.size === 0) continue;

      let changed = false;
      const newTicks = {};

      // Map -> iterate
      for (const [key, value] of ticks.entries()) {
        const newKey = key.replace(/ - /g, " to ");

        newTicks[newKey] = value;

        if (newKey !== key) {
          changed = true;
        }
      }

      if (changed) {
        report.ticks = new Map(Object.entries(newTicks));
        await report.save();

        updatedCount++;
        console.log(`✔ Updated report ${report._id}`);
      }
    }

    console.log(`\n🎉 Done! Updated ${updatedCount} report(s).`);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

renameTickKeys();