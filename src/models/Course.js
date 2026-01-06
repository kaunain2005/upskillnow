// src/models/Course.js
import mongoose from "mongoose";

// Module Schema
const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  image: { type: String, trim: true }, // optional image
});

// Chapter Schema
const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  modules: { type: [moduleSchema], default: [] },
});

// Course Schema
const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true }, // course cover image
    duration: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    fullInfo: { type: String, trim: true },

    // 🎯 Categorization (course-level)
    department: {
      type: String,
      enum: ["CS", "IT", "DS"],
      required: true,
    },
    year: {
      type: String,
      enum: ["FY", "SY", "TY"],
      required: true,
    },
    semester: {
      type: String,
      enum: ["SEM1", "SEM2"],
      required: true,
    },

    chapters: {
      type: [chapterSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);
export default Course;
