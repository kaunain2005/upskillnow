"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

// Register ScrollTrigger plugin with GSAP
gsap.registerPlugin(ScrollTrigger);

// --- Content Data (Remains the same for consistency) ---
const aboutContent = {
    mission: {
        title: "Our Mission: Elevate Every Learner",
        icon: "🚀",
        description: "To democratize high-quality education by providing practical, project-based learning paths that directly translate into career success. We aim to turn potential into tangible skills.",
    },
    vision: {
        title: "Our Vision: The Future of Personalized Mastery",
        icon: "💡",
        description: "To become the global standard for personalized skill mastery, where every curriculum adapts in real-time to the learner's unique pace, interests, and career goals.",
    },
    values: [
        { title: "Mastery Focus", icon: "🧠", description: "Learning is judged by application, not memorization. We prioritize deep understanding and project-based proof of competence." },
        { title: "Community Driven", icon: "🤝", description: "Knowledge thrives in collaboration. We foster a supportive global community for shared growth and mentorship." },
        { title: "Perpetual Growth", icon: "📈", description: "We believe in constant iteration. Our platform and curricula evolve continuously to meet industry demands." },
    ],
    teamStatement: "Behind LevelUpLearn is a diverse team of educators, engineers, and industry professionals unified by one belief: **The best investment you can make is in yourself.**",
};

// --- Reusable Animated Component for Mission/Vision Cards (Themed) ---
const AnimatedSectionCard = ({ content, index }) => {
    const cardRef = useRef(null);

    useEffect(() => {
        // Sophisticated slide-up, slight rotation animation
        gsap.fromTo(cardRef.current,
            { opacity: 0, y: 80, rotationX: -10, transformOrigin: 'top center' },
            {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: cardRef.current,
                    start: "top 90%",
                    toggleActions: "play none none none",
                    id: `card-${index}`
                }
            }
        );
    }, [index]);

    return (
        <div
            ref={cardRef}
            // Background, border, and shadows are now themed
            className="p-8 border-t-4 border-[var(--primary-accent)] rounded-xl shadow-2xl 
                       bg-white dark:bg-[var(--form-background)] backdrop-blur-sm 
                       transform transition-shadow duration-500 hover:shadow-3xl dark:shadow-indigo-500/10"
            style={{ opacity: 0 }} // Initial state hidden for GSAP to animate
        >
            <div className="text-6xl mb-4 text-[var(--primary-accent)]">{content.icon}</div>
            <h3 className="text-3xl font-extrabold mb-3 pb-2 border-b 
                        text-[var(--primary-text)] dark:text-[var(--secondary-text)]
                        border-[var(--bg-shade-2)] dark:border-[var(--form-border)]">
                {content.title}
            </h3>
            <p className="text-lg leading-relaxed 
                       text-[var(--tertiary-text)] dark:text-[var(--quaternary-text)]">
                {content.description}
            </p>
        </div>
    );
};

// --- Main About Page Component (Themed) ---
export default function AboutPage() {
    const headerRef = useRef(null);
    const valueRefs = useRef([]);
    valueRefs.current = [];
    const ctaRef = useRef(null);

    const addToValueRefs = (el) => {
        if (el && !valueRefs.current.includes(el)) {
            valueRefs.current.push(el);
        }
    };

    useEffect(() => {
        // --- GSAP Animations (Unchanged) ---
        gsap.fromTo(headerRef.current,
            { opacity: 0, y: -40 },
            { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
        );

        valueRefs.current.forEach((el, index) => {
            gsap.fromTo(el,
                { opacity: 0, y: 50, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1,
                    ease: "power2.out",
                    delay: index * 0.1,
                    scrollTrigger: {
                        trigger: el,
                        start: "top 95%",
                        toggleActions: "play none none none",
                        id: `value-card-${index}`
                    }
                }
            );
        });

        gsap.fromTo(ctaRef.current,
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1,
                scale: 1,
                duration: 1.5,
                ease: "elastic.out(1, 0.5)",
                scrollTrigger: {
                    trigger: ctaRef.current,
                    start: "top 90%",
                    toggleActions: "play none none none",
                    id: "cta-level-up"
                }
            }
        )
    }, []);

    return (
        <div className="min-h-screen pt-20 pb-16 relative overflow-x-hidden
             bg-[var(--background)] dark:bg-[var(--secondary-background)]">

            {/* Background Gradient/Decoration - Adjusted for Dark Mode */}
            <div className="absolute top-0 left-0 w-full h-1/2 
                        bg-gradient-to-br from-[var(--primary-accent-light)] to-[var(--background)] 
                        dark:from-[var(--bg-dark-shade-3)] dark:to-[var(--secondary-background)] z-0">
            </div>

            <div className="container mx-auto px-6 z-10 relative">

                {/* --- 1. Header Section --- */}
                <header ref={headerRef} className="text-center mb-16 pt-12" style={{ opacity: 0 }}>
                    <p className="text-sm font-extrabold text-[var(--primary-accent)] uppercase tracking-[0.2em]">
                        ABOUT LEVELUPLEARN
                    </p>
                    <h1 className="text-6xl md:text-7xl font-extrabold mt-4 mb-4 leading-snug
                        text-[var(--primary-text)] dark:text-[var(--secondary-text)]">
                        The Platform for <span className="text-[var(--primary-accent-hover)]">Proven Mastery</span>.
                    </h1>
                    <p className="max-w-3xl mx-auto text-xl font-light 
                        text-[var(--tertiary-text)] dark:text-[var(--quaternary-text)]">
                        We don't just teach. We provide the **structure, projects, and community** required to truly master in-demand skills and validate your expertise.
                    </p>
                </header>

                <hr className="mb-20 border-[var(--bg-shade-2)] dark:border-[var(--bg-dark-shade-2)]" />

                {/* --- 2. Mission & Vision --- */}
                <section className="grid md:grid-cols-2 gap-10 mb-24">
                    <AnimatedSectionCard content={aboutContent.mission} index={0} />
                    <AnimatedSectionCard content={aboutContent.vision} index={1} />
                </section>

                {/* --- 3. Core Values Section --- */}
                <section className="text-center mb-24">
                    <h2 className="text-4xl font-extrabold mb-12
                        text-[var(--primary-text)] dark:text-[var(--secondary-text)]">
                        Our Core Operating Principles
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {aboutContent.values.map((value, index) => (
                            <div
                                key={index}
                                ref={addToValueRefs}
                                // Card styling for both light and dark mode
                                className="p-8 rounded-xl shadow-xl transform transition-transform duration-500 hover:scale-[1.03] hover:shadow-2xl
                                        bg-[var(--bg-shade-1)] dark:bg-[var(--form-background)] 
                                        border border-[var(--bg-shade-1)] dark:border-[var(--form-border)]"
                                style={{ opacity: 0 }}
                            >
                                <div className="text-4xl mb-4 text-[var(--primary-accent-hover)]">{value.icon}</div>
                                <h4 className="text-2xl font-bold mb-3 
                                    text-[var(--primary-text)] dark:text-[var(--secondary-text)]">{value.title}</h4>
                                <p className="text-md 
                                    text-[var(--tertiary-text)] dark:text-[var(--quaternary-text)]">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- 4. Call to Action / Team Statement (Dynamic Animation) --- */}
                <section
                    ref={ctaRef}
                    className="text-center p-16 rounded-3xl text-white shadow-3xl 
                                bg-[var(--logo-color1)]"
                    style={{ opacity: 0 }}
                >
                    <p className="text-3xl font-bold mb-4 max-w-4xl mx-auto">
                        {aboutContent.teamStatement}
                    </p>
                    <p className="text-xl font-light mb-8">
                        Ready to join the future of learning?
                    </p>
                    <Link href="/courses" passHref>
                        <button
                            className="inline-flex items-center px-10 py-4 mt-4 text-lg font-extrabold rounded-full shadow-xl transition transform hover:scale-[1.05]
                                    text-[var(--logo-color1)] bg-white hover:bg-[var(--bg-shade-1)]"
                        >
                            Start Leveling Up Today
                            <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </button>
                    </Link>
                </section>

            </div>
        </div>
    );
}
