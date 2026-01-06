// src/components/search/SearchPannel.jsx

import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

/**
 * Reusable component for searching and filtering the course list with multiple dynamic dropdowns.
 * @param {object} props
 * @param {string} props.searchTerm - Search input value.
 * @param {function} props.onSearchChange - Handler for search input.
 * @param {object} props.filters - Object containing current filter values {dep, year, sem}.
 * @param {function} props.onFilterChange - Handler to update a specific filter value.
 * @param {object} props.availableOptions - Object containing arrays of unique available options {deps, years, sems}.
 */
const SearchPannel = ({ searchTerm, onSearchChange, filters, onFilterChange, availableOptions }) => {

    // Course model does not have 'chapter' as a filter field, so we adjust the map.
    const filterMaps = [
        { key: 'dep', label: 'Department', options: availableOptions.deps },
        { key: 'year', label: 'Year', options: availableOptions.years },
        { key: 'sem', label: 'Semester', options: availableOptions.sems },
    ];

    const baseInputClasses = "w-full pl-3 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition duration-150";

    return (
        <div
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg flex flex-col gap-4 border-t-4 border-indigo-400"
        >
            {/* Search Input */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                    type="text"
                    placeholder="Search by Course Title or Description..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={`${baseInputClasses} pl-10 dark:placeholder:text-gray-500`}
                    aria-label="Search courses"
                />
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filterMaps.map(({ key, label, options }) => (
                    <div key={key} className="relative">
                        <select
                            value={filters[key]}
                            onChange={(e) => onFilterChange(key, e.target.value)}
                            className={`${baseInputClasses} appearance-none cursor-pointer text-sm`}
                            aria-label={`Filter by ${label}`}
                        >
                            <option value="all">All {label}s</option>
                            {options.map(option => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400 dark:text-gray-500"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchPannel;