// src/components/AuthGuard.jsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // 🎯 Use your existing hook

const LoadingScreen = () => {
  const [index, setIndex] = useState(0);
  const messages = [
    "Pin drop silence! Loading chal rahi hai...",
    "Beta, padhai pe dhyan do, loading pe nahi.",
    "Kya matlab homework nahi kiya? Loading toh ho rahi hai...",
    "Class mein dhyan do, data fetch ho raha hai.",
    "Ye koi machli bazaar hai? Shanti se wait karo.",
    "Principals's office se permission le rahe hain..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 1000); // 2.5 seconds gives them time to read the joke
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-center text-center bg-slate-50">
      <div className="mb-4 h-12 w-12 animate-bounce text-4xl">📚</div>
      <p className="text-xl font-bold text-blue-600 animate-pulse text-center px-4">
        {messages[index]}
      </p>
      <p className="mt-2 text-sm text-gray-400">Patience student</p>
    </div>
  );
};

export default function AuthGuard({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait until auth check is finished

    // 1. Define Public Routes
    const publicRoutes = ['/auth', '/unauthorized', '/'];
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

    // 2. If user is logged in and tries to go to /auth, send them home
    if (user && pathname.startsWith('/auth')) {
      router.replace('/');
      return;
    }

    // 3. If NOT logged in and trying to access a PROTECTED route
    if (!user && !isPublicRoute) {
      router.replace('/auth');
      return;
    }

    // 4. Role Check: Admin pages
    const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/admin-dashboard');
    if (isAdminPage && !isAdmin) {
      router.replace('/unauthorized');
      return;
    }

  }, [user, loading, pathname, router, isAdmin]);

  // Prevent "flash" of protected content by returning null or a spinner while loading
  // or if a guest is on a protected page
  const publicRoutes = ['/auth', '/unauthorized', '/'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  return <>{children}</>;
}