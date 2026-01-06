'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';
import SearchPannel from '@/components/common/SearchPannel';
import QuizCard from '@/components/common/QuizCard';

// --- CONFIGURATION CONSTANTS ---
const PAGE_SIZE = 10;
const QUIZ_API_ENDPOINT = '/api/quizzes';

/**
 * Main component for the Quiz Listing Page with Search, Filtering, and Infinite Scrolling.
 * @param {object} props
 * @param {string} props.pageType - Controls button display: 'list', 'delete', or 'update'.
 */
const QuizListPage = ({ pageType = 'list' }) => {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        dep: 'all',
        year: 'all',
        sem: 'all',
        chapter: 'all'
    });

    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const sentinelRef = useRef(null);
    const [error, setError] = useState(null);

    // ------------------------------------------------------------------
    // ⚠️ FIX 1: Make filter options extraction robust against missing 'info'
    // ------------------------------------------------------------------
    const availableOptions = useMemo(() => {
        if (quizzes.length === 0) return { deps: [], years: [], sems: [], chapters: [] };

        const deps = new Set();
        const years = new Set();
        const sems = new Set();
        const chapters = new Set();

        quizzes.forEach(quiz => {
            // Check if 'info' exists before accessing properties
            if (quiz.info) {
                deps.add(quiz.info.dep);
                years.add(String(quiz.info.year));
                sems.add(quiz.info.semester);
                chapters.add(quiz.info.chapter);
            }
        });

        return {
            deps: Array.from(deps).sort(),
            years: Array.from(years).sort((a, b) => b - a),
            sems: Array.from(sems).sort(),
            chapters: Array.from(chapters).sort(),
        };
    }, [quizzes]);

    // --- Data Fetching Logic (Unchanged) ---
    useEffect(() => {
        const fetchQuizzes = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(QUIZ_API_ENDPOINT);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setQuizzes(data);

            } catch (err) {
                console.error("Failed to fetch quizzes:", err);
                setError("Failed to load quizzes. Please check the network connection or API.");
            } finally {
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, []);

    // --- Single Filter Change Handler (Unchanged) ---
    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    // ------------------------------------------------------------------
    // ⚠️ FIX 2: Make filtering logic robust against missing 'info'
    // ------------------------------------------------------------------
    const filteredQuizzes = useMemo(() => {
        setVisibleCount(PAGE_SIZE);

        let list = quizzes;

        // 1. Apply Multi-Dropdown Filters
        list = list.filter(quiz => {
            // Use optional chaining or a simple check here
            const info = quiz.info;

            // If a filter is selected ('all' is skipped) but the quiz has no info, it fails the filter.
            if (!info && (filters.dep !== 'all' || filters.year !== 'all' || filters.sem !== 'all' || filters.chapter !== 'all')) {
                return false;
            }

            // Check Department
            if (filters.dep !== 'all' && info.dep !== filters.dep) return false;

            // Check Year (compare as strings)
            if (filters.year !== 'all' && String(info.year) !== filters.year) return false;

            // Check Semester
            if (filters.sem !== 'all' && info.semester !== filters.sem) return false;

            // Check Chapter
            if (filters.chapter !== 'all' && info.chapter !== filters.chapter) return false;

            return true;
        });

        // 2. Apply Search Term (Title, Description, Chapter)
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            list = list.filter(quiz =>
                quiz.title.toLowerCase().includes(lowerSearch) ||
                quiz.description.toLowerCase().includes(lowerSearch) ||
                (quiz.info && quiz.info.chapter.toLowerCase().includes(lowerSearch)) // Ensure quiz.info is checked here too
            );
        }

        return list;
    }, [quizzes, searchTerm, filters]); // Depend on filters state object

    // --- Load More Handler & Intersection Observer (Unchanged) ---
    const isLastBatch = useMemo(() => visibleCount >= filteredQuizzes.length, [visibleCount, filteredQuizzes.length]);

    const handleLoadMore = useCallback(() => {
        if (isMoreLoading || isLastBatch) return;

        setIsMoreLoading(true);
        setTimeout(() => {
            setVisibleCount(prevCount => prevCount + PAGE_SIZE);
            setIsMoreLoading(false);
        }, 300);
    }, [isMoreLoading, isLastBatch]);

    useEffect(() => {
        if (loading || !sentinelRef.current) return;

        const observerCallback = (entries) => {
            const target = entries[0];
            if (target.isIntersecting && !isMoreLoading && !isLastBatch) {
                handleLoadMore();
            }
        };

        const observer = new IntersectionObserver(observerCallback, {
            root: null,
            rootMargin: '300px',
            threshold: 0.1,
        });

        observer.observe(sentinelRef.current);

        return () => {
            observer.disconnect();
        };
    }, [loading, isMoreLoading, isLastBatch, handleLoadMore]);

    // --- Core Handlers for Card Interactions (Unchanged) ---
    const handleUpdate = useCallback((quizId) => {
        const quiz = quizzes.find(q => q._id === quizId);
        if (quiz && quiz.chapterId) {
            router.push(`/admin-dashboard/quizzes/update/${quiz.chapterId}`);
        } else {
            console.error(`Error: Could not find chapter ID for quiz ${quizId} to navigate to update page.`);
        }
    }, [quizzes, router]);

    const handleDelete = useCallback((quizId) => {
        console.warn(`[ACTION] Quiz deletion initiated for ID: ${quizId}.`);
        setQuizzes(prev => prev.filter(q => q._id !== quizId));
    }, []);

    // --- Conditional Logic & Render (Unchanged) ---
    const isListPage = pageType === 'list';
    const showDeleteButton = isListPage || pageType === 'delete';
    const showUpdateButton = isListPage || pageType === 'update';

    const getPageTitle = () => {
        if (pageType === 'delete') return 'Delete Quizzes Management';
        if (pageType === 'update') return 'Update Quizzes Management';
        return 'All Quizzes List';
    };

    const quizzesToDisplay = filteredQuizzes.slice(0, visibleCount);

    return (
        <div
            style={{ backgroundColor: 'var(--background)' }}
            className="min-h-screen p-4 sm:p-8 font-sans"
        >
            <div className="max-w-6xl mx-auto space-y-6">

                <header
                    style={{ borderColor: 'var(--bg-shade-2)' }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b dark:border-[var(--bg-dark-shade-1)]"
                >
                    <h1
                        style={{ color: 'var(--primary-text)' }}
                        className="text-3xl font-extrabold mb-2 sm:mb-0"
                    >
                        {getPageTitle()}
                    </h1>
                    <Link href="/admin-dashboard" passHref>
                        <button
                            style={{ backgroundColor: 'var(--primary-accent)', color: 'var(--secondary-text)' }}
                            className="flex items-center px-4 py-2 text-sm font-medium rounded-xl shadow-md transition duration-150 transform hover:scale-[1.02] hover:bg-[var(--primary-accent-hover)]"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                        </button>
                    </Link>
                </header>

                <SearchPannel
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    availableOptions={availableOptions}
                />

                {/* Error Display */}
                {error && (
                    <div className="text-center p-4 text-lg rounded-xl shadow-lg bg-red-100 text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div
                        style={{ color: 'var(--tertiary-text)' }}
                        className="text-center p-8 text-lg"
                    >
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: 'var(--primary-accent)' }} />
                        Loading all quizzes...
                    </div>
                ) : quizzesToDisplay.length === 0 ? (
                    <div
                        style={{ backgroundColor: 'var(--card-background)', color: 'var(--tertiary-text)' }}
                        className="text-center p-8 text-lg rounded-xl shadow-lg"
                    >
                        No quizzes found matching your current filters.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzesToDisplay.map(quiz => (
                            <QuizCard
                                key={quiz._id}
                                quiz={quiz}
                                showDeleteButton={showDeleteButton}
                                showUpdateButton={showUpdateButton}
                                onDelete={handleDelete}
                                onUpdate={handleUpdate}
                            />
                        ))}
                    </div>
                )}

                {/* Infinite Scroll Sentinel and Loading Indicator */}
                {!loading && !isLastBatch && (
                    <div ref={sentinelRef} className="text-center py-6">
                        {isMoreLoading ? (
                            <div
                                style={{ color: 'var(--primary-accent)' }}
                                className="flex items-center justify-center font-semibold"
                            >
                                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                <span>Fetching more quizzes...</span>
                            </div>
                        ) : (
                            <div className="h-1 w-full"></div>
                        )}
                    </div>
                )}

                {/* End of list message */}
                {!loading && filteredQuizzes.length > 0 && isLastBatch && (
                    <p
                        style={{ color: 'var(--tertiary-text)', borderColor: 'var(--bg-shade-1)' }}
                        className="text-center text-sm mt-8 py-4 border-t"
                    >
                        You've reached the end of the quiz list. Total quizzes: {filteredQuizzes.length}
                    </p>
                )}

            </div>
        </div>
    );
};

export default QuizListPage;