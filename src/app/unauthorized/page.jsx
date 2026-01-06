// src/app/unauthorized/page.jsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function UnauthorizedPage() {
  const router = useRouter();
  const lockRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    // Animate lock shaking
    gsap.fromTo(
      lockRef.current,
      { rotate: -5 },
      { rotate: 5, yoyo: true, repeat: -1, duration: 0.3, ease: "power1.inOut" }
    );

    // Fade in text
    gsap.from(textRef.current, {
      opacity: 0,
      y: 40,
      duration: 1,
      delay: 0.3,
      ease: "power3.out",
    });
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-red-500 to-orange-600 text-white overflow-hidden relative">
      {/* Lock Icon Animation */}
      <div ref={lockRef} className="mb-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-40 w-40 text-white drop-shadow-lg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V12a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 116 0v3H9z" />
        </svg>
      </div>

      {/* Unauthorized Text */}
      <h1 ref={textRef} className="text-5xl font-bold mb-4 drop-shadow-lg">
        403 - Unauthorized
      </h1>
      <p className="text-lg mb-8 text-center">
        You don’t have permission to view this page.
      </p>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-white text-red-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition"
        >
          Go Home
        </button>
        <button
          onClick={() => router.push("/auth")}
          className="px-6 py-3 bg-white text-red-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition"
        >
          Login Again
        </button>
      </div>
    </div>
  );
}
