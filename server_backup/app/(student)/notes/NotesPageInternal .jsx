// src/app/(student)/notes/page.jsx
"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    FiDownload, FiEye, FiSearch,
    FiChevronDown, FiChevronRight,
    FiAlertTriangle, FiBookOpen,
    FiFileText, FiLink, FiVideo,
    FiFolder, FiX, FiCheckCircle
} from 'react-icons/fi';

// --- MOCK MODAL COMPONENT ---

// Helper function to try and extract YouTube ID
const getYouTubeId = (url) => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        if (url.includes('youtube.com')) {
            return urlObj.searchParams.get('v');
        }
        if (url.includes('youtu.be')) {
            return urlObj.pathname.substring(1);
        }
    } catch (e) {
        // Handle invalid URL format gracefully
        return null;
    }
    return null;
};

const PreviewModal = ({ isOpen, onClose, note }) => {
    if (!isOpen || !note) return null;

    const renderContent = () => {
        const fileType = note.fileType.toLowerCase();

        switch (fileType) {
            case 'pdf':
                return (
                    <iframe
                        src={note.downloadLink}
                        title={note.noteTitle}
                        className="w-full h-[60vh] border-0 bg-white"
                        allowFullScreen
                    />
                );
            case 'video':
                const videoId = getYouTubeId(note.downloadLink);
                if (videoId) {
                    return (
                        <iframe
                            className="w-full h-[60vh] border-0 bg-black"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={note.noteTitle}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    );
                }
                return (
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded text-center">
                        <FiVideo className="w-10 h-10 mx-auto text-red-500 mb-2" />
                        <p className="font-semibold">Video Link Not Embeddable</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Preview only works for standard YouTube links.</p>
                    </div>
                );
            case 'doc':
            case 'zip':
            case 'other':
                return (
                    <div className="p-6 bg-yellow-50 dark:bg-gray-700/50 rounded-lg text-center">
                        <FiAlertTriangle className="w-10 h-10 mx-auto text-yellow-600 mb-3" />
                        <p className="text-lg font-bold mb-2">Preview Unavailable</p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Direct preview for **{fileType.toUpperCase()}** files is not supported by the browser.
                        </p>
                        <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                            Please use the **Download** button to access the file.
                        </p>
                    </div>
                );
            case 'link':
                return (
                    <div className="p-6 bg-blue-50 dark:bg-gray-700/50 rounded-lg text-center">
                        <FiLink className="w-10 h-10 mx-auto text-blue-600 mb-3" />
                        <p className="text-lg font-bold mb-2">External Link</p>
                        <p className="text-gray-700 dark:text-gray-300">
                            This resource is an external link. Click the button below to open it in a new tab.
                        </p>
                        <a
                            href={note.downloadLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FiLink className="mr-2" /> Go to Link
                        </a>
                    </div>
                );
            default:
                return <p className="p-4">Unknown file type: {fileType}</p>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-xl font-bold dark:text-white truncate">{note.noteTitle} Preview</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-2xl p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <FiX />
                    </button>
                </div>
                <div className="p-4">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export default function NotesPageInternal() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for initial search form values (synced with URL)
    const [department, setDepartment] = useState(searchParams.get('dep') || '');
    const [year, setYear] = useState(searchParams.get('year') || '');
    const [semester, setSemester] = useState(searchParams.get('sem') || '');

    // State for fetched data
    const [notesData, setNotesData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for collapse/expand functionality
    const [expandedCourses, setExpandedCourses] = useState({});
    const [expandedChapters, setExpandedChapters] = useState({});

    // State for modal
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    // Static data (should match your Course model enums)
    const departments = ['CS', 'IT', 'DS'];
    const years = ['FY', 'SY', 'TY'];
    const semesters = ['SEM1', 'SEM2'];

    // --- Data Fetching Logic ---
    const fetchNotes = useCallback(async (dep, yr, sem) => {
        if (!dep || !yr || !sem) return;

        setLoading(true);
        setError(null);
        setNotesData([]);

        // Update the URL (unchanged)
        router.push(`/notes?dep=${dep}&year=${yr}&sem=${sem}`, undefined, { shallow: true });

        try {
            const res = await fetch(`/api/notes/get?dep=${dep}&year=${yr}&sem=${sem}`);

            const apiResponse = await res.json();
            let structuredData; // Variable to hold the clean array of courses

            if (!res.ok) {
                // Handle server errors (e.g., 400, 500)
                throw new Error(apiResponse.error || 'Failed to fetch notes data.');
            }

            // --- FIX: Robustly determine the data array from the API response ---
            if (Array.isArray(apiResponse)) {
                // Case 1: API returned a clean array directly (e.g., when data is found)
                structuredData = apiResponse;
            } else if (apiResponse && Array.isArray(apiResponse.data)) {
                // Case 2: API returned a wrapper object { message: "...", data: [] } (e.g., when no notes are found)
                structuredData = apiResponse.data;
            } else {
                // Case 3: Unexpected format. Log the issue and set data to an empty array.
                console.error("API returned an unexpected successful response format:", apiResponse);
                structuredData = [];
            }
            // -------------------------------------------------------------------

            // Set the extracted array
            setNotesData(structuredData);

            // Auto-expand logic (now runs on the safely extracted array)
            const newExpandedCourses = {};
            structuredData.forEach(course => newExpandedCourses[course.courseId] = true);
            setExpandedCourses(newExpandedCourses);
            setExpandedChapters({});

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Initial load/sync with URL
    useEffect(() => {
        const dep = searchParams.get('dep');
        const yr = searchParams.get('year');
        const sem = searchParams.get('sem');

        if (dep && yr && sem) {
            setDepartment(dep);
            setYear(yr);
            setSemester(sem);
            fetchNotes(dep, yr, sem);
        }
    }, [searchParams, fetchNotes]);

    // --- Handlers ---
    const handleSubmit = (e) => {
        e.preventDefault();
        fetchNotes(department, year, semester);
    };

    const handlePreview = (note) => {
        setSelectedNote(note);
        setModalOpen(true);
    };

    const handleDownload = (link) => {
        // Direct download using window.open
        window.open(link, '_blank');
    };

    const toggleCourse = (courseId) => {
        setExpandedCourses(prev => ({
            ...prev,
            [courseId]: !prev[courseId]
        }));
    };

    const toggleChapter = (chapterId) => {
        setExpandedChapters(prev => ({
            ...prev,
            [chapterId]: !prev[chapterId]
        }));
    };

    // --- Render Functions ---

    const getFileIcon = (fileType) => {
        const type = fileType ? fileType.toLowerCase() : 'other';
        switch (type) {
            case 'pdf': return <FiFileText className="text-red-500" />;
            case 'video': return <FiVideo className="text-red-600" />;
            case 'doc': return <FiFileText className="text-blue-500" />;
            case 'zip': return <FiFolder className="text-yellow-600" />;
            case 'link': return <FiLink className="text-indigo-500" />;
            default: return <FiFileText className="text-gray-500" />;
        }
    };

    const renderNoteItem = (note) => {
        // Determine if the resource is a video
        const isVideo = note.fileType && note.fileType.toLowerCase() === 'video';

        return (
            <div key={note._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border-b last:border-b-0 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm">
                <div className="flex items-center space-x-3 w-full sm:w-1/2 mb-2 sm:mb-0">
                    {getFileIcon(note.fileType)}
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{note.noteTitle}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700">{note.fileType}</span>
                </div>
                <div className="flex space-x-3 ml-auto sm:ml-0">
                    {/* Conditional Button: Watch for video, Download for others */}
                    {isVideo ? (
                        <button
                            // This button opens the link directly, replacing the Download function
                            onClick={() => handleDownload(note.downloadLink)}
                            className="flex items-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold transition-colors"
                        >
                            <FiVideo className="w-4 h-4 mr-1" /> Watch
                        </button>
                    ) : (
                        <button
                            onClick={() => handleDownload(note.downloadLink)}
                            className="flex items-center text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-semibold transition-colors"
                        >
                            <FiDownload className="w-4 h-4 mr-1" /> Download
                        </button>
                    )}

                    {/* Preview Button: Remains the same for all file types */}
                    <button
                        onClick={() => handlePreview(note)}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors"
                    >
                        <FiEye className="w-4 h-4 mr-1" /> Preview
                    </button>
                </div>
            </div>
        );
    };

    const renderChapter = (chapter) => {
        const chapterId = String(chapter.chapterId);
        const isChapterExpanded = expandedChapters[chapterId];

        return (
            <div key={chapterId} className="mt-2 p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm">
                <button
                    onClick={() => toggleChapter(chapterId)}
                    className="flex items-center w-full text-left font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    {isChapterExpanded ? <FiChevronDown className="mr-2 w-5 h-5" /> : <FiChevronRight className="mr-2 w-5 h-5" />}
                    {chapter.chapterTitle} ({chapter.notes.length} Resources)
                </button>
                {isChapterExpanded && (
                    <div className="mt-3 bg-gray-100 dark:bg-gray-700 rounded-md divide-y divide-gray-200 dark:divide-gray-600">
                        {chapter.notes.length > 0 ? (
                            chapter.notes.map(renderNoteItem)
                        ) : (
                            <p className="p-3 text-gray-500 dark:text-gray-400 text-sm">No notes available for this chapter.</p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderCourse = (course) => {
        const courseId = String(course.courseId);
        const isCourseExpanded = expandedCourses[courseId];

        return (
            <div key={courseId} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => toggleCourse(courseId)}
                    className="flex items-center w-full text-left text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                    <FiBookOpen className="w-6 h-6 mr-3" />
                    {isCourseExpanded ? <FiChevronDown className="mr-2" /> : <FiChevronRight className="mr-2" />}
                    {course.courseTitle}
                </button>

                {isCourseExpanded && (
                    <div className="mt-4 border-t pt-4 dark:border-gray-700">
                        {course.chapters.map(renderChapter)}
                    </div>
                )}
            </div>
        );
    };

    // --- Main Render ---
    return (
        <Suspense fallback={<div className="p-6">Loading courses...</div>}>
            <div className="p-4 md:p-8 min-h-dvh bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-extrabold mb-6 text-gray-800 dark:text-white flex items-center">
                        <FiFolder className="w-8 h-8 mr-3 text-indigo-500" /> Resource Notes Library
                    </h1>

                    {/* Breadcrumb / Search Info */}
                    <div className="mb-6 text-lg font-medium text-gray-500 dark:text-gray-400">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{department}</span> &gt;
                        <span className="font-bold text-indigo-600 dark:text-indigo-400"> {year}</span> &gt;
                        <span className="font-bold text-indigo-600 dark:text-indigo-400"> {semester}</span>
                    </div>

                    {/* Search Form (To allow changing parameters without going back) */}
                    <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="" disabled>Select Department</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>

                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="" disabled>Select Year</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>

                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="" disabled>Select Semester</option>
                            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <button
                            type="submit"
                            disabled={loading || !department || !year || !semester}
                            className="flex items-center justify-center p-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                        >
                            <FiSearch className="w-5 h-5 mr-2" /> {loading ? 'Fetching...' : 'Apply Filter'}
                        </button>
                    </form>

                    {/* Results Area */}
                    <div>
                        {error && (
                            <div className="p-4 mb-6 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg flex items-center">
                                <FiAlertTriangle className="w-5 h-5 mr-3" />
                                <p className="font-medium">Error Fetching Notes: {error}</p>
                            </div>
                        )}

                        {loading && (
                            <p className="text-center py-10 text-lg text-indigo-500">Loading notes data...</p>
                        )}

                        {!loading && notesData.length === 0 && (department && year && semester) && (
                            <div className="p-10 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                                <h3 className="text-xl font-semibold mb-2 flex items-center justify-center">
                                    <FiCheckCircle className="w-6 h-6 mr-2 text-green-500" />
                                    No Resources Found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">No notes are currently available for this selection.</p>
                            </div>
                        )}

                        {!loading && notesData.length > 0 && (
                            <div className="space-y-6">
                                {notesData.map(renderCourse)}
                            </div>
                        )}
                    </div>

                    {/* Preview Modal */}
                    <PreviewModal
                        isOpen={modalOpen}
                        onClose={() => setModalOpen(false)}
                        note={selectedNote}
                    />
                </div>
            </div>
        </Suspense>
    );
}
