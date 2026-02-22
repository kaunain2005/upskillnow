"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Typed from "typed.js";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaLock,
} from "react-icons/fa";
import Link from 'next/link';
import { Terminal, FileText, Printer, MapPin, ArrowRight } from 'lucide-react';
import { MdQuiz, MdOutlineMenuBook } from "react-icons/md";
import { AiOutlineRobot } from "react-icons/ai";
import { MarqueeDemo } from "@/components/common/MaqueeDemo";
import AthenaSection from "@/components/common/AthenaSection";
import { ScrollTextView } from "@/components/common/ScrollTextView";

import { getApps } from "firebase/app";
import { auth } from "@/lib/firebase";

import {
  GraduationCap,
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  Trophy,
  Bot
} from "lucide-react";

const features2 = [
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: "Student Dashboard",
    desc: "Track your progress across modules, quizzes, and tests with real-time analytics.",
    color: "from-blue-500 to-indigo-500"
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Admin Dashboard",
    desc: "Seamlessly manage courses and content while monitoring student performance metrics.",
    color: "from-emerald-500 to-teal-500"
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Organized Content",
    desc: "Deeply structured hierarchy from Stream down to Module level for easy navigation.",
    color: "from-violet-500 to-purple-500"
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Interactive Quizzes",
    desc: "Chapter-wise mock tests and instant feedback to sharpen your examination skills.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "AI Assistant",
    desc: "24/7 instant doubt resolution and smart summarization powered by advanced AI.",
    color: "from-cyan-500 to-blue-500"
  },
  {
    icon: <LayoutDashboard className="w-6 h-6" />,
    title: "Secure Auth",
    desc: "Enterprise-grade role-based access control ensuring data privacy and security.",
    color: "from-slate-500 to-slate-700"
  }
];

export function WhyChooseUs() {
  return (
    <section id="features2" className="px-6 md:px-16 lg:px-32 py-24 bg-[var(--background)] overflow-hidden">
      <div className="relative mb-16 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Why Choose <span className="text-blue-600 dark:text-blue-400">Us?</span>
        </h2>
        <div className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          We provide the most comprehensive platform for academic excellence and professional growth.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features2.map((f, i) => (
          <div
            key={i}
            className="group relative p-8 rounded-3xl transition-all duration-300
                       bg-white dark:bg-slate-800/50 
                       border border-slate-200 dark:border-slate-700
                       hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5
                       hover:-translate-y-1"
          >
            {/* Gradient Icon Backdrop */}
            <div className={`inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br ${f.color} text-white mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300`}>
              {f.icon}
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
              {f.title}
            </h3>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              {f.desc}
            </p>

            {/* Subtle corner accent for dark mode */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${f.color} opacity-[0.03] rounded-bl-full -z-10`} />
          </div>
        ))}
      </div>
    </section>
  );
}

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Interview Prep",
    desc: "Master technical rounds with our AI-driven mock questions and tips.",
    icon: <Terminal className="w-8 h-8" />,
    path: "/interview",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Resume Templates",
    desc: "Craft a professional, ATS-friendly resume with live preview.",
    icon: <FileText className="w-8 h-8" />,
    path: "/resume",
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "PDF Maker",
    desc: "Convert notes, images, and documents into high-quality PDFs.",
    icon: <Printer className="w-8 h-8" />,
    path: "/scan",
    color: "from-orange-500 to-red-500"
  },
  {
    title: "Career Guidelines",
    desc: "Step-by-step roadmaps to navigate your professional journey.",
    icon: <MapPin className="w-8 h-8" />,
    path: "/career",
    color: "from-emerald-500 to-teal-500"
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="px-6 md:px-16 lg:px-32 py-20 bg-[var(--background)]">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-extrabold tracking-tight text-[var(--primary-text)] dark:text-white mb-4">
          Professional Tools
        </h2>
        <p className="text-[var(--tertiary-text)] max-w-2xl mx-auto">
          Everything you need to accelerate your career, from preparation to documentation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <Link href={f.path} key={i} className="group relative">
            <div className="h-full p-8 rounded-2xl transition-all duration-300 
                            bg-white/50 dark:bg-gray-800/30 
                            backdrop-blur-md border border-gray-200 dark:border-gray-700
                            hover:border-transparent hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]
                            dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]
                            flex flex-col items-start text-left">

              {/* Icon Circle */}
              <div className={`mb-6 p-3 rounded-xl bg-gradient-to-br ${f.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>

              <h3 className="text-xl font-bold mb-3 text-[var(--primary-text)] dark:text-white">
                {f.title}
              </h3>

              <p className="text-[var(--tertiary-text)] dark:text-gray-400 text-sm leading-relaxed mb-6">
                {f.desc}
              </p>

              {/* Bottom Link Action */}
              <div className="mt-auto flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                Try it now <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Hover Gradient Overlay (Mobile Friendly) */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.07] transition-opacity pointer-events-none`} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function LandingPage() {
  const heroRef = useRef(null);
  const blobsRef = useRef([]);
  const imageRef = useRef(null);
  const typedRef = useRef(null);
  const subtitleRef = useRef(null);
  // TEST
  useEffect(() => {
    // This will now be TRUE because 'auth' import triggered initializeApp
    console.log("Firebase initialized:", getApps().length > 0);
    console.log("Current App Name:", getApps()[0]?.name);
  }, []);
  // Typed.js setup
  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: [
        "<span class='text-blue-600 >UpSkillNow</span>",
        "<span class='text-green-600'>Coding</span>",
        "<span class='text-purple-600'>Data Science</span>",
        "<span class='text-pink-600'>AI Learning</span>",
      ],
      typeSpeed: 60,
      backSpeed: 30,
      backDelay: 1500,
      loop: true,
      showCursor: true,
      cursorChar: "|",
      cursorClass: "typed-cursor-custom",
    });

    return () => typed.destroy();
  }, []);

  // GSAP animations
  useEffect(() => {
    blobsRef.current = blobsRef.current.slice(0, 2);

    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: "power3.out",
      });

      // Hero image float
      gsap.fromTo(
        imageRef.current,
        { y: 0 },
        {
          y: -15,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        }
      );

      // Word-by-word bounce subtitle
      const words = subtitleRef.current.querySelectorAll("span");
      gsap.from(words, {
        y: -80,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: "bounce.out",
        delay: 0.8,
      });

      // Floating blobs
      blobsRef.current.forEach((blob, idx) => {
        if (!blob) return;
        gsap.to(blob, {
          y: idx % 2 === 0 ? -18 : 18,
          duration: 6 + idx * 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: idx * 0.2,
        });
      });

      // Features scroll-in
      gsap.from("#features .feature-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: "#features",
          start: "top 80%",
        },
      });

      // Card hover animations
      const cards = document.querySelectorAll(".feature-card, .testimonial-card");
      cards.forEach((card) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            scale: 1.05,
            rotate: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            scale: 1,
            rotate: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-neutral-950 text-gray-800">
      {/* Hero */}
      <section
        ref={heroRef}
        id="hero"
        className="relative overflow-hidden flex flex-col md:flex-row items-center justify-between px-8 md:px-16 lg:px-32 py-16 min-h-screen bg-[var(--background)] dark:bg-[var(--secondary-background)] text-[var(--primary-text)] dark:text-[var(--secondary-text)]"
      >
        {/* Decorative Blobs */}
        <svg
          ref={(el) => (blobsRef.current[0] = el)}
          className="absolute top-10 left-10 w-40 h-40 text-blue-400 opacity-40 z-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
        >
          <path
            fill="currentColor"
            d="M47.6,-61.3C62.7,-54.1,77.4,-42.4,81.8,-27.1C86.3,-11.8,80.5,7,71.5,23.9C62.6,40.7,50.6,55.6,35.2,65.4C19.7,75.1,0.8,79.7,-17.3,78.8C-35.4,77.9,-52.6,71.6,-63.9,58.5C-75.2,45.4,-80.6,25.5,-82.5,5C-84.4,-15.5,-82.7,-36.6,-71.4,-51.6C-60,-66.6,-39.1,-75.4,-19.4,-77.1C0.4,-78.9,20.8,-73.5,47.6,-61.3Z"
            transform="translate(100 100)"
          />
        </svg>

        <svg
          ref={(el) => (blobsRef.current[1] = el)}
          className="absolute bottom-10 right-10 w-60 h-60 text-pink-300 opacity-30 z-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
        >
          <path
            fill="currentColor"
            d="M37.1,-50.8C52.4,-46.5,72.5,-44.1,80.8,-34.2C89.1,-24.3,85.6,-7,79.4,7.9C73.1,22.9,64,35.6,52.2,47.1C40.4,58.5,25.9,68.7,9.8,72.2C-6.3,75.7,-25,72.6,-40.3,62.1C-55.5,51.5,-67.3,33.4,-72.9,12.6C-78.5,-8.2,-77.9,-31.6,-66.1,-45.5C-54.2,-59.4,-31.1,-63.9,-10.6,-60.9C10,-57.9,20.1,-47.5,37.1,-50.8Z"
            transform="translate(100 100)"
          />
        </svg>


        {/* Hero Content */}
        <div className="max-w-xl relative z-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-[var(--primary-text)] dark:text-[var(--secondary2-text)]">
            Unlock Your Potential with{" "}
            <span ref={typedRef} className="text-blue-600"></span>
          </h1>

          <p
            ref={subtitleRef}
            className="text-lg mb-6 text-[var(--tertiary-text)] dark:text-[var(--quaternary-text)]"
          >
            {"Access structured courses, interactive quizzes, and AI-powered tools tailored for CS, IT, and DS students."
              .split(" ")
              .map((word, i) => (
                <span key={i} className="inline-block mr-1">
                  {word}
                </span>
              ))}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a
              href="/auth"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Started
            </a>
            <a
              href="#features"
              className="bg-gray-100 text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Hero Image */}
        <img
          ref={imageRef}
          src="/images/hero-image.png"
          alt="Student Learning"
          className="relative z-10 w-full md:w-105 mt-8 md:mt-0 drop-shadow-lg"
        />
      </section>

      {/* Scrolling Text */}
      <ScrollTextView text1="🚀 Learn • 📚 Practice • 🧠 Grow • 💻 Succeed ➡️" text2="🚀 Learn • 📚 Practice • 🧠 Grow • 💻 Succeed ➡️" />

      <FeatureSection />

      {/* Why Choose Us? */}
      <section id="features">
        <WhyChooseUs />
      </section>

      {/* Athena AI Section */}
      <AthenaSection />

      {/* Testimonials */}
      <section
        id="testimonials"
        className="bg-[var(--background2)] dark:bg-[var(--secondary-background)] py-16"
      >
        <h2 className="text-3xl font-bold text-center mb-12 text-[var(--primary-text)] dark:text-[var(--secondary-text)]">What Students Say</h2>
        <MarqueeDemo />
      </section>

      {/* Contact */}
      <section id="contact" className="px-8 md:px-16 lg:px-32 py-16 dark:bg-black">
        <h2 className="text-3xl text-[var(--primary-text)] dark:text-[var(--secondary-text)] font-bold text-center mb-8">Get in Touch</h2>
        <form className="max-w-2xl mx-auto bg-[var(--background)] border border-[var(--form-border)] dark:border-[var(--form-secondary-border)] shadow-md rounded-xl p-8 space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-3 text-[var(--primary-text)] dark:text-[var(--secondary-text)] border border-[var(--form-border)] dark:border-[var(--form-secondary-border)] rounded-lg"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-3 text-[var(--primary-text)] dark:text-[var(--secondary-text)] border border-[var(--form-border)] dark:border-[var(--form-secondary-border)] rounded-lg"
          />
          <textarea
            placeholder="Your Message"
            rows="4"
            className="w-full p-3 text-[var(--primary-text)] dark:text-[var(--secondary-text)] border border-[var(--form-border)] dark:border-[var(--form-secondary-border)] rounded-lg"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Send Message
          </button>
        </form>
      </section>

    </div>
  );
}
