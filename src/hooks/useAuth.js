// src/hooks/useAuth.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth({ redirectTo = null, role = null } = {}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          setUser(null);
          if (redirectTo) router.push(redirectTo);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setUser(data.user);
        console.log("Fetched user:", data.user);

        // Role-based redirect
        if (role && data.user?.role !== role) {
          router.push("/unauthorized");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
        if (redirectTo) router.push(redirectTo);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [redirectTo, role, router]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isStudent: user?.role === "student",
  };
}
