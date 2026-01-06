// src/app/api/quizzes/[id]/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Quiz from "@/models/Quiz";
import { requireAdmin } from "@/lib/requireAdmin";

// ✅ GET single quiz (INCLUDES correct answers and FILTERS by Chapter ID)
export async function GET(req, context) {
    await dbConnect();
    const { id } = await context.params;
    const chapterId = id;
    console.log("Fetching quiz for Chapter ID:", chapterId);

    // 1. Get chapterId from URL query parameters (e.g., ?chapterId=...)
    // const chapterId = req.nextUrl.searchParams.get('chapterId');

    // 2. Validate essential IDs
    if (!chapterId) {
        return NextResponse.json({ error: "Chapter ID is required" }, { status: 400 });
    }

    // 3. Find the quiz using BOTH IDs for security and integrity
    const quiz = await Quiz.findOne({
        chapterId: chapterId
    }).lean();

    if (!quiz) {
        return NextResponse.json({ error: "Quiz not found for this chapter" }, { status: 404 });
    }

    return NextResponse.json({ quiz });
}

// ✅ UPDATE quiz (Admin only)
export async function PUT(req, { params }) {
    await dbConnect();
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = params; // Corrected parameter access
    const data = await req.json();

    // Use runValidators: true to ensure updated fields meet schema requirements
    const quiz = await Quiz.findByIdAndUpdate(id, data, { new: true, runValidators: true });

    if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
}

// ✅ DELETE quiz (Admin only)
export async function DELETE(req, { params }) {
    await dbConnect();
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = params; // Corrected parameter access

    const quiz = await Quiz.findByIdAndDelete(id);

    if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Quiz deleted successfully" });
}