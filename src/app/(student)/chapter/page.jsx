// src/app/(student)/chapter/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    orderBy,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

export default function ChapterPage() {
    const searchParams = useSearchParams();
    const courseId = searchParams.get('courseId');
    const chapterId = searchParams.get('chapterId');
    const [activeIndex, setActiveIndex] = useState(0);

    const [modules, setModules] = useState([]);
    const [course, setCourse] = useState(null);
    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    // --------------- SAVE PROGRESS -----------------
    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);   // ✅ REAL USER ID
            } else {
                setUserId(null);       // not logged in
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!userId || !modules.length) return;

        setDoc(
            doc(db, 'users', userId, 'progress', `${courseId}_${chapterId}`),
            {
                lastIndex: activeIndex,
                updatedAt: serverTimestamp()
            },
            { merge: true }
        );
    }, [activeIndex, userId, modules, courseId, chapterId]);

    // --------------- FETCH MODULE DATA ----------------

    useEffect(() => {
        if (!(courseId && chapterId)) return;

        const fetchData = async () => {
            // Course
            const courseSnap = await getDoc(doc(db, 'courses', courseId));
            if (courseSnap.exists()) setCourse(courseSnap.data());

            // Chapter
            const chapterSnap = await getDoc(
                doc(db, 'courses', courseId, 'chapters', chapterId)
            );
            if (chapterSnap.exists()) setChapter(chapterSnap.data());

            // ✅ Modules (SUBCOLLECTION)
            const modulesSnap = await getDocs(
                query(
                    collection(db, 'courses', courseId, 'chapters', chapterId, 'modules'),
                    orderBy('order', 'asc')
                )
            );

            setModules(
                modulesSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
            );
            setLoading(false);
        };

        fetchData();
    }, [courseId, chapterId]);

    if (loading) return <div className="p-6">Loading chapter...</div>;
    if (!chapter) return <div className="p-6">Chapter not found</div>;

    return (
        <div className="min-h-screen p-4 lg:p-8">
            {/* Breadcrumb */}
            <div className="mb-4 text-sm lg:pt-10 pt-15">
                <Link href="/courses" className="text-blue-600">Courses</Link> /
                <Link
                    href={`/course?courseId=${courseId}`}
                    className="text-blue-600 ml-1"
                >
                    {course?.title}
                </Link> /
                <span className="ml-1 font-semibold">{chapter.title}</span>
            </div>

            {/* Chapter Info */}
            <h1 className="text-2xl font-bold mb-2">{chapter.title}</h1>
            <p className="text-gray-600 mb-6">{chapter.description}</p>

            {modules.length > 0 && (
                <div className="flex items-center justify-center gap-4 my-6">
                    <button
                        disabled={activeIndex === 0}
                        onClick={() => setActiveIndex(i => i - 1)}
                        className="px-4 py-2 border rounded disabled:opacity-40"
                    >
                        ◀ Previous
                    </button>

                    <span className="font-medium">
                        {activeIndex + 1} / {modules.length}
                    </span>

                    <button
                        disabled={activeIndex === modules.length - 1}
                        onClick={() => setActiveIndex(i => i + 1)}
                        className="px-4 py-2 border rounded disabled:opacity-40"
                    >
                        Next ▶
                    </button>
                </div>
            )}

            {modules[activeIndex] && (
                <div className="p-6 border rounded-lg bg-white shadow">
                    <h2 className="text-xl font-semibold mb-3">
                        {/* This shows "1. Title", "2. Title" based on the sorted list */}
                        {activeIndex + 1}. {modules[activeIndex].title}
                    </h2>

                    <p className="leading-relaxed text-gray-700">
                        {modules[activeIndex].content}
                    </p>
                </div>
            )}
        </div>
    );
}
