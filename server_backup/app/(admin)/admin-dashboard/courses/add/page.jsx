// src/app/(student)/courses/add/page.jsx

"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, XCircle, BookOpen, Layers, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

// 💡 NEW: Import the custom LoadingButton component
import LoadingButton from '@/components/ui/LoadingButton';
// 💡 We need the Framer motion component for the small buttons' animation
import { motion } from "framer-motion"; 

// --- Initial State and Options (No Change) ---
const initialModule = { title: '', content: '', image: '' };
const initialChapter = { title: '', modules: [initialModule] };
const initialCourseState = {
    title: '',
    description: '',
    image: '',
    duration: '',
    startDate: '',
    endDate: '',
    fullInfo: '',
    department: 'CS',
    year: 'FY',
    semester: 'SEM1',
    chapters: [initialChapter],
};
const departmentOptions = ["CS", "IT", "DS"];
const yearOptions = ["FY", "SY", "TY"];
const semesterOptions = ["SEM1", "SEM2"];

// --- Helper Components (Updated to use native button/motion.button) ---

// Base styling for form elements (enhanced dark/light contrast)
const baseClasses = "p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 w-full shadow-sm";
const labelClasses = "text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const fieldContainerClasses = "flex flex-col";

const Input = ({ label, name, value, onChange, type = 'text', required = false, className = '', placeholder = '' }) => (
    <div className={`${fieldContainerClasses} ${className}`}>
        <label htmlFor={name} className={labelClasses}>
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className={baseClasses}
        />
    </div>
);

const Textarea = ({ label, name, value, onChange, required = false, className = '', placeholder = '' }) => (
    <div className={`${fieldContainerClasses} ${className}`}>
        <label htmlFor={name} className={labelClasses}>
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            rows={4}
            className={`${baseClasses} resize-y`}
        />
    </div>
);

const SelectInput = ({ label, name, value, onChange, options, required = false, className = '' }) => (
    <div className={`${fieldContainerClasses} ${className}`}>
        <label htmlFor={name} className={labelClasses}>
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={baseClasses}
        >
            {options.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);

// Simplified Button helper for non-submission actions
const ActionButton = ({ children, onClick, type = 'button', variant = 'primary', icon, className = '', disabled = false }) => {
    let style = '';
    switch (variant) {
        case 'primary':
            style = 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
            break;
        case 'danger':
            style = 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            break;
        case 'secondary':
            style = 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500';
            break;
        default:
            style = 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
    }

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center text-sm font-semibold text-white px-4 py-2 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-md ${style} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {icon}
            {children}
        </motion.button>
    );
};


// --- Main Component ---

const AddCoursePage = () => {
    const [courseData, setCourseData] = useState(initialCourseState);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // --- Handlers (Logic kept the same) ---
    const handleCourseChange = useCallback((e) => {
        const { name, value } = e.target;
        setCourseData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleChapterChange = useCallback((index, e) => {
        const { name, value } = e.target;
        const newChapters = [...courseData.chapters];
        newChapters[index] = { ...newChapters[index], [name]: value };
        setCourseData(prev => ({ ...prev, chapters: newChapters }));
    }, [courseData.chapters]);

    const addChapter = useCallback(() => {
        setCourseData(prev => ({
            ...prev,
            chapters: [...prev.chapters, initialChapter]
        }));
    }, []);

    const removeChapter = useCallback((index) => {
        if (courseData.chapters.length > 1) {
            const newChapters = courseData.chapters.filter((_, i) => i !== index);
            setCourseData(prev => ({ ...prev, chapters: newChapters }));
        } else {
            toast.error("A course must have at least one chapter.");
        }
    }, [courseData.chapters]);

    const handleModuleChange = useCallback((chapIndex, modIndex, e) => {
        const { name, value } = e.target;
        const newChapters = [...courseData.chapters];
        const newModules = [...newChapters[chapIndex].modules];
        newModules[modIndex] = { ...newModules[modIndex], [name]: value };
        newChapters[chapIndex] = { ...newChapters[chapIndex], modules: newModules };
        setCourseData(prev => ({ ...prev, chapters: newChapters }));
    }, [courseData.chapters]);

    const addModule = useCallback((chapIndex) => {
        const newChapters = [...courseData.chapters];
        newChapters[chapIndex].modules.push(initialModule);
        setCourseData(prev => ({ ...prev, chapters: newChapters }));
    }, [courseData.chapters]);

    const removeModule = useCallback((chapIndex, modIndex) => {
        const newChapters = [...courseData.chapters];
        if (newChapters[chapIndex].modules.length > 1) {
            const newModules = newChapters[chapIndex].modules.filter((_, i) => i !== modIndex);
            newChapters[chapIndex].modules = newModules;
            setCourseData(prev => ({ ...prev, chapters: newChapters }));
        } else {
            toast.error("A chapter must have at least one module.");
        }
    }, [courseData.chapters]);


    // --- Submission Handler (Logic kept the same) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const requiredFields = ['title', 'description', 'image', 'duration', 'startDate', 'endDate'];
        for (const field of requiredFields) {
            if (!courseData[field]) {
                toast.error(`The '${field}' field is required.`);
                setIsLoading(false);
                return;
            }
        }
        
        const invalidChapter = courseData.chapters.some(ch => !ch.title.trim());
        if (invalidChapter) {
            toast.error("All chapters must have a title.");
            setIsLoading(false);
            return;
        }

        const invalidModule = courseData.chapters.some(ch => 
            ch.modules.some(mod => !mod.title.trim() || !mod.content.trim())
        );
        if (invalidModule) {
            toast.error("All modules must have a title and content.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courseData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create course.');
            }

            const newCourse = await response.json();
            toast.success('Course created successfully! 🎉');
            router.push(`/courses/${newCourse._id}`); 
        } catch (error) {
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300"> 
            <div className="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-indigo-400 mb-8 border-b-4 border-indigo-200 dark:border-indigo-600 pb-4">
                    📚 Create New Course
                </h1>
                
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* General Course Information */}
                    <section className="bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl p-8 border-t-8 border-indigo-600">
                        <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-6 flex items-center">
                            <BookOpen className="w-6 h-6 mr-3 text-indigo-500" /> Course Essentials
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Title" name="title" value={courseData.title} onChange={handleCourseChange} required />
                            <Input label="Duration" name="duration" value={courseData.duration} onChange={handleCourseChange} placeholder="e.g., 8 Weeks, 40 Hrs" required />
                            <Input label="Start Date" name="startDate" type="date" value={courseData.startDate} onChange={handleCourseChange} required />
                            <Input label="End Date" name="endDate" type="date" value={courseData.endDate} onChange={handleCourseChange} required />
                            <Input label="Image URL" name="image" value={courseData.image} onChange={handleCourseChange} placeholder="e.g., https://unsplash.com/course-cover.jpg" className="md:col-span-2" required />
                            <Textarea label="Short Description" name="description" value={courseData.description} onChange={handleCourseChange} required className="md:col-span-2" placeholder="A compelling summary of the course." />
                            <Textarea label="Full Information (Syllabus/Details)" name="fullInfo" value={courseData.fullInfo} onChange={handleCourseChange} className="md:col-span-2" placeholder="Detailed syllabus, prerequisites, and outcomes." />
                        </div>
                    </section>

                    {/* Categorization */}
                    <section className="bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl p-8 border-t-8 border-green-600">
                        <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-6 flex items-center">
                            <Layers className="w-6 h-6 mr-3 text-green-500" /> Categorization
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <SelectInput label="Department" name="department" value={courseData.department} onChange={handleCourseChange} options={departmentOptions} />
                            <SelectInput label="Year" name="year" value={courseData.year} onChange={handleCourseChange} options={yearOptions} />
                            <SelectInput label="Semester" name="semester" value={courseData.semester} onChange={handleCourseChange} options={semesterOptions} />
                        </div>
                    </section>
                    
                    {/* Chapters and Modules */}
                    <section className="bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl p-8 border-t-8 border-blue-600">
                        <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-3">
                            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 flex items-center">
                                <Zap className="w-6 h-6 mr-3 text-blue-500" /> Course Structure
                            </h2>
                            <ActionButton onClick={addChapter} type="button" variant="primary" icon={<PlusCircle className="w-4 h-4 mr-1" />}>
                                Add Chapter
                            </ActionButton>
                        </div>

                        <div className="space-y-8">
                            {courseData.chapters.map((chapter, chapIndex) => (
                                <div key={chapIndex} className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 shadow-md">
                                    <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-300 dark:border-gray-600">
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Chapter {chapIndex + 1}</h3>
                                        
                                        <ActionButton 
                                            onClick={() => removeChapter(chapIndex)} 
                                            type="button" 
                                            variant="danger" 
                                            icon={<XCircle className="w-4 h-4" />}
                                            className="w-8 h-8 p-0"
                                            aria-label={`Remove Chapter ${chapIndex + 1}`}
                                        />
                                    </div>
                                    
                                    <Input
                                        label="Chapter Title"
                                        name="title"
                                        value={chapter.title}
                                        onChange={(e) => handleChapterChange(chapIndex, e)}
                                        placeholder="e.g., Core Concepts"
                                        required
                                        className="mb-6"
                                    />
                                    
                                    {/* Modules container - distinct background */}
                                    <div className="mt-6 space-y-4 p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-gray-900/40"> 
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Modules ({chapter.modules.length})</h4>
                                            <ActionButton onClick={() => addModule(chapIndex)} type="button" variant="secondary" icon={<PlusCircle className="w-4 h-4 mr-1" />}>
                                                Add Module
                                            </ActionButton>
                                        </div>

                                        {chapter.modules.map((module, modIndex) => (
                                            // Module Card - Highly distinct, using indigo accent
                                            <div key={modIndex} className="p-4 border-l-4 border-indigo-400 dark:border-indigo-600 rounded-lg bg-indigo-50 dark:bg-gray-900 shadow-md relative">
                                                <h5 className="text-md font-bold text-indigo-700 dark:text-indigo-400 mb-3">Module {modIndex + 1}</h5>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    <Input
                                                        label="Title"
                                                        name="title"
                                                        value={module.title}
                                                        onChange={(e) => handleModuleChange(chapIndex, modIndex, e)}
                                                        required
                                                    />
                                                    <Input
                                                        label="Image URL (Optional)"
                                                        name="image"
                                                        value={module.image}
                                                        onChange={(e) => handleModuleChange(chapIndex, modIndex, e)}
                                                        className="sm:col-span-2"
                                                    />
                                                    <Textarea
                                                        label="Content"
                                                        name="content"
                                                        value={module.content}
                                                        onChange={(e) => handleModuleChange(chapIndex, modIndex, e)}
                                                        required
                                                        className="sm:col-span-3"
                                                        placeholder="Detailed content for this module."
                                                    />
                                                </div>
                                                
                                                <div className="absolute top-2 right-2">
                                                    <ActionButton 
                                                        onClick={() => removeModule(chapIndex, modIndex)} 
                                                        type="button" 
                                                        variant="danger" 
                                                        icon={<XCircle className="w-4 h-4" />}
                                                        className="w-7 h-7 p-0"
                                                        aria-label={`Remove Module ${modIndex + 1}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Submission Button - 💡 USING THE CUSTOM LOADING BUTTON */}
                    <LoadingButton 
                        type="submit" 
                        loading={isLoading} // The prop name must be 'loading'
                        className="w-full h-14 text-xl tracking-wider uppercase font-extrabold shadow-indigo-500/50"
                    >
                        Submit Course for Review
                    </LoadingButton>
                </form>
            </div>
        </div>
    );
};

export default AddCoursePage;