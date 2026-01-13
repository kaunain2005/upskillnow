// src/components/admin/AdminCourseList.jsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import CourseCard from '../common/CourseCard';
import SearchPannel from '../common/SearchPannel';
import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    updateDoc,
    where   // ✅ ADD THIS
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Central component for fetching, filtering, and displaying courses.
 * @param {string} mode - Determines button visibility ('list', 'update', or 'delete').
 */
const AdminCourseList = ({ mode }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ dep: 'all', year: 'all', sem: 'all' });
    const router = useRouter();

    // --- Button Visibility Logic ---
    const showUpdate = mode === 'list' || mode === 'update';
    const showDelete = mode === 'list' || mode === 'delete';

    // --- Data Fetching ---
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const q = query(
                    collection(db, "courses"),
                    orderBy("createdAt", "desc")
                );

                const snapshot = await getDocs(q);
                const list = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setCourses(list);
            } catch (error) {
                toast.error("Failed to load courses");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);


    // --- Search & Filter Handlers ---
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // --- Dynamic Options Calculation (for SearchPannel) ---
    const availableOptions = useMemo(() => {
        const unique = (key) => [...new Set(courses.map(c => c[key]))].filter(Boolean).sort();
        return {
            deps: unique('department'),
            years: unique('year'),
            sems: unique('semester'),
        };
    }, [courses]);

    // --- Filtering Logic ---
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            // 1. Search Filter
            const matchesSearch = searchTerm.toLowerCase() === '' ||
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.description.toLowerCase().includes(searchTerm.toLowerCase());

            // 2. Dropdown Filters
            const matchesDep = filters.dep === 'all' || course.department === filters.dep;
            const matchesYear = filters.year === 'all' || course.year === filters.year;
            const matchesSem = filters.sem === 'all' || course.semester === filters.sem;

            return matchesSearch && matchesDep && matchesYear && matchesSem;
        });
    }, [courses, searchTerm, filters]);

    // --- Action Handlers ---
    const handleUpdate = (id) => {
        // Navigate to the central update page with the course ID
        router.push(`/admin-dashboard/courses/update?id=${id}`);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this course?")) return;

        try {
            await updateDoc(doc(db, "courses", id), {
                status: "deleted",
                deletedAt: new Date()
            });

            toast.success("Course moved to Deleted");
            setCourses(prev => prev.map(c =>
                c.id === id ? { ...c, status: "deleted" } : c
            ));
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const activeCourses = filteredCourses.filter(
        c => c.status !== "deleted"
    );

    const deletedCourses = filteredCourses.filter(
        c => c.status === "deleted"
    );

    const handleRecover = async (id) => {
        try {
            await updateDoc(doc(db, "courses", id), {
                status: "active",
                recoveredAt: new Date()
            });

            toast.success("Course recovered");

            setCourses(prev =>
                prev.map(c =>
                    c.id === id ? { ...c, status: "active" } : c
                )
            );
        } catch (err) {
            toast.error("Recover failed");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96 dark:text-gray-300">
                <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading Courses...
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-4 lg:p-10 rounded-2xl">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {mode === 'update' ? 'Update Courses' : mode === 'delete' ? 'Delete Courses' : 'All Courses'}
                </h1>
                <button
                    onClick={() => router.push('/admin-dashboard/courses/add')}
                    className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
                >
                    <Plus className="w-5 h-5 mr-2" /> Add New Course
                </button>
            </header>

            <SearchPannel
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filters}
                onFilterChange={handleFilterChange}
                availableOptions={availableOptions}
            />

            <main className="mt-8">
                {filteredCourses.length === 0 && (
                    <div className="text-center p-10 dark:text-gray-400">
                        No courses found matching your criteria.
                    </div>
                )}

                <h2 className="text-xl font-bold mb-4">Active Courses</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeCourses.map(course => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            showUpdateButton
                            showDeleteButton
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
                {deletedCourses.length > 0 && (
                    <>
                        <h2 className="text-xl font-bold text-red-600 mt-10 mb-4">
                            Deleted Courses
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {deletedCourses.map(course => (
                                <div
                                    key={course.id}
                                    className="border border-red-300 bg-red-50 p-4 rounded-xl"
                                >
                                    <h3 className="font-bold text-lg">{course.title}</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {course.description}
                                    </p>

                                    <button
                                        onClick={() => handleRecover(course.id)}
                                        className="bg-green-600 text-white px-4 py-2 rounded"
                                    >
                                        Recover
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

            </main>
        </div>
    );
};

export default AdminCourseList;