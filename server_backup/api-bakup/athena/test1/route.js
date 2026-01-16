import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- 1. CONFIGURATION: ATHENA PERSONA & TOKEN MAP ---
const ATHENA_PROMPT = `
You are Athena, the AI Professor at UpSkillNow.
You specialize in Computer Science, Information Technology, and Data Science.
Speak clearly and structure answers. Provide:
1) A concise explanation
2) An example
3) Practical applications
4) Recommended next steps/resources
When asked for code, provide well documented, clean code.
Adapt depth to the user's level (graduating students).
`;

// Map of question types to their corresponding token limits (maxOutputTokens)
const TOKEN_BUDGETS = {
    PERSONAL: 70,       // Personal Q -> small, fast
    SHORT_FACTUAL: 250, // Short factual Q -> small, fast
    CODING: 800,        // Coding / explanation -> medium length
    ESSAY: 1500,        // Essay / research -> long but restricted
    DEFAULT: 300,       // Fallback token limit
};

// System instruction for the classifier model
const CLASSIFIER_INSTRUCTION = `
Analyze the following user prompt and categorize it into one of these four types:
1. PERSONAL (Questions about the AI itself, its creator, or its internal status.)
2. SHORT_FACTUAL (Simple, direct questions that require a quick definition or single-point answer.)
3. CODING (Requests for code, detailed explanations of algorithms, or complex technical concepts.)
4. ESSAY (Requests for detailed analysis, multi-paragraph essays, or extensive research summaries.)

Respond ONLY with the category name (e.g., PERSONAL, SHORT_FACTUAL, CODING, or ESSAY). Do not add any other text, punctuation, or explanation.
`;
// -----------------------------------------------------

export async function POST(req) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Missing 'prompt' in request body." },
                { status: 400 }
            );
        }

        // --- 2. STEP 1: CLASSIFY THE QUESTION TYPE ---
        const classifierResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Use a fast model for classification
            contents: prompt,
            config: {
                systemInstruction: CLASSIFIER_INSTRUCTION.trim(),
                maxOutputTokens: 20, // Keep the classifier fast and cheap
            },
        });
        
        let questionType = (classifierResponse?.text || 'DEFAULT').toUpperCase().trim();
        
        // Ensure the type is one of our defined keys, otherwise use DEFAULT
        if (!TOKEN_BUDGETS.hasOwnProperty(questionType)) {
            questionType = 'DEFAULT';
        }

        const maxTokens = TOKEN_BUDGETS[questionType];
        
        console.log(`Question classified as: ${questionType}. Setting token limit to: ${maxTokens}`);

        // --- 3. STEP 2: GENERATE THE FINAL RESPONSE ---
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: ATHENA_PROMPT.trim(),
                maxOutputTokens: maxTokens, // Apply the dynamic token limit
            },
        });
        
        const text = response?.text || "No answer";

        return NextResponse.json({ answer: text });
    } catch (err) {
        console.error("Athena API error:", err);
        return NextResponse.json(
            { error: "Athena encountered an error." },
            { status: 500 }
        );
    }
}