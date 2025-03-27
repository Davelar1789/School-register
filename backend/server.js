import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import auth from "./routes/general/auth.js";
import admin from "./routes/admin/admin.js";
import teacher from "./routes/teacher/teacher.js";
import products from "./routes/general/product.js";
import students from "./routes/general/student.js";
import schoolRoutes from "./routes/SchoolRoutes.js";

import events from "./routes/general/event.js";

import { authToken } from "./middleware/authToken.js";
import { verifyAdmin } from "./middleware/verifyAdmin.js";
import { verifyTeacher } from "./middleware/verifyTeacher.js";
import connectToMongoDb from "./db/connectToMongoDB.js";
import User from "./models/User.model.js"; // Import your User model to retrieve user data

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS (only allowing frontend hosted on Vercel)
const corsConfig = {
  origin: ["https://school-register-ruby.vercel.app"], // Frontend origin
  credentials: true, // Allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow all required methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allow required headers
};
app.use(cors(corsConfig));


app.use(express.json());
app.use(cookieParser());

// Route Definitions
app.post("/api/", (req, res) => {
  res.send("JBA Server is UP and Running");
});

app.use("/api/auth", auth);
app.use("/api/admin", authToken, admin); // Protected admin routes// app.use("/api", product);
app.use("/api/teacher", authToken, teacher);
app.use("/api/", products);
app.use("/api/", students);
app.use("/api/", events);
app.use("/api/schools", schoolRoutes);


app.get('/ping', (req, res) => {
  res.status(200).send('Pong!');
  });

// app.use("/api", general);
// Define user data endpoint
app.get("/api/user-data", authToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user data" });
  }
});


// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`Error: ${message}`); // Log error details for debugging
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Connect to MongoDB and start the server
connectToMongoDb().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Graceful Shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0); // Exit process after closing the server
    });
  });
});
