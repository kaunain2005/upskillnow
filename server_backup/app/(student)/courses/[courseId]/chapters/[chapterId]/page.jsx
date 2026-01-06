'use client';

import React, { useState, useEffect, useCallback, useMemo, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const MockQuizModal = ({ isOpen, chapterTitle, chapterId, onClose, courseId }) => {
    const router = useRouter();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">Chapter Completed! 🎉</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    You have successfully finished all modules in **{chapterTitle}**. Ready for the quiz?
                </p>

                <button
                    onClick={() => {
                        onClose();
                        router.push(`/quizes/chapterQuiz/${chapterId}`);
                    }}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01]"
                >
                    Start Chapter Quiz Now 📝
                </button>
            </div>
        </div>
    );
};

const updateProgressStatus = async (moduleId, status) => {
    console.log(`[API MOCK] Updating module ${moduleId} status to: ${status}`);
    return new Promise(resolve => setTimeout(() => resolve({ success: true, newStatus: status }), 300));
};


// --- MAIN COMPONENT ---
// This is a Next.js Page Component (Client Side due to 'use client')
export default function ChapterDetailPage({ params }) {

    // Destructure params correctly for Next.js App Router
    const { courseId, chapterId } = use(params);

    const router = useRouter();
    const searchParams = useSearchParams();

    const currentModuleId = searchParams.get('module');

    const [chapter, setChapter] = useState(null);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(-1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    useEffect(() => {
        if (!courseId || !chapterId) {
            setError("Course or Chapter ID missing from URL.");
            setLoading(false);
            return;
        }

        const fetchChapter = async () => {
            setLoading(true);
            try {
                // In a real Next.js app, this would be your fetch call:
                const res = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`);
                const data = await res.json();

                setChapter(data);

                const modules = data.modules || [];
                let initialIndex = modules.findIndex(m => m._id === currentModuleId);

                if (initialIndex === -1) {
                    initialIndex = 0;
                }

                setCurrentModuleIndex(initialIndex);

                if (modules.length > 0 && modules[initialIndex]._id !== currentModuleId) {
                    const moduleToLoadId = modules[initialIndex]._id;
                    router.replace(`/courses/${courseId}/chapters/${chapterId}?module=${moduleToLoadId}`, { shallow: true });
                    updateProgressStatus(moduleToLoadId, "in-progress");
                }

            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message || "An unknown error occurred while fetching chapter data.");
            } finally {
                setLoading(false);
            }
        };

        fetchChapter();
    }, [courseId, chapterId, currentModuleId, router]);

    // --- Remaining Logic ---
    const modules = chapter?.modules || [];
    const currentModule = modules[currentModuleIndex];
    const isFirstModule = currentModuleIndex === 0;
    const isLastModule = modules.length > 0 && currentModuleIndex === modules.length - 1;
    const hasModules = modules.length > 0;

    const navigateToModule = useCallback((index) => {
        if (index >= 0 && index < modules.length) {
            const nextModuleId = modules[index]._id;
            updateProgressStatus(nextModuleId, "in-progress");
            router.replace(`/courses/${courseId}/chapters/${chapterId}?module=${nextModuleId}`, { shallow: true });
            setCurrentModuleIndex(index);
        }
    }, [router, courseId, chapterId, modules]);

    const handlePrev = () => {
        navigateToModule(currentModuleIndex - 1);
    };

    const handleNext = () => {
        navigateToModule(currentModuleIndex + 1);
    };

    const handleDone = async () => {
        if (currentModule) {
            await updateProgressStatus(currentModule._id, "completed");
            setIsModalOpen(true);
        }
    };


    if (loading) {
        return (
            <div className="w-full min-h-screen p-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-500 border-t-transparent"></div>
                <p className="text-xl text-gray-700 dark:text-gray-300 mt-4 font-medium">Loading chapter details...</p>
            </div>
        );
    }

    if (error || !chapter) {
        return (
            <div className="w-full min-h-screen p-8 bg-gray-50 dark:bg-gray-950 text-red-600">
                <h1 className="text-2xl font-bold mb-4">Error Loading Chapter</h1>
                <p className="text-red-400">Details: {error || "Chapter data is missing."}</p>
            </div>
        );
    }

    return (
        <Suspense fallback={<div className="p-6">Loading courses...</div>}>
            <div className="min-h-screen p-4 md:p-10 lg:pt-20 bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-inter">
                <div className="max-w-4xl mx-auto">

                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 border-b border-indigo-200 dark:border-indigo-800 pb-2">
                        {chapter.title}
                    </h1>
                    <p className="text-indigo-600 dark:text-indigo-400 mb-8 text-lg italic font-medium">
                        {modules.length} Modules Total
                    </p>

                    <div className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-2xl shadow-xl min-h-[60vh] border border-gray-100 dark:border-gray-700">
                        {!hasModules || !currentModule ? (
                            <div className="text-center py-20 text-gray-500 dark:text-gray-400 text-xl">No content found for this chapter.</div>
                        ) : (
                            <>
                                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b pb-2 border-gray-200 dark:border-gray-700">
                                    {currentModule.title}
                                </h2>

                                {currentModule.image && (
                                    <img
                                        src={currentModule.image}
                                        alt={currentModule.title}
                                        className="w-full h-auto max-h-96 object-cover rounded-xl mb-8 shadow-md border border-gray-100 dark:border-gray-700"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x300/e0e7ff/3730a3?text=Module+Image'; }}
                                    />
                                )}

                                {/* 🔥 THE FIX: Using dangerouslySetInnerHTML and the 'prose' style modifiers */}
                                <div
                                    className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed prose dark:prose-invert max-w-none transition duration-500"
                                    dangerouslySetInnerHTML={{ __html: currentModule.content }}
                                />
                                {/* The 'prose dark:prose-invert' classes automatically style the raw HTML (h3, ul, b, etc.) beautifully. */}

                                <div className="mt-12 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Viewing Module **{currentModuleIndex + 1}** of **{modules.length}**
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-8 flex justify-between gap-4">
                        <button
                            onClick={handlePrev}
                            disabled={isFirstModule || !hasModules}
                            className="flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Previous
                        </button>

                        {isLastModule && hasModules ? (
                            <button
                                onClick={handleDone}
                                className="flex items-center px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg hover:shadow-xl transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Mark as Done & Quiz
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={!currentModule || !hasModules || isLastModule}
                                className="flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Module
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        )}
                    </div>
                </div>

                <MockQuizModal
                    isOpen={isModalOpen}
                    chapterTitle={chapter?.title || "Chapter"}
                    chapterId={chapterId}
                    courseId={courseId}
                    onClose={() => setIsModalOpen(false)}
                />
            </div>
        </Suspense>
    );
}
