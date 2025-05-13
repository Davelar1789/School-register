import mongoose from 'mongoose';


const notificationSchema = new mongoose.Schema({
    userIds: [{ // ✅ Keep user notifications for admins
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    teacherIds: [{ // ✅ New field for teachers
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
    }],
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ["attendance", "payment", "reminder", "general"],
        required: true,
    },
    readBy: [{ // ✅ Track who has read the notification
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
