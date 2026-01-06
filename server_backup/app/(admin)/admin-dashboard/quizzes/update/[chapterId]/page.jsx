// src/app/(admin)/admin-dashboard/quizzes/update/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft, Loader2, Save, X, Plus, Trash2, CheckCircle, Edit3, AlertTriangle
} from 'lucide-react';

// --- CONFIGURATION & MOCK DATA ---

// This mock hook simulates fetching the 'chapterId' from the URL (e.g., /update/68db1ad02971a07f55abd740)
const useMockParams = () => {
    // In a real Next.js App Router environment, you would use:
    // const params = useParams(); return { chapterId: params.chapterId };
    // We'll hardcode a mock ID to ensure the component loads data.
    return { chapterId: "68db1ad02971a07f55abd740" };
};

// Mock Quiz Data (Based on your provided structure)
const MOCK_QUIZ_DATA = {
    chapterId: "68db1ad02971a07f55abd740",
    title: "Array Basics Quiz",
    description: "Test your knowledge on array fundamentals.",
    type: "general",
    duration: 20,
    questions: [
        {
            question: "Arrays are stored at...?",
            options: ["Random locations", "Contiguous memory locations", "Heap memory", "Stack memory"],
            correctAnswer: 1,
            _id: "68dcdc6b9972508edd631d89"
        },
        {
            question: "Array indexes typically start from?",
            options: ["1", "0", "-1", "Any number"],
            correctAnswer: 1,
            _id: "68dcdc6b9972508edd631d8a"
        }
    ],
    numQuestions: 2,
    _id: "68dcdc6b9972508edd631d88",
};

// --- UTILITY COMPONENTS ---

/**
 * Custom Confirmation/Status Modal (replaces window.alert/confirm)
 */
const ConfirmationModal = ({ message, type, onClose }) => {
    const icon = type === 'success' ? <CheckCircle className="w-8 h-8 text-green-500" /> :
        type === 'error' ? <AlertTriangle className="w-8 h-8 text-red-500" /> :
            <AlertTriangle className="w-8 h-8 text-yellow-500" />;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100">
                <div className="flex flex-col items-center space-y-4">
                    {icon}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">{message}</h3>
                    <button
                        onClick={onClose}
                        className="w-full py-2 px-4 rounded-xl text-white font-medium transition duration-150 shadow-md bg-blue-600 hover:bg-blue-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Component for editing a single question within the quiz.
 */
const QuizQuestionEditor = ({ question, index, updateQuestion, deleteQuestion }) => {
    const handleQuestionChange = (e) => {
        updateQuestion(index, { ...question, question: e.target.value });
    };

    const handleOptionChange = (optionIndex, e) => {
        const newOptions = question.options.map((opt, i) =>
            i === optionIndex ? e.target.value : opt
        );
        updateQuestion(index, { ...question, options: newOptions });
    };

    const handleCorrectAnswerChange = (optionIndex) => {
        updateQuestion(index, { ...question, correctAnswer: optionIndex });
    };

    const addOption = () => {
        const newOptions = [...question.options, `New Option ${question.options.length + 1}`];
        updateQuestion(index, { ...question, options: newOptions });
    };

    const deleteOption = (optionIndex) => {
        if (question.options.length <= 2) return; // Must have at least two options
        const newOptions = question.options.filter((_, i) => i !== optionIndex);
        // If the correct answer was deleted, reset it.
        const newCorrectAnswer = question.correctAnswer === optionIndex
            ? 0
            : (question.correctAnswer > optionIndex ? question.correctAnswer - 1 : question.correctAnswer);

        updateQuestion(index, { ...question, options: newOptions, correctAnswer: newCorrectAnswer });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b pb-3 mb-3 border-gray-100 dark:border-gray-700">
                <h4 className="text-xl font-bold text-gray-700 dark:text-gray-200">
                    Question {index + 1}
                </h4>
                <button
                    onClick={() => deleteQuestion(index)}
                    className="text-red-500 hover:text-red-600 transition duration-150 p-2 rounded-full hover:bg-red-50/50"
                    aria-label={`Delete Question ${index + 1}`}
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Question Textarea */}
            <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Question Text</span>
                <textarea
                    value={question.question}
                    onChange={handleQuestionChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none transition duration-150"
                    placeholder="Enter the quiz question here..."
                />
            </label>

            {/* Options List */}
            <div className="space-y-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 block">Options (Select the correct one)</span>
                {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name={`correct-q-${index}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => handleCorrectAnswerChange(optionIndex)}
                            className="text-blue-500 focus:ring-blue-500 h-5 w-5 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                        />
                        <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(optionIndex, e)}
                            className={`flex-grow p-2 border rounded-lg dark:bg-gray-700 dark:text-white transition duration-150 ${question.correctAnswer === optionIndex
                                    ? 'border-green-400 ring-1 ring-green-400'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                            placeholder={`Option ${optionIndex + 1}`}
                        />
                        <button
                            onClick={() => deleteOption(optionIndex)}
                            disabled={question.options.length <= 2}
                            className={`p-2 rounded-full transition duration-150 ${question.options.length <= 2
                                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                    : 'text-red-500 hover:bg-red-50/50 hover:text-red-600'
                                }`}
                            aria-label={`Delete Option ${optionIndex + 1}`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addOption}
                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition duration-150 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700"
            >
                <Plus className="w-4 h-4 mr-1" /> Add Option
            </button>
        </div>
    );
};

// --- MAIN COMPONENT ---

/**
 * Quiz Update Page component for editing existing quiz data.
 */
const QuizUpdatePage = () => {
    const router = useRouter();
    const { chapterId } = useMockParams(); // Mocking param retrieval

    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [modal, setModal] = useState(null); // { message, type }

    // 1. Data Loading Effect
    useEffect(() => {
        if (!chapterId) {
            setModal({ message: "Error: No chapter ID provided for update.", type: 'error' });
            setLoading(false);
            return;
        }

        setLoading(true);
        // Simulate API call to fetch quiz data
        setTimeout(() => {
            if (chapterId === MOCK_QUIZ_DATA.chapterId) {
                setQuizData(MOCK_QUIZ_DATA);
            } else {
                setModal({ message: `Quiz with chapter ID ${chapterId} not found.`, type: 'error' });
            }
            setLoading(false);
        }, 800);
    }, [chapterId]);

    // 2. Core Handlers for Quiz Details

    const handleDetailChange = useCallback((e) => {
        const { name, value } = e.target;
        setQuizData(prev => ({
            ...prev,
            [name]: name === 'duration' ? parseInt(value, 10) || 0 : value,
        }));
    }, []);

    // 3. Core Handlers for Questions Array

    const handleUpdateQuestion = useCallback((index, newQuestion) => {
        setQuizData(prev => {
            const newQuestions = [...(prev.questions || [])];
            newQuestions[index] = newQuestion;
            return {
                ...prev,
                questions: newQuestions,
                numQuestions: newQuestions.length // Update total question count
            };
        });
    }, []);

    const handleDeleteQuestion = useCallback((index) => {
        setQuizData(prev => {
            const newQuestions = (prev.questions || []).filter((_, i) => i !== index);
            return {
                ...prev,
                questions: newQuestions,
                numQuestions: newQuestions.length // Update total question count
            };
        });
    }, []);

    const handleAddQuestion = useCallback(() => {
        const newQuestion = {
            question: "New Question Placeholder",
            options: ["Option 1 (Correct)", "Option 2", "Option 3"],
            correctAnswer: 0,
            // Mock Mongoose ID generation
            _id: `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        };
        setQuizData(prev => {
            const newQuestions = [...(prev.questions || []), newQuestion];
            return {
                ...prev,
                questions: newQuestions,
                numQuestions: newQuestions.length
            };
        });
    }, []);

    // 4. Submission Handler

    const handleSave = async (e) => {
        e.preventDefault();
        if (!quizData || isSaving) return;

        // Simple validation
        if (!quizData.title || quizData.questions.length === 0) {
            setModal({ message: "Please ensure the quiz has a title and at least one question.", type: 'error' });
            return;
        }

        setIsSaving(true);
        console.log("Saving updated quiz data:", quizData);

        // Simulate API call to update quiz
        // await fetch(`/api/quizzes/${quizData._id}`, { method: 'PUT', body: JSON.stringify(quizData) });

        setTimeout(() => {
            setIsSaving(false);
            setModal({ message: "Quiz successfully updated! Redirecting...", type: 'success' });
            // Simulate redirection after a short delay
            setTimeout(() => {
                setModal(null);
                router.push('/admin-dashboard'); // Navigate back after success
            }, 1500);
        }, 1200);
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-lg font-medium text-gray-700 dark:text-gray-300">Loading Quiz Data...</span>
                {modal && <ConfirmationModal {...modal} onClose={() => setModal(null)} />}
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-8 bg-gray-50 dark:bg-gray-900 font-sans">
            {modal && <ConfirmationModal {...modal} onClose={() => setModal(null)} />}

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 sm:mb-0 flex items-center">
                        <Edit3 className="w-7 h-7 mr-2 text-blue-600" />
                        Update Quiz: <span className="ml-2 text-blue-600 dark:text-blue-400 truncate">{quizData?.title || 'Unknown Quiz'}</span>
                    </h1>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center px-4 py-2 text-sm font-medium rounded-xl shadow-md transition duration-150 transform hover:scale-[1.02] bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to List
                    </button>
                </header>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Quiz Details Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl space-y-5 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-b pb-3 mb-2 border-gray-200 dark:border-gray-700">
                            Quiz Metadata
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Title */}
                            <label className="block space-y-1">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Quiz Title</span>
                                <input
                                    type="text"
                                    name="title"
                                    value={quizData?.title || ''}
                                    onChange={handleDetailChange}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150"
                                    required
                                    placeholder="e.g., Array Basics Quiz"
                                />
                            </label>

                            {/* Duration */}
                            <label className="block space-y-1">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Duration (Minutes)</span>
                                <input
                                    type="number"
                                    name="duration"
                                    value={quizData?.duration || 0}
                                    onChange={handleDetailChange}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150"
                                    min="1"
                                    required
                                    placeholder="20"
                                />
                            </label>
                        </div>

                        {/* Description */}
                        <label className="block space-y-1">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Description</span>
                            <textarea
                                name="description"
                                value={quizData?.description || ''}
                                onChange={handleDetailChange}
                                rows="3"
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none transition duration-150"
                                placeholder="A brief description of the quiz content."
                                required
                            />
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Chapter ID: {quizData?.chapterId} | Quiz ID: {quizData?._id}
                        </p>
                    </div>

                    {/* Questions Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                Questions ({quizData?.questions?.length || 0})
                            </h2>
                            <button
                                type="button"
                                onClick={handleAddQuestion}
                                className="flex items-center px-4 py-2 text-sm font-medium rounded-xl shadow-md transition duration-150 transform hover:scale-[1.02] bg-green-500 hover:bg-green-600 text-white"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Add New Question
                            </button>
                        </div>

                        {quizData?.questions?.map((question, index) => (
                            <QuizQuestionEditor
                                key={question._id} // Use the unique ID as the key
                                question={question}
                                index={index}
                                updateQuestion={handleUpdateQuestion}
                                deleteQuestion={handleDeleteQuestion}
                            />
                        ))}

                        {/* No Questions Placeholder */}
                        {quizData?.questions?.length === 0 && (
                            <div className="text-center p-10 border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400">
                                <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                                <p>No questions added yet. Click "Add New Question" above to start building your quiz.</p>
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={isSaving || !quizData || quizData.questions.length === 0}
                            className="w-full flex items-center justify-center px-6 py-3 text-lg font-semibold rounded-xl shadow-xl transition duration-300 transform bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Updating Quiz...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-2" />
                                    Save Updates
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuizUpdatePage;
