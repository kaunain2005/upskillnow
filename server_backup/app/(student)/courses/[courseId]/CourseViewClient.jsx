"use client";
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

const db = getFirestore(app);

// 🎯 REQUIRED FOR CAPACITOR/STATIC EXPORT
export async function generateStaticParams() {
    return []; // Tells Next.js to handle IDs at runtime
}

export default function CourseViewClient({ params }) {
    const { courseId } = use(params);
    const router = useRouter();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleChapterClick = (chapterId) => {
        router.push(`/courses/${courseId}/chapters/${chapterId}`);
    };

    useEffect(() => {
        if (!courseId) return;

        const fetchCourse = async () => {
            setLoading(true);
            try {
                // 🎯 DIRECT FIREBASE CALL (Works on Mobile)
                const docRef = doc(db, "courses", courseId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setCourse({ _id: docSnap.id, ...docSnap.data() });
                } else {
                    throw new Error("Course not found in database.");
                }
            } catch (err) {
                console.error("Firestore error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    if (loading) return <div className="p-20 text-center">Loading...</div>;
    if (error) return <div className="p-20 text-red-500">Error: {error}</div>;

    const { title, description, image, fullInfo, department, year, semester, duration, chapters = [] } = course || {};

    return (
        <div className="w-full min-h-screen p-4 lg:pt-20 md:p-10 bg-gray-50 dark:bg-neutral-950">
            <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 shadow-2xl rounded-xl overflow-hidden">
                {/* Header */}
                <div className="p-6 md:p-8 border-b dark:border-neutral-800">
                    <div className="flex flex-col md:flex-row items-start md:items-center">
                        <img src={image || "https://via.placeholder.com/150"} className="w-24 h-24 rounded-lg mr-6" alt="Course" />
                        <div>
                            <h1 className="text-3xl font-bold dark:text-white">{title}</h1>
                            <p className="text-gray-500 italic">{description}</p>
                        </div>
                    </div>
                </div>
                {/* Chapters */}
                <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold mb-4 dark:text-white">Chapters</h2>
                    <ul className="space-y-4">
                        {chapters.map((chapter) => (
                            <li key={chapter._id}
                                onClick={() => handleChapterClick(chapter._id)}
                                className="p-4 border dark:border-neutral-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800">
                                <div className="font-bold text-indigo-600">{chapter.title}</div>
                                <p className="text-sm text-gray-400">Modules: {chapter.modules?.length || 0}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}