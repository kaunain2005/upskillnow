// src/app/api/quizzes/[id]/attempts/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import QuizAttempt from "@/models/QuizAttempt";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(req, { params }) {
  await dbConnect();
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = params; // quizId
  const attempts = await QuizAttempt.find({ quizId: id })
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  return NextResponse.json({ attempts });
}
