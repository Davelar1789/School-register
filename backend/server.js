import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http"; // ✅ For WebSocket support
import { Server } from "socket.io"; // ✅ WebSocket server
import connectToMongoDb from "./db/connectToMongoDB.js";

// Routes
import whatsappRoutes from "./whatsapp/routes.js";
import schoolRoutes from "./routes/SchoolRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import saRoutes from "./routes/Saschool.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import studentRoutes from "./routes/student.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import feesRoutes from "./routes/feesRoutes.js";
import termsRoutes from "./routes/termSessionRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import tutorialRoutes from "./routes/tutorialRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";
import attendanceInternalRouter from "./routes/attendance.internal.js";
import path from 'path';

import reportTemplateRoutes from "./routes/reportTemplateRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import patchRoutes from "./routes/patchRoutes.js";
import examRoutes from "./routes/exams.js";
// import excelRoutes from "./routes/BulkExcelRoutes.js";
import topicRoutes from "./routes/topicRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import eventRoutes2 from "./routes/eventRoutes2.js";
import teacherMarkingSchemeRoutes from "./routes/teacherMarkingSchemeRoutes.js";
import adminMarkingSchemeRoutes from "./routes/adminMarkingSchemeRoutes.js";


// Middleware
import { authToken } from "./middleware/authToken.js";
import { verifyAdmin } from "./middleware/verifyAdmin.js";
import { verifyTeacher } from "./middleware/verifyTeacher.js";
import User from "./models/User.model.js"; // Import User model
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for WebSocket support
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://school-register-ruby.vercel.app", "https://jbrains.vercel.app"],
        credentials: true,
    },
    pingTimeout: 60000, // ✅ Prevents auto-disconnects (60 sec timeout)
    pingInterval: 25000, // ✅ Sends a keep-alive message every 25 sec
});

// ✅ WebSocket Connection (Improved Stability)
io.on("connection", (socket) => {
    console.log("✅ A user connected to real-time notifications:", socket.id);

    // ✅ Send confirmation when connected
    socket.emit("connection-confirmed", { message: "WebSocket connection established!" });

    // ✅ Listen for incoming notifications
    socket.on("send-notification", (data) => {
        console.log("🔔 Real-time notification received:", data);
        io.emit("new-notification", data); // ✅ Broadcast notification to all clients
    });

    // ✅ Handle unexpected disconnects
    socket.on("disconnect", (reason) => {
        console.log(`❌ A user disconnected from notifications (${reason})`);
    });
});

// Configure CORS
const corsConfig = {
    origin: ["https://school-register-ruby.vercel.app", "https://jbrains.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsConfig));

app.use(express.json());
app.use(cookieParser());

// API Routes
app.post("/api/", (req, res) => {
    res.send("JBA Server is UP and Running");
});

app.use("/api/schools", schoolRoutes);
app.use("/api/users", userRoutes);
app.use("/api/superschool", saRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/fees", feesRoutes);
app.use("/api/terms", termsRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/tutorial", tutorialRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/report-template", reportTemplateRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/patch", patchRoutes);
app.use("/api/topics", topicRoutes);
app.use('/api/exams/', examRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/eventss", eventRoutes2);
app.use("/api/attendance2", attendanceInternalRouter);
app.use("/api/marking-schemes/teacher", teacherMarkingSchemeRoutes);
app.use("/api/marking-schemes/admin", adminMarkingSchemeRoutes);
app.use('/generated-exams', express.static(path.join(__dirname, 'generated-exams')));
// app.use("/api/excel-bulk", excelRoutes);
app.use("/uploads", express.static("uploads"));



app.get("/ping", (req, res) => {
    res.status(200).send("Pong!");
});

// ✅ User Data Endpoint
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

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`Error: ${message}`);
    res.status(statusCode).json({ success: false, statusCode, message });
});

// ✅ Connect to MongoDB and Start Server
connectToMongoDb().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
});

// ✅ Export io for use in notifications
export { io };