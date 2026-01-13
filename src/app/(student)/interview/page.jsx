'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, Search, BookOpen, Layers, Zap, Code2, Terminal, Globe, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INTERVIEW_QNA = {
    HTML: {
        BASIC: [
            { id: 1, question: 'What is HTML?', answer: 'HTML (HyperText Markup Language) is the standard markup language for creating web pages.', tags: ['structure'] },
            { id: 2, question: 'What are Semantic Tags?', answer: 'Tags like <header>, <article>, and <footer> that clearly describe their meaning to both the browser and the developer.', tags: ['seo'] },
            { id: 3, question: 'Difference between <div> and <span>?', answer: 'div is a block-level element (starts on a new line), while span is an inline element.', tags: ['layout'] },
        ],
        INTERMEDIATE: [
            { id: 4, question: 'What is SVG?', answer: 'Scalable Vector Graphics used to define vector-based graphics for the web in XML format.', tags: ['graphics'] },
            { id: 5, question: 'Explain HTML5 Web Storage.', answer: 'Allows web applications to store data locally within the user\'s browser (LocalStorage and SessionStorage).', tags: ['storage'] },
        ],
        ADVANCED: [
            { id: 6, question: 'What is the Critical Rendering Path?', answer: 'The sequence of steps the browser goes through to convert HTML, CSS, and JS into pixels on the screen.', tags: ['performance'] },
            { id: 7, question: 'What are Web Components?', answer: 'A suite of technologies allowing you to create reusable custom elements with encapsulated functionality.', tags: ['architecture'] },
        ]
    },
    DATA_ANALYSIS: {
        BASIC: [
            { id: 101, question: 'What is Data Analysis?', answer: 'The process of inspecting, cleansing, transforming, and modeling data to discover useful information and support decision-making.', tags: ['basics'] },
            { id: 102, question: 'Difference between Qualitative and Quantitative data?', answer: 'Qualitative data is descriptive/categorical (colors, names), while Quantitative data is numerical (height, price).', tags: ['statistics'] },
            { id: 103, question: 'What is a CSV file?', answer: 'Comma Separated Values; a plain text file that stores tabular data in a structured format.', tags: ['files'] },
            { id: 104, question: 'Explain Mean, Median, and Mode.', answer: 'Mean is the average, Median is the middle value, and Mode is the most frequent value in a dataset.', tags: ['statistics'] },
            { id: 105, question: 'What is Pandas in Python?', answer: 'An open-source library providing high-performance, easy-to-use data structures and data analysis tools.', tags: ['python', 'libraries'] },
            { id: 106, question: 'What is a DataFrame?', answer: 'A 2-dimensional labeled data structure with columns of potentially different types, similar to a spreadsheet.', tags: ['pandas'] },
            { id: 107, question: 'What is Data Cleaning?', answer: 'The process of fixing or removing incorrect, corrupted, incorrectly formatted, duplicate, or incomplete data.', tags: ['cleansing'] }
        ],
        INTERMEDIATE: [
            { id: 108, question: 'What is an Outlier?', answer: 'A data point that differs significantly from other observations, often caused by measurement error or heavy-tailed distribution.', tags: ['statistics'] },
            { id: 109, question: 'Difference between Series and DataFrame?', answer: 'A Series is a 1D array (one column), while a DataFrame is a 2D table (multiple columns).', tags: ['pandas'] },
            { id: 110, question: 'What is a Pivot Table?', answer: 'A table that summarizes data from a larger table by grouping and aggregating values.', tags: ['excel', 'pandas'] },
            { id: 111, question: 'Explain Correlation vs. Causation.', answer: 'Correlation means two variables move together; Causation means one variable directly causes the other to change.', tags: ['logic'] },
            { id: 112, question: 'What is a Box Plot?', answer: 'A standardized way of displaying the distribution of data based on a five-number summary (Min, Q1, Median, Q3, Max).', tags: ['visualization'] },

            { id: 113, question: 'What is Data Normalization?', answer: 'Rescaling data to a specific range (usually 0 to 1) to ensure all features contribute equally to an analysis.', tags: ['preprocessing'] },
            { id: 114, question: 'Explain the purpose of NumPy.', answer: 'Used for numerical computing in Python, providing support for large, multi-dimensional arrays and matrices.', tags: ['libraries'] }
        ],
        ADVANCED: [
            { id: 115, question: 'What is the P-value in statistics?', answer: 'The probability of obtaining results at least as extreme as the observed results, assuming the null hypothesis is true.', tags: ['statistics'] },
            { id: 116, question: 'Explain A/B Testing.', answer: 'A statistical way of comparing two versions (A and B) to determine which one performs better.', tags: ['marketing', 'product'] },
            { id: 117, question: 'What is the Central Limit Theorem?', answer: 'States that the distribution of sample means approximates a normal distribution as the sample size becomes larger.', tags: ['statistics'] },

            { id: 118, question: 'Difference between Overfitting and Underfitting?', answer: 'Overfitting is when a model learns noise (too complex); Underfitting is when it fails to capture the trend (too simple).', tags: ['machine-learning'] },
            { id: 119, question: 'What is Time Series Analysis?', answer: 'Analyzing a sequence of data points collected over time to forecast future trends.', tags: ['forecasting'] },
            { id: 120, question: 'What is Principal Component Analysis (PCA)?', answer: 'A dimensionality-reduction method used to reduce the complexity of large datasets while preserving as much variance as possible.', tags: ['math'] }
        ]
    },
    CSS: {
        BASIC: [
            { id: 8, question: 'What is CSS?', answer: 'Cascading Style Sheets used for describing the presentation of a document written in HTML.', tags: ['styling'] },
            { id: 9, question: 'Explain the Box Model.', answer: 'The model includes Content, Padding, Border, and Margin.', tags: ['basics'] },
        ],
        INTERMEDIATE: [
            { id: 10, question: 'Difference between Flexbox and Grid?', answer: 'Flexbox is 1D (rows OR columns), while Grid is 2D (rows AND columns).', tags: ['layout'] },
        ],
        ADVANCED: [
            { id: 11, question: 'What are CSS Custom Properties?', answer: 'Variables defined by CSS authors that contain specific values to be reused throughout a document.', tags: ['variables'] },
        ]
    },
    PYTHON: {
        BASIC: [
            { id: 12, question: 'What is Python?', answer: 'An interpreted, high-level, general-purpose programming language.', tags: ['backend'] },
            { id: 13, question: 'What are Python data types?', answer: 'Integers, Floats, Strings, Booleans, Lists, Tuples, Dictionaries, and Sets.', tags: ['types'] },
        ],
        INTERMEDIATE: [
            { id: 14, question: 'What is a Decorator?', answer: 'A function that takes another function and extends its behavior without explicitly modifying it.', tags: ['logic'] },
        ],
        ADVANCED: [
            { id: 15, question: 'What is Global Interpreter Lock (GIL)?', answer: 'A mutex that allows only one thread to hold the control of the Python interpreter at a time.', tags: ['concurrency'] },
        ]
    }
};



const QuestionCard = ({ item, isExpanded, onToggle }) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <button onClick={onToggle} className="w-full flex items-start justify-between p-5 text-left group">
            <div className="flex-1 pr-4">
                <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {item.question}
                </h3>
                <div className="flex gap-2 mt-2">
                    {item.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] uppercase font-bold rounded">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
            <ChevronDown size={18} className={`mt-1 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
        </button>
        <AnimatePresence>
            {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="px-5 pb-5 pt-0">
                        <div className="p-4 bg-blue-50/50 rounded-lg border-l-4 border-blue-500 text-sm md:text-base text-gray-700 italic">
                            {item.answer}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

export default function InterviewPage() {
    const [expandedItem, setExpandedItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSubject, setActiveSubject] = useState('HTML');
    const [activeLevel, setActiveLevel] = useState('ALL');

    const subjects = [
        { id: 'HTML', icon: Globe, color: 'text-orange-500' },
        { id: 'CSS', icon: Palette, color: 'text-blue-500' },
        { id: 'PYTHON', icon: Terminal, color: 'text-yellow-600' },
        { id: 'DATA_ANALYSIS', icon: Layers, color: 'text-green-600' } // Added this line
    ];

    const levels = [
        { id: 'ALL', icon: Code2 },
        { id: 'BASIC', icon: BookOpen },
        { id: 'INTERMEDIATE', icon: Layers },
        { id: 'ADVANCED', icon: Zap }
    ];

    const filteredData = useMemo(() => {
        const subjectData = INTERVIEW_QNA[activeSubject];
        let result = {};

        Object.keys(subjectData).forEach(level => {
            if (activeLevel === 'ALL' || activeLevel === level) {
                const filtered = subjectData[level].filter(q =>
                    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    q.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
                );
                if (filtered.length > 0) result[level] = filtered;
            }
        });
        return result;
    }, [activeSubject, activeLevel, searchQuery]);

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-4xl mx-auto mt-15 lg:mt-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview <span className="text-blue-600">Knowledge Base</span></h1>
                    <p className="text-gray-500">Select a subject and difficulty to start practicing.</p>
                </div>

                {/* Subject Selector */}
                <div className="flex justify-center gap-4 mb-8">
                    {subjects.map((sub) => (
                        <button
                            key={sub.id}
                            onClick={() => { setActiveSubject(sub.id); setActiveLevel('ALL'); setExpandedItem(null); }}
                            className={`flex flex-col items-center p-4 rounded-2xl w-24 transition-all shadow-sm border ${activeSubject === sub.id ? 'bg-white border-blue-500 ring-2 ring-blue-100 scale-105' : 'bg-white border-transparent hover:bg-gray-50'
                                }`}
                        >
                            <sub.icon size={24} className={activeSubject === sub.id ? sub.color : 'text-gray-400'} />
                            <span className={`text-xs font-bold mt-2 ${activeSubject === sub.id ? 'text-gray-900' : 'text-gray-500'}`}>{sub.id}</span>
                        </button>
                    ))}
                </div>

                {/* Search and Difficulty Filter */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={`Search ${activeSubject} questions...`}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {levels.map((lvl) => (
                            <button
                                key={lvl.id}
                                onClick={() => setActiveLevel(lvl.id)}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeLevel === lvl.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-gray-500 hover:bg-slate-200'
                                    }`}
                            >
                                <lvl.icon size={14} />
                                {lvl.id}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Displaying Questions */}
                <div className="space-y-8">
                    {Object.entries(filteredData).map(([level, questions]) => (
                        <div key={level} className="space-y-4">
                            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="h-px w-6 bg-blue-200"></span> {level} QUESTIONS
                            </h2>
                            <div className="grid gap-3">
                                {questions.map((item) => (
                                    <QuestionCard
                                        key={`${activeSubject}-${level}-${item.id}`}
                                        item={item}
                                        isExpanded={expandedItem === item.id}
                                        onToggle={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                    {Object.keys(filteredData).length === 0 && (
                        <div className="text-center py-10 text-gray-400 italic">No results found for this selection.</div>
                    )}
                </div>
            </div>
        </div>
    );
}