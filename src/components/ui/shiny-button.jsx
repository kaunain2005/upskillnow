// src/components/ui/ShinyButton.jsx
"use client";
import React from "react"
// Ensure you have the Loader2 icon installed (e.g., npm install lucide-react)
import { Loader2 } from "lucide-react"; 
import { motion } from "framer-motion"; // Use framer-motion instead of motion/react
// If you don't have framer-motion installed: npm install framer-motion

import { cn } from "@/lib/utils"

const animationProps = {
  initial: { "--x": "100%", scale: 0.8 },
  animate: { "--x": "-100%", scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 0.5,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
}

// 💡 CHANGE: Add 'loading' prop and update logic
export const ShinyButton = React.forwardRef(({ children, className, loading, ...props }, ref) => {
  
  // Conditionally apply motion props: disable shiny animation when loading
  const motionProps = loading ? { whileTap: { scale: 1 } } : animationProps;

  return (
    <motion.button
      ref={ref}
      // 💡 NEW: Disable the button when loading
      disabled={loading} 
      className={cn(
        // 💡 NEW: Style changes when loading
        "relative cursor-pointer rounded-lg border px-6 py-2 font-medium backdrop-blur-xl transition-shadow duration-300 ease-in-out hover:shadow dark:bg-[radial-gradient(circle_at_50%_0%,var(--primary)/10%_0%,transparent_60%)] dark:hover:shadow-[0_0_20px_var(--primary)/10%]",
        // Additional styles for disabled/loading state
        loading && "opacity-70 cursor-not-allowed", 
        className
      )}
      {...motionProps} // Use conditional motion props
      {...props}
    >
      {/* 💡 NEW: Conditional rendering for content/loader */}
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-[var(--primary-text)] dark:text-[var(--secondary-text)]" />
      ) : (
        <>
          <span
            className="relative block size-full text-sm tracking-wide text-[rgb(79,57,246)] uppercase dark:font-light dark:text-[rgb(255,255,255,90%)]"
            style={{
              maskImage:
                "linear-gradient(-75deg,var(--primary) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),var(--primary) calc(var(--x) + 100%))",
            }}
          >
            {children}
          </span>
          <span
            style={{
              mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
              WebkitMask:
                "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
              backgroundImage:
                "linear-gradient(-75deg,var(--primary)/10% calc(var(--x)+20%),var(--primary)/50% calc(var(--x)+25%),var(--primary)/10% calc(var(--x)+100%))",
            }}
            className="absolute inset-0 z-10 block rounded-[inherit] p-px" 
          />
        </>
      )}
    </motion.button>
  );
})

ShinyButton.displayName = "ShinyButton"