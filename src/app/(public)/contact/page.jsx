// src/app/(public)/contact/page.jsx
"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap'; // Standard GSAP import
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Standard ScrollTrigger plugin import
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';

// --- 1. Validation Schema ---
const contactSchema = z.object({
    name: z.string().min(2, "Your full name is required."),
    email: z.string().email("Please enter a valid email address."),
    subject: z.string().min(5, "A concise subject line is required."),
    message: z.string().min(20, "Please provide at least 20 characters detailing your request."),
});

// --- 2. Contact Data ---
const contactInfo = [
    {
        title: "General Inquiries",
        icon: "📧",
        detail: "support.leveluplearn@gmail.com",
        type: "email"
    },
    {
        title: "Call Us",
        icon: "📞",
        detail: "+91 9619113702",
        type: "phone"
    },
    {
        title: "Corporate Address",
        icon: "📍",
        detail: "LevelUpLearn HQ, Govandi West, SN",
        type: "address"
    },
];

// --- 3. Contact Info Card Component (Themed) ---
const ContactCard = ({ info }) => {
    return (
        <div className="flex items-start space-x-4 p-6 
             bg-[var(--bg-shade-1)] dark:bg-[var(--form-background)] 
             rounded-xl shadow-md border border-[var(--bg-shade-1)] dark:border-[var(--form-border)] 
             transition duration-300 hover:shadow-lg">

            <div className="text-4xl">{info.icon}</div>
            <div>
                <h4 className="text-xl font-bold text-[var(--primary-text)] dark:text-[var(--secondary-text)]">{info.title}</h4>
                {info.type === 'email' && (
                    <a href={`mailto:${info.detail}`}
                        className="text-[var(--primary-accent)] hover:text-[var(--primary-accent-hover)] text-md font-medium transition">
                        {info.detail}
                    </a>
                )}
                {info.type === 'phone' && (
                    <a href={`tel:${info.detail.replace(/[^0-9+]/g, '')}`}
                        className="text-[var(--primary-accent)] hover:text-[var(--primary-accent-hover)] text-md font-medium transition">
                        {info.detail}
                    </a>
                )}
                {info.type === 'address' && (
                    <p className="text-md text-[var(--tertiary-text)] dark:text-[var(--quaternary-text)]">{info.detail}</p>
                )}
            </div>
        </div>
    );
};


// --- 4. Main Contact Page Component (Themed) ---
export default function ContactPage() {
    const headerRef = useRef(null);
    const formRef = useRef(null);
    const infoRefs = useRef([]);
    infoRefs.current = [];

    const addToInfoRefs = (el) => {
        if (el && !infoRefs.current.includes(el)) {
            infoRefs.current.push(el);
        }
    };

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data) => {
        toast.loading("Sending message...", { id: "contact-send" });
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success("Message Sent! We'll be in touch soon.", { id: "contact-send" });
        reset();
    };

    useEffect(() => {
        // This is the line that required the ScrollTrigger definition
        gsap.registerPlugin(ScrollTrigger);

        // --- GSAP Animations ---
        gsap.fromTo(headerRef.current,
            { opacity: 0, y: -40 },
            { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
        );
        gsap.fromTo(formRef.current,
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0, duration: 1.2, ease: "power3.out", delay: 0.5 }
        );
        gsap.fromTo(infoRefs.current,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                stagger: 0.2,
                delay: 0.8
            }
        );
    }, []);

    // Helper function for consistent input styling using CSS variables
    const inputClasses = (isError) => (
        `mt-1 block w-full rounded-md shadow-sm p-3 focus:ring-1 transition
        text-[var(--primary-text)] dark:text-[var(--secondary-text)]
        bg-white dark:bg-[var(--bg-dark-shade-4)]
        border ${isError
            ? 'border-[var(--danger-color)]'
            : 'border-[var(--bg-shade-2)] dark:border-[var(--form-border)]'} 
        focus:ring-[var(--primary-accent)] focus:border-[var(--primary-accent)]`
    );

    return (
        <div className="min-h-screen pt-20 pb-16 relative overflow-x-hidden
             bg-[var(--background)] dark:bg-[var(--secondary-background)]">

            <Toaster position="top-center" />

            <div className="container mx-auto px-6 z-10 relative">

                {/* --- 1. Header Section --- */}
                <header ref={headerRef} className="text-center mb-16 pt-12" style={{ opacity: 0 }}>
                    <p className="text-sm font-extrabold text-[var(--primary-accent)] uppercase tracking-[0.2em]">
                        GET IN TOUCH
                    </p>
                    <h1 className="text-5xl md:text-6xl font-extrabold mt-4 mb-4 leading-snug
                        text-[var(--primary-text)] dark:text-[var(--secondary-text)]">
                        How Can We <span className="text-[var(--primary-accent)]">Help You</span>?
                    </h1>
                    <p className="max-w-3xl mx-auto text-xl font-light 
                        text-[var(--tertiary-text)] dark:text-[var(--quaternary-text)]">
                        Whether you have a question about courses, need technical support, or want to discuss a partnership, our team is ready to assist.
                    </p>
                </header>

                {/* --- 2. Main Content Grid (Contact Info & Form) --- */}
                <section className="grid md:grid-cols-3 gap-12 mb-16">

                    {/* Contact Info Cards (Col 1) */}
                    <div className="md:col-span-1 space-y-6">
                        <h2 className="text-3xl font-bold mb-4 
                            text-[var(--primary-text)] dark:text-[var(--secondary-text)]">
                            Reach Out Directly
                        </h2>
                        {contactInfo.map((info, index) => (
                            <div key={index} ref={addToInfoRefs}>
                                <ContactCard info={info} />
                            </div>
                        ))}
                    </div>

                    {/* Contact Form (Col 2 & 3) */}
                    <div ref={formRef} className="md:col-span-2 p-10 rounded-xl shadow-2xl 
                        bg-[var(--bg-shade-1)] dark:bg-[var(--form-background)] 
                        border border-[var(--bg-shade-1)] dark:border-[var(--form-border)]"
                        style={{ opacity: 0 }}>

                        <h2 className="text-3xl font-bold mb-6 border-b pb-3 
                            text-[var(--primary-text)] dark:text-[var(--secondary-text)] 
                            border-[var(--bg-shade-2)] dark:border-[var(--form-border)]">
                            Send Us a Message
                        </h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                            {/* Name & Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium 
                                        text-[var(--tertiary-text)] dark:text-[var(--quaternary-text)]">Full Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        {...register('name')}
                                        className={inputClasses(errors.name)}
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-[var(--danger-color)]">{errors.name.message}</p>}
                                </div>
                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium 
                                        text-[var(--tertiary-text)] dark:text-[var(--quaternary-text)]">Email Address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        {...register('email')}
                                        className={inputClasses(errors.email)}
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-[var(--danger-color)]">{errors.email.message}</p>}
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium 
                                    text-[var(--tertiary-text)] dark:text-[var(--quaternary-text)]">Subject</label>
                                <input
                                    id="subject"
                                    type="text"
                                    {...register('subject')}
                                    className={inputClasses(errors.subject)}
                                />
                                {errors.subject && <p className="mt-1 text-sm text-[var(--danger-color)]">{errors.subject.message}</p>}
                            </div>

                            {/* Message */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium 
                                    text-[var(--tertiary-text)] dark:text-[var(--quaternary-text)]">Message</label>
                                <textarea
                                    id="message"
                                    rows="4"
                                    {...register('message')}
                                    className={inputClasses(errors.message)}
                                />
                                {errors.message && <p className="mt-1 text-sm text-[var(--danger-color)]">{errors.message.message}</p>}
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 px-4 font-semibold rounded-lg shadow-md transition flex items-center justify-center disabled:opacity-75
                                        bg-[var(--primary-accent)] hover:bg-[var(--primary-accent-hover)] text-white"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
}