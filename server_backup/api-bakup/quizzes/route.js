// src/app/api/quizzes/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Quiz from "@/models/Quiz";
import { requireAdmin } from "@/lib/requireAdmin";

// ✅ Get all quizzes
export async function GET() {
    await dbConnect();
    const quizzes = await Quiz.find();
    return NextResponse.json(quizzes);
}

// ✅ Create quiz (Admin only)
export async function POST(req) {
    await dbConnect();
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // 💡 UPDATED: Destructure chapterId from the request body
    const {
        title,
        description,
        department,
        year,
        semester,
        type,
        duration,
        numQuestions,
        questions,
        chapterId
    } = await req.json();

    // 💡 UPDATED VALIDATION: chapterId is now required
    if (!title || !questions || questions.length === 0 || !chapterId) {
        return NextResponse.json(
            { error: "Title, questions, and chapterId are required" },
            { status: 400 }
        );
    }

    const quiz = new Quiz({
        title,
        description,
        department,
        year,
        semester,
        type: type || "general",
        chapterId,
        duration: duration || (type === "challenge" ? 20 : undefined),
        numQuestions: numQuestions || (type === "challenge" ? 10 : undefined),
        questions,
        createdBy: admin.userId,
    });

    await quiz.save();
    return NextResponse.json(quiz, { status: 201 });
}

