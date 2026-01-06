// src/components/admin/AdminCourseList.jsx

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import CourseCard from '../common/CourseCard';
import SearchPannel from '../common/SearchPannel';

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
                const res = await fetch('/api/courses');
                if (!res.ok) throw new Error("Failed to fetch courses.");
                const data = await res.json();
                setCourses(data);
            } catch (error) {
                toast.error(error.message);
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
        if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;

        // Simulating the API call for delete
        try {
            // Placeholder: Replace with actual delete API call
            // const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
            // if (!res.ok) throw new Error("Failed to delete course.");

            toast.success("Course deleted successfully (Simulated)!");
            // Update the list immediately after successful deletion
            setCourses(prev => prev.filter(c => c._id !== id));
        } catch (error) {
            toast.error(error.message);
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => (
                        <CourseCard
                            key={course._id}
                            course={course}
                            showUpdateButton={showUpdate}
                            showDeleteButton={showDelete}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default AdminCourseList;