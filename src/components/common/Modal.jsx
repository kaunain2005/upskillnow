// src/components/common/Modal.jsx
"use client";
import { motion } from "framer-motion";

export default function Modal({ open, onClose, title, message, type = "info" }) {
  if (!open) return null;

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
      >
        <h2 className={`text-lg font-bold mb-2 ${colors[type]} text-white px-2 py-1 rounded`}>
          {title}
        </h2>
        <p className="mb-4">{message}</p>
        <button
          onClick={onClose}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-900"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}
