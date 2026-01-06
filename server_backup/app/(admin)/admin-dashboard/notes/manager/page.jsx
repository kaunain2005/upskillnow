"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ChapterSelector from '@/components/admin/ChapterSelector';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';
import { Plus, Trash2, Save, Pencil, Loader2, ChevronDown, RefreshCcw, FilePlus, ListChecks } from 'lucide-react';

// Initial state for a new note link input
const emptyNoteLink = {
    noteTitle: '',
    downloadLink: '',
    fileType: 'pdf' // Default to PDF
};

export default function AdminNotesManager() {
    // ----------------------------------------
    // Global State for Selection & Data
    // ----------------------------------------
    const [activeTab, setActiveTab] = useState('add'); // 'add' or 'edit'

    // Actual state for data fetched from API (empty initially)
    const [allCourses, setAllCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    const [filters, setFilters] = useState({
        dep: '', year: '', sem: '', course: '', chapter: ''
    });
    const [options, setOptions] = useState({
        deps: [], years: [], sems: [], courses: [], chapters: []
    });

    // State for Status/Loading
    const [statusMessage, setStatusMessage] = useState({ type: null, text: '' });

    // ----------------------------------------
    // State for ADD Notes Tab
    // ----------------------------------------
    const [noteLinks, setNoteLinks] = useState([emptyNoteLink]);
    const [isAdding, setIsAdding] = useState(false);

    // ----------------------------------------
    // State for EDIT/DELETE Notes Tab
    // ----------------------------------------
    const [chapterNotes, setChapterNotes] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editedNote, setEditedNote] = useState(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // State for Delete Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null); // Stores the staged note object

    // ----------------------------------------
    // CORE LOGIC: Initial Course Data Fetch
    // ----------------------------------------
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/courses');
                if (!res.ok) throw new Error("Failed to fetch courses data.");

                const courses = await res.json();
                setAllCourses(courses);

                // Initialize filter options from fetched data
                const uniqueDeps = [...new Set(courses.map(c => c.department))];
                const uniqueYears = [...new Set(courses.map(c => c.year))];
                const uniqueSems = [...new Set(courses.map(c => c.semester))];

                setOptions(prev => ({
                    ...prev,
                    deps: uniqueDeps,
                    years: uniqueYears,
                    sems: uniqueSems
                }));

            } catch (error) {
                console.error("Initial Course Fetch Error:", error);
                setStatusMessage({ type: 'error', text: `Failed to load initial data: ${error.message}` });
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCourses();
    }, []);

    // ----------------------------------------
    // CORE LOGIC: Filtering (Dependent on allCourses state)
    // ----------------------------------------
    useEffect(() => {
        const { dep, year, sem, course } = filters;

        // A. Filter Courses (Uses static filters to find matching courses in allCourses)
        if (dep && year && sem) {
            const filteredCourses = allCourses
                .filter(c => c.department === dep && c.year === year && c.semester === sem)
                .map(c => ({ _id: c._id, title: c.title, chapters: c.chapters })); // <-- Collects chapters here

            setOptions(prev => ({ ...prev, courses: filteredCourses }));
        } else {
            setOptions(prev => ({ ...prev, courses: [] }));
        }

        // B. Filter Chapters (Uses the selected course ID to find chapters)
        if (course) {
            // Find the full course object from allCourses
            const selectedCourse = allCourses.find(c => c._id === course);
            if (selectedCourse && selectedCourse.chapters) {
                // Map the chapter structure to the expected { _id, title } format for the selector
                const chapterOptions = selectedCourse.chapters.map(ch => ({ _id: ch._id, title: ch.title }));
                setOptions(prev => ({ ...prev, chapters: chapterOptions }));
            }
        } else {
            setOptions(prev => ({ ...prev, chapters: [] }));
        }

        // Clear notes when filters change significantly
        setChapterNotes([]);
        setEditingId(null);
        setEditedNote(null);
        setStatusMessage({ type: null, text: '' });

    }, [filters.dep, filters.year, filters.sem, filters.course, allCourses]);

    // Handler for Chapter Selector
    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };
            if (key === 'dep' || key === 'year' || key === 'sem') {
                newFilters.course = '';
                newFilters.chapter = '';
            }
            if (key === 'course') {
                newFilters.chapter = '';
            }
            return newFilters;
        });
        setStatusMessage({ type: null, text: '' });
    }, []);

    // ----------------------------------------
    // CORE LOGIC: Fetch Notes (Used by Edit/Delete Tab)
    // ----------------------------------------
    const fetchNotes = useCallback(async (chapterId) => {
        const { dep, year, sem, course } = filters;

        if (!chapterId || activeTab !== 'edit' || !dep || !year || !sem || !course) {
            setChapterNotes([]);
            return; // <-- This is where the unnecessary fetch is prevented now.
        }
        setLoadingNotes(true);
        setStatusMessage({ type: null, text: '' });
        setEditingId(null);
        setEditedNote(null);

        try {
            // Use the aggregated backend API route
            const url = `/api/notes/get?dep=${dep}&year=${year}&sem=${sem}`;
            const res = await fetch(url);

            if (!res.ok) throw new Error("Failed to fetch notes from the server.");

            // The API returns notes aggregated by course and chapter
            const aggregatedData = await res.json();
            let notesForChapter = [];

            // Find the notes specific to the selected chapterId
            for (const courseData of aggregatedData) {
                const chapterData = courseData.chapters.find(ch => ch.chapterId === chapterId);
                if (chapterData) {
                    notesForChapter = chapterData.notes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    break;
                }
            }

            setChapterNotes(notesForChapter);
            setStatusMessage({
                type: 'success',
                text: notesForChapter.length > 0 ? `Found ${notesForChapter.length} existing notes.` : 'No notes found for this chapter.'
            });
        } catch (error) {
            setStatusMessage({ type: 'error', text: `Error fetching notes: ${error.message}` });
        } finally {
            setLoadingNotes(false);
        }
    }, [activeTab, filters]);

    // Trigger fetch when chapter filter or active tab changes
    useEffect(() => {
        const { dep, year, sem, course, chapter } = filters;

        // 📌 FIX: Only fetch notes if the user is on the 'edit' tab AND all required filters are selected
        if (activeTab === 'edit' && dep && year && sem && course && chapter) {
            fetchNotes(chapter);
        } else if (activeTab === 'edit' && !chapter) {
            // Clear notes when the edit tab is active but no chapter is selected
            setChapterNotes([]);
        }
    }, [filters, activeTab, fetchNotes]);

    // ----------------------------------------
    // ADD NOTES TAB LOGIC (Using actual API structure)
    // ----------------------------------------

    const handleAddLink = () => {
        setNoteLinks(prev => [...prev, emptyNoteLink]);
    };

    const handleRemoveLink = (index) => {
        setNoteLinks(prev => prev.filter((_, i) => i !== index));
    };

    const handleNoteLinkChange = (index, key, value) => {
        setNoteLinks(prev => prev.map((item, i) =>
            i === index ? { ...item, [key]: value } : item
        ));
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();

        if (!filters.chapter) {
            setStatusMessage({ type: 'error', text: 'Please select a specific chapter before adding notes.' });
            return;
        }

        const validNotes = noteLinks.filter(note => note.noteTitle && note.downloadLink && note.fileType);

        if (validNotes.length === 0) {
            setStatusMessage({ type: 'error', text: 'Please add at least one complete note link.' });
            return;
        }

        setIsAdding(true);
        setStatusMessage({ type: null, text: '' });

        try {
            const courseDetail = options.courses.find(c => c._id === filters.course);
            const chapterDetail = options.chapters.find(ch => ch._id === filters.chapter);
            const { dep, year, sem } = filters;

            const notesData = validNotes.map(note => ({
                ...note,
                chapterId: filters.chapter,
                chapterTitle: chapterDetail.title,
                course: filters.course,
                courseTitle: courseDetail.title,
                department: dep,
                year: year,
                semester: sem,
            }));

            // --- ACTUAL API CALL: POST to /api/notes/add ---
            const res = await fetch('/api/notes/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notesData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to save notes on the server.');
            }
            // -----------------------------------------

            setStatusMessage({ type: 'success', text: `Successfully added ${validNotes.length} notes to ${chapterDetail.title}!` });
            setNoteLinks([emptyNoteLink]); // Reset form

        } catch (error) {
            setStatusMessage({ type: 'error', text: `Failed to save notes: ${error.message}` });
        } finally {
            setIsAdding(false);
        }
    };

    // ----------------------------------------
    // EDIT/DELETE NOTES TAB LOGIC
    // ----------------------------------------

    // 1. OPEN MODAL: Stages the note for deletion
    const handleOpenDeleteModal = (note) => {
        // Ensure no other edit operation is active
        handleCancelEdit();
        setNoteToDelete(note);
        setIsModalOpen(true);
        setStatusMessage({ type: null, text: '' });
    };

    // 2. CONFIRM DELETION: Executes the API call
    const handleConfirmDelete = async () => {
        const id = noteToDelete?._id;
        if (!id) return;

        setIsSavingEdit(true);
        setStatusMessage({ type: null, text: '' });

        try {
            // --- ACTUAL API CALL: DELETE to /api/notes/[id] ---
            const res = await fetch(`/api/notes/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to delete note on the server.');
            }

            // Remove the note from local state
            setChapterNotes(prev => prev.filter(n => n._id !== id));
            setStatusMessage({ type: 'success', text: `Note ID ${id} deleted successfully.` });

        } catch (error) {
            setStatusMessage({ type: 'error', text: `Deletion failed: ${error.message}` });
        } finally {
            // Clean up modal states
            setIsSavingEdit(false);
            setIsModalOpen(false);
            setNoteToDelete(null);
        }
    };

    // ... (Edit handlers remain the same)
    const handleStartEdit = (note) => {
        setEditingId(note._id);
        setEditedNote(note);
        setStatusMessage({ type: null, text: '' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditedNote(null);
    };

    const handleEditChange = (key, value) => {
        setEditedNote(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveNote = async () => {
        if (!editedNote.noteTitle || !editedNote.downloadLink) {
            setStatusMessage({ type: 'error', text: 'Note Title and Link cannot be empty.' });
            return;
        }

        setIsSavingEdit(true);
        setStatusMessage({ type: null, text: '' });

        try {
            // --- ACTUAL API CALL: PUT to /api/notes/[id] ---
            const res = await fetch(`/api/notes/${editedNote._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    noteTitle: editedNote.noteTitle,
                    downloadLink: editedNote.downloadLink,
                    fileType: editedNote.fileType,
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update note on the server.');
            }
            // -----------------------------------------

            // Update local state with the new note data
            setChapterNotes(prev =>
                prev.map(n => n._id === editedNote._id ? editedNote : n)
            );

            setStatusMessage({ type: 'success', text: `Note ID ${editedNote._id} updated successfully.` });
            handleCancelEdit();
        } catch (error) {
            setStatusMessage({ type: 'error', text: `Update failed: ${error.message}` });
        } finally {
            setIsSavingEdit(false);
        }
    };

    // ----------------------------------------
    // RENDER: Helper Functions
    // ----------------------------------------

    // Render function for a single note row in the Edit/Delete tab
    const renderNoteRow = (note) => {
        const isEditing = editingId === note._id;

        // ... (Edit mode rendering remains the same)
        if (isEditing) {
            return (
                <div key={note._id} className="grid grid-cols-1 md:grid-cols-10 gap-4 items-center p-4 border-b dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/50">
                    <div className="md:col-span-3">
                        <input
                            type="text"
                            value={editedNote.noteTitle}
                            onChange={(e) => handleEditChange('noteTitle', e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                        />
                    </div>
                    <div className="md:col-span-5">
                        <input
                            type="url"
                            value={editedNote.downloadLink}
                            onChange={(e) => handleEditChange('downloadLink', e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                        />
                    </div>
                    <div className="md:col-span-1 relative">
                        <select
                            value={editedNote.fileType}
                            onChange={(e) => handleEditChange('fileType', e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm appearance-none cursor-pointer"
                        >
                            <option value="pdf">PDF</option>
                            <option value="video">Video</option>
                            <option value="doc">DOC/PPT</option>
                            <option value="link">Link</option>
                            <option value="other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="md:col-span-1 flex space-x-2">
                        <button
                            type="button"
                            onClick={handleSaveNote}
                            disabled={isSavingEdit}
                            className="p-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                            aria-label="Save changes"
                        >
                            {isSavingEdit ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
                            aria-label="Cancel editing"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            );
        }
        // Normal (View) mode rendering
        return (
            <div key={note._id} className="grid grid-cols-1 md:grid-cols-10 gap-4 items-center p-4 border-b last:border-b-0 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm">
                <span className="md:col-span-3 font-medium truncate">{note.noteTitle}</span>
                <span className="md:col-span-5 text-gray-500 dark:text-gray-400 truncate">
                    <a href={note.downloadLink} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-500 dark:text-indigo-400">
                        {note.downloadLink}
                    </a>
                </span>
                <span className="md:col-span-1 text-xs uppercase px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-200 justify-self-start">
                    {note.fileType}
                </span>
                <div className="md:col-span-1 flex space-x-2 justify-end">
                    <button
                        onClick={() => handleStartEdit(note)}
                        className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                        aria-label={`Edit ${note.noteTitle}`}
                    >
                        <Pencil className="w-5 h-5" />
                    </button>
                    {/* CHANGED: Call modal opener */}
                    <button
                        onClick={() => handleOpenDeleteModal(note)}
                        className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        aria-label={`Delete ${note.noteTitle}`}
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    };

    // ----------------------------------------
    // RENDER: Main Component
    // ----------------------------------------

    const selectedChapterTitle = options.chapters.find(ch => ch._id === filters.chapter)?.title;
    const isChapterSelected = !!filters.chapter;

    return (
        <div className="p-4 md:p-8 min-h-dvh bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-extrabold mb-6 text-gray-800 dark:text-white">
                    Admin: Resource Notes Manager
                </h1>

                {/* Chapter Selector Panel */}
                <ChapterSelector
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    availableOptions={options}
                />

                {/* Current Selection Status */}
                <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg text-sm font-medium text-indigo-800 dark:text-indigo-200">
                    Target Chapter: {
                        selectedChapterTitle
                            ? <span className="font-bold">{selectedChapterTitle}</span>
                            : 'Please select a specific chapter above to manage notes.'
                    }
                </div>

                {/* Status Message (Global) */}
                {statusMessage.text && (
                    <div className={`mt-4 p-3 rounded-lg font-medium ${statusMessage.type === 'error'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        }`}>
                        {statusMessage.text}
                    </div>
                )}

                {/* ---------------------------------------- */}
                {/* TAB NAVIGATION */}
                {/* ---------------------------------------- */}
                <div className="flex space-x-4 mt-8 mb-6 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('add')}
                        className={`py-2 px-4 flex items-center font-medium transition-colors ${activeTab === 'add'
                            ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        disabled={loadingCourses}
                    >
                        <FilePlus className="w-5 h-5 mr-2" /> Add New Notes
                    </button>
                    <button
                        onClick={() => setActiveTab('edit')}
                        className={`py-2 px-4 flex items-center font-medium transition-colors ${activeTab === 'edit'
                            ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        disabled={loadingCourses}
                    >
                        <ListChecks className="w-5 h-5 mr-2" /> Edit/Delete Existing Notes
                    </button>
                </div>

                {/* ---------------------------------------- */}
                {/* TAB CONTENT: ADD NOTES */}
                {/* ---------------------------------------- */}
                {activeTab === 'add' && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                            Add New Notes for {selectedChapterTitle || 'Selected Chapter'}
                        </h2>

                        <form onSubmit={handleAddSubmit}>
                            <div className="space-y-4 mb-6">
                                {noteLinks.map((link, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-10 gap-4 items-center p-3 border rounded-lg dark:border-gray-700">
                                        <div className="md:col-span-3">
                                            <input
                                                type="text"
                                                placeholder="Note Title (e.g., Chapter 5 Summary PDF)"
                                                value={link.noteTitle}
                                                onChange={(e) => handleNoteLinkChange(index, 'noteTitle', e.target.value)}
                                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-5">
                                            <input
                                                type="url"
                                                placeholder="Download/External Link (e.g., https://storage.com/file.pdf)"
                                                value={link.downloadLink}
                                                onChange={(e) => handleNoteLinkChange(index, 'downloadLink', e.target.value)}
                                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-1 relative">
                                            <select
                                                value={link.fileType}
                                                onChange={(e) => handleNoteLinkChange(index, 'fileType', e.target.value)}
                                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm appearance-none cursor-pointer"
                                                required
                                            >
                                                <option value="pdf">PDF</option>
                                                <option value="video">Video</option>
                                                <option value="doc">DOC/PPT</option>
                                                <option value="link">Link</option>
                                                <option value="other">Other</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <div className="md:col-span-1 flex justify-end">
                                            {noteLinks.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveLink(index)}
                                                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                                    aria-label="Remove link"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={handleAddLink}
                                    className="flex items-center px-4 py-2 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors disabled:opacity-50"
                                    disabled={!isChapterSelected || isAdding}
                                >
                                    <Plus className="w-5 h-5 mr-2" /> Add Another Link
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                                    disabled={!isChapterSelected || isAdding || noteLinks.length === 0}
                                >
                                    {isAdding ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                                    Save {noteLinks.length} Note(s)
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ---------------------------------------- */}
                {/* TAB CONTENT: EDIT/DELETE NOTES */}
                {/* ---------------------------------------- */}
                {activeTab === 'edit' && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center justify-between">
                            Existing Notes
                            {isChapterSelected && (
                                <button
                                    onClick={() => fetchNotes(filters.chapter)}
                                    className="flex items-center px-3 py-1 text-sm text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors disabled:opacity-50"
                                    disabled={loadingNotes}
                                >
                                    {loadingNotes ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-1" />}
                                    Refresh
                                </button>
                            )}
                        </h2>

                        {!isChapterSelected && (
                            <p className="text-gray-500 dark:text-gray-400">Select a chapter to view its notes.</p>
                        )}

                        {isChapterSelected && loadingNotes && (
                            <div className="flex items-center justify-center p-8 text-indigo-600 dark:text-indigo-400">
                                <Loader2 className="w-6 h-6 animate-spin mr-3" /> Fetching notes...
                            </div>
                        )}

                        {isChapterSelected && !loadingNotes && chapterNotes.length === 0 && (
                            <p className="text-gray-500 dark:text-gray-400 p-4 border rounded-lg">No notes have been added for this chapter yet.</p>
                        )}

                        {isChapterSelected && !loadingNotes && chapterNotes.length > 0 && (
                            <div className="border rounded-xl overflow-hidden dark:border-gray-700">
                                {/* Header Row */}
                                <div className="grid grid-cols-1 md:grid-cols-10 gap-4 items-center p-4 bg-gray-50 dark:bg-gray-700/50 font-bold text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-700">
                                    <span className="md:col-span-3">Title</span>
                                    <span className="md:col-span-5">Link</span>
                                    <span className="md:col-span-1">Type</span>
                                    <span className="md:col-span-1 text-right">Actions</span>
                                </div>

                                {/* Notes Rows */}
                                {chapterNotes.map(renderNoteRow)}
                            </div>
                        )}

                    </div>
                )}

            </div> {/* closing div for max-w-6xl mx-auto */}

            {/* MODAL COMPONENT INTEGRATION */}
            {noteToDelete && (
                <DeleteConfirmationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmDelete} // The actual API call handler
                    noteTitle={noteToDelete.noteTitle}
                    noteId={noteToDelete._id}
                    imageSrc={noteToDelete.downloadLink} // Passes the link for display/preview
                    isDeleting={isSavingEdit} // Reuse isSavingEdit for the deletion loader
                />
            )}

        </div> // closing div for p-4 md:p-8 min-h-dvh
    );
}