import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Course from "@/models/Course"; // To get course titles and chapters (imported but not used)
import Note from "@/models/Note";   // To get the actual note links
import mongoose from "mongoose";

// 📌 GET: Fetch all courses, chapters, and notes for a specific semester
export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const department = searchParams.get('dep');
        const year = searchParams.get('year');
        const semester = searchParams.get('sem');

        // 1. Basic Validation
        if (!department || !year || !semester) {
            return NextResponse.json(
                { error: "Missing required query parameters: dep, year, and sem." },
                { status: 400 }
            );
        }

        // 2. Fetch Notes and Group Them
        const notesAggregation = await Note.aggregate([
            {
                // Match notes based on the provided hierarchy
                $match: {
                    department: department,
                    year: year,
                    semester: semester,
                }
            },
            {
                // Group notes by Chapter ID to create the chapter structure
                $group: {
                    _id: "$chapterId",
                    chapterTitle: { $first: "$chapterTitle" },
                    course: { $first: "$course" },
                    courseTitle: { $first: "$courseTitle" },
                    // Collect all note links into an array for this chapter
                    notes: {
                        $push: {
                            _id: "$_id",
                            noteTitle: "$noteTitle",
                            downloadLink: "$downloadLink",
                            fileType: "$fileType",
                            createdAt: "$createdAt"
                        }
                    }
                }
            },
            {
                // Group the resulting chapters by Course ID
                $group: {
                    _id: "$course",
                    courseTitle: { $first: "$courseTitle" },
                    // Collect all chapters and their notes into an array for this course
                    chapters: {
                        $push: {
                            // 🛑 IMPORTANT: Use the chapter's original ID from the previous $group
                            chapterId: "$_id",
                            chapterTitle: "$chapterTitle",
                            notes: "$notes"
                        }
                    }
                }
            },
            {
                // Final projection and cleanup
                $project: {
                    _id: 0,
                    courseId: "$_id", // Rename _id (Course ObjectId) to courseId
                    courseTitle: 1,
                    chapters: 1,
                }
            }
        ]);

        // 🛑 ENHANCEMENT: Simply return the array. If empty, the frontend gets [].
        // This keeps the response structure consistent (always an array).
        return NextResponse.json(notesAggregation, { status: 200 });

    } catch (err) {
        console.error("API Notes Get Error:", err);
        return NextResponse.json(
            { error: "Failed to fetch notes", details: err.message },
            { status: 500 }
        );
    }
}