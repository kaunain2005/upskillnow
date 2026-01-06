import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Quiz from "@/models/Quiz";
import QuizAttempt from "@/models/QuizAttempt";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(req, { params }) {
  await dbConnect();

  const token = cookies().get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  // FIX: verifyToken is now async
  const decoded = await verifyToken(token);
  if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { id } = params; // quizId
  const { answers, startedAt } = await req.json();

  const quiz = await Quiz.findById(id);
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  // ✅ Score evaluation
  let score = 0;
  const evaluatedAnswers = quiz.questions.map((q, index) => {
    const selected = answers[index];
    const isCorrect = selected === q.correctAnswer;
    if (isCorrect) score++;
    return { questionId: q._id, selectedAnswer: selected, isCorrect };
  });

  const startedTime = new Date(startedAt);
  const submittedTime = new Date();
  const durationTaken = Math.floor((submittedTime - startedTime) / 1000);

  const attempt = new QuizAttempt({
    quizId: quiz._id,
    userId: decoded.userId,
    answers: evaluatedAnswers,
    score,
    durationTaken,
    startedAt: startedTime,
    submittedAt: submittedTime,
  });

  await attempt.save();
  return NextResponse.json({ message: "Quiz submitted", attempt });
}
