// components/Analytics/QuizAnalytics.jsx
import React from 'react';
import { FiClipboard, FiCheckCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi';
import { Line } from 'react-chartjs-2'; // Line chart can render area charts with fill property
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- Mock Data and Config ---
const quizAttemptsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
        {
            label: 'Attempts',
            data: [50, 65, 40, 80, 120, 90, 70],
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.4)', // Area fill color
            fill: true,
            tension: 0.4,
            yAxisID: 'y1',
        },
        {
            label: 'Avg. Score',
            data: [75, 78, 82, 70, 85, 79, 72],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.4)',
            fill: false, // Don't fill the score line
            tension: 0.4,
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
    },
    scales: {
        y1: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'Attempts', color: '#4f46e5' },
            ticks: { color: '#6b7280' },
            grid: { color: 'rgba(107, 114, 128, 0.2)' },
        },
        y2: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Score (%)', color: '#10b981' },
            min: 0,
            max: 100,
            ticks: { color: '#6b7280' },
            grid: { drawOnChartArea: false },
        },
        x: {
            ticks: { color: '#6b7280' },
            grid: { color: 'rgba(107, 114, 128, 0.2)' },
        }
    },
};

// --- Component ---
const QuizAnalytics = ({ totalQuizzes, goBack }) => {
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
                <FiClipboard className="mr-3 text-indigo-500" /> Quiz Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Quizzes Created</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{totalQuizzes || "N/A"}</p>
                </div>
                <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        <FiCheckCircle className="mr-1" /> Avg. Pass Rate
                    </p>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">78%</p>
                </div>
                <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        <FiXCircle className="mr-1" /> Most Failed Quiz
                    </p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-2 truncate">Python Chapter 1</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 min-h-96">
                    <h3 className="font-bold text-lg mb-4 text-indigo-600 dark:text-indigo-400">Weekly Quiz Attempts and Average Score</h3>
                    <div className='h-80'>
                        <Line data={quizAttemptsData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizAnalytics;