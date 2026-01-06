// src/app/(student)/quizes/chapterQuiz/[chapterId]/page.jsx
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// NOTE: Assuming this file is used within a Next.js environment for useParams
// If running standalone, remove this and hardcode a chapterId for testing.
import { useParams } from 'next/navigation'; 

const DEFAULT_QUIZ_DURATION = 20; // Default to 20 minutes (1200 seconds) if duration is missing
const MAX_QUIZ_QUESTIONS = 10;

// --- UTILITIES ---

/**
 * Helper to shuffle an array (Fisher-Yates)
 * @param {Array} array - The array to shuffle.
 * @returns {Array} A new shuffled array.
 */
const shuffleArray = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// Local Storage Manager for persistence
const LocalStorage = {
    get: (key) => {
        if (typeof window !== 'undefined') {
            const data = window.localStorage.getItem(key);
            // Added simple check for string data type before parsing
            return data && typeof data === 'string' ? JSON.parse(data) : null;
        }
        return null;
    },
    set: (key, value) => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(value));
        }
    },
    remove: (key) => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
        }
    },
    // Clears all keys associated with this chapter's quiz instance
    clearAll: (chapterId) => {
        if (chapterId) {
            ['data', 'qs', 'ans', 'idx', 'time', 'fin'].forEach(key =>
                LocalStorage.remove(`quiz_${key}_${chapterId}`)
            );
        }
    }
};

/**
 * Simulates fetching quiz data from an API with exponential backoff.
 * In a real application, the quiz data structure would need to match the backend structure.
 */
const fetchQuizData = async (chapterId) => {
    // API path uses the chapterId directly
    const apiUrl = `/api/quizzes/${chapterId}`;

    // --- Mock Data Insertion for Canvas Environment ---
    // If the API call fails or is not available (e.g., during development), 
    // we use the mock data structure from the previous response.
    const mockQuizData = {
        _id: chapterId, // Use chapterId as mock quiz ID
        title: "Ch. 1: Data Structures - Arrays Fundamentals Quiz",
        description: "Test your knowledge on the foundational concepts of Arrays.",
        duration: 10, // 10 minutes for this mock quiz
        questions: [
            { question: "What is the defining characteristic of how elements are stored in an array?", options: ["Elements are stored using pointers to scattered memory locations.", "Elements are stored at contiguous memory locations.", "Elements are stored based on a hashing function.", "Elements are stored in a LIFO (Last-In, First-Out) order."], correctAnswer: 1, details: "Arrays require elements to be stored in a continuous block of memory." },
            { question: "Assuming a zero-indexed array, what is the index of the ninth element?", options: ["8", "9", "10", "0"], correctAnswer: 0, details: "Index is $9 - 1 = 8$." },
            { question: "What is the time complexity for accessing an element in an array using its index?", options: ["$O(n)$", "$O(n^2)$", "$O(1)$", "$O(\\log n)$"], correctAnswer: 2, details: "Constant time access $O(1)$ due to contiguous memory." },
            { question: "What is the primary drawback of a traditional, static array?", options: ["It cannot store different data types.", "The size is fixed and cannot be changed after declaration.", "It has very slow access time ($O(n)$).", "It can only be used to implement stacks."], correctAnswer: 1, details: "The fixed size requires creating a new array to resize." },
            { question: "In a 32-bit system, if an array of 4-byte integers starts at memory address 2000, what is the memory address of the element at index 4?", options: ["2008", "2016", "2004", "2020"], correctAnswer: 1, details: "Address: $2000 + (4 \\times 4) = 2016$." },
            { question: "Which of the following operations has a time complexity of $O(n)$ in an array?", options: ["Reading the value of the last element.", "Inserting a new element at the beginning of the array.", "Finding the size of the array.", "Updating the value of an element at a known index."], correctAnswer: 1, details: "Inserting at the start requires shifting every subsequent element." },
            { question: "The property of contiguous memory storage in arrays directly supports which feature?", options: ["Dynamic resizing at runtime.", "Random Access (accessing any element directly by index).", "Storing multiple, different data types.", "Efficient deletion of elements from the middle."], correctAnswer: 1, details: "Random access is $O(1)$ because of contiguous memory." },
            { question: "Which term describes a data structure that allows you to access any element directly and immediately via an index?", options: ["Sequential Access", "Random Access", "Indirect Access", "Constant Access"], correctAnswer: 1, details: "Random Access means constant time access $O(1)$." },
            { question: "Why is array insertion or deletion in the middle generally inefficient?", options: ["Because it requires allocating a new memory block every time.", "The adjacent elements must be shifted to maintain contiguity.", "The correct index cannot be calculated without iterating through the whole array.", "The time complexity is $O(\\log n)$."], correctAnswer: 1, details: "All subsequent elements must be shifted, leading to $O(n)$ complexity." },
            { question: "A key difference between a Linked List and an Array is that Linked Lists use references (pointers), while Arrays rely on:", options: ["Variable element size.", "Fixed element size.", "Sequential memory allocation.", "A maximum of 10 elements."], correctAnswer: 2, details: "Arrays rely on sequential, contiguous memory for indexing." }
        ]
    };
    // --- End Mock Data Insertion ---


    for (let i = 0; i < 3; i++) {
        try {
            const response = await fetch(apiUrl);

            if (response.status === 404) {
                // If 404, fall back to mock data
                console.warn(`Quiz not found for ${chapterId} on API. Using mock data.`);
                return mockQuizData; 
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `API failed with status ${response.status}` }));
                throw new Error(errorData.error || `API failed with status ${response.status}`);
            }

            const data = await response.json();
            return data.quiz;
        } catch (error) {
            if (i < 2) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            } else {
                console.error("Failed to fetch quiz data after retries. Using mock data as fallback.", error);
                return mockQuizData; // Final fallback to mock data after all retries fail
            }
        }
    }
};

/**
 * Simulates submitting the quiz score to the server.
 * NOTE: Returns a mock score for this self-contained component.
 */
const submitQuiz = async (quizId, questions, userAnswers, timeTakenSeconds) => {
    // NOTE: For a real app, you would send userAnswers to the backend for secure grading.
    const apiUrl = `/api/quizzes/${quizId}/submit`;

    for (let i = 0; i < 3; i++) {
        try {
            // Mock Grading Logic: Calculate score locally for demonstration
            let correctCount = 0;
            userAnswers.forEach((userAnswer, index) => {
                if (userAnswer === questions[index].correctAnswer) {
                    correctCount++;
                }
            });

            // Simulate the POST request
            // const response = await fetch(apiUrl, { ... });
            
            // Assuming successful submission for this demo, return the mock score
            return { score: correctCount, totalQuestions: questions.length };

        } catch (error) {
            if (i < 2) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            } else {
                // Fail and throw a submission error
                throw new Error("Failed to submit quiz after retries. Please check your network.");
            }
        }
    }
};

// --- COMPONENTS ---

// Results and Time-Up Modal 
const QuizModal = ({ score, totalQuestions, onAction, actionLabel, onSecondaryAction, secondaryActionLabel, title, message }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-8 text-center border-t-4 border-indigo-500 transform transition-all duration-300 scale-100">
            <div className="text-6xl mb-4">
                {score !== null ? '🏆' : '⏰'}
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

            {score !== null && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg mb-6">
                    <p className="text-xl font-bold text-indigo-700 dark:text-indigo-200">
                        Your Score: {score} / {totalQuestions}
                    </p>
                </div>
            )}

            <div className="space-y-3">
                {/* Primary Action (e.g., Start Next Chapter) */}
                <button
                    onClick={onAction}
                    className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-150 ease-in-out shadow-lg transform hover:scale-[1.01]"
                >
                    {actionLabel}
                </button>

                {/* Secondary Action (New Re-attempt Quiz Button) */}
                {onSecondaryAction && (
                    <button
                        onClick={onSecondaryAction}
                        className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-indigo-600 font-semibold rounded-lg transition duration-150 ease-in-out shadow-md"
                    >
                        {secondaryActionLabel}
                    </button>
                )}
            </div>
        </div>
    </div>
);

// Question and Options Component
const QuestionDisplay = ({ question, qIndex, selectedAnswer, totalQuestions, isSubmitted, handleSelectAnswer }) => {

    // Determine dynamic color classes based on quiz state
    const getOptionClass = (optionIndex, correctAnswer) => {
        const isSelected = selectedAnswer === optionIndex;

        if (isSubmitted) {
            // State 1: Quiz is Submitted (Grading View)
            const isCorrectOption = optionIndex === correctAnswer;
            const isUserSelection = optionIndex === selectedAnswer;

            if (isCorrectOption) {
                // GREEN: The actual correct answer
                return 'bg-green-200 border-green-500 text-green-800 font-bold dark:bg-green-800 dark:border-green-400 dark:text-green-100';
            }
            if (isUserSelection && !isCorrectOption) {
                // RED: User selected this, and it was wrong
                return 'bg-red-200 border-red-500 text-red-800 font-bold dark:bg-red-800 dark:border-red-400 dark:text-red-100';
            }
            // Default for unselected/wrong options in grading view
            return 'bg-white border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white';
        }

        // State 2: Quiz is Active (Playing View)
        if (isSelected) {
            // YELLOW/INDIGO: Currently selected answer
            return 'bg-yellow-100 border-yellow-500 text-yellow-800 font-semibold shadow-md dark:bg-yellow-800 dark:border-yellow-400 dark:text-yellow-100 transform scale-[1.01]';
        }

        // Default for unselected answers
        return 'bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white';
    };

    return (
        <div className="p-6 md:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-indigo-400">
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">Question {qIndex + 1} of {totalQuestions}</p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {question.question}
            </h3>

            <div className="space-y-4">
                {question.options.map((option, optionIndex) => (
                    <button
                        key={optionIndex}
                        onClick={() => handleSelectAnswer(optionIndex)}
                        disabled={isSubmitted}
                        className={`w-full text-left p-4 rounded-lg border-2 transition duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-700
                            ${getOptionClass(optionIndex, question.correctAnswer)}
                        `}
                    >
                        <span className="font-mono text-lg mr-3">
                            {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        {option}
                        {isSubmitted && optionIndex === question.correctAnswer && (
                            <span className="ml-3 font-bold text-green-700 dark:text-green-300">✅ Correct</span>
                        )}
                        {isSubmitted && optionIndex === selectedAnswer && optionIndex !== question.correctAnswer && (
                             <span className="ml-3 font-bold text-red-700 dark:text-red-300">❌ Your Answer</span>
                        )}
                    </button>
                ))}
            </div>
            
            {/* Rationale Display for Submitted Quiz */}
            {isSubmitted && question.details && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 border-l-4 border-indigo-500 rounded-lg">
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400">Explanation:</p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{question.details}</p>
                </div>
            )}
        </div>
    );
};


// --- MAIN APP COMPONENT ---

export default function App() {
    // WARNING: useParams requires a Next.js environment. Using mock 'chapter-id-1' for standalone demo.
    const mockParams = { chapterId: 'chapter-id-1' }; 
    const params = typeof useParams === 'function' ? useParams() : mockParams;
    
    // 1. EXTRACT CHAPTER ID from the URL params or use mock
    const chapterId = params.chapterId || mockParams.chapterId;

    const [status, setStatus] = useState('loading'); // 'loading', 'playing', 'error'
    const [quizData, setQuizData] = useState(null); // Full fetched quiz data (includes _id, title, duration)
    const [questions, setQuestions] = useState([]); // The 10 questions the user sees
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(null);
    const [error, setError] = useState(null);

    // Unique keys for Local Storage based on the DYNAMIC CHAPTER ID
    const lsKeys = useMemo(() => {
        if (!chapterId) return null;
        return {
            data: `quiz_data_${chapterId}`,
            qs: `quiz_questions_${chapterId}`,
            ans: `quiz_answers_${chapterId}`,
            idx: `quiz_current_index_${chapterId}`,
            time: `quiz_time_${chapterId}`,
            fin: `quiz_finished_${chapterId}`,
        };
    }, [chapterId]);

    // ----------------------------------------------------
    // 1. INITIALIZATION & DATA FETCHING
    // ----------------------------------------------------
    const loadInitialState = useCallback(async (isRestarting = false) => {
        if (!chapterId || !lsKeys) {
            setStatus('loading');
            return;
        }

        setError(null);
        let initialData = LocalStorage.get(lsKeys.data);
        let finalQuestions = LocalStorage.get(lsKeys.qs);

        // 1. Fetch Quiz Data if not in Local Storage or restarting
        if (!initialData || isRestarting) {
            try {
                initialData = await fetchQuizData(chapterId);
                // Check if the mock ID was used, if so, ensure the quiz _id is set
                initialData._id = initialData._id || chapterId;
                LocalStorage.set(lsKeys.data, initialData);
            } catch (e) {
                setError(e.message);
                setStatus('error');
                return;
            }
        }
        setQuizData(initialData);

        // 2. Set Questions 
        if (isRestarting || !finalQuestions || finalQuestions.length === 0) {
            // Fresh start/Restart: shuffle and limit
            const numQuestions = Math.min(initialData.questions.length, MAX_QUIZ_QUESTIONS);
            const shuffled = shuffleArray(initialData.questions);
            finalQuestions = shuffled.slice(0, numQuestions);

            LocalStorage.set(lsKeys.qs, finalQuestions);

            // Resetting states for new/restarted quiz
            setUserAnswers(Array(finalQuestions.length).fill(null));
            setCurrentQIndex(0);
            setIsFinished(false);
            setScore(null);

            // Clear all quiz-specific persistence keys
            ['ans', 'idx', 'fin', 'time'].forEach(key => LocalStorage.remove(lsKeys[key]));

        } else {
            // Resume from Local Storage (Page Reload)
            setUserAnswers(LocalStorage.get(lsKeys.ans) || Array(finalQuestions.length).fill(null));
            setCurrentQIndex(LocalStorage.get(lsKeys.idx) || 0);
            const finishedStatus = LocalStorage.get(lsKeys.fin) || false;
            setIsFinished(finishedStatus);
            
            if (finishedStatus) {
                // If finished, calculate score to display results
                const result = await submitQuiz(initialData._id, finalQuestions, LocalStorage.get(lsKeys.ans) || Array(finalQuestions.length).fill(null));
                setScore(result.score);
            }
        }

        setQuestions(finalQuestions);

        // 3. Set Time
        const durationInMinutes = initialData.duration || DEFAULT_QUIZ_DURATION;
        const durationInSeconds = durationInMinutes * 60;
        const storedTimeLeft = LocalStorage.get(lsKeys.time);

        const timeToSet = storedTimeLeft !== null && !isRestarting ? storedTimeLeft : durationInSeconds;
        setTimeLeft(timeToSet);

        setStatus('playing');

    }, [chapterId, lsKeys]); 

    useEffect(() => {
        if (chapterId) {
            loadInitialState(false);
        }
    }, [chapterId, loadInitialState]);


    // ----------------------------------------------------
    // 2. TIMER MANAGEMENT 
    // ----------------------------------------------------
    useEffect(() => {
        if (status !== 'playing' || isFinished || timeLeft === null) return;

        const interval = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime > 0) {
                    LocalStorage.set(lsKeys.time, prevTime - 1);
                    return prevTime - 1;
                } else {
                    clearInterval(interval);
                    if (quizData) {
                        // Pass true to indicate time is up
                        handleSubmit(true); 
                    }
                    return 0;
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [status, isFinished, lsKeys, quizData, timeLeft, chapterId]);

    // ----------------------------------------------------
    // 3. PERSISTENCE: Save state variables on change
    // ----------------------------------------------------
    useEffect(() => {
        if (status === 'playing' && lsKeys && !isFinished) {
            LocalStorage.set(lsKeys.ans, userAnswers);
            LocalStorage.set(lsKeys.idx, currentQIndex);
        }
    }, [userAnswers, currentQIndex, status, lsKeys, isFinished]);

    // ----------------------------------------------------
    // 4. HANDLERS
    // ----------------------------------------------------

    const handleSubmit = async (isTimeUp = false) => {
        if (!quizData || (isFinished && score !== null)) return;

        setIsFinished(true);
        LocalStorage.set(lsKeys.fin, true);

        const durationInSeconds = (quizData.duration || DEFAULT_QUIZ_DURATION) * 60;
        // Calculate time taken using the initial duration
        const timeTakenSeconds = durationInSeconds - timeLeft; 

        console.log("Submitting Answers:", userAnswers, "Time Taken:", timeTakenSeconds);

        try {
            // Use the actual quiz ID from the fetched data for submission
            const result = await submitQuiz(quizData._id, questions, userAnswers, timeTakenSeconds);
            setScore(result.score);

            if (isTimeUp) {
                setError("Time's Up!");
            } else {
                setError(null);
            }
        } catch (e) {
            console.error("Submission failed:", e);
            setError(`Submission Error: ${e.message}`);
            // If submission fails, set score to 0 or leave null depending on desired UX
            setScore(0); 
        }
    };

    const handleRestart = () => {
        setError(null);
        // This clears all quiz state in local storage and fetches a new set of questions
        loadInitialState(true);
    };

    const handleStartNextChapter = () => {
        // Clear all local storage when navigating away
        LocalStorage.clearAll(chapterId);
        console.log(`Navigating from chapter ${chapterId} (cleared Local Storage)...`);
        // NOTE: Use router.push('/path/to/next-chapter') in a real app
    };

    const handleSelectAnswer = useCallback((optionIndex) => {
        if (isFinished) return;
        setUserAnswers(prevAnswers => {
            const newAnswers = [...prevAnswers];
            newAnswers[currentQIndex] = optionIndex;
            return newAnswers;
        });
    }, [currentQIndex, isFinished]);

    const handleNext = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prevIndex => prevIndex + 1);
        } else {
            handleSubmit(false);
        }
    };

    // ----------------------------------------------------
    // 5. RENDER LOGIC
    // ----------------------------------------------------
    if (status === 'loading') {
        return <div className="flex justify-center items-center h-screen text-2xl font-semibold text-indigo-600 dark:text-indigo-400 bg-gray-50 dark:bg-gray-900">Loading Quiz Data...</div>;
    }

    if (questions.length === 0 && status !== 'error') {
        return (
            <div className="flex justify-center items-center h-screen text-2xl font-semibold text-red-600 dark:text-red-400 bg-gray-50 dark:bg-gray-900">
                Error: Quiz data loaded but no questions available.
            </div>
        );
    }

    const currentQuestion = questions[currentQIndex];
    const isLastQuestion = currentQIndex === questions.length - 1;
    const selectedAnswer = userAnswers[currentQIndex];

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="min-h-screen lg:pt-20 bg-gray-50 dark:bg-gray-900 font-sans p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">

                {/* Timer and Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border-b-4 border-indigo-500">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center sm:text-left">
                        {quizData?.title || "Chapter Quiz"}
                    </h1>

                    {timeLeft !== null && (
                        <div className="flex items-center space-x-2 text-xl font-mono p-2 rounded-lg bg-indigo-50 dark:bg-indigo-700 dark:text-white text-indigo-700">
                            {/* Clock Icon (lucide-react style inline SVG) */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span className={`${timeLeft <= 60 && 'text-red-500 font-bold dark:text-red-300'}`}>
                                {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                            </span>
                        </div>
                    )}
                </div>
                
                {/* Question Navigation Map */}
                <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-x-auto whitespace-nowrap">
                    <div className="flex space-x-2">
                        {questions.map((q, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQIndex(index)}
                                className={`h-10 w-10 text-sm font-semibold rounded-full flex items-center justify-center transition duration-150 ease-in-out flex-shrink-0
                                    ${index === currentQIndex
                                        ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-300 dark:ring-indigo-700'
                                        : userAnswers[index] !== null
                                            ? 'bg-indigo-100 text-indigo-600 border border-indigo-300 dark:bg-indigo-900 dark:text-indigo-200'
                                            : 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }
                                `}
                                title={`Go to Question ${index + 1}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Question Display */}
                {status === 'playing' && currentQuestion && (
                    <QuestionDisplay
                        question={currentQuestion}
                        qIndex={currentQIndex}
                        selectedAnswer={selectedAnswer}
                        totalQuestions={questions.length}
                        isSubmitted={isFinished}
                        handleSelectAnswer={handleSelectAnswer}
                        key={currentQIndex}
                    />
                )}

                {/* Navigation Controls */}
                <div className="mt-8 flex justify-between">
                    <button
                        onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQIndex === 0}
                        className={`px-6 py-3 text-lg font-semibold rounded-lg shadow-md transition duration-200 ease-in-out
                            ${currentQIndex === 0
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-white hover:bg-gray-100 text-indigo-600 border border-indigo-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                            }
                        `}
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={selectedAnswer === null && !isFinished} // Allow navigating if finished
                        className={`px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transition duration-200 ease-in-out
                            ${selectedAnswer === null && !isFinished
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-[1.02]'
                            }
                        `}
                    >
                        {isFinished
                            ? (isLastQuestion ? 'Review Complete' : 'Next Question')
                            : (isLastQuestion ? 'Submit Quiz' : 'Next Question')
                        }
                    </button>
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* Time Up Modal (Only when finished AND time was the cause) */}
            {isFinished && error === "Time's Up!" && (
                <QuizModal
                    title="Time's Up!"
                    message="Your time has expired. Your score has been recorded."
                    score={score}
                    totalQuestions={questions.length}
                    onAction={handleStartNextChapter}
                    actionLabel="Start Next Chapter"
                    onSecondaryAction={handleRestart}
                    secondaryActionLabel="Re-attempt Quiz"
                />
            )}

            {/* Quiz Complete Modal / Submission Error (Finished by Submit) */}
            {isFinished && error !== "Time's Up!" && (
                <QuizModal
                    title={error ? "Submission Failed" : "Quiz Completed!"}
                    message={error || "You have successfully finished the chapter quiz. Use the navigation to review your answers."}
                    score={score}
                    totalQuestions={questions.length}
                    onAction={handleStartNextChapter}
                    actionLabel="Start Next Chapter"
                    onSecondaryAction={handleRestart}
                    secondaryActionLabel="Re-attempt Quiz"
                />
            )}

            {/* General Loading/Error Display */}
            {status === 'error' && (
                <QuizModal
                    title="Error Loading Quiz"
                    message={error || "An unknown error occurred while loading the quiz."}
                    score={null}
                    totalQuestions={0}
                    onAction={() => loadInitialState(false)}
                    actionLabel="Try Again"
                    onSecondaryAction={null}
                    secondaryActionLabel=""
                />
            )}
        </div>
    );
}
