// src/models/Note.js

import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    // 🎯 Foreign Keys (Used for database linking)
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', // Reference to your Course model
        required: true,
    },
    chapterId: {
        // This stores the auto-generated _id of the embedded Chapter document inside the Course
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },

    // 🎯 Denormalized Categorization (Used for filtering and grouping in the GET API)
    department: { type: String, required: true },
    year: { type: String, required: true },
    semester: { type: String, required: true },
    courseTitle: { type: String, required: true },
    chapterTitle: { type: String, required: true },

    // 🎯 Note Details (The actual resource information)
    noteTitle: {
        type: String,
        required: true,
        trim: true,
    },
    downloadLink: {
        type: String,
        required: true,
        trim: true,
    },
    fileType: {
        type: String,
        enum: ['pdf', 'doc', 'link', 'video', 'zip', 'other'],
        default: 'pdf',
    },
}, { timestamps: true });

// --- Indexing for Performance ---
// Compound index to speed up filtering by the hierarchy (used in the GET API)
noteSchema.index({ department: 1, year: 1, semester: 1 });
// Index to quickly find all notes for a specific course and chapter
noteSchema.index({ course: 1, chapterId: 1 });

const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);
export default Note;