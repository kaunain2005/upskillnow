import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Quiz from "@/models/Quiz";

// NOTE: You would typically use authentication middleware here 
// to get the userId and ensure the user is logged in.

// Helper function to save the score. 
// You must replace this with your actual Mongoose/MongoDB logic (e.g., creating a new Score/Attempt document).
const saveUserAttempt = async (quizId, userId, score, totalQuestions, timeTakenSeconds) => {
    console.log(`[Database] Saving attempt for Quiz ${quizId}, User ${userId}. Score: ${score}/${totalQuestions}. Time: ${timeTakenSeconds}s`);
    // Example: await UserAttempt.create({ quiz: quizId, user: userId, score, totalQuestions, timeTakenSeconds });
    // Assume success for now.
    return { success: true }; 
}

// ✅ POST endpoint to submit quiz results
export async function POST(req, { params }) {
    await dbConnect();
    
    const { id: quizId } = params;
    
    // NOTE: Replace this with the actual user ID from your authentication system (e.g., NextAuth, Clerk)
    const MOCK_USER_ID = "authenticated_user_001"; 

    try {
        const body = await req.json();
        const { userAnswers, timeTakenSeconds } = body;

        if (!quizId || !userAnswers || !Array.isArray(userAnswers)) {
            return NextResponse.json({ error: "Invalid submission data." }, { status: 400 });
        }

        // 1. Fetch the full quiz data, which includes correct answers (required for scoring)
        const quiz = await Quiz.findById(quizId).lean();

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }
        
        const allQuestions = quiz.questions;
        const totalQuestions = allQuestions.length;

        // 2. Calculate the score on the server (SECURE SCORING)
        let score = 0;
        
        // We iterate through the submitted answers and compare them to the full list of questions
        userAnswers.forEach((submittedAnswerIndex, index) => {
            // Find the corresponding question in the full list
            const questionData = allQuestions[index];
            
            // If the question exists and the answer matches the stored correct index
            if (questionData && submittedAnswerIndex === questionData.correctAnswer) {
                score++;
            }
        });

        // 3. Save the attempt and score to the database
        await saveUserAttempt(quizId, MOCK_USER_ID, score, totalQuestions, timeTakenSeconds);

        // 4. Return the result to the client
        return NextResponse.json({ 
            message: "Quiz submitted successfully", 
            score, 
            totalQuestions 
        });

    } catch (error) {
        console.error("Quiz submission error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
