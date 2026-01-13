"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenerativeAI } from "@google/generative-ai"; // 💡 Import SDK

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { ShinyButton } from "@/components/ui/shiny-button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useRouter } from 'next/navigation';

const CHAT_STORAGE_KEY = "athena:chatHistory";
const uuid = () => Math.random().toString(36).substring(2, 9);

// 💡 Athena System Prompt
const ATHENA_PROMPT = `
You are Athena, the AI Professor at LevelUpLearn.
You specialize in Computer Science, Information Technology, and Data Science.
Speak clearly and structure answers. Provide:
1) A concise explanation
2) An example
3) Practical applications
4) Recommended next steps/resources
When asked for code, provide well documented, clean code.
Adapt depth to graduating students.
`;

export default function AthenaChat() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isNavigatingHome, setIsNavigatingHome] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);
  const scrollRef = useRef();

  // 💡 Initialize Google AI (Client Side)
  // Note: For production Capacitor apps, ensure your key is restricted in Google Cloud Console
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

  // 1. Change the model string
  // 2. Use the systemInstruction parameter for cleaner context
  const sendMessage = async (prompt) => {
    if (isLoading || !prompt.trim()) return;

    const userMessage = { id: uuid(), role: "user", content: prompt.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setConnectionError(null);

    try {
      // FIX: Use the base model name
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: ATHENA_PROMPT
      });

      // Prepare history: ensure roles are strictly 'user' or 'model'
      const history = messages.map(m => ({
        role: m.role === "ai" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessageStream(prompt);

      let fullResponse = "";
      const aiMsgId = uuid();

      setMessages(prev => [...prev, { id: aiMsgId, role: "ai", content: "" }]);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;

        setMessages(prev => prev.map(msg =>
          msg.id === aiMsgId ? { ...msg, content: fullResponse } : msg
        ));
      }

    } catch (error) {
      console.error("Gemini Error:", error);
      // Handle specific 404 or API Key issues for the user
      setConnectionError("Athena is having trouble connecting. Check your API key or model name.");
      setMessages(prev => [...prev, { id: uuid(), role: "ai", content: "❌ Connection Error. Please verify your internet and API configuration." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  };

  const retryLast = () => {
    const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user');
    if (lastUserMessage) sendMessage(lastUserMessage.content);
  };

  const goHome = async () => {
    setIsNavigatingHome(true);
    await new Promise(r => setTimeout(r, 500));
    router.push('/');
  };

  // Persistance Logic
  useEffect(() => {
    const savedChat = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedChat) setMessages(JSON.parse(savedChat));
  }, []);

  useEffect(() => {
    if (messages.length > 0) localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  // Speech Recognition Logic
  const initRecognition = () => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) return null;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setCurrentTranscript(text);
    };
    recognitionRef.current = recognition;
    return recognition;
  };

  const onMicClick = () => {
    const rec = recognitionRef.current || initRecognition();
    if (rec) {
      setIsModalOpen(true);
      rec.start();
    }
  };

  return (
    <div className="w-full mx-auto h-dvh flex flex-col bg-[var(--athena-pr-bg)] text-[var(--athena-pr-text)] dark:text-[var(--athena-sec-text)] shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold">A</div>
          <div>
            <div className="font-semibold">Athena</div>
            <div className="text-sm opacity-70">AI Professor — CS, IT, DS</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShinyButton onClick={goHome} loading={isNavigatingHome} className="px-4 py-2 text-sm">Home</ShinyButton>
          <button onClick={clearConversation} className="text-sm px-3 py-1 opacity-70 hover:opacity-100">Clear</button>
          <AnimatedThemeToggler />
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${m.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && <TypingLoader />}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <PlaceholdersAndVanishInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSubmit={() => sendMessage(input)}
          placeholders={["Explain Cloud Computing", "What is an API?", "Help with my Python project"]}
        />
        <button onClick={onMicClick} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">🎤</button>
      </div>

      {/* Voice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-center font-bold mb-4">{listening ? "🎙️ Listening..." : "Review Text"}</h2>
            <textarea
              value={currentTranscript}
              onChange={(e) => setCurrentTranscript(e.target.value)}
              className="w-full h-32 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => { recognitionRef.current?.stop(); setIsModalOpen(false); }} className="flex-1 p-3 bg-gray-200 dark:bg-gray-700 rounded-lg">Cancel</button>
              <button onClick={() => { setInput(currentTranscript); setIsModalOpen(false); recognitionRef.current?.stop(); }} className="flex-1 p-3 bg-indigo-600 text-white rounded-lg">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TypingLoader() {
  return (
    <div className="flex gap-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit animate-pulse">
      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
    </div>
  );
}