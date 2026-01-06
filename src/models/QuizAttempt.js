import mongoose from "mongoose";

// Define a sub-schema for a single answer record
const answerSchema = new mongoose.Schema({
    questionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    selectedAnswer: { 
        type: Number, // Stores the index of the option the user selected (e.g., 0, 1, 2, 3)
        required: true 
    },
    isCorrect: { 
        type: Boolean, 
        required: true 
    },
});

const quizAttemptSchema = new mongoose.Schema(
    {
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        // 💡 NEW FIELD for storing individual user responses
        answers: { 
            type: [answerSchema], 
            required: true 
        },

        // Scores
        score: { type: Number, required: true },
        correctAnswers: { type: Number, required: true },
        totalQuestions: { type: Number, required: true },

        // Timing for weekend challenge
        timeTaken: { type: Number, default: 0 }, // in seconds

        // New field
        type: {
            type: String,
            enum: ["general", "weekend"],
            default: "general",
        },
    },
    { timestamps: true }
);

const QuizAttempt =
    mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;