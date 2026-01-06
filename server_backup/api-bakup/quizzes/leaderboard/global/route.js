// src/app/api/quizzes/leaderboard/global/route.js
import { dbConnect } from "@/lib/dbConnect";
import QuizAttempt from "@/models/QuizAttempt";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  const leaderboard = await QuizAttempt.aggregate([
    {
      $group: {
        _id: "$userId",
        totalScore: { $sum: "$score" },
        totalCorrect: { $sum: "$correctAnswers" },
        attempts: { $sum: 1 },
      },
    },
    { $sort: { totalScore: -1 } },
    { $limit: 20 },
  ]);

  const results = await User.populate(leaderboard, { path: "_id", select: "name email" });

  return NextResponse.json(results);
}
