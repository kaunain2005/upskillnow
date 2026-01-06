'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, X, ArrowRight, BookOpen, Clock, LayoutGrid, CheckSquare, Settings } from 'lucide-react';

// Define the shape of a single question
const initialQuestion = {
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0, // Index of the correct option (0, 1, 2, or 3)
    details: '', // Explanation for the answer
};

// --- API Helpers ---

// Placeholder API URL constants
const COURSES_API_URL = '/api/courses';
const QUIZ_CREATE_API_URL = '/api/quizzes';

// --- Reusable UI Components ---

const InputField = ({ label, id, type = 'text', value, onChange, placeholder, required = false, className = '' }) => (
    <div className={`flex flex-col space-y-1 ${className}`}>
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === 'textarea' ? (
            <textarea
                id={id}
                rows="3"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition duration-150"
            />
        ) : (
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                min={type === 'number' ? 1 : undefined}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition duration-150"
            />
        )}
    </div>
);

const SelectField = ({ label, id, value, onChange, options, required = false, disabled = false }) => (
    <div className="flex flex-col space-y-1">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled || options.length === 0}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-700 disabled:opacity-75 transition duration-150"
        >
            <option value="">{options.length === 0 ? `Loading...` : `Select ${label}`}</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

// --- Question Form Component ---

const QuestionForm = ({ question, index, updateQuestion, removeQuestion }) => {
    const handleOptionChange = (optionIndex, event) => {
        const newOptions = [...question.options];
        newOptions[optionIndex] = event.target.value;
        updateQuestion(index, { ...question, options: newOptions });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    Question {index + 1}
                </h3>
                <button
                    onClick={() => removeQuestion(index)}
                    type="button"
                    className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition duration-150"
                    aria-label="Remove Question"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Question Text */}
            <InputField
                label="Question Text"
                id={`q-${index}-text`}
                type="textarea"
                value={question.question}
                onChange={(e) => updateQuestion(index, { ...question, question: e.target.value })}
                placeholder="Enter the quiz question here"
                required
                className="mb-4"
            />

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {[0, 1, 2, 3].map((optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                        <input
                            type="radio"
                            id={`q-${index}-correct-${optionIndex}`}
                            name={`q-${index}-correct`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => updateQuestion(index, { ...question, correctAnswer: optionIndex })}
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-500 dark:bg-gray-600"
                            required
                        />
                        <InputField
                            label={`Option ${optionIndex + 1}`}
                            id={`q-${index}-option-${optionIndex}`}
                            value={question.options[optionIndex]}
                            onChange={(e) => handleOptionChange(optionIndex, e)}
                            placeholder={`Option ${optionIndex + 1} text`}
                            required
                        />
                        <label htmlFor={`q-${index}-correct-${optionIndex}`} className="text-xs text-gray-500 dark:text-gray-400">
                            {question.correctAnswer === optionIndex ? <CheckSquare className="w-5 h-5 text-green-500" /> : 'Correct'}
                        </label>
                    </div>
                ))}
            </div>

            {/* Details/Explanation */}
            <InputField
                label="Answer Explanation (Optional Details)"
                id={`q-${index}-details`}
                type="textarea"
                value={question.details}
                onChange={(e) => updateQuestion(index, { ...question, details: e.target.value })}
                placeholder="Explain the correct answer for student review"
                className="mt-4"
            />
        </div>
    );
};


// --- Main App Component ---

export default function App() {
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionMessage, setSubmissionMessage] = useState(null);

    // --- Cascading Select State ---
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSem, setSelectedSem] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedChapterId, setSelectedChapterId] = useState('');

    // --- Quiz Data State ---
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [quizType, setQuizType] = useState('general');
    const [quizDuration, setQuizDuration] = useState(20);
    const [quizNumQuestions, setQuizNumQuestions] = useState(10);
    const [quizQuestions, setQuizQuestions] = useState([initialQuestion]);


    // 1. Data Fetching
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Implementing exponential backoff for robustness
                let response = null;
                const maxRetries = 3;
                let lastError = null;

                for (let i = 0; i < maxRetries; i++) {
                    try {
                        response = await fetch(COURSES_API_URL);
                        if (response.ok) break;
                        throw new Error(`HTTP error! status: ${response.status}`);
                    } catch (err) {
                        lastError = err;
                        if (i < maxRetries - 1) {
                            const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }
                    }
                }

                if (!response || !response.ok) throw new Error(lastError?.message || 'Failed to fetch courses data after retries.');

                const data = await response.json();
                setAllCourses(data);
            } catch (err) {
                console.error("Course fetch error:", err);
                setError('Could not load course data. Please check the API.');
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    // 2. Data Transformation (Memoized options for cascading selectors)
    const options = useMemo(() => {
        const uniqueDepartments = new Set(allCourses.map(c => c.department).filter(Boolean));

        const years = new Set();
        const semesters = new Set();
        const courses = [];
        const chapters = [];

        // Filter courses based on current selections
        const filteredCourses = allCourses.filter(course =>
            (!selectedDept || course.department === selectedDept) &&
            (!selectedYear || course.year === selectedYear) &&
            (!selectedSem || course.semester === selectedSem)
        );

        // Populate options for the next level
        filteredCourses.forEach(course => {
            years.add(course.year);
            semesters.add(course.semester);

            if (course.department === selectedDept && course.year === selectedYear && course.semester === selectedSem) {
                courses.push({ value: course._id, label: `${course.title} (${course.department}-${course.year}-${course.semester})` });

                // Populate chapters only if a course is selected
                if (course._id === selectedCourseId) {
                    // Find the full course object to access chapters
                    const fullCourse = allCourses.find(c => c._id === selectedCourseId);
                    fullCourse?.chapters?.forEach(chapter => {
                        chapters.push({ value: chapter._id, label: chapter.title });
                    });
                }
            }
        });

        return {
            departments: Array.from(uniqueDepartments).map(dept => ({ value: dept, label: dept })),
            years: Array.from(years).map(year => ({ value: year, label: year })).sort((a, b) => a.label.localeCompare(b.label)),
            semesters: Array.from(semesters).map(sem => ({ value: sem, label: sem })).sort((a, b) => a.label.localeCompare(b.label)),
            courses,
            chapters
        };
    }, [allCourses, selectedDept, selectedYear, selectedSem, selectedCourseId]);

    // 3. Question Management Handlers
    const addQuestion = () => {
        setQuizQuestions([...quizQuestions, initialQuestion]);
    };

    const updateQuestion = useCallback((index, newQuestion) => {
        setQuizQuestions(prev => {
            const newQuestions = [...prev];
            newQuestions[index] = newQuestion;
            return newQuestions;
        });
    }, []);

    const removeQuestion = useCallback((index) => {
        setQuizQuestions(prev => prev.filter((_, i) => i !== index));
    }, []);

    // 4. Submission Handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedChapterId || !selectedDept || !selectedYear || !selectedSem) {
            setSubmissionMessage({ type: 'error', text: 'Please complete all Course/Chapter selections before submitting.' });
            return;
        }

        // --- FIX: Include categorization fields in the payload ---
        const payload = {
            chapterId: selectedChapterId,
            title: quizTitle,
            description: quizDescription,
            type: quizType,
            // ADDED: Department, Year, and Semester required by Mongoose schema
            department: selectedDept,
            year: selectedYear,
            semester: selectedSem,
            // END ADDED
            questions: quizQuestions,
            // Only include duration and numQuestions if it's a challenge quiz
            ...(quizType === 'challenge' && { duration: quizDuration, numQuestions: quizNumQuestions }),
        };

        setIsSubmitting(true);
        setSubmissionMessage(null);

        try {
            let response = null;
            const maxRetries = 3;
            let lastError = null;

            for (let i = 0; i < maxRetries; i++) {
                try {
                    response = await fetch(QUIZ_CREATE_API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });

                    if (response.ok) break;

                    const errorData = await response.json();
                    throw new Error(errorData.error || `Server responded with status ${response.status}.`);

                } catch (err) {
                    lastError = err;
                    if (i < maxRetries - 1) {
                        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }

            if (!response || !response.ok) {
                throw new Error(lastError?.message || 'Failed to create quiz after retries.');
            }

            const newQuiz = await response.json();
            setSubmissionMessage({ type: 'success', text: `Quiz "${newQuiz.title}" created successfully! ID: ${newQuiz._id}` });

            // Reset form after success
            setQuizTitle('');
            setQuizDescription('');
            setQuizQuestions([initialQuestion]);
            setSelectedChapterId('');

        } catch (err) {
            console.error("Quiz creation error:", err);
            setSubmissionMessage({ type: 'error', text: err.message || 'An unknown error occurred during submission.' });
        } finally {
            setIsSubmitting(false);
        }
    };


    if (loading) return <div className="text-center p-12 text-lg text-gray-500 dark:text-gray-400">Loading course data...</div>;
    if (error) return <div className="text-center p-12 text-lg text-red-600 dark:text-red-400">{error}</div>;

    // Determine if the full chapter path is selected
    const isChapterSelected = !!selectedChapterId && !!selectedDept && !!selectedYear && !!selectedSem;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 border-b border-indigo-200 dark:border-indigo-800 pb-3 flex items-center">
                    <BookOpen className="w-8 h-8 mr-3 text-indigo-500" />
                    Create New Quiz
                </h1>

                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* --- 1. Chapter Selection (Cascading Dropdowns) --- */}
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-500">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-5 flex items-center">
                            <ArrowRight className="w-5 h-5 mr-2 text-indigo-500" />
                            1. Select Target Chapter
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                            {/* Department */}
                            <SelectField
                                label="Department"
                                id="dept"
                                value={selectedDept}
                                onChange={(e) => {
                                    setSelectedDept(e.target.value);
                                    setSelectedYear(''); setSelectedSem(''); setSelectedCourseId(''); setSelectedChapterId('');
                                }}
                                options={options.departments}
                                required
                            />

                            {/* Year */}
                            <SelectField
                                label="Year"
                                id="year"
                                value={selectedYear}
                                onChange={(e) => {
                                    setSelectedYear(e.target.value);
                                    setSelectedSem(''); setSelectedCourseId(''); setSelectedChapterId('');
                                }}
                                options={options.years}
                                disabled={!selectedDept}
                                required
                            />

                            {/* Semester */}
                            <SelectField
                                label="Semester"
                                id="sem"
                                value={selectedSem}
                                onChange={(e) => {
                                    setSelectedSem(e.target.value);
                                    setSelectedCourseId(''); setSelectedChapterId('');
                                }}
                                options={options.semesters}
                                disabled={!selectedYear}
                                required
                            />

                            {/* Course */}
                            <SelectField
                                label="Course"
                                id="course"
                                value={selectedCourseId}
                                onChange={(e) => {
                                    setSelectedCourseId(e.target.value);
                                    setSelectedChapterId('');
                                }}
                                options={options.courses}
                                disabled={!selectedSem}
                                required
                            />

                            {/* Chapter (Final Selection) */}
                            <SelectField
                                label="Chapter"
                                id="chapter"
                                value={selectedChapterId}
                                onChange={(e) => setSelectedChapterId(e.target.value)}
                                options={options.chapters}
                                disabled={!selectedCourseId}
                                required
                            />
                        </div>

                        {isChapterSelected && (
                            <p className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-semibold border border-green-200 dark:border-green-700">
                                Chapter ID selected: <span className="font-mono text-green-900 dark:text-green-100">{selectedChapterId}</span>. Proceed to add quiz details.
                            </p>
                        )}
                    </div>

                    {/* --- 2. Quiz Details --- */}
                    <div className={`p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 ${isChapterSelected ? 'border-indigo-500' : 'border-gray-300 opacity-50'}`}>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-5 flex items-center">
                            <Settings className="w-5 h-5 mr-2 text-indigo-500" />
                            2. Quiz Settings
                        </h2>
                        <fieldset disabled={!isChapterSelected} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="Quiz Title"
                                    id="title"
                                    value={quizTitle}
                                    onChange={(e) => setQuizTitle(e.target.value)}
                                    placeholder="e.g., Chapter 1: Arrays Fundamentals Quiz"
                                    required
                                />
                                <SelectField
                                    label="Quiz Type"
                                    id="type"
                                    value={quizType}
                                    onChange={(e) => {
                                        setQuizType(e.target.value);
                                        // Reset challenge specific fields if switching to general
                                        if (e.target.value === 'general') {
                                            setQuizDuration(20); // Setting back to default, not 0
                                            setQuizNumQuestions(10); // Setting back to default, not 0
                                        }
                                    }}
                                    options={[
                                        { value: 'general', label: 'General (Chapter Quiz)' },
                                        { value: 'challenge', label: 'Challenge (Timed Exam)' },
                                    ]}
                                    required
                                />
                            </div>

                            <InputField
                                label="Quiz Description"
                                id="description"
                                type="textarea"
                                value={quizDescription}
                                onChange={(e) => setQuizDescription(e.target.value)}
                                placeholder="A brief summary of what the quiz covers."
                            />

                            {quizType === 'challenge' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                    <InputField
                                        label="Duration (Minutes)"
                                        id="duration"
                                        type="number"
                                        value={quizDuration}
                                        onChange={(e) => setQuizDuration(Number(e.target.value))}
                                        placeholder="e.g., 20"
                                        required
                                    />
                                    <InputField
                                        label="Number of Questions (For Challenge)"
                                        id="numQuestions"
                                        type="number"
                                        value={quizNumQuestions}
                                        onChange={(e) => setQuizNumQuestions(Number(e.target.value))}
                                        placeholder="e.g., 10"
                                        required
                                    />
                                </div>
                            )}
                        </fieldset>
                    </div>

                    {/* --- 3. Questions Section --- */}
                    <div className={`p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-t-4 ${isChapterSelected ? 'border-indigo-500' : 'border-gray-300 opacity-50'}`}>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-5 flex items-center">
                            <LayoutGrid className="w-5 h-5 mr-2 text-indigo-500" />
                            3. Add Questions
                        </h2>
                        <fieldset disabled={!isChapterSelected} className="space-y-6">
                            <div className="space-y-8">
                                {quizQuestions.map((question, index) => (
                                    <QuestionForm
                                        key={index}
                                        question={question}
                                        index={index}
                                        updateQuestion={updateQuestion}
                                        removeQuestion={removeQuestion}
                                    />
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addQuestion}
                                className="w-full flex items-center justify-center py-3 px-6 border border-dashed border-indigo-400 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition duration-150 ease-in-out font-semibold mt-6"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add New Question
                            </button>
                        </fieldset>
                    </div>

                    {/* --- Submission --- */}
                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting || !isChapterSelected || quizQuestions.length === 0}
                            className="flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out transform hover:scale-[1.01]"
                        >
                            {isSubmitting ? 'Creating Quiz...' : 'Create Quiz'}
                            <CheckSquare className="w-5 h-5 ml-2" />
                        </button>
                    </div>

                    {/* --- Submission Message --- */}
                    {submissionMessage && (
                        <div className={`p-4 mt-6 rounded-lg ${submissionMessage.type === 'success'
                                ? 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300'
                                : 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300'
                            } border`} role="alert">
                            {submissionMessage.text}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
