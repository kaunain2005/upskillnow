// src/app/(public)/contact/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  FiUsers,
  FiBookOpen,
  FiClipboard,
  FiLayout,
  FiChevronRight,
  FiEdit3, // <-- NEW: Import icon for Notes
} from "react-icons/fi";
import StudentAnalytics from "@/components/analytics/StudentAnalytics";
import CourseAnalytics from "@/components/analytics/CourseAnalytics";
import QuizAnalytics from "@/components/analytics/QuizAnalytics";
import Image from "next/image";

// --- Dashboard Configuration ---
const sections = {
  dashboard: [
    { title: "Total Students", value: null, icon: FiUsers, color: "bg-green-500", key: "students", apiPath: "/api/admin/users" },
    { title: "Active Courses", value: null, icon: FiBookOpen, color: "bg-blue-500", key: "courses", apiPath: "/api/courses" },
    { title: "Quizzes Created", value: null, icon: FiClipboard, color: "bg-yellow-500", key: "quizzes", apiPath: "/api/quizzes" },
    { title: "Pending Tasks", value: "5", icon: FiLayout, color: "bg-red-500", key: "tasks", apiPath: null },
  ],
  // students: [
  //   { title: "Add Student", path: "/admin-dashboard/students/add" },
  //   { title: "List Students", path: "/admin-dashboard/students/list" },
  //   { title: "Update Student", path: "/admin-dashboard/students/update" },
  //   { title: "Remove Student", path: "/admin-dashboard/students/remove" },
  // ],
  courses: [
    { title: "Add Course", path: "/admin-dashboard/courses/add" },
    { title: "List & Update Courses", path: "/admin-dashboard/courses/list" },
    // { title: "Update Course", path: "/admin-dashboard/courses/update" },
    // { title: "Remove Course", path: "/admin-dashboard/courses/remove" },
  ],
  quizzes: [
    { title: "Add Quiz", path: "/admin-dashboard/quizzes/add" },
    { title: "List Quizzes", path: "/admin-dashboard/quizzes/list" },
    { title: "Update Quiz", path: "/admin-dashboard/quizzes/update" },
    { title: "Remove Quiz", path: "/admin-dashboard/quizzes/remove" },
  ],
  // No 'notes' section needed in 'sections' since it redirects immediately
};

const navItems = {
  dashboard: { name: "Dashboard", icon: FiLayout, path: null },
  students: { name: "Students", icon: FiUsers, path: null },
  courses: { name: "Courses", icon: FiBookOpen, path: null },
  quizzes: { name: "Quizzes", icon: FiClipboard, path: null },
  // --- NEW: Notes Item with Redirect Path ---
  notes: { name: "Notes", icon: FiEdit3, path: "/admin-dashboard/notes/manager" },
};

const apiEndpoints = {
  students: sections.dashboard.find((s) => s.key === "students").apiPath,
  courses: sections.dashboard.find((s) => s.key === "courses").apiPath,
  quizzes: sections.dashboard.find((s) => s.key === "quizzes").apiPath,
  tasks: null,
};

export default function AdminDashboard() {
  const router = useRouter();
  const functionalCardsRef = useRef([]);
  const statCardsRef = useRef([]);
  const detailViewRef = useRef(null);

  const [statsData, setStatsData] = useState({
    students: "...",
    courses: "...",
    quizzes: "...",
    tasks: "5",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailKey, setDetailKey] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem("adminDashboardActiveTab");
      return savedTab || "dashboard";
    }
    return "dashboard";
  });

  // --- Data Fetching ---
  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);

      const fetchCount = async (path) => {
        if (!path) return null;
        try {
          const res = await fetch(path);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = await res.json();
          if (Array.isArray(data)) return data.length.toLocaleString();
          if (data.student && Array.isArray(data.student)) return data.student.length.toLocaleString();
          if (data.total) return data.total.toLocaleString();
          return "N/A";
        } catch (e) {
          console.error(`Failed to fetch ${path}:`, e);
          return "Error";
        }
      };

      try {
        const [studentCount, courseCount, quizCount] = await Promise.all([
          fetchCount(apiEndpoints.students),
          fetchCount(apiEndpoints.courses),
          fetchCount(apiEndpoints.quizzes),
        ]);
        setStatsData((prev) => ({
          ...prev,
          students: studentCount,
          courses: courseCount,
          quizzes: quizCount,
        }));
      } catch (err) {
        setError("Failed to load statistics.");
      } finally {
        setLoading(false);
      }
    }

    if (activeTab === "dashboard") fetchStats();
  }, [activeTab]);

  // --- Animations ---
  useEffect(() => {
    if (activeTab !== "dashboard" && activeTab in sections) { // Check if functional cards exist
      gsap.fromTo(
        functionalCardsRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "back.out(1.2)" }
      );
    }

    if (activeTab === "dashboard" && !detailKey && !loading && statCardsRef.current.length > 0) {
      gsap.fromTo(
        statCardsRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "back.out(1.2)" }
      );
    }

    if (detailKey && detailViewRef.current) {
      gsap.fromTo(
        detailViewRef.current,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
      );
    }
    const mainContent = document.querySelector("main");
    if (mainContent) mainContent.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab, loading, detailKey]);

  useEffect(() => {
    // Only save to localStorage if it's a tab displayed in the dashboard
    if (activeTab in sections) {
      localStorage.setItem("adminDashboardActiveTab", activeTab);
    }
  }, [activeTab]);
  useEffect(() => {
    functionalCardsRef.current = [];
    statCardsRef.current = [];
  }, [activeTab]);

  // --- Detail Rendering ---
  const renderDynamicDetail = () => {
    const students = statsData.students === "..." || statsData.students === "Error" ? null : statsData.students;
    const courses = statsData.courses === "..." || statsData.courses === "Error" ? null : statsData.courses;
    const quizzes = statsData.quizzes === "..." || statsData.quizzes === "Error" ? null : statsData.quizzes;
    const goBack = () => setDetailKey(null);

    switch (detailKey) {
      case "students":
        return <StudentAnalytics totalStudents={students} goBack={goBack} />;
      case "courses":
        return <CourseAnalytics totalCourses={courses} goBack={goBack} />;
      case "quizzes":
        return <QuizAnalytics totalQuizzes={quizzes} goBack={goBack} />;
      default:
        return null;
    }
  };

  // --- Functional Cards ---
  const renderFunctionalCards = () => {
    // Only render functional cards for tabs that exist in the sections object
    if (!(activeTab in sections)) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections[activeTab].map((card, i) => (
          <div
            key={card.title}
            ref={(el) => (functionalCardsRef.current[i] = el)}
            onClick={() => router.push(card.path)}
            className="h-44 group p-6 rounded-xl shadow-lg cursor-pointer transition-all bg-white text-gray-900 border border-gray-200 hover:border-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <div className="relative z-10 flex flex-col justify-between h-full">
              <h3 className="text-xl font-bold mb-2 text-indigo-600 dark:text-indigo-400">{card.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Go to the <strong>{card.title}</strong> page to manage records.
              </p>
              <div className="flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-4 transition-colors">
                View Page <FiChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // --- Dashboard Statistics ---
  const renderDashboardStats = () => {
    if (loading)
      return (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          <p className="flex items-center justify-center text-lg">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading metrics...
          </p>
        </div>
      );

    if (error)
      return (
        <div className="text-center py-10 text-red-500 border border-red-300 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          Error: {error}
        </div>
      );

    const mergedStats = sections.dashboard.map((stat) => ({
      ...stat,
      value: statsData[stat.key] ?? stat.value,
    }));

    return (
      <>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Key Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mergedStats.map((stat, i) => (
            <div
              key={stat.title}
              ref={(el) => (statCardsRef.current[i] = el)}
              onClick={() => {
                if (stat.key !== "tasks") setDetailKey(stat.key);
              }}
              className={`p-6 rounded-xl shadow-md bg-white border border-gray-200 transition-all hover:shadow-lg dark:bg-gray-700 dark:border-gray-600 ${stat.key !== "tasks" ? "cursor-pointer hover:border-indigo-500" : ""
                }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <stat.icon className={`w-6 h-6 p-1 rounded-full text-white ${stat.color} opacity-80`} />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
              {stat.key !== "tasks" && (
                <div className="mt-2 text-xs font-semibold text-indigo-500 flex items-center">
                  View Analytics <FiChevronRight className="w-3 h-3 ml-1" />
                </div>
              )}
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Recent Activity</h2>
        <div className="p-6 rounded-xl shadow-md border border-gray-200 min-h-60 bg-white dark:bg-gray-700 dark:border-gray-600">
          <p className="text-gray-500 dark:text-gray-300">
            [Placeholder: A chart showing recent student signups or a table of the latest quiz results goes here.]
          </p>
        </div>
      </>
    );
  };

  // --- RENDER ---
  return (
    <div className="min-h-dvh flex flex-col md:flex-row bg-gray-900 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Mobile Sticky Top Navbar */}
      <div className="md:hidden sticky top-0 z-30 bg-gray-900 text-white shadow-lg">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-bold">
            <span className="text-indigo-400">LMS</span> Admin
          </h2>
        </div>

        {/* Horizontal Nav Buttons */}
        <div className="flex overflow-x-auto border-t border-gray-800">
          {Object.entries(navItems).map(([tabKey, { name, icon: Icon, path }]) => (
            <button
              key={tabKey}
              onClick={() => {
                if (path) { // If a path exists (like 'notes'), redirect immediately
                  router.push(path);
                } else {
                  setActiveTab(tabKey);
                  setDetailKey(null);
                }
              }}
              className={`flex flex-col items-center justify-center flex-shrink-0 w-1/4 py-3 text-sm font-medium transition-colors ${activeTab === tabKey
                ? "text-indigo-400 border-b-2 border-indigo-400"
                : "text-gray-400 hover:text-white"
                }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-gray-900 text-white p-6 space-y-8 shadow-2xl">
        <div className="flex items-center mb-10">
          <Image src="/images/logo-rb.png" width={100} height={100} alt="Admin Logo" />
        </div>
        <nav className="flex flex-col gap-2">
          {Object.entries(navItems).map(([tabKey, { name, icon: Icon, path }]) => (
            <button
              key={tabKey}
              onClick={() => {
                if (path) { // If a path exists (like 'notes'), redirect immediately
                  router.push(path);
                } else {
                  setActiveTab(tabKey);
                  setDetailKey(null);
                }
              }}
              className={`flex items-center px-4 py-3 rounded-xl text-left font-medium transition-colors duration-200 
                                ${activeTab === tabKey
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-gray-100 dark:bg-gray-800 min-h-[calc(100vh-100px)] md:min-h-dvh">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-gray-800 dark:text-white capitalize">
          {detailKey
            ? sections.dashboard.find((s) => s.key === detailKey)?.title.replace("Total", "").replace("Active", "").trim() + " Analytics"
            : navItems[activeTab]?.name || "Dashboard"}
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
          {detailKey
            ? `Viewing detailed analytics for ${navItems[detailKey]?.name}.`
            : activeTab === "dashboard"
              ? "Welcome to your control panel."
              : `Manage all ${activeTab} operations here.`}
        </p>

        <div ref={detailViewRef}>
          {activeTab === "dashboard"
            ? detailKey
              ? renderDynamicDetail()
              : renderDashboardStats()
            : renderFunctionalCards()}
        </div>
      </main>
    </div>
  );
}