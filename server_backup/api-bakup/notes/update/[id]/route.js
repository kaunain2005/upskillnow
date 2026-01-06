// src/app/api/notes/update/[id]/route.js

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Note from "@/models/Note";
import { requireAdmin } from "@/lib/requireAdmin";
import mongoose from "mongoose";

// 📌 PATCH: Update a single note link by its ID
export async function PATCH(request, { params }) {
    try {
        await dbConnect();

        // 🚨 Authorization Check (Uncomment when ready to enforce admin access)
        // const authResponse = await requireAdmin();
        // if (authResponse) return authResponse;

        const { id } = params;
        const updates = await request.json();

        // 1. Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: "Invalid Note ID format." },
                { status: 400 }
            );
        }

        // 2. Filter out unnecessary fields (like _id, createdAt, etc.) 
        // and ensure only updateable fields are passed.
        const updateableFields = ['noteTitle', 'downloadLink', 'fileType'];

        // If you allow updating chapter/course details, add them here:
        // const updateableFields = ['noteTitle', 'downloadLink', 'fileType', 'department', 'year', 'semester', 'courseId', 'courseTitle', 'chapterId', 'chapterTitle'];

        const filteredUpdates = Object.keys(updates)
            .filter(key => updateableFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
            }, {});

        // 3. Ensure there are fields to update
        if (Object.keys(filteredUpdates).length === 0) {
            return NextResponse.json(
                { error: "No valid fields provided for update. Only noteTitle, downloadLink, and fileType are updateable." },
                { status: 400 }
            );
        }

        // 4. Perform the update operation
        const updatedNote = await Note.findByIdAndUpdate(
            id,
            { $set: filteredUpdates },
            { new: true, runValidators: true } // Return the updated document, run Mongoose validation
        );

        // 5. Check if the note was found and updated
        if (!updatedNote) {
            return NextResponse.json(
                { error: `Note with ID ${id} not found.` },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                message: `Note ID ${id} updated successfully.`,
                note: updatedNote,
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("API Notes Update Error:", err);
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            return NextResponse.json(
                { error: "Validation failed", details: err.message },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to update note", details: err.message },
            { status: 500 }
        );
    }
}