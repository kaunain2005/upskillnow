// src/app/not-found.jsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import LottiePlayer from "@/components/common/LottiePlayerWrapper";

export default function NotFoundPage() {
  const router = useRouter();
  const ghostRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    // Floating ghost animation
    gsap.to(ghostRef.current, {
      y: -20,
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: "power1.inOut",
    });

    // Text fade in
    gsap.from(textRef.current, {
      opacity: 0,
      y: 30,
      duration: 1,
      delay: 0.5,
      ease: "power3.out",
    });
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center  text-white overflow-hidden relative">
      {/* <h1 className="text-9xl font-bold text-gray-700">404</h1> */}
      <LottiePlayer
        autoplay
        loop
        src="/lottie/error_404.json"
        // src="/lottie/sad_emotion.json"
        className='h-90'
      />
      <p className="text-2xl mb-2 text-gray-500">Oops! The page you are looking for doesn't exist.</p>

      {/* Button */}
      <button
        onClick={() => router.push("/")}
        className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition"
      >
        Go Home
      </button>
    </div>
  );
}
