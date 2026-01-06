// src/components/auth/LogoutButton.jsx
"use client";

import { useAuth } from "@/context/AuthContext";

export default function LogoutButton({ className = "" }) {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition ${className}`}
    >
      Logout
    </button>
  );
}
