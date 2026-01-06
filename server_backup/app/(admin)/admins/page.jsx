"use client";

import dynamic from "next/dynamic";
import { ShinyButton } from "@/components/ui/shiny-button";

const LottiePlayer = dynamic(
  () => import("@lottiefiles/react-lottie-player").then(m => m.Player),
  { ssr: false }
);

export default function AdminPage() {

  const handleChatClick = async () => {
    let resultMessage = "API call failed.";
    alert(resultMessage);
  };

  return (
    <div className="w-full min-h-screen p-8 bg-gray-50 dark:bg-neutral-950 text-gray-800">
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin panel.</p>

      <ShinyButton onClick={handleChatClick}>
        Generate Response
      </ShinyButton>

      <LottiePlayer
        autoplay
        loop
        src="/lottie/sad_emotion.json"
        style={{ height: '600px', width: '600px' }}
      />
    </div>
  );
}
