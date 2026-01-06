// src/app/api/notes/add/route.js

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Note from "@/models/Note";
import { requireAdmin } from "@/lib/requireAdmin";

// 📌 POST: Add one or multiple note links
export async function POST(request) {
    try {
        await dbConnect();

        // 🚨 Authorization Check (Uncomment when ready to enforce admin access)
        // const authResponse = await requireAdmin();
        // if (authResponse) return authResponse;

        const body = await request.json();

        // 1. Validate if the body is a non-empty array
        if (!Array.isArray(body) || body.length === 0) {
            return NextResponse.json(
                { error: "Invalid request body. Expecting an array of note objects." },
                { status: 400 }
            );
        }

        // 2. Validate necessary fields for each note
        const invalidNotes = body.filter(note =>
            // 🛑 FIX: Ensure 'course' and 'fileType' are checked as per Note model
            !note.course || // Mongoose model uses 'course' (ObjectId)
            !note.chapterId ||
            !note.department ||
            !note.year ||
            !note.semester ||
            !note.courseTitle ||
            !note.chapterTitle ||
            !note.noteTitle ||
            !note.downloadLink ||
            !note.fileType // Added fileType check
        );

        if (invalidNotes.length > 0) {
            return NextResponse.json(
                // 🛑 Updated error message to show all required fields
                { error: "One or more notes are missing required fields (course, chapterId, department, year, semester, courseTitle, chapterTitle, noteTitle, downloadLink, fileType)." },
                { status: 400 }
            );
        }

        // 3. Use insertMany for efficient bulk insertion
        const result = await Note.insertMany(body);

        return NextResponse.json(
            {
                message: `${result.length} note link(s) added successfully!`,
                count: result.length,
                notes: result.map(n => n._id)
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("API Notes Add Error:", err);
        return NextResponse.json(
            { error: "Failed to add notes", details: err.message },
            { status: 500 }
        );
    }
}