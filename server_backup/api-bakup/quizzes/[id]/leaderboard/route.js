// src/app/api/quizzes/[id]/leaderboard/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import QuizAttempt from "@/models/QuizAttempt";

export async function GET(req, { params }) {
  await dbConnect();

  const { id } = params; // quizId

  // Sort by score DESC, then timeTaken ASC
  const leaderboard = await QuizAttempt.find({ quizId: id })
    .populate("userId", "name email")
    .sort({ score: -1, timeTaken: 1 })
    .limit(10);

  return NextResponse.json({ leaderboard });
}
