// src/app/api/attempts/[attemptId]/route.js (REVISED)

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import QuizAttempt from "@/models/QuizAttempt";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(req, { params }) {
    await dbConnect();

    const token = cookies().get("token")?.value;
    if (!token) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { attemptId } = params;

    // 1. Find the attempt and populate the quiz details
    // We populate the 'quizId' to get the full questions and correct answers.
    const attempt = await QuizAttempt.findById(attemptId)
        .populate("quizId", "title questions")
        .lean();

    if (!attempt) {
        return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }
    
    // 2. Authorization Check (Must be the user or Admin)
    const isOwner = attempt.userId.toString() === decoded.userId;
    // Assuming role is available in decoded token
    const isAdmin = decoded.role === "admin"; 

    if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Unauthorized access to this attempt" }, { status: 403 });
    }

    // 3. Merge Attempt Answers with Full Questions for Review
    const reviewQuestions = attempt.quizId.questions.map(quizQ => {
        // Find the user's answer record for this specific question
        const userAttempt = attempt.answers.find(
            a => a.questionId.toString() === quizQ._id.toString()
        );

        return {
            question: quizQ.question,
            options: quizQ.options,
            // Include user's specific result fields
            userSelected: userAttempt ? userAttempt.selectedAnswer : null,
            isCorrect: userAttempt ? userAttempt.isCorrect : false,
            // Include the correct answer for review
            correctAnswer: quizQ.correctAnswer, 
        };
    });

    // Replace the raw quiz data with the review-ready questions
    attempt.reviewData = reviewQuestions; 
    
    // Clean up to prevent sending internal Mongoose structures
    delete attempt.quizId.questions; 

    return NextResponse.json({ attempt });
}