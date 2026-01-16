// src/app/api/athena/route.js
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const ATHENA_PROMPT = `
You are Athena, the AI Professor at UpskillNow 
You specialize in Computer Science, Information Technology, and Data Science.
Speak clearly and structure answers. Provide:
1) A concise explanation
2) An example
3) Practical applications
4) Recommended next steps/resources
When asked for code, provide well documented, clean code.
Adapt depth to the user's level (graduating students).
`;

function getDynamicMaxTokens(question) {
  const lengthWords = question ? question.split(/\s+/).length : 0;
  let base = 500;
  if (lengthWords > 20) base += 200;
  if (lengthWords > 50) base += 300;
  return Math.min(base, 1600);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { question = "", history = [], stream = true } = body;

    const maxTokens = getDynamicMaxTokens(question);

    // 🔹 Prepare conversation for Gemini
    const contents = [
      { role: "user", parts: [{ text: ATHENA_PROMPT }] },
      ...history.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: question }] },
    ];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    if (stream) {
      // ✅ Streaming version
      const result = await model.generateContentStream({
        contents,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
          topP: 0.9,
        },
      });

      const encoder = new TextEncoder();
      const streamResp = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) controller.enqueue(encoder.encode(text));
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new NextResponse(streamResp, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // 🚨 Non-stream fallback

    const resp = await model.generateContent({
      contents,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const text =
      resp.response?.text?.() ??
      resp.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "⚠️ No response generated.";

    return NextResponse.json({ answer: text, usedMaxTokens: maxTokens });
  } catch (err) {
    console.error("Athena API error:", err);
    return NextResponse.json(
      { error: "Athena encountered an error." },
      { status: 500 }
    );
  }
}
