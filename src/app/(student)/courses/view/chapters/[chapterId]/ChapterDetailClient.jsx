// src/app/(student)/courses/[courseId]/chapters/[chapterId]/ChapterDetailClient.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

const db = getFirestore(app);

// Mock progress update (still client-safe)
const updateProgressStatus = async () => true;

export default function ChapterDetailClient({ courseId, chapterId }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentModuleId = searchParams.get("module");

    const [chapter, setChapter] = useState(null);
    const [modules, setModules] = useState([]);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!courseId || !chapterId) return;

        const fetchChapterAndModules = async () => {
            try {
                // 1️⃣ Fetch chapter
                const chapterSnap = await getDoc(
                    doc(db, "courses", courseId, "chapters", chapterId)
                );

                if (!chapterSnap.exists()) {
                    throw new Error("Chapter not found");
                }

                const chapterData = { id: chapterSnap.id, ...chapterSnap.data() };
                setChapter(chapterData);

                // 2️⃣ Fetch modules
                const modulesSnap = await getDocs(
                    collection(db, "courses", courseId, "chapters", chapterId, "modules")
                );

                const modulesData = modulesSnap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .sort((a, b) => a.order - b.order);

                setModules(modulesData);

                // 3️⃣ Resolve initial module
                let index = modulesData.findIndex(m => m.id === currentModuleId);
                if (index === -1) index = 0;

                setCurrentModuleIndex(index);

                if (modulesData[index]) {
                    router.replace(
                        `/courses/${courseId}/chapters/${chapterId}?module=${modulesData[index].id}`
                    );
                }

            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchChapterAndModules();
    }, [courseId, chapterId, currentModuleId, router]);

    const currentModule = modules[currentModuleIndex];
    const isFirst = currentModuleIndex === 0;
    const isLast = currentModuleIndex === modules.length - 1;

    const navigateTo = useCallback((index) => {
        if (!modules[index]) return;
        router.replace(
            `/courses/${courseId}/chapters/${chapterId}?module=${modules[index].id}`
        );
        setCurrentModuleIndex(index);
        updateProgressStatus(modules[index].id, "in-progress");
    }, [modules, router, courseId, chapterId]);

    if (loading) return <div className="p-20 text-center">Loading chapter…</div>;
    if (error) return <div className="p-20 text-red-500">{error}</div>;

    return (
        <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-950">
            <h1 className="text-4xl font-bold mb-2">{chapter.title}</h1>
            <p className="text-indigo-500 mb-6">{modules.length} Modules</p>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                {currentModule && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">{currentModule.title}</h2>

                        {currentModule.image && (
                            <img
                                src={currentModule.image}
                                className="rounded-xl mb-6"
                                alt=""
                            />
                        )}

                        <div
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: currentModule.content }}
                        />
                    </>
                )}
            </div>

            <div className="mt-8 flex justify-between">
                <button
                    onClick={() => navigateTo(currentModuleIndex - 1)}
                    disabled={isFirst}
                    className="px-6 py-3 bg-gray-300 rounded-xl disabled:opacity-50"
                >
                    Previous
                </button>

                {isLast ? (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl"
                    >
                        Done & Quiz
                    </button>
                ) : (
                    <button
                        onClick={() => navigateTo(currentModuleIndex + 1)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl"
                    >
                        Next
                    </button>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl text-center">
                        <h3 className="text-xl font-bold mb-4">Chapter Completed 🎉</h3>
                        <button
                            onClick={() => router.push(`/quizes/chapterQuiz/${chapterId}`)}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl"
                        >
                            Start Quiz
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
