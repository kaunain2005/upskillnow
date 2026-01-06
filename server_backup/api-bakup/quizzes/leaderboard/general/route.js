// src/app/api/quizzes/leaderboard/general/route.js
import { dbConnect } from "@/lib/dbConnect";
import QuizAttempt from "@/models/QuizAttempt";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  // Aggregate scores of general quizzes
  const leaderboard = await QuizAttempt.aggregate([
    { $match: { type: "general" } },
    {
      $group: {
        _id: "$userId",
        totalScore: { $sum: "$score" },
        totalCorrect: { $sum: "$correctAnswers" },
        attempts: { $sum: 1 },
      },
    },
    { $sort: { totalScore: -1, totalCorrect: -1 } },
    { $limit: 20 }, // Top 20 students
  ]);

  // Populate user details
  const results = await User.populate(leaderboard, { path: "_id", select: "name email" });

  return NextResponse.json(results);
}
