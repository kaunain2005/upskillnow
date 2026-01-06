import React from 'react';
import { ChevronDown, BookOpen, List, Folder } from 'lucide-react';

/**
 * Component for selecting a specific Chapter via a dependent, multi-level dropdown hierarchy.
 * @param {object} props
 * @param {object} props.filters - Object containing current filter values {dep, year, sem, course, chapter}.
 * @param {function} props.onFilterChange - Handler to update a specific filter value (key, value).
 * @param {object} props.availableOptions - Object containing dependent options.
 * @param {Array<string>} props.availableOptions.deps
 * @param {Array<string>} props.availableOptions.years
 * @param {Array<string>} props.availableOptions.sems
 * @param {Array<{_id: string, title: string, chapters: ...}>} props.availableOptions.courses - Courses for selected dep/year/sem.
 * @param {Array<{_id: string, title: string}>} props.availableOptions.chapters - Chapters for selected course.
 */
const ChapterSelector = ({ filters, onFilterChange, availableOptions }) => {

    const baseInputClasses = "w-full pl-3 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition duration-150 text-sm appearance-none cursor-pointer";

    // Define all filters in order, including their disabled logic and icon
    const allFilters = [
        { key: 'dep', label: 'Department', options: availableOptions.deps, icon: Folder, disabled: false },
        { key: 'year', label: 'Year', options: availableOptions.years, icon: List, disabled: false },
        { key: 'sem', label: 'Semester', options: availableOptions.sems, icon: List, disabled: false },
        {
            key: 'course',
            label: 'Course',
            options: availableOptions.courses,
            icon: BookOpen,
            // Disable until dep, year, sem are selected
            disabled: !filters.dep || !filters.year || !filters.sem
        },
        {
            key: 'chapter',
            label: 'Chapter',
            options: availableOptions.chapters, // <-- This is correctly populated by the parent component
            icon: BookOpen, // Use BookOpen for the final selection (chapter)
            // Disable until a course is selected
            disabled: !filters.course
        },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-t-4 border-indigo-500">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Select Target Chapter
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

                {allFilters.map(({ key, label, options, icon: Icon, disabled }) => (
                    <div key={key} className="relative">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                            {label}
                        </label>
                        <select
                            value={filters[key]}
                            onChange={(e) => onFilterChange(key, e.target.value)}
                            className={`${baseInputClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={disabled}
                            aria-label={`Select ${label}`}
                        >
                            <option value="">-- Select {label} --</option>
                            {/* Renders options correctly for both string arrays (dep, year, sem) and object arrays (course, chapter) */}
                            {options.map(option => {
                                // Handles both primitive strings and objects with _id/title
                                const value = option._id || option;
                                const display = option.title || option;
                                return (
                                    <option
                                        key={value}
                                        value={value}
                                    >
                                        {display}
                                    </option>
                                );
                            })}
                        </select>
                        {/* Chevron Icon for visual dropdown cue */}
                        <ChevronDown className="absolute right-3 top-1/2 mt-3 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400 dark:text-gray-500" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChapterSelector;