// models/Class.model.js
import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
  classCode: {
    type: String,
    required: true,
    unique: true,
  },
  className: {
    type: String,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  maxStudents: {
    type: Number,
    default: 70,
  },
  enrolledStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
}, { timestamps: true });

export default mongoose.model('Class', ClassSchema);
