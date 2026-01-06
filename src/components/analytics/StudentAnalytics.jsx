// components/Analytics/StudentAnalytics.jsx
import React from 'react';
import { FiUsers, FiCalendar, FiTrendingUp, FiArrowLeft } from 'react-icons/fi';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// --- Mock Data and Config ---

const enrollmentData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
        {
            label: 'Enrollments',
            data: [4000, 3000, 2000, 2780, 1890, 2390],
            backgroundColor: 'rgba(79, 70, 229, 0.8)', // Indigo-600
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 1,
        },
    ],
};

const departmentData = {
    labels: ['CS', 'IT', 'ECE', 'Mech'],
    datasets: [
        {
            label: 'Students',
            data: [5000, 3000, 2000, 1500],
            backgroundColor: ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b'],
            hoverOffset: 4,
        },
    ],
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                color: '#6b7280', // Tailwind gray-500
            },
        },
        title: {
            display: false,
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                color: '#6b7280',
            },
            grid: {
                color: 'rgba(107, 114, 128, 0.2)', // Light gray grid
            },
        },
        x: {
            ticks: {
                color: '#6b7280',
            },
            grid: {
                color: 'rgba(107, 114, 128, 0.2)',
            },
        },
    },
};

// --- Component ---
const StudentAnalytics = ({ totalStudents, goBack }) => {
    return (
        <div className="space-y-8">
            <button
                onClick={goBack}
                className="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 transition-colors"
            >
                <FiArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard Overview
            </button>

            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center">
                <FiUsers className="mr-3 text-indigo-500" /> Student Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{totalStudents || "N/A"}</p>
                </div>
                <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        <FiTrendingUp className="mr-1" /> New Signups (Last 30 Days)
                    </p>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">+ 1,250</p>
                </div>
                <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        <FiCalendar className="mr-1" /> Retention Rate
                    </p>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">85%</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Enrollment Trend - Bar Chart */}
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 min-h-96">
                    <h3 className="font-bold text-lg mb-4 text-indigo-600 dark:text-indigo-400">Enrollment Trend (Monthly)</h3>
                    <div className='h-80'>
                        <Bar data={enrollmentData} options={chartOptions} />
                    </div>
                </div>

                {/* Students by Department - Doughnut Chart */}
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 min-h-96 flex flex-col items-center">
                    <h3 className="font-bold text-lg mb-4 text-indigo-600 dark:text-indigo-400">Students by Department</h3>
                    <div className='h-72 w-72 mt-4'>
                        <Doughnut data={departmentData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudentAnalytics;