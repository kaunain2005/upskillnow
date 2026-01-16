"use client";

import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { Globe } from "../ui/globe";
import { ShinyButton } from "../ui/shiny-button";
import { Meteors } from "../ui/meteors";
import { useState, useTransition, useEffect } from "react";

export default function AthenaSection() {
  const router = useRouter();

  // useTransition helps Next.js manage the state during the "asynchronous" 
  // period when the new page is being fetched and rendered.
  const [isPending, startTransition] = useTransition();
  const [isNavigatingAthena, setIsNavigatingAthena] = useState(false);

  // Optimization: Prefetch the route for instant mobile feel
  useEffect(() => {
    router.prefetch('/athena');
  }, [router]);

  const handleChatClick = () => {
    if (isNavigatingAthena || isPending) return;

    setIsNavigatingAthena(true);

    // Using startTransition ensures the UI remains responsive 
    // while the 'athena' page bundle is loading
    startTransition(() => {
      try {
        router.push('/athena');
      } catch (error) {
        console.error("Navigation error:", error);
        setIsNavigatingAthena(false);
      }
    });
  };

  // If the transition finishes but we haven't unmounted yet, 
  // or if an error occurs, reset loading.
  useEffect(() => {
    if (!isPending && isNavigatingAthena) {
      const timeout = setTimeout(() => setIsNavigatingAthena(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [isPending, isNavigatingAthena]);

  return (
    <section className="relative w-full h-full bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 px-15 py-25 md:flex-row md:gap-8 overflow-hidden">
        <Meteors />

        {/* Left side: text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="flex flex-1 flex-col items-start text-left"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl">
            Meet <span className="text-indigo-600 dark:text-indigo-700">Athena</span>,
            <br /> Your AI Professor
          </h2>
          <p className="mt-6 max-w-lg text-lg text-gray-600 dark:text-gray-300">
            Athena is your personal guide at <strong>UpSkillNow</strong>.
            She explains complex topics, answers your questions, and helps
            you learn smarter — anytime, anywhere.
          </p>
          <div className="mt-8">
            <ShinyButton
              onClick={handleChatClick}
              // loading will show if manually set or if transition is pending
              loading={isNavigatingAthena || isPending}
              className="px-6 py-3 text-lg border-indigo-600"
            >
              Chat with Athena
            </ShinyButton>
          </div>
        </motion.div>

        {/* Right side: globe */}
        <motion.div
          initial={{ opacity: 1, x: 200, y: -50 }}
          whileInView={{ opacity: 1, x: 0, y: -50 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 1.2, type: "spring", stiffness: 50 }}
          className="relative flex flex-1 items-center justify-center h-[450px] w-[350px] md:h-[450px] md:w-[450px]"
        >
          <Globe />
        </motion.div>
      </div>
    </section>
  );
}