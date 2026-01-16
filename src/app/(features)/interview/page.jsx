'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, Search, BookOpen, Layers, Zap, Code2, Terminal, Globe, Palette, Database, Cpu, Network, CpuIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INTERVIEW_QNA = {
    PROGRAMMING: {
        BASIC: [
            { id: 1, question: 'Difference between Python and Java?', answer: 'Python is dynamically typed and uses an interpreter, while Java is statically typed and compiled to bytecode for the JVM.', tags: ['basics', 'java', 'python'] },
            { id: 2, question: 'What are the main features of Java?', answer: 'Platform independence, Object-Oriented, Robust, Secure, and Multithreaded.', tags: ['java'] },
            { id: 3, question: 'What is PEP 8 in Python?', answer: 'It is a document that provides guidelines and best practices on how to write Python code for maximum readability.', tags: ['python'] },
            { id: 4, question: 'Explain the "self" keyword in Python.', answer: 'It represents the instance of the class and allows access to the attributes and methods of the class in Python.', tags: ['python', 'oops'] },
            { id: 5, question: 'What is a Constructor in Java?', answer: 'A special method used to initialize objects. It has the same name as the class and no return type.', tags: ['java', 'oops'] },
            { id: 6, question: 'Difference between List and Tuple in Python?', answer: 'Lists are mutable (can change), while Tuples are immutable (cannot change).', tags: ['python', 'data-types'] },
            { id: 7, question: 'What is a Package in Java?', answer: 'A mechanism to encapsulate a group of classes, sub-packages, and interfaces.', tags: ['java'] },
            { id: 8, question: 'What is __init__ in Python?', answer: 'It is a reserved method in Python classes, known as a constructor in OOPS terminology.', tags: ['python'] },
        ],
        INTERMEDIATE: [
            { id: 9, question: 'What is Exception Handling in Java?', answer: 'A mechanism to handle runtime errors using try, catch, finally, throw, and throws keywords.', tags: ['java', 'errors'] },
            { id: 10, question: 'What are List Comprehensions in Python?', answer: 'A concise way to create lists using a single line of code, often replacing for-loops.', tags: ['python'] },
            { id: 11, question: 'Difference between Overloading and Overriding?', answer: 'Overloading is same method name with different parameters (compile-time); Overriding is same method name/parameters in a subclass (runtime).', tags: ['oops'] },
            { id: 12, question: 'What is the Global Interpreter Lock (GIL) in Python?', answer: 'A mutex that allows only one thread to hold control of the Python interpreter at a time, impacting CPU-bound multi-threading.', tags: ['python', 'advanced'] },
            { id: 13, question: 'Explain the "final" keyword in Java.', answer: 'Used to restrict the user. It can be used with variables (constant), methods (no overriding), or classes (no inheritance).', tags: ['java'] },
            { id: 14, question: 'What are Lambda functions in Python?', answer: 'Small anonymous functions defined with the lambda keyword; they can take any number of arguments but have only one expression.', tags: ['python'] },
        ],
        ADVANCED: [
            { id: 15, question: 'What is Reflection in Java?', answer: 'An API used to examine or modify the behavior of methods, classes, and interfaces at runtime.', tags: ['java', 'advanced'] },
            { id: 16, question: 'What are Metaclasses in Python?', answer: 'Metaclasses are the "classes of classes" that define how a class behaves. A class is an instance of a metaclass.', tags: ['python', 'advanced'] },
            { id: 17, question: 'How does Garbage Collection work in Java?', answer: 'The JVM automatically identifies and deletes objects that are no longer reachable in memory to free up space.', tags: ['java', 'memory'] },
            { id: 18, question: 'Explain Generators in Python.', answer: 'Functions that return an iterable set of items, one at a time, using the "yield" keyword, making them memory efficient.', tags: ['python'] },
        ]
    },
    DATA_STRUCTURES: {
        BASIC: [
            { id: 201, question: 'What is a Data Structure?', answer: 'A specialized format for organizing, processing, retrieving, and storing data.', tags: ['basics'] },
            { id: 202, question: 'Difference between Array and Linked List?', answer: 'Arrays have contiguous memory and fixed size; Linked Lists have non-contiguous memory and dynamic size.', tags: ['array', 'linkedlist'] },
            { id: 203, question: 'What is a Stack?', answer: 'A linear data structure that follows the LIFO (Last In, First Out) principle.', tags: ['stack'] },
            { id: 204, question: 'What is a Queue?', answer: 'A linear data structure that follows the FIFO (First In, First Out) principle.', tags: ['queue'] },
        ],
        INTERMEDIATE: [
            { id: 205, question: 'What is a Hash Map?', answer: 'A data structure that maps keys to values using a hashing function for fast retrieval (O(1) average).', tags: ['hashing'] },
            { id: 206, question: 'Explain Binary Search Tree (BST).', answer: 'A tree where the left child is smaller than the parent, and the right child is larger.', tags: ['trees'] },
            { id: 207, question: 'What is the difference between BFS and DFS?', answer: 'BFS uses a queue and explores neighbor nodes first; DFS uses a stack (or recursion) and explores as far as possible along each branch.', tags: ['graph', 'search'] },
        ],
        ADVANCED: [
            { id: 208, question: 'What is an AVL Tree?', answer: 'A self-balancing binary search tree where the height difference between left and right subtrees is at most 1.', tags: ['trees', 'advanced'] },
            { id: 209, question: 'What is Dynamic Programming?', answer: 'An algorithmic technique that breaks down problems into simpler subproblems and stores results to avoid redundant work (Memoization).', tags: ['algorithms'] },
            { id: 210, question: 'Explain the "Time Complexity" of QuickSort.', answer: 'Average case is O(n log n), but the worst case is O(n²) if the pivot selection is poor.', tags: ['sorting'] },
        ]
    },
    DBMS: {
        BASIC: [
            { id: 301, question: 'What is DBMS?', answer: 'Database Management System is software used to manage, store, and retrieve data efficiently.', tags: ['basics'] },
            { id: 302, question: 'What are ACID properties?', answer: 'Atomicity, Consistency, Isolation, and Durability - ensuring reliable database transactions.', tags: ['transactions'] },
            { id: 303, question: 'What is a Primary Key?', answer: 'A unique identifier for each record in a database table. It cannot be null.', tags: ['keys'] },
        ],
        INTERMEDIATE: [
            { id: 304, question: 'What is Normalization?', answer: 'The process of organizing data to reduce redundancy and improve data integrity (1NF, 2NF, 3NF, BCNF).', tags: ['design'] },
            { id: 305, question: 'Difference between DELETE and TRUNCATE?', answer: 'DELETE is a DML command (can be rolled back, deletes specific rows); TRUNCATE is a DDL command (cannot be rolled back, deletes all rows).', tags: ['sql'] },
            { id: 306, question: 'What is a Joins in SQL?', answer: 'Used to combine rows from two or more tables based on a related column (Inner, Left, Right, Full).', tags: ['sql'] },
        ],
        ADVANCED: [
            { id: 307, question: 'What is Sharding?', answer: 'A horizontal partitioning method that splits a large database into smaller, faster, more manageable parts called shards.', tags: ['scaling'] },
            { id: 308, question: 'Explain NoSQL vs SQL.', answer: 'SQL is relational, structured, and uses predefined schemas; NoSQL is non-relational, distributed, and flexible (Document, Key-Value, Graph).', tags: ['architecture'] },
        ]
    },
    OS: {
        BASIC: [
            { id: 401, question: 'What is an Operating System?', answer: 'Software that acts as an interface between computer hardware and the user.', tags: ['basics'] },
            { id: 402, question: 'Difference between Process and Thread?', answer: 'A process is an independent program in execution; a thread is a subset of a process that shares the same memory space.', tags: ['execution'] },
        ],
        INTERMEDIATE: [
            { id: 403, question: 'What is a Deadlock?', answer: 'A situation where a set of processes are blocked because each process is holding a resource and waiting for another resource held by another process.', tags: ['concurrency'] },
            { id: 404, question: 'Explain Virtual Memory.', answer: 'A memory management technique that creates an illusion of a very large main memory by using the hard disk.', tags: ['memory'] },
            { id: 405, question: 'What is Paging?', answer: 'A memory management scheme that eliminates the need for contiguous allocation of physical memory by dividing memory into fixed-size blocks.', tags: ['memory'] },
        ],
        ADVANCED: [
            { id: 406, question: 'What is Thrashing?', answer: 'A state where the CPU spends more time swapping pages in and out of memory than executing actual instructions.', tags: ['performance'] },
            { id: 407, question: 'What is the Banker\'s Algorithm?', answer: 'A resource allocation and deadlock avoidance algorithm that tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources.', tags: ['algorithms'] },
        ]
    },
    NETWORKS: {
        BASIC: [
            { id: 501, question: 'What is the OSI Model?', answer: 'A conceptual framework of 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.', tags: ['basics'] },
            { id: 502, question: 'What is an IP Address?', answer: 'A unique numerical label assigned to each device connected to a computer network.', tags: ['ip'] },
        ],
        INTERMEDIATE: [
            { id: 503, question: 'Difference between TCP and UDP?', answer: 'TCP is connection-oriented and reliable (3-way handshake); UDP is connectionless and faster (no delivery guarantee).', tags: ['protocols'] },
            { id: 504, question: 'What is DNS?', answer: 'Domain Name System - it translates human-friendly domain names (google.com) into IP addresses (142.250.x.x).', tags: ['web'] },
        ],
        ADVANCED: [
            { id: 505, question: 'How does HTTPS work?', answer: 'It is HTTP over SSL/TLS, providing encryption, data integrity, and authentication through certificates.', tags: ['security'] },
            { id: 506, question: 'What is BGP (Border Gateway Protocol)?', answer: 'The protocol used to exchange routing information between autonomous systems on the internet.', tags: ['routing'] },
        ]
    },
    WEB_TECH: {
        BASIC: [
            { id: 601, question: 'What is the DOM?', answer: 'Document Object Model - a programming interface for web documents that represents the page so programs can change structure/style.', tags: ['javascript'] },
            { id: 602, question: 'Difference between let, const, and var?', answer: 'var is function-scoped; let and const are block-scoped. const cannot be reassigned.', tags: ['javascript'] },
        ],
        INTERMEDIATE: [
            { id: 603, question: 'What is a Closure in JavaScript?', answer: 'A function that remembers its outer lexical environment even after the outer function has finished executing.', tags: ['javascript'] },
            { id: 604, question: 'What is React Virtual DOM?', answer: 'A lightweight copy of the real DOM that React uses to optimize updates by only re-rendering changed elements.', tags: ['react'] },
        ],
        ADVANCED: [
            { id: 605, question: 'What is SSR vs CSR?', answer: 'Server-Side Rendering (SSR) generates HTML on the server; Client-Side Rendering (CSR) renders content in the browser using JS.', tags: ['performance'] },
        ]
    },
    ML: {
        BASIC: [
            { id: 701, question: 'What is Supervised Learning?', answer: 'Learning where the model is trained on labeled data (inputs and corresponding outputs).', tags: ['basics'] },
            { id: 702, question: 'Difference between Classification and Regression?', answer: 'Classification predicts discrete categories (Yes/No); Regression predicts continuous values (Price/Temperature).', tags: ['basics'] },
        ],
        INTERMEDIATE: [
            { id: 703, question: 'What is Overfitting?', answer: 'When a model learns the training data too well, including the noise, and performs poorly on new data.', tags: ['concepts'] },
            { id: 704, question: 'Explain the Bias-Variance Tradeoff.', answer: 'The conflict in trying to simultaneously minimize two sources of error: Bias (underfitting) and Variance (overfitting).', tags: ['math'] },
        ],
        ADVANCED: [
            { id: 705, question: 'What is a Neural Network?', answer: 'A series of algorithms that endeavor to recognize underlying relationships in a set of data through a process that mimics the human brain.', tags: ['deep-learning'] },
            { id: 706, question: 'What is Gradient Descent?', answer: 'An optimization algorithm used to minimize a loss function by iteratively moving toward the steepest descent.', tags: ['optimization'] },
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
    const [activeSubject, setActiveSubject] = useState('PROGRAMMING');
    const [activeLevel, setActiveLevel] = useState('ALL');

    const subjects = [
        { id: 'PROGRAMMING', icon: Terminal, color: 'text-yellow-600' },
        { id: 'DATA_STRUCTURES', icon: Layers, color: 'text-green-600' },
        { id: 'DBMS', icon: Database, color: 'text-blue-500' },
        { id: 'OS', icon: Cpu, color: 'text-purple-500' },
        { id: 'NETWORKS', icon: Network, color: 'text-red-500' },
        { id: 'WEB_TECH', icon: Globe, color: 'text-orange-500' },
        { id: 'ML', icon: CpuIcon, color: 'text-indigo-500' }
    ];

    const levels = [
        { id: 'ALL', icon: Code2 },
        { id: 'BASIC', icon: BookOpen },
        { id: 'INTERMEDIATE', icon: Layers },
        { id: 'ADVANCED', icon: Zap }
    ];

    const filteredData = useMemo(() => {
        const subjectData = INTERVIEW_QNA[activeSubject] || {};
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
                    <p className="text-gray-500">Master core concepts for your technical interviews.</p>
                </div>

                {/* Subject Selector */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {subjects.map((sub) => (
                        <button
                            key={sub.id}
                            onClick={() => { setActiveSubject(sub.id); setActiveLevel('ALL'); setExpandedItem(null); }}
                            className={`flex flex-col items-center p-3 rounded-2xl w-24 transition-all shadow-sm border ${activeSubject === sub.id ? 'bg-white border-blue-500 ring-2 ring-blue-100 scale-105' : 'bg-white border-transparent hover:bg-gray-50'
                                }`}
                        >
                            <sub.icon size={22} className={activeSubject === sub.id ? sub.color : 'text-gray-400'} />
                            <span className={`text-[10px] font-bold mt-2 text-center leading-tight ${activeSubject === sub.id ? 'text-gray-900' : 'text-gray-500'}`}>{sub.id.replace('_', ' ')}</span>
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