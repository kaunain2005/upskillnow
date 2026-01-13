'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import {
    doc,
    getDoc,
    getDocs,
    collection,
    updateDoc,
    addDoc,
    deleteDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PlusCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Initial structures ---
const initialModule = { title: '', content: '', image: '' };
const initialChapter = { title: '', modules: [initialModule] };

export default function UpdateCoursePage() {
    const params = useSearchParams();
    const router = useRouter();
    const courseId = params.get('id');

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    console.log('🟡 courseId:', courseId);

    // ================= FETCH COURSE =================
    useEffect(() => {
        if (!courseId) return;

        const fetchAll = async () => {
            console.log("🚀 Fetching full course tree");

            const courseRef = doc(db, "courses", courseId);
            const courseSnap = await getDoc(courseRef);

            if (!courseSnap.exists()) {
                console.error("❌ Course not found");
                setLoading(false);
                return;
            }

            const courseData = courseSnap.data();
            console.log("✅ Course:", courseData);

            const chaptersRef = collection(db, "courses", courseId, "chapters");
            const chaptersSnap = await getDocs(chaptersRef);

            const chapters = [];

            for (const chapDoc of chaptersSnap.docs) {
                const modulesRef = collection(db, "courses", courseId, "chapters", chapDoc.id, "modules");
                const modulesSnap = await getDocs(modulesRef);

                const modules = modulesSnap.docs.map(modDoc => ({
                    id: modDoc.id,
                    ...modDoc.data()
                }));

                chapters.push({
                    id: chapDoc.id,
                    ...chapDoc.data(),
                    modules
                });
            }

            const fullCourse = { id: courseId, ...courseData, chapters };
            console.log("🧠 FINAL COURSE STATE", fullCourse);
            setCourse(fullCourse);
            setLoading(false);
        };

        fetchAll();
    }, [courseId]);

    // ================= CHAPTER & MODULE HANDLERS =================
    const handleCourseChange = useCallback((e) => {
        const { name, value } = e.target;
        setCourse(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleChapterChange = useCallback((index, e) => {
        const { name, value } = e.target;
        const copy = [...course.chapters];
        copy[index][name] = value;
        setCourse(prev => ({ ...prev, chapters: copy }));
    }, [course]);

    const handleModuleChange = useCallback((chapIndex, modIndex, e) => {
        const { name, value } = e.target;
        const copy = [...course.chapters];
        copy[chapIndex].modules[modIndex][name] = value;
        setCourse(prev => ({ ...prev, chapters: copy }));
    }, [course]);

    const addChapter = useCallback(() => {
        setCourse(prev => ({ ...prev, chapters: [...prev.chapters, initialChapter] }));
    }, []);

    const removeChapter = useCallback((index) => {
        if (course.chapters.length === 1) {
            toast.error("A course must have at least one chapter.");
            return;
        }
        const copy = course.chapters.filter((_, i) => i !== index);
        setCourse(prev => ({ ...prev, chapters: copy }));
    }, [course]);

    const addModule = useCallback((chapIndex) => {
        const copy = [...course.chapters];
        copy[chapIndex].modules.push(initialModule);
        setCourse(prev => ({ ...prev, chapters: copy }));
    }, [course]);

    const removeModule = useCallback((chapIndex, modIndex) => {
        const copy = [...course.chapters];
        if (copy[chapIndex].modules.length === 1) {
            toast.error("A chapter must have at least one module.");
            return;
        }
        copy[chapIndex].modules = copy[chapIndex].modules.filter((_, i) => i !== modIndex);
        setCourse(prev => ({ ...prev, chapters: copy }));
    }, [course]);

    // ================= SAVE / UPDATE =================
    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            console.log('🟢 Updating course:', course);

            // Update main course
            await updateDoc(doc(db, 'courses', courseId), {
                title: course.title,
                description: course.description,
                image: course.image,
                duration: course.duration,
                startDate: course.startDate,
                endDate: course.endDate,
                fullInfo: course.fullInfo,
                department: course.department,
                year: course.year,
                semester: course.semester,
                updatedAt: Timestamp.now()
            });

            // Delete old chapters + modules
            const oldChaptersSnap = await getDocs(collection(db, 'courses', courseId, 'chapters'));
            for (const chap of oldChaptersSnap.docs) {
                const modulesSnap = await getDocs(collection(db, 'courses', courseId, 'chapters', chap.id, 'modules'));
                for (const mod of modulesSnap.docs) await deleteDoc(mod.ref);
                await deleteDoc(chap.ref);
            }

            // Recreate chapters + modules
            for (let i = 0; i < course.chapters.length; i++) {
                const chap = course.chapters[i];
                const chapRef = await addDoc(collection(db, 'courses', courseId, 'chapters'), {
                    title: chap.title,
                    order: i,
                    createdAt: Timestamp.now()
                });

                for (let j = 0; j < chap.modules.length; j++) {
                    const mod = chap.modules[j];
                    await addDoc(collection(db, 'courses', courseId, 'chapters', chapRef.id, 'modules'), {
                        title: mod.title,
                        content: mod.content,
                        image: mod.image || '',
                        order: j,
                        createdAt: Timestamp.now()
                    });
                }
            }

            toast.success('Course updated successfully ✅');
            router.push('/admin-dashboard/courses/list');
        } catch (err) {
            console.error('🔥 UPDATE ERROR:', err);
            toast.error('Update failed ❌');
        } finally {
            setIsSaving(false);
        }
    };

    // ================= UI =================
    if (loading) return <p className="p-6">Loading...</p>;
    if (!course) return <p className="p-6">Course not found</p>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-indigo-700">Update Course</h1>

            {/* Course Info */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-6">
                <h2 className="text-xl font-semibold mb-3">Course Information</h2>
                <input
                    name="title"
                    value={course.title || ''}
                    onChange={handleCourseChange}
                    placeholder="Course Title"
                    className="w-full border p-2 rounded mb-3"
                />
                <textarea
                    name="description"
                    value={course.description || ''}
                    onChange={handleCourseChange}
                    placeholder="Course Description"
                    className="w-full border p-2 rounded mb-3"
                    rows={3}
                />
                <input
                    name="image"
                    value={course.image || ''}
                    onChange={handleCourseChange}
                    placeholder="Image URL"
                    className="w-full border p-2 rounded mb-3"
                />
                <input
                    name="duration"
                    value={course.duration || ''}
                    onChange={handleCourseChange}
                    placeholder="Duration"
                    className="w-full border p-2 rounded mb-3"
                />
                <div className="flex gap-3 mb-3">
                    <input
                        name="startDate"
                        type="date"
                        value={course.startDate || ''}
                        onChange={handleCourseChange}
                        className="w-full border p-2 rounded"
                    />
                    <input
                        name="endDate"
                        type="date"
                        value={course.endDate || ''}
                        onChange={handleCourseChange}
                        className="w-full border p-2 rounded"
                    />
                </div>
                <textarea
                    name="fullInfo"
                    value={course.fullInfo || ''}
                    onChange={handleCourseChange}
                    placeholder="Full Course Info / Syllabus"
                    className="w-full border p-2 rounded mb-3"
                    rows={4}
                />
            </div>

            {/* Chapters */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-semibold">Chapters & Modules</h2>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={addChapter}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded"
                    >
                        <PlusCircle className="w-5 h-5" /> Add Chapter
                    </motion.button>
                </div>

                {course.chapters.map((chap, cIndex) => (
                    <div key={chap.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded shadow">
                        <div className="flex justify-between items-center mb-3">
                            <input
                                value={chap.title}
                                name="title"
                                onChange={e => handleChapterChange(cIndex, e)}
                                placeholder={`Chapter ${cIndex + 1} Title`}
                                className="w-full border p-2 rounded"
                            />
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => removeChapter(cIndex)}
                                className="ml-3 bg-red-600 text-white p-2 rounded"
                            >
                                <XCircle className="w-4 h-4" />
                            </motion.button>
                        </div>

                        {/* Modules */}
                        <div className="space-y-2 pl-4 border-l-2 border-indigo-400">
                            {chap.modules.map((mod, mIndex) => (
                                <div key={mod.id} className="bg-white dark:bg-gray-800 p-3 rounded shadow mb-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <input
                                            value={mod.title}
                                            name="title"
                                            placeholder={`Module ${mIndex + 1} Title`}
                                            onChange={e => handleModuleChange(cIndex, mIndex, e)}
                                            className="w-full border p-2 rounded"
                                        />
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => removeModule(cIndex, mIndex)}
                                            className="ml-2 bg-red-600 text-white p-2 rounded"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                    <textarea
                                        value={mod.content}
                                        name="content"
                                        placeholder="Module Content"
                                        rows={3}
                                        onChange={e => handleModuleChange(cIndex, mIndex, e)}
                                        className="w-full border p-2 rounded"
                                    />
                                    <input
                                        value={mod.image || ''}
                                        name="image"
                                        placeholder="Module Image URL (optional)"
                                        onChange={e => handleModuleChange(cIndex, mIndex, e)}
                                        className="w-full border p-2 rounded mt-2"
                                    />
                                </div>
                            ))}
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => addModule(cIndex)}
                                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded mt-1"
                            >
                                <PlusCircle className="w-4 h-4" /> Add Module
                            </motion.button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Save */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleUpdate}
                className={`mt-6 w-full bg-indigo-600 text-white px-6 py-3 rounded text-lg font-bold ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isSaving}
            >
                {isSaving ? 'Saving...' : 'Save Changes'}
            </motion.button>
        </div>
    );
}
