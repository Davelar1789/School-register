import mongoose, { Schema } from 'mongoose';

// Define the schema for a question in a test
const questionSchema = new Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [
    {
      type: String,
    },
  ],
  correctAnswer: {
    type: String,
  },
});

// Define the schema for a test
const testSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  questions: [questionSchema], // Array of questions
});

// Updated course schema
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  materials: [
    {
      type: String, // URL or file path
    },
  ],
  tests: [testSchema], // Array of tests
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Course', courseSchema);
