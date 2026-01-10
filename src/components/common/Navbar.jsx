// Navbar.jsx
"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import gsap from "gsap";
import LoadingButton from "@/components/ui/LoadingButton";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";
import { ShinyButton } from "../ui/shiny-button";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Navbar() {
  const router = useRouter();
  const [dbUser, setDbUser] = useState(null);
  const { user, isAdmin, isStudent, isAuthenticated, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const navbarRef = useRef(null);

  useEffect(() => {
    if (!user?.id) {
      setDbUser(null);
      return;
    }

    const unsub = onSnapshot(
      doc(db, "users", user.id),
      (snap) => {
        if (snap.exists()) {
          setDbUser(snap.data());
        }
      },
      (err) => {
        console.error("Navbar user fetch error:", err);
      }
    );

    return () => unsub();
  }, [user?.id]);

  // ✅ Scroll behavior
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 50) {
        setIsHidden(true); // scrolling down
      } else {
        setIsHidden(false); // scrolling up
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Hover detection at top of screen
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientY < 80) {
        // If cursor is near the top, show navbar
        setIsHidden(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ✅ Animate with GSAP only when hidden state changes
  useEffect(() => {
    if (navbarRef.current) {
      gsap.to(navbarRef.current, {
        y: isHidden ? -100 : 0,
        duration: 0.4,
        ease: "power3.out",
      });
    }
  }, [isHidden]);

  if (loading) return (
    <nav
      // Base fixed styling with added height (h-16 is a standard height) and animation
      className="fixed top-0 px-8 h-16 w-full z-50 shadow-md bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 animate-pulse"
    >
      <div className="flex items-center justify-between h-full max-w-7xl mx-auto">

        {/* 1. Logo/Brand Placeholder (Left) */}
        <div className="h-8 w-24 rounded-lg bg-gray-400 dark:bg-gray-700"></div>

        {/* 2. Menu Items Placeholder (Right) */}
        <div className="flex items-center space-x-6">

          {/* Link Placeholder 1 */}
          <div className="h-5 w-16 rounded bg-gray-400 dark:bg-gray-700 hidden md:block"></div>

          {/* Link Placeholder 2 */}
          <div className="h-5 w-20 rounded bg-gray-400 dark:bg-gray-700 hidden sm:block"></div>

          {/* Link Placeholder 3 */}
          <div className="h-5 w-14 rounded bg-gray-400 dark:bg-gray-700"></div>

          {/* Avatar/Button Placeholder (Far Right) */}
          <div className="h-8 w-8 rounded-full bg-gray-400 dark:bg-gray-700 ml-4"></div>
        </div>
      </div>
    </nav>);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const profileImage =
    dbUser?.profileImage ||
    (dbUser?.gender?.toLowerCase() === "male"
      ? "/images/defaults/maleDefaultProfile.png"
      : dbUser?.gender?.toLowerCase() === "female"
        ? "/images/defaults/femaleDefaultProfile.png"
        : "/images/defaults/defaultProfile.png");


  return (
    <nav
      ref={navbarRef}
      className="fixed top-0 w-full z-50 backdrop-blur-md shadow-md bg-white/30 dark:bg-black/30 border-b border-white/20 dark:border-balck/20 transition-transform"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[var(--logo-color1)]">
            UpSkill<span className="text-gray-800 dark:text-gray-50">Now</span>
          </Link>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-800 dark:text-gray-50 hover:text-indigo-600 font-medium transition"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              isAdmin ? (
                <ShinyButton onClick={() => router.push("/admin-dashboard")}>Admin Dashboard</ShinyButton>
              ) : null
            ) : null
            }
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-10 h-10 rounded-full border-2 border-indigo-500 overflow-hidden"
                >
                  <img
                    src={profileImage}
                    alt="profile"
                    onError={(e) => {
                      e.currentTarget.src = "/images/defaults/defaultProfile.png";
                    }}
                    className="w-full h-full object-cover"
                  />

                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-950 rounded-lg shadow-lg pt-2 z-50">
                    {isStudent && (
                      <Link
                        href="/student-dashboard/dashboard"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Dashboard
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        href="/admin-dashboard"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <LoadingButton
                      className="bg-red-600"
                      onClick={() => {
                        logout();
                      }}
                    >
                      Logout
                    </LoadingButton>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth"><LoadingButton className="px-5" loading={loading}>Login</LoadingButton></Link>
            )}
            <AnimatedThemeToggler className="cursor-pointer" />

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-800 focus:outline-none"
              >
                {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-md shadow-lg">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-gray-800 font-medium hover:text-indigo-600 transition"
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <LoadingButton className="mt-4">
                <Link href="/auth">Login</Link>
              </LoadingButton>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
