// components/Analytics/CourseAnalytics.jsx
import React from 'react';
import { FiBookOpen, FiStar, FiClock, FiArrowLeft } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// --- Mock Data and Config ---
const courseProgressData = {
    labels: ['Python', 'DSA', 'MERN Stack', 'DevOps', 'AI/ML'],
    datasets: [
        {
            label: 'Completion Rate (%)',
            data: [75, 55, 88, 60, 45],
            borderColor: '#4f46e5', // Indigo-600
            backgroundColor: 'rgba(79, 70, 229, 0.5)',
            yAxisID: 'y1',
        },
        {
            label: 'Average Rating (0-5)',
            data: [4.8, 4.1, 4.9, 4.5, 4.3],
            borderColor: '#10b981', // Emerald-500
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            yAxisID: 'y2',
        },
    ],
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    plugins: {
        legend: {
            position: 'top',
            labels: {
                color: '#6b7280',
            },
        },
        title: {
            display: false,
        },
    },
    scales: {
        y1: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
                display: true,
                text: 'Completion (%)',
                color: '#4f46e5',
            },
            ticks: { color: '#6b7280' },
            grid: { color: 'rgba(107, 114, 128, 0.2)' },
        },
        y2: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
                display: true,
                text: 'Rating (0-5)',
                color: '#10b981',
            },
            min: 0,
            max: 5,
            ticks: { color: '#6b7280' },
            grid: { drawOnChartArea: false }, // Only draw grid lines for the first Y axis
        },
        x: {
            ticks: { color: '#6b7280' },
            grid: { color: 'rgba(107, 114, 128, 0.2)' },
        }
    },
};

// --- Component ---
const CourseAnalytics = ({ totalCourses, goBack }) => {
    return (
        <div className="space-y-8">
            {/* Back Button */}
            <button
                onClick={goBack}
                className="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 transition-colors"
            >
                <FiArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard Overview
            </button>

            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center">
                <FiBookOpen className="mr-3 text-indigo-500" /> Course Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Active Courses</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{totalCourses || "N/A"}</p>
                </div>
                <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        <FiStar className="mr-1" /> Average Course Rating
                    </p>
                    <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">4.7 / 5.0</p>
                </div>
                <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        <FiClock className="mr-1" /> Most Popular Duration
                    </p>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">4 Weeks</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 min-h-96">
                    <h3 className="font-bold text-lg mb-4 text-indigo-600 dark:text-indigo-400">Course Completion and Rating Comparison</h3>
                    <div className='h-80'>
                        <Line data={courseProgressData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseAnalytics;