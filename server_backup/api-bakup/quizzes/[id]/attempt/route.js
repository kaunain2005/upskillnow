import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import QuizAttempt from "@/models/QuizAttempt";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(req, { params }) {
  await dbConnect();

  const token = cookies().get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  // FIX: verifyToken is now async
  const decoded = await verifyToken(token);
  if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { userId } = params;

  if (decoded.role !== "admin" && decoded.userId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const attempts = await QuizAttempt.find({ userId })
    .populate("quizId", "title duration totalQuestions")
    .sort({ createdAt: -1 });

  return NextResponse.json({ attempts });
}
