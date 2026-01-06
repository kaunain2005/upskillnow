// src/components/ui/LoadingButton.jsx
"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function LoadingButton({
  children,
  loading,
  className = "",
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={loading}
      className={`relative flex items-center justify-center w-full rounded py-2 font-medium text-white transition ${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      } ${className}`}
      {...props}
    >
      {loading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 1, rotate: 360 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-5 h-5 animate-spin" />
        </motion.div>
      ) : (
        children
      )}
    </motion.button>
  );
}
