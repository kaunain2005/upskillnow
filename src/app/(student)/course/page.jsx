'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

export default function CoursePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const courseId = searchParams.get('courseId');

    const [course, setCourse] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!courseId) return;

        const fetchData = async () => {
            try {
                const courseRef = doc(db, 'courses', courseId);
                const courseSnap = await getDoc(courseRef);

                if (!courseSnap.exists()) return;

                setCourse({ id: courseSnap.id, ...courseSnap.data() });

                const chaptersRef = collection(db, 'courses', courseId, 'chapters');
                const chaptersSnap = await getDocs(chaptersRef);

                setChapters(
                    chaptersSnap.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId]);

    if (loading) return <div className="p-6">Loading course...</div>;
    if (!course) return <div className="p-6">Course not found</div>;

    return (
        <div className="min-h-screen p-4 lg:p-8">
            {/* Breadcrumb */}
            <div className="mb-4 text-sm">
                <Link href="/courses" className="text-blue-600">Courses</Link> /
                <span className="ml-1 font-semibold">{course.title}</span>
            </div>

            {/* Course Info */}
            <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-6">{course.description}</p>

            {/* Chapters */}
            <h2 className="text-xl font-semibold mb-4">Chapters</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {chapters.map(ch => (
                    <Link
                        key={ch.id}
                        href={`/chapter?courseId=${courseId}&chapterId=${ch.id}`}
                        className="p-4 border rounded-xl shadow hover:shadow-lg transition"
                    >
                        <h3 className="font-bold text-lg">{ch.title}</h3>
                        <p className="text-sm text-gray-500">{ch.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
