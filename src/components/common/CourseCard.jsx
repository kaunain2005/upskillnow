// src/components/cards/CourseCard.jsx

import React from 'react';
import { Trash2, Edit, BookOpen, Clock, Calendar, Layers, Hash } from 'lucide-react';

/**
 * Reusable component to display a single Course item with conditional action buttons.
 * @param {object} props
 * @param {object} props.course - The course data object.
 * @param {boolean} props.showDeleteButton - Whether to display the Delete button.
 * @param {boolean} props.showUpdateButton - Whether to display the Update button.
 * @param {function} props.onDelete - Handler for the delete action.
 * @param {function} props.onUpdate - Handler for the update action (navigates/opens modal).
 */
const CourseCard = ({ course, showDeleteButton, showUpdateButton, onDelete, onUpdate }) => {
    const { _id, title, description, duration, startDate, endDate, department, year, semester, chapters } = course;

    // Format dates nicely
    const formattedStartDate = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedEndDate = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const numChapters = chapters ? chapters.length : 0;
    const showActions = showUpdateButton || showDeleteButton;

    return (
        // Enhanced card styling: Deeper shadow, transition effect, and a striking top border
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden border-t-8 border-indigo-600 dark:border-indigo-500 h-full">

            {/* Course Details Section */}
            <div className="p-6">
                
                {/* Title and ID */}
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-50 mb-1 line-clamp-2">
                    {title}
                </h3>
                <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mb-4">
                    <Hash className="w-3 h-3 mr-1" />
                    <span className="font-mono">{_id}</span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                    {description}
                </p>

                {/* Metadata Section - Structured and elevated */}
                <div className="grid grid-cols-2 gap-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-700">
                    
                    {/* Category */}
                    <div className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 border-r dark:border-gray-600 pr-4">
                        <Layers className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="truncate">{department} ({year}/{semester})</span>
                    </div>

                    {/* Chapters */}
                    <div className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 pl-4">
                        <BookOpen className="w-4 h-4 mr-2 text-green-500" />
                        <span>{numChapters} Chapters</span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 border-r dark:border-gray-600 pr-4">
                        <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                        <span>{duration}</span>
                    </div>

                    {/* Dates */}
                    <div className="flex flex-col text-xs text-gray-600 dark:text-gray-300 pl-4">
                        <div className='flex items-center mb-1'>
                            <Calendar className="w-4 h-4 mr-2 text-pink-500" />
                            <span className="font-medium">Starts: {formattedStartDate}</span>
                        </div>
                        <div className='flex items-center'>
                             <Calendar className="w-4 h-4 mr-2 text-pink-500 opacity-0" /> {/* Spacer */}
                            <span className="font-medium">Ends: {formattedEndDate}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons (Sticky at bottom) */}
            {showActions && (
                <div className="w-full flex p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 space-x-3">
                    
                    {showUpdateButton && (
                        <button
                            onClick={() => onUpdate(_id)}
                            className="flex items-center justify-center p-3 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-200 shadow-lg shadow-indigo-500/50 w-full"
                            aria-label={`Update course: ${title}`}
                        >
                            <Edit className="w-4 h-4 mr-2" /> Update Course
                        </button>
                    )}
                    
                    {showDeleteButton && (
                        <button
                            onClick={() => onDelete(_id)}
                            className="flex items-center justify-center p-3 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200 shadow-lg shadow-red-500/50 w-full"
                            aria-label={`Delete course: ${title}`}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CourseCard;