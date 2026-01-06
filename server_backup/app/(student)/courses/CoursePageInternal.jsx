// src/(student)/courses/page.jsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import LottiePlayer from '@/components/common/LottiePlayerWrapper';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";

const db = getFirestore(app);

// Mock implementations for ShadCN/UI components
const Breadcrumb = ({ children }) => <nav className="text-sm font-medium text-[var(--primary-text)] dark:text-[var(--secondary-text)]">{children}</nav>;
const BreadcrumbList = ({ children }) => <ol className="flex items-center space-x-1.5">{children}</ol>;
const BreadcrumbItem = ({ children }) => <li>{children}</li>;
const BreadcrumbLink = ({ href, children }) => {
    return <Link href={href} className="text-blue-600 hover:text-blue-800 transition-colors" passHref>{children}</Link>;
};
const BreadcrumbPage = ({ children }) => <span className=" text-[var(--primary-text)] dark:text-[var(--secondary-text)]">{children}</span>;
const BreadcrumbSeparator = () => <span aria-hidden="true">/</span>;


// --- STATIC & UTILITY COMPONENTS/LOGIC ---
const DEPARTMENTS = ["CS", "IT", "DS"];
const YEARS = ["FY", "SY", "TY"];
const SEMESTERS = ["SEM1", "SEM2"];
// 🎯 CHANGE 1: Replace 'MOCK TESTS' with 'NOTES'
const MENU_CARDS = ["SUBJECTS", "QUIZES", "NOTES"];
const BASE_ROUTE = '/courses';
const DETAIL_ROUTE_PREFIX = '/courses';
const API_ENDPOINT = '/api/courses/filter';
const NOTES_ROUTE = '/notes'; // 🎯 NEW: Route for the notes viewing page

const NavigationCard = ({ label, onClick, icon }) => (
    <button
        onClick={onClick}
        className="w-full max-w-xs bg-[var(--background)] dark:bg-[var(--bg-dark-shade-4)] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] rounded-xl p-6 text-left border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-300"
    >
        <div className="flex items-center">
            <span className="text-3xl text-blue-600 mr-4">{icon || '📁'}</span>
            <h3 className="text-lg font-semibold text-[var(--primary-text)] dark:text-[var(--secondary-text)]">{label}</h3>
        </div>
    </button>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-lg text-[var(--primary-text)] dark:text-[var(--secondary-text)]">Fetching courses from server...</span>
    </div>
);

// --- HOOK FOR APPLICATION STATE LOGIC using Next.js Router ---
const useNavigationState = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State derived directly from URL query parameters
    const dept = searchParams.get('department');
    const year = searchParams.get('year');
    const sem = searchParams.get('semester');
    const menu = searchParams.get('menu');

    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to handle navigating to a new step - Wrapped in useCallback
    const handleNavigate = useCallback((type, value) => {

        // 🎯 CHANGE 2: SPECIAL HANDLING FOR 'NOTES'
        if (type === 'menu' && value === 'NOTES') {
            // Redirect to the dedicated notes page, preserving the hierarchy in search params
            const notesUrl = `${NOTES_ROUTE}?dep=${dept}&year=${year}&sem=${sem}`;
            router.push(notesUrl);
            return;
        }

        // Create a mutable copy of the current search parameters
        const newParams = new URLSearchParams(searchParams.toString());

        // Logic to update parameters based on the clicked item type
        if (type === 'department') {
            newParams.set('department', value);
            newParams.delete('year');
            newParams.delete('semester');
            newParams.delete('menu');
        }
        else if (type === 'year') {
            newParams.set('year', value);
            newParams.delete('semester');
            newParams.delete('menu');
        }
        else if (type === 'semester') {
            newParams.set('semester', value);
            newParams.delete('menu');
        }
        else if (type === 'menu') {
            newParams.set('menu', value);
        }

        // Use the Next.js router to update the URL
        router.push(`${BASE_ROUTE}?${newParams.toString()}`);
    }, [router, searchParams, dept, year, sem]); // Added dept, year, sem as dependencies

    // Function to handle breadcrumb click - Unchanged
    const handleCrumbClick = useCallback((path) => {
        router.push(path);
    }, [router]);

    // --- REAL API CALL LOGIC --- (Unchanged)
    // Update this part inside your useNavigationState hook:
    useEffect(() => {
        if (!(dept && year && sem && menu === 'SUBJECTS')) {
            setSubjects([]);
            return;
        }

        const fetchSubjects = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // 🎯 DIRECT FIRESTORE FILTERING (Mobile Compatible)
                const coursesRef = collection(db, "courses");
                const q = query(
                    coursesRef,
                    where("department", "==", dept),
                    where("year", "==", year),
                    where("semester", "==", sem)
                );

                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({
                    _id: doc.id,
                    ...doc.data()
                }));

                setSubjects(data);
            } catch (err) {
                console.error("Firestore filter error:", err);
                setError("Failed to load courses. Please check your connection.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubjects();
    }, [dept, year, sem, menu]);


    const currentViewData = useMemo(() => {
        // Determine the current step and the data/options to display
        if (!dept) return { type: 'department', data: DEPARTMENTS, title: 'Select Department' };
        if (!year) return { type: 'year', data: YEARS, title: `Select Year for ${dept}` };
        if (!sem) return { type: 'semester', data: SEMESTERS, title: `Select Semester for ${dept} > ${year}` };
        if (!menu) return { type: 'menu', data: MENU_CARDS, title: `Menu for ${dept} > ${year} > ${sem}` };

        if (menu === 'SUBJECTS') {
            return { type: 'subjects', data: subjects, title: `Subjects for ${dept} > ${year} > ${sem}`, isLoading, error };
        }

        // 🎯 CHANGE 3: Handle other menu items (NOTES is handled in handleNavigate)
        return { type: 'info', data: [`${menu} feature coming soon!`], title: `${menu} for ${dept} > ${year} > ${sem}` };

    }, [dept, year, sem, menu, subjects, isLoading, error]);

    return {
        currentViewData,
        handleNavigate,
        handleCrumbClick,
        back: router.back,
        dept, year, sem, menu
    };
};


// --- MAIN PAGE COMPONENT --- (Largely Unchanged)
export default function CoursePageInternal() {
    const { currentViewData, handleNavigate, handleCrumbClick, back, dept, year, sem, menu } = useNavigationState();

    // 1. Build Crumb Data 
    const crumbs = [{ label: 'All Courses', path: BASE_ROUTE }];
    let currentPath = BASE_ROUTE;

    if (dept) {
        currentPath = `${BASE_ROUTE}?department=${dept}`;
        crumbs.push({ label: dept, path: currentPath });
    }
    if (year) {
        currentPath += `&year=${year}`;
        crumbs.push({ label: year, path: currentPath });
    }
    if (sem) {
        currentPath += `&semester=${sem}`;
        crumbs.push({ label: sem, path: currentPath });
    }
    if (menu) {
        currentPath += `&menu=${menu}`;
        crumbs.push({ label: menu, path: currentPath });
    }

    // 2. Content Renderer
    const renderContent = () => {
        const { type, data, isLoading, error } = currentViewData;

        if (isLoading) return <LoadingSpinner />;

        if (error) return (
            <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-xl shadow-inner max-w-lg mx-auto">
                <p className="font-bold mb-1">Error Fetching Courses:</p>
                <p className="text-sm">{error}.</p>
            </div>
        );

        if (type === 'subjects') {
            if (data.length === 0) return (
                <div className="p-6 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-xl shadow-inner max-w-lg mx-auto">
                    <p className="font-semibold">No Courses Found 😟</p>
                    <p className='text-sm mb-2'>No subjects are currently listed for **{dept} - {year} - {sem}**.</p>
                    <LottiePlayer
                        autoplay
                        loop
                        src="/lottie/sad_emotion.json"
                        className='h-50 border-t-1 border-yellow-500'
                    />
                </div>
            );

            return (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {data.map(course => (
                        <div key={course._id} className="p-5 bg-white border border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                            {course.image && (
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-16 h-16 object-cover rounded-full mb-3"
                                />
                            )}
                            <h3 className="text-xl font-bold text-blue-700 mb-1">{course.title}</h3>
                            <p className="text-sm text-gray-500 mb-3">ID: {course._id}</p>
                            <p className="text-gray-600 flex-grow">{course.description}</p>

                            {/* Link to the Course Detail Page (e.g., /courses/[courseId]) */}
                            <Link
                                href={`${DETAIL_ROUTE_PREFIX}/${course._id}`}
                                className="mt-4 w-full text-center text-base font-semibold text-white bg-green-500 hover:bg-green-600 py-2 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
                            >
                                View Course
                            </Link>
                        </div>
                    ))}
                </div>
            );
        }

        // Render generic navigation cards (Department, Year, Semester, Menu)
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((item) => (
                    <NavigationCard
                        key={item}
                        label={item}
                        // 🎯 Change 4: Updated icon logic for NOTES
                        icon={type === 'menu' ? (item === 'SUBJECTS' ? '📖' : item === 'QUIZES' ? '📝' : item === 'NOTES' ? '📚' : '💻') : '📁'}
                        onClick={() => handleNavigate(type, item)}
                    />
                ))}
            </div>
        );
    };

    return (
        <Suspense fallback={<div className="p-6">Loading courses...</div>}>
            <div className="min-h-screen bg-[var(--background)] dark:bg-[var(--secondary-background)] p-4 sm:p-8 lg:pt-20 font-['Inter']">
                <div className="w-full mx-auto">
                    {/* --- Breadcrumb and Back Button Area --- */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            {/* Back Button */}
                            {crumbs.length > 1 && (
                                <button
                                    onClick={back}
                                    className="flex items-center p-2 mr-3 bg-[var(--bg-shade-1)] dark:bg-[var(--bg-dark-shade-2)] hover:bg-gray-200 rounded-full transition-colors text-[var(--primary-text)] dark:text-[var(--secondary-text)] shadow-md focus:outline-none focus:ring-4 focus:ring-gray-300"
                                    aria-label="Go back one step"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                                    </svg>
                                </button>
                            )}

                            {/* Breadcrumb UI */}
                            <Breadcrumb>
                                <BreadcrumbList>
                                    {crumbs.map((crumb, index) => {
                                        const isLast = index === crumbs.length - 1;
                                        return (
                                            <React.Fragment key={crumb.label}>
                                                <BreadcrumbItem>
                                                    {!isLast ? (
                                                        <BreadcrumbLink href={crumb.path}>
                                                            {crumb.label}
                                                        </BreadcrumbLink>
                                                    ) : (
                                                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                                    )}
                                                </BreadcrumbItem>
                                                {!isLast && <BreadcrumbSeparator />}
                                            </React.Fragment>
                                        );
                                    })}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </div>
                    {/* ------------------------------------------------------------------ */}

                    <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-[var(--primary-text)] dark:text-[var(--secondary-text)] mb-8 border-b pb-3">
                        {currentViewData.title}
                    </h1>

                    {renderContent()}
                </div>
            </div>
        </Suspense>
    );
}