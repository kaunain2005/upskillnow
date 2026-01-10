'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

export default function ChapterPage() {
    const searchParams = useSearchParams();
    const courseId = searchParams.get('courseId');
    const chapterId = searchParams.get('chapterId');

    const [course, setCourse] = useState(null);
    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!(courseId && chapterId)) return;

        const fetchData = async () => {
            const courseSnap = await getDoc(doc(db, 'courses', courseId));
            const chapterSnap = await getDoc(
                doc(db, 'courses', courseId, 'chapters', chapterId)
            );

            if (courseSnap.exists()) setCourse(courseSnap.data());
            if (chapterSnap.exists()) setChapter(chapterSnap.data());

            setLoading(false);
        };

        fetchData();
    }, [courseId, chapterId]);

    if (loading) return <div className="p-6">Loading chapter...</div>;
    if (!chapter) return <div className="p-6">Chapter not found</div>;

    return (
        <div className="min-h-screen p-4 lg:p-8">
            {/* Breadcrumb */}
            <div className="mb-4 text-sm">
                <Link href="/courses" className="text-blue-600">Courses</Link> /
                <Link href={`/course?courseId=${courseId}`} className="text-blue-600 ml-1">
                    {course?.title}
                </Link> /
                <span className="ml-1 font-semibold">{chapter.title}</span>
            </div>

            {/* Chapter Content */}
            <h1 className="text-2xl font-bold mb-2">{chapter.title}</h1>
            <p className="text-gray-600 mb-4">{chapter.description}</p>

            {/* Modules / Content */}
            {chapter.modules?.map((m, i) => (
                <div key={i} className="p-4 mb-3 border rounded-lg">
                    <h3 className="font-semibold">{m.title}</h3>
                    <p className="text-sm text-gray-500">{m.type}</p>
                </div>
            ))}
        </div>
    );
}
