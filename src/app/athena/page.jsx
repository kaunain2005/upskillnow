// src/components/AthenaChat.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
// 💡 NEW: Import Markdown renderer and plugins
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { ShinyButton } from "@/components/ui/shiny-button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useRouter } from 'next/navigation';

// --- PERSISTENCE KEY ---
const CHAT_STORAGE_KEY = "athena:chatHistory";
// --- END PERSISTENCE KEY ---

// Utility to generate a simple unique ID for messages (optional, but good practice)
const uuid = () => Math.random().toString(36).substring(2, 9);

export default function AthenaChat() {
  const router = useRouter();
  // --- State and Logic ---
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  // Removed textToTransfer state as it's no longer needed for passing text via prop

  // State for the Home button loading animation (KEEP THIS)
  const [isNavigatingHome, setIsNavigatingHome] = useState(false);

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);
  // -------------------------

  const sendMessage = async (prompt) => {
    if (isLoading || !prompt.trim()) return;

    const userMessage = { id: uuid(), role: "user", content: prompt.trim() };
    const apiEndpoint = "/api/athena/test1";

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setConnectionError(null);

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiResponse = data.answer || "Sorry, I didn't get a response.";

        setMessages(prev => [
          ...prev,
          { id: uuid(), role: "ai", content: aiResponse },
        ]);
      } else {
        const errorData = await res.json();
        setConnectionError(errorData.error || `Server Error (${res.status})`);
        setMessages(prev => [...prev, { id: uuid(), role: "ai", content: `❌ Error: ${errorData.error || 'Server error occurred.'}` }]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setConnectionError("Connection lost. Please check your network or API key.");
      setMessages(prev => [...prev, { id: uuid(), role: "ai", content: "❌ Network error. Could not connect to the API." }]);
    } finally {
      // This runs after try or catch, ensuring loading state is reset
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setConnectionError(null);
    setInput("");

    // Explicitly remove history from storage
    localStorage.removeItem("athena:draft");
    localStorage.removeItem(CHAT_STORAGE_KEY);
  };

  const retryLast = () => {
    const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      // Filter out the last AI message (if it exists) for a cleaner retry attempt
      const newMessages = messages.filter(m => m.role !== 'ai' || m.id !== messages[messages.length - 1].id);
      setMessages(newMessages);
      sendMessage(lastUserMessage.content);
    } else if (input.trim()) {
      sendMessage(input);
    }
  };

  const goHome = async () => {
    if (isNavigatingHome) return;

    setIsNavigatingHome(true);
    console.log("Navigating home...");

    try {
      // Step 1: Optional delay for visual feedback (e.g., 500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/');
    } catch (error) {
      // Step 3: ONLY reset the loading state if the navigation failed (e.g., network error, security block)
      console.error("Navigation error:", error);
      setIsNavigatingHome(false);
    }
  };
  // ------------------------------------

  const scrollRef = useRef();

  /** scroll chat automatically (UNCHANGED) */
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // ----------------------------------------------------
  // --- CHAT AND DRAFT PERSISTENCE LOGIC (UNCHANGED) ---
  // ----------------------------------------------------

  /** Hydrate chat history and input draft on component mount */
  useEffect(() => {
    // 1. Load Draft Input
    const savedInput = localStorage.getItem("athena:draft");
    if (savedInput) setInput(savedInput);

    // 2. Load Chat History
    const savedChat = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedChat) {
      try {
        setMessages(JSON.parse(savedChat));
      } catch (e) {
        console.error("Failed to parse chat history from localStorage", e);
        localStorage.removeItem(CHAT_STORAGE_KEY); // Clear corrupt data
      }
    }
  }, []);

  /** Persist draft input on change */
  useEffect(() => {
    localStorage.setItem("athena:draft", input);
  }, [input]);

  /** Persist chat history every time messages state changes */
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } else {
      // Ensure history is cleared if the array becomes empty (e.g., after clearConversation)
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  }, [messages]);

  // ----------------------------------------------------
  // --- END CHAT AND DRAFT PERSISTENCE LOGIC ---
  // ----------------------------------------------------

  /** Handle submit (UNCHANGED) */
  const onSubmit = (e) => {
    e?.preventDefault();
    if (input.trim()) {
      sendMessage(input);
    }
  };

  /** File upload stub (UNCHANGED) */
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log("Selected file for Athena:", file);
  };

  // --- MODAL AND MIC 🎤 LOGIC REFINEMENTS (UNCHANGED) ---
  const initRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported. Use Chrome/Edge.");
      return null;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.interimTranscript = "";

    recognition.onstart = () => {
      setListening(true);
      recognition.finalTranscript = "";
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setListening(false);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      recognition.finalTranscript = (recognition.finalTranscript || "") + finalTranscript;

      setCurrentTranscript(
        recognition.finalTranscript + (interimTranscript ? " " + interimTranscript : "")
      );
    };

    recognitionRef.current = recognition;
    return recognition;
  };


  /** Starts listening modal and recognition */
  const onMicClick = () => {
    if (listening) return;

    const recognition = recognitionRef.current || initRecognition();
    if (recognition) {
      setIsModalOpen(true);
      setCurrentTranscript("");
      recognition.start();
    }
  };

  /** Stops recognition */
  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }
  };

  /** Confirms transcript, closes modal, and moves text to input */
  const handleProceed = () => {
    if (listening) {
      stopListening();
    }

    const textToTransfer = currentTranscript.trim();
    console.log("Transferring transcript to input:", textToTransfer);

    // Set the parent's state (`input`) directly
    setInput(textToTransfer);

    setIsModalOpen(false);
    setCurrentTranscript("");
  };

  /** Clears transcript and closes modal */
  const handleCancel = () => {
    stopListening();
    setIsModalOpen(false);
    setCurrentTranscript("");
  };

  // --- END OF MODAL AND MIC LOGIC REFINEMENTS ---


  return (
    <div className="w-full mx-auto h-dvh flex flex-col bg-[var(--athena-pr-bg)] text-[var(--athena-pr-text)] dark:text-[var(--athena-sec-text)] shadow-md overflow-hidden">
      {/* Header (UNCHANGED) */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div>
            <div className="text-[var(--athena-pr-text)] dark:text-[var(--athena-sec-text)] font-semibold">
              Athena
            </div>
            <div className="text-sm text-[var(--athena-ter-text)] dark:text-[var(--athena-sec-text)]">
              AI Professor — CS, IT, DS
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">

          <ShinyButton
            onClick={goHome}
            loading={isNavigatingHome} // Pass the state to the loading prop
            className="w-auto px-4 py-2 text-sm" // You can remove size="sm" if not needed
          >
            Home
          </ShinyButton>
          <button
            onClick={retryLast}
            className="text-sm px-3 py-1 rounded hover:bg-[var(--athena-user-bg)] dark:hover:bg-gray-800"
          >
            Retry
          </button>
          <button
            onClick={clearConversation}
            className="text-sm px-3 py-1 rounded hover:bg-[var(--athena-user-bg)] dark:hover:bg-gray-800"
          >
            Clear
          </button>
          <AnimatedThemeToggler />
        </div>
      </div>

      {/* Connection error banner (UNCHANGED) */}
      {connectionError && (
        <div className="text-center text-red-500 text-sm py-1 border-b border-red-300 dark:border-red-600">
          ⚠️ Connection lost.{" "}
          <button onClick={retryLast} className="underline">
            Retry
          </button>
        </div>
      )}

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-sm text-[var(--athena-ter-text)]">
            Ask Athena anything — concepts, code, interview prep, project advice.
          </div>
        )}

        {messages.map((m, idx) => (
          <div
            key={m.id ?? idx}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[78%] p-3 rounded-lg whitespace-pre-wrap ${m.role === "user"
                ? "bg-[var(--athena-user-bg)] text-[var(--athena-pr-text)]"
                : "bg-[var(--athena-ai-bg)] text-[var(--athena-sec-text)]"
                }`}
            >
              {/* 💡 IMPLEMENTATION: Use ReactMarkdown to parse the AI's response */}
              <ReactMarkdown
                children={m.content}
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom component for styling code blocks (essential for AI output)
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline ? (
                      <pre className="mt-2 p-3 rounded-lg bg-gray-700 text-gray-100 overflow-x-auto text-sm font-mono">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className="bg-gray-200 dark:bg-gray-700 p-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  // Optional: Adjust the list style to fit the chat bubble better
                  ul: ({ node, children, ...props }) => (
                    <ul className="list-disc pl-5 mt-1 space-y-1" {...props}>{children}</ul>
                  ),
                  ol: ({ node, children, ...props }) => (
                    <ol className="list-decimal pl-5 mt-1 space-y-1" {...props}>{children}</ol>
                  ),
                }}
              />
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="mr-auto p-3 rounded-lg bg-[var(--athena-ai-bg)] text-[var(--athena-sec-text)]">
            <TypingLoader />
          </div>
        )}
      </div>

      {/* Input + actions (UNCHANGED) */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center justify-center gap-3">
        <div className="flex w-150">
          <PlaceholdersAndVanishInput
            placeholders={[
              "Explain neural networks with a simple example",
              "How to optimize merge sort?",
              "Mock interview: system design question",
            ]}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={onSubmit}
            disabled={isModalOpen || isLoading}
          />
        </div>

        {/* File + mic (UNCHANGED) */}
        <div className="flex items-center gap-3 justify-start">
          <input
            id="athena-file"
            type="file"
            className="hidden"
            onChange={onFileChange}
            disabled={isModalOpen || isLoading}
          />
          <label
            htmlFor="athena-file"
            className={`p-2 rounded hover:bg-[var(--athena-user-bg)] dark:hover:bg-gray-800 ${isModalOpen || isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            title="Upload file"
          >
            📎
          </label>

          <button
            onClick={onMicClick}
            className={`p-2 rounded hover:bg-[var(--athena-user-bg)] dark:hover:bg-gray-800 ${listening ? "text-red-500" : ""
              } ${isModalOpen || isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
            title="Voice"
            disabled={isLoading}
          >
            🎤
          </button>
        </div>
      </div>

      {/* --- LISTENING MODAL (UNCHANGED) --- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
        >
          <div
            className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-2xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">
              {listening ? "🎙️ Listening Continuously..." : "✅ Review Transcript"}
            </h2>

            <textarea
              value={currentTranscript}
              onChange={(e) => setCurrentTranscript(e.target.value)}
              placeholder="Start speaking now..."
              className="w-full h-32 p-3 border rounded-lg text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 resize-none mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <div className="flex justify-between gap-3">
              {/* 2. STOP/RESUME BUTTON LOGIC */}
              {listening ? (
                <ShinyButton
                  onClick={stopListening}
                  className="bg-red-600 hover:bg-red-700 w-full"
                >
                  🛑 Stop Recording
                </ShinyButton>
              ) : (
                <ShinyButton
                  onClick={onMicClick}
                  className="bg-green-600 hover:bg-green-700 w-full"
                >
                  🗣️ Resume Speaking
                </ShinyButton>
              )}

              <ShinyButton
                onClick={handleProceed}
                disabled={!currentTranscript.trim()}
                className="w-full"
              >
                Proceed ➡️
              </ShinyButton>
            </div>
            <button
              onClick={handleCancel}
              className="mt-3 w-full text-sm text-gray-500 dark:text-gray-400 hover:text-red-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* --- END LISTENING MODAL --- */}
    </div>
  );
}

/** Typing loader (UNCHANGED) */
function TypingLoader() {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-[var(--athena-sec-text)] animate-bounce" />
      <span className="w-2 h-2 rounded-full bg-[var(--athena-sec-text)] animate-bounce delay-150" />
      <span className="w-2 h-2 rounded-full bg-[var(--athena-sec-text)] animate-bounce delay-300" />
      <span className="ml-2 text-sm opacity-80">Athena is typing…</span>
    </div>
  );
}