// connectToMongoDB.js
import mongoose from "mongoose";

const connectToMongoDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING);
    console.log("Server Up and Running");
  } catch (error) {
    console.log("Error connecting to MongoDB: ", error.message);
  }
};

export default connectToMongoDb;
