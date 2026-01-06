// src/app/api/quizzes/leaderboard/weekend/route.js
import { dbConnect } from "@/lib/dbConnect";
import QuizAttempt from "@/models/QuizAttempt";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  // Score = quiz score - (timeTaken / 60) penalty
  const leaderboard = await QuizAttempt.aggregate([
    { $match: { type: "weekend" } },
    {
      $group: {
        _id: "$userId",
        rawScore: { $sum: "$score" },
        totalCorrect: { $sum: "$correctAnswers" },
        avgTime: { $avg: "$timeTaken" },
      },
    },
    {
      $addFields: {
        finalScore: { $subtract: ["$rawScore", { $divide: ["$avgTime", 60] }] },
      },
    },
    { $sort: { finalScore: -1 } },
    { $limit: 20 },
  ]);

  // Populate user details
  const results = await User.populate(leaderboard, { path: "_id", select: "name email" });

  return NextResponse.json(results);
}
