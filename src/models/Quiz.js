import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  details: {
    type: String,
    trim: true,
    // Making it NOT required, as some questions might not need an explanation.
  },
});

const quizSchema = new mongoose.Schema(
  {
    // 💡 NEW FIELD: Chapter association
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter", // Assuming your chapters model is named 'Chapter'
      required: true // A quiz must belong to a chapter
    },

    title: { type: String, required: true },
    description: { type: String, trim: true },

    // 🎯 Categorization
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

    // ✅ "general" (chapter quiz) OR "challenge" (weekend quiz)
    type: {
      type: String,
      enum: ["general", "challenge"],
      default: "general",
    },

    questions: { type: [questionSchema], required: true },

    // 🎯 Challenge quiz defaults
    duration: { type: Number, default: 20 }, // minutes
    numQuestions: { type: Number, default: 10 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
export default Quiz;